import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function parseBasicAuth(
  authHeader: string | undefined,
): { email: string; password: string } | null {
  if (!authHeader?.startsWith("Basic ")) return null;
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    email: decoded.slice(0, colonIndex),
    password: decoded.slice(colonIndex + 1),
  };
}
