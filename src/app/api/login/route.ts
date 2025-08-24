import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { authLimiter, getClientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req as unknown as Request);
    if (!authLimiter.take(key)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne<{ _id: any; email: string; passwordHash: string }>({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({ uid: String(user._id), email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("/api/login error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
