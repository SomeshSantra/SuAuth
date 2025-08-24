import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { createLicenseSchema } from "@/lib/validators";
import { ObjectId } from "mongodb";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const applications = db.collection("applications");
    const licenses = db.collection("licenses");
    
    const app = await applications.findOne({ _id: new ObjectId(id), ownerId: userId });
    if (!app) {
      return NextResponse.json({ error: "Application not found or you do not have access" }, { status: 404 });
    }
    
    const now = new Date();

    const sp = _req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(sp.get('pageSize') || '10', 10) || 10));
    const skip = (page - 1) * pageSize;
    
    const [totalLicenses, expiredLicenses, bannedLicenses] = await Promise.all([
      licenses.countDocuments({ 
        appId: id,
        status: 'active'
      }),
      licenses.countDocuments({ 
        appId: id,
        $or: [
          { expiresAt: { $ne: null, $lt: now } },
          { status: 'expired' }
        ],
        status: { $ne: 'banned' }
      }),
      licenses.countDocuments({ 
        appId: id,
        status: 'banned'
      })
    ]);

    const totalList = await licenses.countDocuments({ appId: id });

    const latest = await licenses
      .find({ appId: id })
      .project({
        key: 1,
        createdAt: 1,
        ownerId: 1,
        duration: 1,
        status: 1,
        expiresAt: 1,
        hwidLimit: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      total: totalLicenses,
      expired: expiredLicenses,
      banned: bannedLicenses,
      licenses: latest.map(l => ({
        id: String(l._id),
        key: l.key,
        createdAt: l.createdAt,
        ownerId: l.ownerId,
        duration: l.duration,
        status: l.status,
        expiresAt: l.expiresAt ?? null,
        hwidLimit: l.hwidLimit,
      })),
      page,
      pageSize,
      totalList,
      totalPages: Math.max(1, Math.ceil(totalList / pageSize))
    });
    
  } catch (error) {
    console.error("Error while fetching license counts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching license counts" },
      { status: 500 }
    );
  }
}

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

function addDuration(now: Date, durationSeconds: string): Date | null {
  if (!durationSeconds) return null;
  
  const seconds = parseInt(durationSeconds, 10);
  if (isNaN(seconds) || seconds <= 0) return null;
  
  const result = new Date(now);
  result.setSeconds(result.getSeconds() + seconds);
  
  return result;
}

function generateKey() {
  const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `suauth-${id}`;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const uid = await getUserIdFromCookie();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }
    let appObjectId: ObjectId;
    try {
      appObjectId = new ObjectId(id);
    } catch (_e) {
      console.error("Invalid application ID format", { id });
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const body = await _req.json();
    const parsed = createLicenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const db = await getDb();
    const apps = db.collection("applications");
    const licenses = db.collection("licenses");

    const app = await apps.findOne({ _id: appObjectId, ownerId: uid });
    if (!app) return NextResponse.json({ error: "Application not found or you do not have access" }, { status: 404 });

    const now = new Date();
    const expiresAt = addDuration(now, parsed.data.duration);
    const key = generateKey();

    const doc = {
      key,
      ownerId: uid,
      appId: String(app._id),
      duration: parsed.data.duration,
      expiresAt,
      hwidLimit: parsed.data.hwidLimit ?? 1,
      note: (parsed.data.note || "").trim(),
      createdAt: now,
      updatedAt: now,
      status: "active" as const,
    };

    const { insertedId } = await licenses.insertOne(doc);

    return NextResponse.json({ ok: true, id: String(insertedId), key, expiresAt }, { status: 201 });
  } catch (err) {
    console.error("POST /api/applications/[id]/licenses error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
