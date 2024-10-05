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
        try {
            const results = await index.query({
                vector: queryEmbedding,
                topK: 5,
                includeMetadata: true,
                filter: { namespace: namespace } // Use filter instead of namespace parameter
            });
            allResults = allResults.concat(results.matches);
        } catch (error) {
            console.error(`Error querying namespace ${namespace}:`, error);
        }
    }

    // Sort results by score in descending order
    allResults.sort((a, b) => b.score - a.score);

    // Return top 10 results overall
    return allResults.slice(0, 10);
};
