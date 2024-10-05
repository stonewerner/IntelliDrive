import { getPineconeClient } from "@/utils/pinecone/pineconeClient";
import { clerkClient } from "@clerk/nextjs/server";

export const createPineconeIndex = async () => {
    const pc = getPineconeClient();
    const existingIndexes = await pc.listIndexes();
    const indexName = "intelli-drive-rag";

    // Create the index if it doesn't exist
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

    // Get the index
    const index = pc.Index(indexName);

    try {
        // Fetch all organizations
        const organizationsResponse = await clerkClient.organizations.getOrganizationList();
        console.log("Organizations fetched:", organizationsResponse);

        if (!organizationsResponse.data || !Array.isArray(organizationsResponse.data)) {
            console.error("Organizations data is not an array:", organizationsResponse);
            return;
        }

        const organizations = organizationsResponse.data;

        // Create a namespace for each organization
        for (const org of organizations) {
            try {
                await index.namespace(org.id).describe();
                console.log(`Namespace for organization ${org.id} already exists.`);
            } catch (error) {
                if (error.message.includes("not found")) {
                    // Namespace doesn't exist, so create it
                    await index.namespace(org.id).create();
                    console.log(`Created namespace for organization ${org.id}`);
                } else {
                    console.error(`Error checking/creating namespace for organization ${org.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching organizations:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
    }
};
