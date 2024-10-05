import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const queryPineconeVectorStore = async (userId, organizationIds, question) => {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);

    // Explicitly create OpenAIEmbeddings with the API key
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const queryEmbedding = await embeddings.embedQuery(question);

    const namespaces = [userId, ...organizationIds];
    let allResults = [];

    for (const namespace of namespaces) {
        const results = await index.namespace(namespace).query({
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true,
        });
        allResults = allResults.concat(results.matches);
    }

    // Sort results by score in descending order
    allResults.sort((a, b) => b.score - a.score);

    // Return top 10 results overall
    return allResults.slice(0, 10);
};
