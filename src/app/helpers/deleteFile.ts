import fs from 'fs/promises';
import path from 'path';

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { s3Client } from '../libs/s3Client';

const deleteUploadImage = async (imagePath: string): Promise<boolean> => {
  try {
    const fullPath = path.join(__dirname, '../../../uploads', imagePath);
    console.log('Full path:', fullPath); // Debugging
    await fs.unlink(fullPath);
    return true; // Indicate success
  } catch (err) {
    console.error(`Error deleting file ${imagePath}:`, err);
    return false; // Throw the error so it can be caught where the function is called
  }
};

const deleteS3Image = async (imagePath: string) => {
  if (!imagePath) {
    console.warn('No image path provided');
    return false;
  }
  try {
    // Use DeleteObjectCommand
    const command = new DeleteObjectCommand({
      Bucket: process.env.DO_SPACE_BUCKET,
      Key: imagePath,
    });

    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error(`Error deleting file ${imagePath}:`, err);
    return false;
  }
};

export const deleteFile = { deleteUploadImage, deleteS3Image };
