// src/utils/errorHandler.ts
import { Response } from "express";

export const handleError = (res: Response, message: string, statusCode: number = 500) => {
    res.status(statusCode).json({ error: message });
};
