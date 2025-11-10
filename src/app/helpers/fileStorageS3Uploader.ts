import fs from 'fs/promises';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import httpStatus from 'http-status';

import config from '../configs';
import { s3Client } from '../configs/s3Client';
import ApiError from '../errors/ApiError';

// **Multipart Upload to DigitalOcean Spaces**
const uploadToS3 = async (
  file: Express.Multer.File,
  folder?: string,
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  // Check if file exists
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File not found.');
  }

  // Check if file path, mimetype, or originalname is missing
  if (!file.path || !file.mimetype || !file.originalname) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File path, mimetype, or originalname not found.');
  }

  // Set bucket
  const Bucket = config.S3.bucketName;

  // Set key
  const Key = folder ? `eshofer/${folder}/${file.originalname}` : `eshofer/${file.originalname}`;

  try {
    // Read file
    const fileBuffer = await fs.readFile(file.path);

    // Create command
    const command = new PutObjectCommand({
      Bucket: config.S3.bucketName,
      Key,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    });

    // Upload file
    const uploadResult = await s3Client.send(command);

    // Check if upload failed
    if (!uploadResult) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload file.');
    }

    //  Return result
    return {
      Location: `https://${Bucket}.${config.S3.region}.digitaloceanspaces.com/${Key}`, // Public URL
      Bucket,
      Key,
    };
  } catch (error) {
    console.error('Error in multipart upload:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload file.');
  }
};

// **Upload multiple files to DigitalOcean Spaces**
const uploadMultipleFilesToS3 = async (
  files: Express.Multer.File[],
  folder?: string,
): Promise<{ Location: string; Bucket: string; Key: string }[]> => {
  const uploadPromises = files.map((file) => uploadToS3(file, folder));
  return Promise.all(uploadPromises);
};

type UploadOptions = {
  folder?: string;
  maxSize?: number; // 100MB
  allowedTypes?: string[];
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

// Default allowed types
const defaultAllowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

// Upload single file + validation
export const getFileUrl = async (
  files: Record<string, Express.Multer.File[]>,
  fieldName: string,
  options: UploadOptions = {},
): Promise<string | undefined> => {
  const {
    folder = 'uploads',
    maxSize = 100,
    allowedTypes = defaultAllowedTypes,
    minLength = 1,
    maxLength = 1,
    required = true,
  } = options;

  const fileArray = files[fieldName];

  // Check if file is missing
  if (!fileArray || fileArray.length === 0) {
    if (required) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} is required.`);
    }
    return undefined;
  }

  // Validate min/max count
  if (fileArray.length < minLength) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${fieldName} requires at least ${minLength} file(s).`,
    );
  }
  if (fileArray.length > maxLength) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} allows maximum ${maxLength} file(s).`);
  }

  const file = fileArray[0];

  // Validate file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${fieldName} must be of type: ${allowedTypes.join(', ')}`,
    );
  }

  // Validate file size (MB → bytes)
  const maxBytes = maxSize * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} must not exceed ${maxSize}MB.`);
  }

  const uploadResult = await uploadToS3(file, folder);
  return uploadResult.Location;
};

// Upload multiple files + validation
export const getMultipleFileUrls = async (
  files: Record<string, Express.Multer.File[]>,
  fieldName: string,
  options: UploadOptions = {},
): Promise<string[] | undefined> => {
  const {
    folder = 'uploads',
    maxSize = 100,
    allowedTypes = defaultAllowedTypes,
    minLength = 1,
    maxLength = 1,
    required = true,
  } = options;

  const fileArray = files[fieldName];

  // Check if file is missing
  if (!fileArray || fileArray.length === 0) {
    if (required) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} is required.`);
    }
    return undefined;
  }

  // ✅ Validate min/max count
  if (fileArray.length < minLength) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${fieldName} requires at least ${minLength} file(s).`,
    );
  }

  if (fileArray.length > maxLength) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} allows maximum ${maxLength} file(s).`);
  }

  // Validate file type
  for (const file of fileArray) {
    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `${fieldName} must be of type: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate file size (MB → bytes)
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} must not exceed ${maxSize}MB.`);
    }
  }

  const uploadResults = await uploadMultipleFilesToS3(fileArray, folder);
  return uploadResults.map((result) => result.Location);
};

// **Export**
export const S3Uploader = {
  uploadToS3,
  uploadMultipleFilesToS3,
};
