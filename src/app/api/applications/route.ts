import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { createApplicationSchema } from "@/lib/validators";
import { RateLimiter, getClientKey } from "@/lib/rateLimit";
import { ObjectId } from "mongodb";

const appsLimiter = new RateLimiter(20, 60_000);

type Jwt = { uid: string; email?: string };

async function getUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken<Jwt>(token);
    return String(payload.uid);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const key = getClientKey(req as unknown as Request);
    if (!appsLimiter.take(key)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const uid = await getUserIdFromCookie();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const apps = db.collection("applications");
    await apps.createIndex({ ownerId: 1 });

    const list = await apps
      .find({ ownerId: uid }, { projection: { name: 1, description: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items: list.map((d) => ({ id: String(d._id), ...d })) }, { status: 200 });
  } catch (err) {
    console.error("/api/applications GET error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req as unknown as Request);
    if (!appsLimiter.take(key)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const uid = await getUserIdFromCookie();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = createApplicationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description = "" } = parsed.data;

    const db = await getDb();
    const apps = db.collection("applications");
    await apps.createIndex({ ownerId: 1, name: 1 });

    const now = new Date();
    const { insertedId } = await apps.insertOne({
      name: name.trim(),
      description: String(description || "").trim(),
      ownerId: uid,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, id: String(insertedId) }, { status: 201 });
  } catch (err) {
    console.error("/api/applications POST error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
