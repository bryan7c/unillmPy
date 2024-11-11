"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_CONFIG = void 0;
// src/config/apiConfig.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.API_CONFIG = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/",
    },
    ollama: {
        apiKey: process.env.OLLAMA_API_KEY || "",
        baseUrl: process.env.OLLAMA_BASE_URL || "https://api.ollama.com/v1/",
    },
    grok: {
        apiKey: process.env.GROK_API_KEY || "",
        baseUrl: process.env.GROK_BASE_URL || "https://api.grok.com/v1/",
    },
};
