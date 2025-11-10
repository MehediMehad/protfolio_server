import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

import ApiError from '../errors/ApiError';
import prisma from '../libs/prisma';
import { fiendOwnerId } from '../modules/pet/pet.utils';
import { isValidObjectId } from '../utils/isValidObjectId';

const verifyPetOwnership = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Check if user exists in request (from auth middleware)
    if (!req.user || !req.user.id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const { petId } = req.params as { petId?: string };

    //  Check if petId provided
    if (!petId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'set petId in params');
    }

    // Validate petId format (Mongo-like ID)
    if (typeof petId !== 'string' || !isValidObjectId(petId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid pet ID format!');
    }

    // Find the pet in DB
    const pet = await prisma.pets.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found!');
    }

    // Compare owner
    const ownerId = await fiendOwnerId(req.user.id);
    const petOwnerId = pet.ownerId;

    if (ownerId !== petOwnerId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: You do not own this pet!');
    }

    return next();
  } catch (err) {
    next(err);
  }
};

export default verifyPetOwnership;
