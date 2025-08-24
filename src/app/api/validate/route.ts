import { NextRequest, NextResponse } from "next/server";
import { LicenseService } from "@/services/licenseService";
import { getDb } from "@/lib/db";

function getClientIp(req: NextRequest) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  return 'unknown';
}

interface ValidateRequest {
  license_key: string;
  hwid?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ValidateRequest = await req.json();
    const ip = getClientIp(req);
    
    if (!body.license_key) {
      return NextResponse.json(
        { success: false, message: 'License key is required' },
        { status: 400 }
      );
    }

    try {
      const license = await LicenseService.validateLicense(body.license_key, body.hwid);
      try {
        const db = await getDb();
        const logs = db.collection('license_logs');
        await logs.insertOne({
          licenseId: license.id,
          appId: license.appId,
          key: license.key,
          ip,
          hwid: body.hwid || null,
          status: 'success',
          message: 'Validation successful',
          createdAt: new Date(),
        });
      } catch (e) {
        console.error('Log write error (success):', e);
      }
      
      return NextResponse.json({
        success: true,
        license: {
          id: license.id,
          key: license.key,
          status: license.status,
          expires_at: license.expiresAt,
          created_at: license.createdAt,
          hwid_limit: license.hwidLimit,
          hwids: license.hwids,
          app_name: license.appName,
          app_id: license.appId
        }
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      try {
        const db = await getDb();
        const logs = db.collection('license_logs');
        const licenses = db.collection('licenses');
        const found = await licenses.findOne({ key: body.license_key });
        await logs.insertOne({
          licenseId: found?._id || null,
          appId: found?.appId || null,
          key: body.license_key,
          ip,
          hwid: body.hwid || null,
          status: 'denied',
          message: errorMessage,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error('Log write error (error):', e);
      }
      
      if (errorMessage.includes('Invalid license key')) {
        return NextResponse.json(
          { success: false, message: errorMessage },
          { status: 404 }
        );
      }
      
      if (errorMessage.includes('expired') || 
          errorMessage.includes('not active') ||
          errorMessage.includes('Maximum device')) {
        return NextResponse.json(
          { success: false, message: errorMessage },
          { status: 403 }
        );
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    );
  }
}
