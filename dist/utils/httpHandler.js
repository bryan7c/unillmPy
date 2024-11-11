"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (res, message, statusCode = 500) => {
    res.status(statusCode).json({ error: message });
};
exports.handleError = handleError;
