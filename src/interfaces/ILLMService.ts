// src/interfaces/ILLMService.ts
export interface ILLMService {
    generateText(input: string, options?: any): Promise<string>;
    getEmbedding(input: string): Promise<number[]>;
    translateText(input: string, targetLanguage: string): Promise<string>;
}
