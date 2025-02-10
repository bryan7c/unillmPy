import requests
import time
from config import Config
from services.provider_interface import ProviderInterface
from typing import List, Dict, Union
from services.cache_manager import CacheManager
import logging

class OpenAIService(ProviderInterface):
    def __init__(self):
        self.openai_api_key = Config.OPENAI_API_KEY
        self.openai_base_url = Config.OPENAI_BASE_URL
        self.model = "gpt-4o-mini"  # Modelo padrão
        self.cache = CacheManager()  # Inicializar o cache

    def generate_text(self, input_text: str, options: dict = None) -> str:
        try:
            # Verifica se options['model'] é uma lista
            if options and isinstance(options.get('model'), list):
                responses = []
                for model in options['model']:
                    # Cria uma cópia das options para cada modelo
                    model_options = options.copy()
                    model_options['model'] = model
                    
                    start_time = time.time()
                    response = self._generate_single_text(input_text, model_options)
                    execution_time = time.time() - start_time
                    
                    responses.append({
                        'model': model,
                        'response': response,
                        'execution_time_seconds': round(execution_time, 2)
                    })
                return responses
            else:
                # Comportamento padrão para um único modelo
                start_time = time.time()
                response = self._generate_single_text(input_text, options)
                execution_time = time.time() - start_time
                
                return [{
                    'model': options.get('model', self.model) if options else self.model,
                    'response': response,
                    'execution_time_seconds': round(execution_time, 2)
                }]
        except Exception as e:
            raise RuntimeError(f"Erro ao gerar texto: {str(e)}")

    def _generate_single_text(self, input_text: str, options: dict = None) -> str:
        model = options.get('model', self.model) if options else self.model
        context = options.get('context', '') if options else ''
        no_cache = options.get('no_cache', False) if options else False
        
        # Se no_cache for True, não verifica o cache
        if not no_cache:
            # Gera uma chave única para o cache baseada no input, contexto e modelo
            cache_key = f"{input_text}:{context}:{model}"
            logging.info(f"[Cache] Verificando cache com a chave: {cache_key}")
            
            # Verifica se existe resposta em cache
            cached_response = self.cache.get(cache_key)
            if cached_response:
                logging.info(f"[Cache Hit] Resposta encontrada no cache para o modelo {model}")
                return cached_response
            
            logging.info(f"[Cache Miss] Cache não encontrado para o modelo {model}")
        else:
            logging.info(f"[Cache] Cache desabilitado para esta requisição")
        
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
        if not no_cache:
            self.cache.set(cache_key, response_text)
            logging.info(f"[Cache Store] Nova resposta armazenada no cache para o modelo {model}")
        
        return response_text

    def get_available_models(self) -> List[str]:
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}'
        }
        response = requests.get(f"{self.openai_base_url}/models", headers=headers)
        response.raise_for_status()
        models = response.json()['data']
        return [model['id'] for model in models]