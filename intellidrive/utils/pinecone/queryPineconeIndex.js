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

    console.log(`Query: "${question}"`);
    console.log(`Query embedding (first 5 values):`, queryEmbedding.slice(0, 5));

    const namespaces = [userId, ...organizationIds];
    let allResults = [];

    for (const namespace of namespaces) {
        try {
            console.log(`Querying namespace: ${namespace}`);
            const results = await index.query({
                vector: queryEmbedding,
                topK: 5,
                includeMetadata: true,
                filter: { namespace: { $eq: namespace } }
            });
            console.log(`Results for namespace ${namespace}:`, JSON.stringify(results, null, 2));
            if (results.matches && results.matches.length > 0) {
                console.log(`Found ${results.matches.length} matches in namespace ${namespace}`);
                allResults = allResults.concat(results.matches);
            } else {
                console.log(`No matches found in namespace ${namespace}`);
            }
        } catch (error) {
            console.error(`Error querying namespace ${namespace}:`, error);
        }
    }

    // Sort results by score in descending order
    allResults.sort((a, b) => b.score - a.score);

    // Return top 10 results overall
    return allResults.slice(0, 10);
};
