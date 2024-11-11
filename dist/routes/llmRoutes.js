"use strict";
// src/routes/llmRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const llmController_1 = require("../controllers/llmController");
const apiMiddleware_1 = require("../middlewares/apiMiddleware");
const router = express_1.default.Router();
router.post("/generate-text", apiMiddleware_1.apiMiddleware, (req, res, next) => (0, llmController_1.generateText)(req, res, next));
// Rota para verificar o status do servidor
router.get("/status", (req, res) => {
    res.json({ status: "Servidor está funcionando" });
});
exports.default = router;
