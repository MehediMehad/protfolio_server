// Validate Mongo ObjectId (24 hex chars)
export const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
