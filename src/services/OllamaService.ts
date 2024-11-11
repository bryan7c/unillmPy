import { ILLMService } from "../interfaces/ILLMService";
import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export class OllamaService implements ILLMService {
    async generateText(input: string, options?: any): Promise<string> {
        const response = await axios.post(`${API_CONFIG.ollama.baseUrl}/generate`, JSON.stringify({ 
            model: options?.model || "mistral-nemo:latest",
            messages: [{'role': 'user', 'content': `${input}`}]
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data; // Ajuste conforme a estrutura da resposta
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