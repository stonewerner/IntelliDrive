import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const deletePineconeVector = async (namespace, fileId) => {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);
    await index.namespace(namespace).deleteOne(fileId);
};
