import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { User, Role } from "@prisma/client";

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

async function getSessionToken(request?: Request): Promise<string | null> {
  if (request) {
    const header = request.headers.get("cookie") ?? "";
    const match = header.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(request?: Request): Promise<User | null> {
  const token = await getSessionToken(request);
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } });
    return null;
  }
  return session.user;
}

export function requireRole(user: User | null, roles: Role[]): user is User {
  return user !== null && roles.includes(user.role);
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);
  await prisma.verificationToken.deleteMany({ where: { userId } });
  await prisma.verificationToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function consumeVerificationToken(token: string): Promise<User | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token }, include: { user: true } });
  if (!record) return null;

  await prisma.verificationToken.delete({ where: { token } });
  if (record.expiresAt < new Date()) return null;

  return prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
}
