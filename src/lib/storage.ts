import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "./prisma";

const SIGNING_SECRET = process.env.JWT_SECRET || "compx-storage-signing-secret-key-32-bytes";

export interface DownloadTokenPayload {
  noteId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isFree: boolean;
  exp: number; // unix timestamp in seconds
}

/**
 * Generate a short-lived signed download token for authorized PDF retrieval
 * Defaults to 60 minutes
 */
export function generateSignedDownloadToken(
  payload: Omit<DownloadTokenPayload, "exp">,
  expiryMinutes = 60
): string {
  const exp = Math.floor(Date.now() / 1000) + expiryMinutes * 60;
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(base64Data)
    .digest("base64url");

  return `${base64Data}.${signature}`;
}

/**
 * Verify and parse a signed download token
 */
export function verifySignedDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SIGNING_SECRET)
      .update(base64Data)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const json = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as DownloadTokenPayload;

    // Check expiration
    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify if a user is entitled to access/download a given note:
 * 1. Note is Free (isFree === true)
 * 2. User is ADMIN or SUPER_ADMIN
 * 3. User has a PAID order containing this note
 */
export async function checkUserNoteEntitlement(
  noteId: string,
  userId?: string,
  userRole?: string
): Promise<{ allowed: boolean; reason?: string; note?: any }> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { category: true },
  });

  if (!note) {
    return { allowed: false, reason: "Note not found" };
  }

  // Free notes are accessible to everyone
  if (note.isFree) {
    return { allowed: true, note };
  }

  // Admin access
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    return { allowed: true, note };
  }

  // Not logged in for paid note
  if (!userId) {
    return { allowed: false, reason: "Login required to access this note", note };
  }

  // Check paid order
  const paidOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "PAID",
      items: {
        some: {
          noteId,
        },
      },
    },
  });

  if (paidOrder) {
    return { allowed: true, note };
  }

  return { allowed: false, reason: "Please purchase this note to unlock download", note };
}

/**
 * Resolves local physical path for a stored PDF
 */
export function resolvePdfFilePath(pdfPath: string): string {
  // Check if it starts with /storage/ or storage/
  const relative = pdfPath.replace(/^\/+/, "");
  const fullPath = path.join(process.cwd(), relative);
  
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }

  // Fallback check in storage/sample-pdfs
  const sampleFallback = path.join(process.cwd(), "storage", "sample-pdfs", path.basename(pdfPath));
  if (fs.existsSync(sampleFallback)) {
    return sampleFallback;
  }

  return fullPath;
}

