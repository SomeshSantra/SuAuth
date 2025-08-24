import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_COOKIE = "su_auth";
const ONE_DAY = 60 * 60 * 24; // sec

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: Record<string, unknown>, expiresInSec = ONE_DAY) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSec;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifyToken<T = any>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T;
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set(AUTH_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;
