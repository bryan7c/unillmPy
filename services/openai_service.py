import requests
from config import Config
from services.provider_interface import ProviderInterface
from typing import List

class OpenAIService(ProviderInterface):
    def __init__(self):
        self.openai_api_key = Config.OPENAI_API_KEY
        self.openai_base_url = Config.OPENAI_BASE_URL

    def generate_text(self, input_text: str, options: dict = None) -> str:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        data = {
            'model': 'gpt-4o-mini',
            'messages': [{
                'role': 'system',
                'content': options.get('context', '')
            }, {
                'role': 'user',
                'content': input_text
            }]
        }
        response = requests.post(f"{self.openai_base_url}/chat/completions", json=data, headers=headers)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']

    def get_available_models(self) -> List[str]:
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        response = requests.get(f"{self.openai_base_url}/models", headers=headers)
        response.raise_for_status()
        models = response.json()['data']
        return [model['id'] for model in models]