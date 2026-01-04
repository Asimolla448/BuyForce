import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    return {
      folder: 'products',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov'],
    };
  },
});
