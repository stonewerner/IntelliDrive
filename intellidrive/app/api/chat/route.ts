import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { queryPineconeVectorStore } from "@/utils/pinecone/queryPineconeIndex";
import { auth, currentUser } from "@clerk/nextjs/server";

const systemPrompt = `
You are a document-savvy AI assistant. Your primary functions are:

- Analyze user queries carefully.
- Leverage provided RAG data (file names, download URL, locations, content snippets).
- The RAG data should only be used as support for the user question.
- Offer concise, relevant answers (200 words max).
- Always use proper markdown for clarity.
- Always use HTML <br/> tags for line breaks between sentences. For example, format your responses like this:
  
  First sentence text.<br/><br/> 
  Second sentence text.<br/><br/>  
  Third sentence text.
  
  This formatting is mandatory.
- When providing the download URL, use the file name as a link that points to the download URL and always make sure the link is underlined. For example: <u>[file name](download URL)</u>
- Incorporate document details naturally to support responses.
- Wait for specific user questions related to a document before providing document-related information.
- If you don't have any information about the user's query, let them know and explain that it could be because you currently only have access to user uploads with certain file types (.pdf, .txt, .docx, and images).

- Note: You only have access to information in certain file types. You can access uploaded files have the following file extensions: .pdf, .txt, .docx, and all types of images (.jpg, .png, etc). Currently, you do not have access to other file formats.

Remember: Don't volunteer document details unprompted. Always use the formatting shown above with <br><br> between sentences. This is essential for clarity and readability.`;

interface Message {
    role: string;
    content: string;
}

interface OrganizationMembership {
    organization: { id: string };
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Type assertion to resolve the organizationMemberships warning
        const organizationIds = (user as any).organizationMemberships?.map(
            (membership: OrganizationMembership) => membership.organization.id
        ) || [];

        const lastMessageContent = messages[messages.length - 1].content;
        const results = await queryPineconeVectorStore(userId, organizationIds, lastMessageContent);

        let resultString = "";
        if (results.length > 0) {
            resultString += "\n\nReturned Results RAG:";
            results.forEach((match: any) => {
                resultString += `
                \n
                File Name: ${match.metadata?.fileName}
                Excerpt of file content: ${match.metadata?.pageContent}
                Location of content in file: ${match.metadata?.loc}
                File Download URL: ${match.metadata?.downloadUrl}
                Source: ${match.metadata?.namespace === userId ? 'Personal' : 'Organization'}
                \n\n 
                `;
            });
        }

        const lastMessage = messages[messages.length - 1];
        const updatedLastMessageContent = lastMessage.content + resultString;
        const dataWithoutLastMessage = messages.slice(0, messages.length - 1);

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...dataWithoutLastMessage,
                { role: "user", content: updatedLastMessageContent },
            ],
            model: "gpt-4o-mini",
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: { message: (error as Error).message } },
            { status: 500 }
        );
    }
}
