import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const queryPineconeVectorStore = async (namespace, question) => {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
    return await index.namespace(namespace).query({
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true,
    });
};
