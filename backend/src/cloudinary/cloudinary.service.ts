import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'products', resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url) return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }


  
}
