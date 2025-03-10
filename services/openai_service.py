import requests
from config import Config
from services.base_llm_service import BaseLLMService
from typing import List, Dict

class OpenAIService(BaseLLMService):
    def __init__(self):
        super().__init__()
        self.openai_api_key = Config.OPENAI_API_KEY
        self.openai_base_url = Config.OPENAI_BASE_URL
        self.model = "gpt-4o-mini"  # Modelo padrão

    def _generate_single_text(self, input_text: str, options: dict = None) -> str:
        model, context, no_cache = self._get_options_values(options, self.model)

        # Verifica o cache
        cached_response = self._check_cache(input_text, context, model, no_cache)
        if cached_response:
            return cached_response
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        data = {
            'model': model,
            'messages': [{
                'role': 'system',
                'content': context
            }, {
                'role': 'user',
                'content': input_text
            }]
        }
        response = requests.post(f"{self.openai_base_url}/chat/completions", json=data, headers=headers)
        response.raise_for_status()
        response_text = response.json()['choices'][0]['message']['content']
        
        # Armazena a resposta no cache
        self._store_in_cache(input_text, context, model, response_text, no_cache)
        
        return response_text

    def get_available_models(self) -> List[str]:
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        response = requests.get(f"{self.openai_base_url}/models", headers=headers)
        response.raise_for_status()
        models = response.json()['data']
        return [model['id'] for model in models]