import Tesseract from "tesseract.js";

const extractTextFromImage = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const {
        data: { text },
    } = await Tesseract.recognize(buffer, "eng");
    return text.trim().replace(/\s+/g, " ");
};

export const extractFileText = async (file: File) => {
    const imgTypes = [
        "image/png",
        "image/jpeg",
        "image/bmp",
        "image/tiff",
        "image/gif",
    ];
    if (imgTypes.includes(file.type)) {
        return extractTextFromImage(file);
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
    });

    if (res.ok) {
        return await res.text();
    } else {
        console.error("Failed to extract text from file:", file.name);
    }
};
