from services.groq_service import GroqService
from services.openai_service import OpenAIService
from services.ollama_service import OllamaService

class LLMServiceFactory:
    @staticmethod
    def get_service(provider: str):
        if provider.lower() == 'openai':
            return OpenAIService()
        elif provider.lower() == 'ollama':
            return OllamaService()
        elif provider.lower() == 'groq':
            return GroqService()
        else:
            raise ValueError("Unsupported provider")