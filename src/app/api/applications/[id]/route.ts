import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const uid = await getUserIdFromCookie();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const db = await getDb();
    const apps = db.collection("applications");

    const app = await apps.findOne({ _id: new ObjectId(id), ownerId: uid });
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ id: String(app._id), name: app.name, description: app.description, createdAt: app.createdAt, updatedAt: app.updatedAt }, { status: 200 });
  } catch (err) {
    console.error("/api/applications/[id] GET error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
