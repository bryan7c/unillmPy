// src/config/envConfig.ts
import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
