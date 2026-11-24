import { NextResponse } from "next/server";
import { getMasterAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getMasterAdminSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      permissions: session.permissions,
    },
  });
}
