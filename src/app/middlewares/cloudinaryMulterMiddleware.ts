// MulterMiddleware.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinaryInstance from '../libs/cloudinary.ts';

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryInstance,
    params: async (_req: any, file: any) => {
        let folder = 'users';
        let public_id = `${Date.now()}-${file.fieldname}-${file.originalname.split('.')[0]}`;

        if (file.fieldname === 'image') {
            folder = 'profile-images';
        } else if (file.fieldname === 'images') {
            folder = 'gallery';
        } else if (file.fieldname === 'video') {
            folder = 'videos';
        }

        // ← This is the key fix
        let resource_type: 'image' | 'video' | 'raw' = 'image'; // default

        if (file.mimetype.startsWith('video/')) {
            resource_type = 'video';
        } else if (!file.mimetype.startsWith('image/')) {
            // fallback for PDFs, docs, etc. (if you allow them later)
            resource_type = 'raw';
        }

        return {
            folder,
            public_id,
            resource_type,              // ← added / dynamic
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi'],
            // You can keep or remove allowed_formats — it's optional but adds safety
        };
    },
});

const imageFilter = (_req: any, file: any, cb: any) => {
    // const allowedMimes = [
    //   'image/png',
    //   'image/jpeg',
    //   'image/jpg',
    //   'application/pdf', // pdf
    //   'video/mp4',
    //   'video/webm',
    //   'video/quicktime',
    //   'video/x-msvideo',
    // ];



    // if (!allowedMimes.includes(file.mimetype)) {
    //   return cb(
    //     new ApiError(
    //       httpStatus.BAD_REQUEST,
    //       'Invalid file type. Only PNG, JPG, PDF and JPEG videos are allowed.',
    //     ),
    //     false,
    //   );
    // }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // e.g. 50MB — adjust as needed
    },
});

// Single upload (most common for profile)
const uploadProfileImage = upload.single('image');

// Multiple / mixed fields upload (used in your register route)
const uploadFields = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 },
]);

// Export the same shape as before
export const CloudinaryFileUploader = {
    upload,
    uploadProfileImage,
    uploadFields,
};