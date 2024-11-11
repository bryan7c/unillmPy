// src/app.ts
import express from "express";
import bodyParser from "body-parser";
import llmRoutes from "./routes/llmRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(bodyParser.json());
app.use("/api/llm", llmRoutes);
app.use(errorHandler); // Middleware de tratamento de erros

export default app;
