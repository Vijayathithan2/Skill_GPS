import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Use require to bypass Turbopack's ESM resolution issues
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);

        return NextResponse.json({ text: data.text });
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
    }
}
