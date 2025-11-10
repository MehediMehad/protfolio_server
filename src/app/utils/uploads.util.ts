import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import httpStatus from 'http-status';

import ApiError from '../errors/ApiError';
import { S3Uploader } from '../helpers/fileStorageS3Uploader';

type UploadOptions = {
  fieldName: string; // example: "profile", "video", "image"
  folder?: string; // S3 Folder Name example: "profile/images"
  maxSize?: number; // example: 100; default 100MB
  allowedTypes?: string[];
  defaultUrl?: string; // optional fallback URL, ignored if required is true
  required?: boolean; // if true, defaultUrl is ignored and file is mandatory
};

// **Upload file to DigitalOcean Spaces and return URL**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUploadedFileUrl = async (req: any, options: UploadOptions): Promise<string> => {
  const files = req.files;

  const {
    fieldName,
    folder,
    maxSize = 100, // default 100MB
    allowedTypes,
    defaultUrl,
    required = false,
  } = options;

  // Check if file is missing
  if (!files || !files[fieldName] || files[fieldName].length === 0) {
    if (required) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} is required.`);
    }
    if (!defaultUrl) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `No ${fieldName} provided and no default URL specified.`,
      );
    }
    return defaultUrl;
  }

  const file = files[fieldName][0];

  // Convert MB → bytes
  const maxSizeBytes = maxSize * 1024 * 1024;

  // Size check
  if (file.size > maxSizeBytes) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} size exceeds limit of ${maxSize}MB.`);
  }

  // Type check
  if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid ${fieldName} format. Allowed: ${allowedTypes.join(', ')}`,
    );
  }

  // Upload to S3
  const uploadResult = await S3Uploader.uploadToS3(file, folder);

  const fileUrl = uploadResult.Location;
  return fileUrl;
};

type MultiUploadOptions = {
  fieldName: string; // example: "images"
  folder?: string; // S3 folder name
  maxSize?: number;
  allowedTypes?: string[]; // optional mimeTypes
  defaultUrls?: string[]; // fallback urls if no new file
};

// **Upload multiple files to DigitalOcean Spaces and return URLs**
const getUploadedFileUrls = async (
  req: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  options: MultiUploadOptions,
): Promise<string[] | undefined> => {
  const { fieldName, folder, maxSize, allowedTypes, defaultUrls } = options;

  if (!req.files || !req.files[fieldName] || req.files[fieldName].length === 0) {
    return defaultUrls;
  }

  const files: Express.Multer.File[] = req.files[fieldName];

  // Validate + Upload all files together
  const uploadPromises = files.map(async (file) => {
    // Size check
    if (maxSize && file.size > maxSize) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `${fieldName} size exceeds limit of ${maxSize / (1024 * 1024)}MB.`,
      );
    }

    // Type check
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid ${fieldName} format. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    // Upload to S3
    const uploadResult = await S3Uploader.uploadToS3(file, folder);
    return uploadResult.Location;
  });

  return Promise.all(uploadPromises);
};

// **Ensure uploads folder exists (create if missing)*
const uploadsDir = path.join(process.cwd(), 'uploads');

const createUploadsFolder = (): void => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 uploads folder created successfully!');
  }
};

// **Clear uploads folder (delete all files)**
const clearUploadsDir = async (): Promise<void> => {
  try {
    // Ensure directory exists
    await fsp.mkdir(uploadsDir, { recursive: true });

    // Delete all files
    const files = await fsp.readdir(uploadsDir);
    await Promise.all(
      files.map(async (f) => {
        const filePath = path.join(uploadsDir, f);
        await fsp.unlink(filePath);
      }),
    );
    console.log('🧹 uploads folder cleared!');
  } catch (err) {
    console.error('Failed to clear uploads directory:', err);
  }
};

export { getUploadedFileUrl, getUploadedFileUrls, createUploadsFolder, clearUploadsDir };
