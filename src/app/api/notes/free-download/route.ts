import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateSignedDownloadToken } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { noteId, email, name, phone } = await req.json();

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || !note.isFree) {
      return NextResponse.json({ error: "This note is not free" }, { status: 400 });
    }

    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (settings?.freeNotesRequireLogin && !session && !email) {
      return NextResponse.json(
        { error: "LOGIN_OR_LEAD_REQUIRED", message: "Please provide your email to download free study notes" },
        { status: 403 }
      );
    }

    let userId = session?.id;

    // If guest provided lead info, create or find student record
    if (!userId && email) {
      const cleanEmail = email.toLowerCase().trim();
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || "Student",
            email: cleanEmail,
            phone,
            password: "FREE_LEAD_USER",
            role: "STUDENT",
            permissions: "[]",
          },
        });
      }
      userId = user.id;
    }

    // Record Download
    await prisma.download.create({
      data: {
        noteId: note.id,
        userId: userId || null,
        isFreeDownload: true,
      },
    });

    // Increment downloads count on note
    await prisma.note.update({
      where: { id: note.id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Generate signed download token
    const token = generateSignedDownloadToken({
      noteId: note.id,
      userId,
      userEmail: session?.email || email || "Free Download Student",
      userName: session?.name || name || "Student",
      isFree: true,
    }, 120);

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/notes/download/${token}`,
      noteTitle: note.title,
    });
  } catch (err: any) {
    console.error("Free download error:", err);
    return NextResponse.json({ error: "Failed to process free download" }, { status: 500 });
  }
}

