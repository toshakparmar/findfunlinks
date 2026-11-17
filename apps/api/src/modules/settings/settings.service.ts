import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const publicKeys = [
      'site_name',
      'site_description',
      'registrations_enabled',
      'announcement_banner',
      'maintenance_mode',
    ];

    const records = await this.prisma.setting.findMany({
      where: { key: { in: publicKeys } },
    });

    const result: Record<string, unknown> = {
      site_name: 'FindFunLinks',
      site_description: 'Discover fun websites and their live working mirrors.',
      registrations_enabled: true,
      announcement_banner: null,
      maintenance_mode: false,
    };

    for (const r of records) {
      result[r.key] = r.value;
    }

    return result;
  }

  async getAllSettings() {
    const records = await this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const result: Record<string, unknown> = {};
    for (const r of records) {
      result[r.key] = r.value;
    }
    return result;
  }

  async updateSettings(settings: Record<string, unknown>) {
    const operations = Object.entries(settings).map(([key, value]) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue },
      }),
    );

    await this.prisma.$transaction(operations);
    return this.getAllSettings();
  }
}
