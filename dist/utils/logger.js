"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLog = exports.log = void 0;
// src/utils/logger.ts
const log = (message) => {
    console.log(`[LOG] ${message}`);
};
exports.log = log;
const errorLog = (message) => {
    console.error(`[ERROR] ${message}`);
};
exports.errorLog = errorLog;
