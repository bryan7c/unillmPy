// src/middlewares/apiMiddleware.ts
import { Request, Response, NextFunction } from "express";

export const apiMiddleware = (req: Request, res: Response, next: NextFunction) => {
    next();
};
