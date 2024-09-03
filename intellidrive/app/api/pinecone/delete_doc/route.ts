import { deletePineconeVector } from "@/utils/pinecone/deletePineconeVector";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { namespace, fileId } = await req.json();
        await deletePineconeVector(namespace, fileId);
        console.log(`Successfully deleted ${fileId} from Pinecone`);
        return NextResponse.json({ status: 200 });
    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json(
            { error: { message: (err as Error).message } },
            { status: 500 }
        );
    }
}
