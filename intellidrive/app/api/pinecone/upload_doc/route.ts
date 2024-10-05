import { createPineconeIndex } from "@/utils/pinecone/createPineconeIndex";
import { updatePineconeIndex } from "@/utils/pinecone/updatePineconeIndex";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { userId } = auth();
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { namespace, fileMetadata } = await req.json();

        if (!namespace || !fileMetadata) {
            const message = "Must provide namespace and file metadata";
            return NextResponse.json({ error: { message } }, { status: 400 });
        }

        await createPineconeIndex();
        await updatePineconeIndex(namespace, fileMetadata);

        return NextResponse.json({ status: 200 });
    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json(
            { error: { message: (err as Error).message } },
            { status: 500 }
        );
    }
}
