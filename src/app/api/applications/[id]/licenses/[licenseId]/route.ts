import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";

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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; licenseId: string }> }) {
  try {
    const uid = await getUserIdFromCookie();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, licenseId } = await params;
    if (!id || !licenseId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let appObjectId: ObjectId;
    let licObjectId: ObjectId;
    try {
      appObjectId = new ObjectId(id);
      licObjectId = new ObjectId(licenseId);
    } catch {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const db = await getDb();
    const apps = db.collection("applications");
    const licenses = db.collection("licenses");

    const app = await apps.findOne({ _id: appObjectId, ownerId: uid });
    if (!app) return NextResponse.json({ error: "Application not found or access denied" }, { status: 404 });

    const lic = await licenses.findOne({ _id: licObjectId, appId: String(app._id) });
    if (!lic) return NextResponse.json({ error: "License not found" }, { status: 404 });

    await licenses.deleteOne({ _id: licObjectId });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/applications/[id]/licenses/[licenseId] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
