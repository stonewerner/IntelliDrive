import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { documentId } = await req.json();

        const response = await fetch(
            `https://api.ragie.ai/documents/${documentId}`,
            {
                method: "DELETE",
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${process.env.RAGIE_API_KEY}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete document from Ragie");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting from Ragie:", error);
        return NextResponse.json(
            { error: "Failed to delete from Ragie" },
            { status: 500 }
        );
    }
}
