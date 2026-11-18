import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucket: string;
  private readonly supabaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl =
      this.config.get<string>('SUPABASE_URL') || 'https://elwszhwgeshqmjdhsbep.supabase.co';
    const serviceKey =
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.config.get<string>('SUPABASE_ANON_KEY');
    this.bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET') || 'findfunlinks-media';

    if (
      this.supabaseUrl &&
      serviceKey &&
      serviceKey !== 'your-supabase-service-role-key' &&
      serviceKey !== 'your-supabase-anon-key'
    ) {
      this.supabase = createClient(this.supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });
      this.logger.log(
        `Initialized Supabase Storage client for ${this.supabaseUrl} (Bucket: ${this.bucket})`,
      );
      this.ensureBucketExists().catch((err) => {
        this.logger.warn(
          `Could not verify or auto-create Supabase storage bucket '${this.bucket}': ${err.message}`,
        );
      });
    } else {
      this.logger.warn(
        'Supabase credentials not configured or using placeholder keys; falling back to simulated storage.',
      );
    }
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.supabase) return;
    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      if (error) {
        this.logger.warn(`Failed to list storage buckets: ${error.message}`);
        return;
      }
      const exists = buckets?.some((b) => b.name === this.bucket);
      if (!exists) {
        const { error: createErr } = await this.supabase.storage.createBucket(this.bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        if (createErr) {
          this.logger.warn(`Could not create bucket '${this.bucket}': ${createErr.message}`);
        } else {
          this.logger.log(`Created public Supabase storage bucket '${this.bucket}'.`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Exception checking Supabase bucket: ${message}`);
    }
  }

  /**
   * Upload an Express Multer file to Supabase Storage
   */
  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file payload provided for upload.');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type '${file.mimetype}'. Allowed types: JPG, PNG, WebP, SVG, GIF, PDF.`,
      );
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const safeName = `${Date.now()}-${randomUUID()}.${ext}`;
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const storagePath = `${cleanFolder}/${safeName}`;

    // If Supabase client is live and authenticated
    if (this.supabase) {
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Supabase upload failed for ${storagePath}: ${uploadError.message}`);
        throw new BadRequestException(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(storagePath);

      return {
        url: publicUrlData.publicUrl,
        path: storagePath,
        size: file.size,
        mimeType: file.mimetype,
      };
    }

    // Simulated fallback for dev when keys are placeholders
    const mockUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${storagePath}`;
    return {
      url: mockUrl,
      path: storagePath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete a file from Supabase Storage by its relative path
   */
  async deleteFile(path: string): Promise<boolean> {
    if (!this.supabase || !path) return false;
    try {
      const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
      if (error) {
        this.logger.warn(`Failed to delete storage path '${path}': ${error.message}`);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get public URL for a given path
   */
  getPublicUrl(path: string): string {
    if (this.supabase) {
      const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}
