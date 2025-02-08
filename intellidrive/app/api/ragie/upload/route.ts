import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Get the form data from the request
        const formData = await req.formData();

        // Forward the same formData to Ragie
        const options = {
            method: "POST",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${process.env.RAGIE_API_KEY}`,
            },
            body: formData,
        };

        const response = await fetch("https://api.ragie.ai/documents", options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to upload to Ragie");
        }

        // Return the Ragie document_id along with the success response
        return NextResponse.json({
            success: true,
            data: {
                ...data,
                document_id: data.id,
            },
        });
    } catch (error) {
        console.error("Error in Ragie upload:", error);
        return NextResponse.json(
            { error: "Failed to upload to Ragie" },
            { status: 500 }
        );
    }
}
