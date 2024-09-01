import { NextRequest, NextResponse } from "next/server";

const pdfParse: any = require("pdf-parse");

const extractText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = await pdfParse(arrayBuffer);
    return pdfData.text.trim();
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const pdf = formData.get("pdfFile") as File;
        const text = await extractText(pdf);
        return new NextResponse(text, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: { message: (error as Error).message } },
            { status: 500 }
        );
    }
}
