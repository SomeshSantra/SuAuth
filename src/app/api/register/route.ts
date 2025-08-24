import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { authLimiter, getClientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req as unknown as Request);
    if (!authLimiter.take(key)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const db = await getDb();
    const users = db.collection("users");

    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();
    const { insertedId } = await users.insertOne({
      email: email.toLowerCase(),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    const token = await signToken({ uid: String(insertedId), email: email.toLowerCase() });
    await setAuthCookie(token);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("/api/register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
