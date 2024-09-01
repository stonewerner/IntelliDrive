import { Pinecone } from "@pinecone-database/pinecone";

let pc: Pinecone;

export const getPineconeClient = (): Pinecone => {
    if (!pc) {
        pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY as string,
        });
    }
    return pc;
};
