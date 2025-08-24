import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { License } from '@/models/License';

export class LicenseService {
  static async validateLicense(licenseKey: string, hwid?: string) {
    const db = await getDb();
    const licenses = db.collection<License>('licenses');
    const applications = db.collection('applications');
    
    const license = await licenses.findOne({ key: licenseKey });
    if (!license) {
      throw new Error('Invalid license key');
    }

    const now = new Date();
    
    if (license.expiresAt && new Date(license.expiresAt) < now) {
      throw new Error('License expired');
    }

    if (license.status !== 'active') {
      throw new Error('This license is not active');
    }

    if (hwid) {
      if (!license.hwids) {
        await licenses.updateOne(
          { _id: license._id },
          { $set: { hwids: [hwid], updatedAt: now } }
        );
      } else if (!license.hwids.includes(hwid)) {
        if (license.hwids.length >= license.hwidLimit) {
          throw new Error('Maximum device count reached');
        }
        
        await licenses.updateOne(
          { _id: license._id },
          { 
            $addToSet: { hwids: hwid },
            $set: { updatedAt: now }
          }
        );
      }
    }

    const app = await applications.findOne({ _id: new ObjectId(license.appId) });
    
    return {
      id: license._id,
      key: license.key,
      status: license.status,
      expiresAt: license.expiresAt,
      createdAt: license.createdAt,
      hwidLimit: license.hwidLimit,
      hwids: license.hwids || [],
      appName: app?.name || 'Bilinmeyen Uygulama',
      appId: license.appId
    };
  }

  static async createLicense(licenseData: Partial<License>) {
    const db = await getDb();
    const licenses = db.collection<License>('licenses');
    
    const license = new License({
      ...licenseData,
      key: `LIC-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      hwids: []
    });
    
    const result = await licenses.insertOne(license);
    return { ...license, _id: result.insertedId };
  }

  static async getLicense(licenseId: string) {
    const db = await getDb();
    const licenses = db.collection<License>('licenses');
    return await licenses.findOne({ _id: new ObjectId(licenseId) });
  }

  static async updateLicense(licenseId: string, updateData: Partial<License>) {
    const db = await getDb();
    const licenses = db.collection<License>('licenses');
    
    await licenses.updateOne(
      { _id: new ObjectId(licenseId) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      }
    );
    
    return this.getLicense(licenseId);
  }

  static async deleteLicense(licenseId: string) {
    const db = await getDb();
    const licenses = db.collection<License>('licenses');
    await licenses.deleteOne({ _id: new ObjectId(licenseId) });
  }
}
