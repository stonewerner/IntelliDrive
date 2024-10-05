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

        if (!organizationsResponse.data || !Array.isArray(organizationsResponse.data)) {
            console.error("Organizations data is not an array:", organizationsResponse);
            return;
        }

        const organizations = organizationsResponse.data;

        // Create a namespace for each organization
        for (const org of organizations) {
            try {
                // Instead of using describe, we'll try to fetch vectors from the namespace
                // If it doesn't exist, this will throw an error
                await index.fetch([`test_vector_${org.id}`], { namespace: org.id });
                console.log(`Namespace for organization ${org.id} already exists.`);
            } catch (error) {
                if (error.message.includes("not found") || error.message.includes("does not exist")) {
                    // Namespace doesn't exist, so create it by upserting a test vector
                    await index.upsert({
                        upsertRequest: {
                            vectors: [{
                                id: `test_vector_${org.id}`,
                                values: new Array(1536).fill(0), // Create a zero vector with the correct dimension
                                metadata: { test: true }
                            }],
                            namespace: org.id
                        }
                    });
                    console.log(`Created namespace for organization ${org.id}`);
                    
                    // Optionally, delete the test vector after creating the namespace
                    await index.delete1({
                        ids: [`test_vector_${org.id}`],
                        namespace: org.id
                    });
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
