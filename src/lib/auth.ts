import { randomBytes } from "crypto";
import { prisma } from "./db";

export function generateApiKey(): string {
  return randomBytes(24).toString("base64url");
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, apiKey] = authHeader.split(" ");
  if (scheme !== "Bearer" || !apiKey) {
    return null;
  }
  return prisma.user.findUnique({ where: { apiKey } });
}
