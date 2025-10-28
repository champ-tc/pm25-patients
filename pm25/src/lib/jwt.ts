import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET");
}

export type AppJwtClaims = {
  sub: string;
  username: string;
  role: string;
};

/** เซ็น JWT ที่หมดอายุภายใน 1 ชั่วโมง (3600 วินาที) */
export function signAuthToken(payload: AppJwtClaims): string {
  return jwt.sign(
    { ...payload },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: 60 * 60, // ✅ 1 ชั่วโมง
    }
  );
}

export function verifyAuthToken(token: string): AppJwtClaims | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;

    const { sub, username, role } = decoded as Record<string, unknown>;
    if (!sub || !username || !role) return null;

    return {
      sub: String(sub),
      username: String(username),
      role: String(role),
    };
  } catch {
    return null;
  }
}
