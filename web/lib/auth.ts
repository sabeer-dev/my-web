import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sabeer_admin";

function adminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "admin123";
  return null;
}

function sessionToken(password: string): string {
  return createHmac("sha256", password).update("sabeer-admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(input: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return safeEqual(sessionToken(input), sessionToken(password));
}

export function authConfigured(): boolean {
  return adminPassword() !== null;
}

export async function isAdmin(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, sessionToken(password));
}

export function sessionCookieValue(): string {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD is not configured.");
  return sessionToken(password);
}
