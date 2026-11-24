import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';

export interface VoterIdentity {
  voterId: string;
  voterHash: string;
  ipHash: string;
}

@Injectable()
export class VoterIdentityService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'finallinks_voter_identity_default_hmac_secret_key_32';
  }

  getOrCreateVoterIdentity(req: Request, res?: Response): VoterIdentity {
    let voterId: string | undefined = req.cookies?.fl_voter;

    if (!voterId && req.headers['x-visitor-id']) {
      voterId = req.headers['x-visitor-id'] as string;
    }

    let isNew = false;
    if (!voterId || typeof voterId !== 'string' || voterId.length < 16) {
      voterId = crypto.randomBytes(16).toString('hex');
      isNew = true;
    }

    if (isNew && res && typeof res.cookie === 'function') {
      const isProd = this.configService.get<string>('NODE_ENV') === 'production';
      res.cookie('fl_voter', voterId, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        path: '/',
      });
    }

    const voterHash = crypto
      .createHmac('sha256', this.secret)
      .update(voterId)
      .digest('hex');

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const ipHash = crypto
      .createHmac('sha256', this.secret)
      .update(clientIp)
      .digest('hex');

    return { voterId, voterHash, ipHash };
  }
}
