import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const createPineconeIndex = async () => {
    const pc = getPineconeClient();
    const existingIndexes = await pc.listIndexes();
    const indexName = "intelli-drive-rag";
    if (!existingIndexes.indexes.some((index) => index.name === indexName)) {
        console.log(`Creating "${indexName}"...`);
        await pc.createIndex({
            name: indexName,
            dimension: 1536,
            metric: "cosine",
            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1",
                },
            },
        });
        console.log(`Created "${indexName}" successfully!`);
    } else {
        console.log(`"${indexName}" already exists.`);
    }
};
