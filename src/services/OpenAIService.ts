// src/services/OpenAIService.ts
import { ILLMService } from "../interfaces/ILLMService";
import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export class OpenAIService implements ILLMService {
    async generateText(input: string, options?: any): Promise<string> {
        const response = await axios.post(`${API_CONFIG.openai.baseUrl}/completions`, JSON.stringify({ 
        messages: [{'role': 'user', 'content': [
          {"type": "text", "text": `${input}`}
        ]}],
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0.7
    }), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_CONFIG.openai.apiKey}`
            }
        });
        return response.data.choices[0].message.content;
    }
    
    async getEmbedding(input: string): Promise<number[]> {
        // Implementar chamada para obter embedding
        return []; // Retorna um array vazio como exemplo
    }
    
    async translateText(input: string, targetLanguage: string): Promise<string> {
        // Implementar chamada para tradução
        return ""; // Retorna um array vazio como exemplo
    }
}
