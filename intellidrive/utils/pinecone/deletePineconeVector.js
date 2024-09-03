import { getPineconeClient } from "@/utils/pinecone/pineconeClient";

export const deletePineconeVector = async (namespace, fileId) => {
    const pc = getPineconeClient();
    const indexName = "intelli-drive-rag";
    const index = pc.Index(indexName);
    const ns = index.namespace(namespace);

    let results = await ns.listPaginated({ prefix: fileId });
    let ids = results.vectors.map((v) => v.id);
    if (ids.length > 0) await ns.deleteMany(ids);
    while (results.pagination?.next) {
        results = await ns.listPaginated({
            prefix: fileId,
            paginationToken: results.pagination.next,
        });
        ids = results.vectors.map((v) => v.id);
        if (ids.length > 0) await ns.deleteMany(ids);
    }
};
