import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
}

export class CloudinaryService {
  static async uploadFile(
    file: Buffer | string,
    options: {
      folder?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      public_id?: string;
      allowed_formats?: string[];
    } = {}
  ): Promise<UploadResult> {
    const uploadOptions = {
      folder: options.folder || 'community-platform',
      resource_type: options.resource_type || 'auto',
      use_filename: true,
      unique_filename: true,
      ...options,
    };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file as any,
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadResult);
          }
        }
      );
    });
  }

  static async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });
  }

  static async uploadMultipleFiles(
    files: (Buffer | string)[],
    folder: string = 'community-platform'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file, { folder })
    );
    
    return Promise.all(uploadPromises);
  }
}