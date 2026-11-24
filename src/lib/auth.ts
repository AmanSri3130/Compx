import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "compx-production-jwt-token-signing-secret-key-minimum-32-chars";
export const STUDENT_COOKIE_NAME = "compx_auth_token";
export const ADMIN_COOKIE_NAME = "compx_master_admin_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  permissions: string[];
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for user
 */
export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Get current session user from cookies (Server Components / Server Actions / Route Handlers)
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    // Check master admin token first, then fallback to student token
    const token =
      cookieStore.get(ADMIN_COOKIE_NAME)?.value ||
      cookieStore.get(STUDENT_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Verify user is not blocked in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, permissions: true, isBlocked: true },
    });

    if (!user || user.isBlocked) return null;

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.permissions);
    } catch {
      permissions = [];
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "ADMIN" | "SUPER_ADMIN",
      permissions,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Get Master Admin Session: STRICTLY requires the dedicated compx_master_admin_token cookie
 * and verifies that the role is ADMIN or SUPER_ADMIN in MongoDB Atlas.
 * Student sessions CANNOT authenticate here.
 */
export async function getMasterAdminSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Strict role check from token
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return null;
    }

    // Live MongoDB Atlas verification
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, permissions: true, isBlocked: true },
    });

    if (!user || user.isBlocked) return null;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.permissions);
    } catch {
      permissions = [];
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "SUPER_ADMIN",
      permissions,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Check if user is Admin or Super Admin (type-guard narrows to non-null SessionUser)
 */
export function isAdmin(user: SessionUser | null): user is SessionUser {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

/**
 * Check if user is Super Admin (type-guard)
 */
export function isSuperAdmin(user: SessionUser | null): user is SessionUser {
  return user?.role === "SUPER_ADMIN";
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: SessionUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return user.permissions.includes("all") || user.permissions.includes(permission);
}

