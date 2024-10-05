import { getPineconeClient } from "./pineconeClient";

export async function deleteOrganizationVectors(organizationId: string) {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);

    try {
        // Delete the entire namespace for the organization
        await index.namespace(organizationId).deleteAll();
        console.log(`Successfully deleted all vectors for organization ${organizationId}`);
    } catch (error) {
        console.error(`Error deleting vectors for organization ${organizationId}:`, error);
        throw error;
    }
}
