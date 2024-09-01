import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const updatePineconeIndex = async (namespace, fileMetadata) => {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
    });
    const chunks = await textSplitter.createDocuments([fileMetadata.fileText]);
    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
        `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );
    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    const batchSize = 100;
    let batch = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const vector = {
            id: fileMetadata.fileId,
            values: embeddingsArrays[i],
            metadata: {
                ...chunk.metadata,
                fileName: fileMetadata.fileName,
                downloadUrl: fileMetadata.downloadUrl,
                pageContent: chunk.pageContent,
                loc: JSON.stringify(chunk.metadata.loc),
            },
        };
        batch.push(vector);
        if (batch.length === batchSize || i === chunks.length - 1) {
            await index.namespace(namespace).upsert(batch);
            batch = [];
        }

        console.log(`Pinecone index updated with ${chunks.length} vectors`);
    }
};
