import { ObjectId } from 'mongodb';

export interface ILicense {
  _id: ObjectId;
  key: string;
  ownerId: string;
  appId: string;
  duration: string;
  expiresAt: Date | null;
  hwidLimit: number;
  hwids?: string[];
  note?: string;
  status: 'active' | 'suspended' | 'expired' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

export class License implements ILicense {
  _id: ObjectId;
  key: string;
  ownerId: string;
  appId: string;
  duration: string;
  expiresAt: Date | null;
  hwidLimit: number;
  hwids: string[];
  note: string;
  status: 'active' | 'suspended' | 'expired' | 'banned';
  createdAt: Date;
  updatedAt: Date;

  constructor(license: Partial<ILicense> = {}) {
    this._id = license._id || new ObjectId();
    this.key = license.key || '';
    this.ownerId = license.ownerId || '';
    this.appId = license.appId || '';
    this.duration = license.duration || '1m';
    this.expiresAt = license.expiresAt || null;
    this.hwidLimit = license.hwidLimit || 1;
    this.hwids = license.hwids || [];
    this.note = license.note || '';
    this.status = license.status || 'active';
    this.createdAt = license.createdAt || new Date();
    this.updatedAt = license.updatedAt || new Date();
  }
}
