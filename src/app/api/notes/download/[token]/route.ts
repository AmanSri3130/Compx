import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySignedDownloadToken, resolvePdfFilePath } from "@/lib/storage";
import fs from "fs";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    if (!token) {
      return new NextResponse("Missing authorization token", { status: 400 });
    }

    const payload = verifySignedDownloadToken(token);
    if (!payload) {
      return new NextResponse(
        "Download link has expired or is invalid. Please request a new link from your library.",
        { status: 403 }
      );
    }

    const note = await prisma.note.findUnique({
      where: { id: payload.noteId },
    });

    if (!note) {
      return new NextResponse("Note not found", { status: 404 });
    }

    const filePath = resolvePdfFilePath(note.pdfPath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Requested PDF file is temporarily unavailable", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${note.slug || "compx-notes"}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-CompX-Licensed-To": payload.userEmail || "Guest Student",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    console.error("PDF download stream error:", err);
    return new NextResponse("Failed to download PDF", { status: 500 });
  }
}

