import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image"; // "image" | "pdf" | "screenshot"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size limit checks
    const maxPdfSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 8 * 1024 * 1024; // 8MB

    if (type === "pdf" && file.size > maxPdfSize) {
      return NextResponse.json({ error: "PDF exceeds 50MB limit" }, { status: 400 });
    }

    if (type !== "pdf" && file.size > maxImageSize) {
      return NextResponse.json({ error: "Image exceeds 8MB limit" }, { status: 400 });
    }

    // MIME type verification
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    const allowedPdfTypes = ["application/pdf"];

    if (type === "pdf" && !allowedPdfTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF is allowed." }, { status: 400 });
    }

    if (type !== "pdf" && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, or SVG allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine target directory:
    // Private PDFs go to storage/uploads (protected, not in /public)
    // Images & Screenshots go to public/uploads
    const isPrivate = type === "pdf";
    const baseDir = isPrivate
      ? path.join(process.cwd(), "storage", "uploads")
      : path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const ext = path.extname(file.name) || (type === "pdf" ? ".pdf" : ".jpg");
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const targetFilePath = path.join(baseDir, uniqueName);

    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = isPrivate ? `/storage/uploads/${uniqueName}` : `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Upload failed: " + err.message }, { status: 500 });
  }
}

