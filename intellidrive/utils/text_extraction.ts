export const extractFromPdf = async (file: File) => {
    const formData = new FormData();
    formData.append("pdfFile", file);

    const res = await fetch("/api/extract/pdf", {
        method: "POST",
        body: formData,
    });

    if (res.ok) {
        return await res.text();
    } else {
        console.error("Failed to extract text from PDF");
    }
};
