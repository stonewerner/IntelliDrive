import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { queryPineconeVectorStore } from "@/utils/pinecone/queryPineconeIndex";

const systemPrompt = `
You are a document-savvy AI assistant. Your primary functions are:

- Analyze user queries carefully
- Leverage provided RAG data (file names, download URL, locations, content snippets)
- The RAG data should only be used as support for the user question
- Offer concise, relevant answers (200 words max)
- Use proper markdown for clarity
- Use HTML <br><br> tags for line breaks between paragraphs
- Format your responses like this:

First paragraph text.<br><br>

Second paragraph text.<br><br>

Third paragraph text.

- When providing the download URL, use the file name as a link that points to the download URL. For example: [file name](download URL)
- Incorporate document details naturally to support responses
- Wait for specific user questions related to a document before providing document related information

Remember: Don't volunteer document details unprompted. Always use the formatting shown above with <br><br> between paragraphs.
`;

export async function POST(req: NextRequest) {
    try {
        const { messages, namespace } = await req.json();

        const text = messages[messages.length - 1].content;
        const res = await queryPineconeVectorStore(namespace, text);

        let resultString = "\n\nReturned Results RAG:";
        res.matches.forEach((match) => {
            resultString += `
            \n
            File Name: ${match.metadata?.fileName}
            Excerpt of file content: ${match.metadata?.pageContent}
            Location of content in file: ${match.metadata?.loc}
            File Download URL: ${match.metadata?.downloadUrl}
            \n\n 
            `;
        });

        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage.content + resultString;
        const dataWithoutLastMessage = messages.slice(0, messages.length - 1);

        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...dataWithoutLastMessage,
                { role: "user", content: lastMessageContent },
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
