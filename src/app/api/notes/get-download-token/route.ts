import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkUserNoteEntitlement, generateSignedDownloadToken } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { noteId } = await req.json();

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const entitlement = await checkUserNoteEntitlement(noteId, session?.id, session?.role);

    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "Unauthorized to access this note" },
        { status: 403 }
      );
    }

    const note = entitlement.note;

    // Generate signed download token valid for 60 minutes
    const token = generateSignedDownloadToken({
      noteId: note.id,
      userId: session?.id,
      userEmail: session?.email,
      userName: session?.name,
      isFree: note.isFree,
    }, 60);

    // Record Download record in DB
    await prisma.download.create({
      data: {
        noteId: note.id,
        userId: session?.id || null,
        isFreeDownload: note.isFree,
      },
    });

    // Increment downloadsCount on note
    await prisma.note.update({
      where: { id: note.id },
      data: { downloadsCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/notes/download/${token}`,
      noteTitle: note.title,
      fileName: `${note.slug}.pdf`,
    });
  } catch (err: any) {
    console.error("Token generation error:", err);
    return NextResponse.json({ error: "Failed to generate download authorization" }, { status: 500 });
  }
}

