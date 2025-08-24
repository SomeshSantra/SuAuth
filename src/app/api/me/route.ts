import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";

type Jwt = { uid: string; email?: string };

export async function GET(_req: NextRequest) {
  try {
    const store = await cookies();
    const token = store.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });
    try {
      const payload = await verifyToken<Jwt>(token);
      return NextResponse.json(
        { authenticated: true, uid: String(payload.uid), email: payload.email || null },
        { status: 200 }
      );
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
  } catch (err) {
    console.error("/api/me GET error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
