import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Admin email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user in MongoDB Atlas
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Access denied: Invalid credentials or unlisted administrator" },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Account suspended: Contact system security" },
        { status: 403 }
      );
    }

    // STRICT CHECK: Reject students or unauthorized roles immediately
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied: Unauthorized role for command console" },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Access denied: Invalid credentials" },
        { status: 401 }
      );
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.permissions);
    } catch {
      permissions = [];
    }

    // Create Audit Log in MongoDB Atlas
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: "MASTER_ADMIN_LOGIN_SUCCESS",
          details: JSON.stringify({
            role: user.role,
            ip: req.headers.get("x-forwarded-for") || "local",
            userAgent: req.headers.get("user-agent") || "unknown",
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation warning:", auditErr);
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "SUPER_ADMIN",
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      message: "Master administrator authenticated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
      },
    });

    // Set dedicated compx_master_admin_token cookie strictly for admin control
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error during admin authentication" },
      { status: 500 }
    );
  }
}
