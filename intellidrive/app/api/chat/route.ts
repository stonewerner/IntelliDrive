import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

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

async function queryRagie(query: string) {
    try {
        const response = await fetch("https://api.ragie.ai/retrievals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RAGIE_API_KEY}`,
            },
            body: JSON.stringify({
                query,
                // Add any filters if needed
                // filters: { ... }
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Ragie API error: ${response.status} ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error querying Ragie:", error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const userMessages = messages.filter((m: Message) => m.role === "user");
        const messagesToUse = userMessages.slice(-10);
        const query = messagesToUse
            .map((m: Message) => m.content.trim())
            .join(" ");

        // Query Ragie instead of Pinecone
        const ragieResults = await queryRagie(query);

        let resultString = "";
        if (ragieResults.scored_chunks.length > 0) {
            resultString += "\n\nRAG Results:";
            ragieResults.scored_chunks.forEach((chunk: any) => {
                resultString += `
                \n
                File Name: ${chunk.document_name || "Unknown"}
                Excerpt of file content: ${chunk.text || "No content available"}
                File Download URL: ${chunk.document_metadata?.firebaseUrl || "No URL available"}
                \n\n 
                `;
            });
        }

        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage.content + resultString;
        const dataWithoutLastMessage = messages.slice(0, messages.length - 1);

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: `${process.env.OPEN_ROUTER_API_KEY}`,
        });
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...dataWithoutLastMessage,
                { role: "user", content: lastMessageContent },
            ],
            model: "deepseek/deepseek-r1:free",
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
