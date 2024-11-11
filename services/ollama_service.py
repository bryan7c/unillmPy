import requests
from config import Config

class OllamaService:
    def generate_text(self, input_text: str, options: dict = None) -> str:
        headers = {
            'Content-Type': 'application/json'
        }
        data = {
            'model': options.get('model', 'mistral-nemo:latest'),
            'messages': [{'role': 'user', 'content': input_text}]
        }
        response = requests.post(f"{Config.OLLAMA_BASE_URL}/generate", json=data, headers=headers)
        response.raise_for_status()
        return response.json()  # Ajuste conforme a estrutura da resposta