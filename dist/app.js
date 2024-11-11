"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const llmRoutes_1 = __importDefault(require("./routes/llmRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use("/api/llm", llmRoutes_1.default);
app.use(errorHandler_1.errorHandler); // Middleware de tratamento de erros
exports.default = app;
