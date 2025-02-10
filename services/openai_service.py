import requests
from config import Config
from services.provider_interface import ProviderInterface
from typing import List

class OpenAIService(ProviderInterface):
    def __init__(self):
        self.openai_api_key = Config.OPENAI_API_KEY
        self.openai_base_url = Config.OPENAI_BASE_URL
        self.model = "gpt-4o-mini"  # Modelo padrão

    def generate_text(self, input_text: str, options: dict = None) -> str:
        try:
            # Verifica se options['model'] é uma lista
            if options and isinstance(options.get('model'), list):
                responses = []
                for model in options['model']:
                    # Cria uma cópia das options para cada modelo
                    model_options = options.copy()
                    model_options['model'] = model
                    response = self._generate_single_text(input_text, model_options)
                    responses.append({
                        'model': model,
                        'response': response
                    })
                return responses
            else:
                # Comportamento padrão para um único modelo
                return self._generate_single_text(input_text, options)
        except Exception as e:
            raise RuntimeError(f"Erro ao gerar texto: {str(e)}")

    def _generate_single_text(self, input_text: str, options: dict = None) -> str:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        data = {
            'model': options.get('model', self.model) if options else self.model,
            'messages': [{
                'role': 'system',
                'content': options.get('context', '') if options else ''
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