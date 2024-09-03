import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

const pdfParse: any = require("pdf-parse");

const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
    const pdfData = await pdfParse(buffer);
    return pdfData.text.trim().replace(/\s+/g, " ");
};

const extractTextFromDocx = async (buffer: Buffer): Promise<string> => {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim().replace(/\s+/g, " ");
};

const extractText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (!extension) {
        throw new Error("Unable to determine file extension");
    }

    if (mimeType === "text/plain") {
        return await file.text().then((t) => t.replace(/\s+/g, " "));
    } else if (extension === "pdf") {
        return extractTextFromPdf(buffer);
    } else if (extension === "docx") {
        return extractTextFromDocx(buffer);
    } else {
        throw new Error("Unsupported file type");
    }
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) throw new Error("No file provided");

        const text = await extractText(file);
        return new NextResponse(text, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: { message: (error as Error).message } },
            { status: 500 }
        );
    }
}
