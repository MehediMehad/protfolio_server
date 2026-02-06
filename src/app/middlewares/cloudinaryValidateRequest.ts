// cloudinaryValidateRequest
import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

interface FileFieldMapping {
    [key: string]:
    | 'single'
    | 'array'
    | { target: string; mode: 'single' | 'array'; filedName: string; type?: 'multiple' | 'single' };
}

const CloudinaryValidateRequest =
    (schema: z.ZodTypeAny, fileFields?: FileFieldMapping) =>
        async (req: Request, _res: Response, next: NextFunction) => {

            try {
                let data = req.body?.data ?? req.body;

                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }

                // ──────────────────────────────────────────────
                // Single file (req.file) – rare in your case, but kept for completeness
                // ──────────────────────────────────────────────
                if (fileFields && req.file) {
                    const fileFieldNames = Object.keys(fileFields);
                    const file = req.file as any; // or better: import { CloudinaryFile } or use Express.Multer.File
                    if (fileFieldNames.includes(file.fieldname) && fileFields[file.fieldname] === 'single') {
                        data[file.fieldname] = file.path;  // ← changed from .location to .path
                    }
                }

                // ──────────────────────────────────────────────
                // Multiple files (req.files)
                // ──────────────────────────────────────────────
                if (fileFields && req.files) {
                    const files = req.files as { [key: string]: Express.Multer.File[] };

                    for (const fieldName in fileFields) {
                        const config = fileFields[fieldName];
                        const uploadedFiles = files[fieldName];
                        if (!uploadedFiles || uploadedFiles.length === 0) continue;

                        if (config === 'single') {
                            data[fieldName] = uploadedFiles[0].path;          // ← .path
                        } else if (config === 'array') {
                            data[fieldName] = uploadedFiles.map((f) => f.path); // ← .path
                        }
                        // Nested/dynamic mapping (if you use it later)
                        else if (typeof config === 'object' && config.target) {
                            console.log('files🛑🛑🛑', files);
                            const { target, mode, filedName, type } = config;

                            if (data[target] && Array.isArray(data[target])) {
                                const urls =
                                    mode === 'array'
                                        ? uploadedFiles.map((f) => f.path)          // ← .path
                                        : [uploadedFiles[0].path];                  // ← .path

                                data[target] = data[target].map((item: any) => {
                                    if (type === 'multiple') {
                                        return {
                                            ...item,
                                            [filedName]: urls,
                                        };
                                    }
                                    return {
                                        ...item,
                                        [filedName]: urls[0],
                                    };
                                });
                            }
                        }
                    }
                }

                console.log('🎯 Validated Request:', data);
                await schema.parseAsync(data);

                req.body = data;
                next();
            } catch (err) {
                next(err);
            }
        };

export default CloudinaryValidateRequest;