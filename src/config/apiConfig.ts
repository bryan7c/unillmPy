// src/config/apiConfig.ts
import dotenv from "dotenv";

dotenv.config();

export const API_CONFIG = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/",
    },
    ollama: {
        apiKey: process.env.OLLAMA_API_KEY || "",
        baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api",
    },
    grok: {
        apiKey: process.env.GROK_API_KEY || "",
        baseUrl: process.env.GROK_BASE_URL || "https://api.grok.com/v1/",
    },
};
