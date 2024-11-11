// src/routes/llmRoutes.ts

import express from "express";
import { generateText } from "../controllers/llmController";
import { apiMiddleware } from "../middlewares/apiMiddleware";

const router = express.Router();

router.post("/generate-text", apiMiddleware, (req, res, next) => generateText(req, res, next));

// Rota para verificar o status do servidor
router.get("/status", (req, res) => {
    res.json({ status: "Servidor está funcionando" });
});

export default router;
