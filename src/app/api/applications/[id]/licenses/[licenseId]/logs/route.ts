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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; licenseId: string }> }) {
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
    const logsCol = db.collection("license_logs");

    const app = await apps.findOne({ _id: appObjectId, ownerId: uid });
    if (!app) return NextResponse.json({ error: "Application not found or you do not have access" }, { status: 404 });

    const lic = await licenses.findOne({ _id: licObjectId, appId: String(app._id) });
    if (!lic) return NextResponse.json({ error: "License not found" }, { status: 404 });

    const logs = await logsCol
      .find({ licenseId: String(lic._id) })
      .project({ licenseId: 0, appId: 0 })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ logs: logs.map(l => ({ id: String(l._id), ...l })) });
  } catch (err) {
    console.error("GET /api/applications/[id]/licenses/[licenseId]/logs error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
