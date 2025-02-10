import logging
import time
from groq import Groq
from config import Config
import requests
import os
from services.provider_interface import ProviderInterface
from typing import List, Dict, Union

MODEL_LIST = [
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
    "llama3-8b-8192",
]

class GroqService(ProviderInterface):
    def __init__(self):
        # Inicializa o modelo Groq com as configurações necessárias
        self.client = Groq(api_key=Config.GROK_API_KEY)
        self.model_index = 0
        self.max_retries = len(MODEL_LIST) * 3  # Máximo de 3 rotações completas pela lista
        self.model = MODEL_LIST[self.model_index]  # Modelo padrão

    def get_models(self):
        api_key = Config.GROK_API_KEY
        url = "https://api.groq.com/openai/v1/models"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        response = requests.get(url, headers=headers)

        print(response.json())

    def generate_text(self, input_text: str, options: dict = None) -> Union[List[Dict[str, Union[str, float]]], str]:
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
        retries = 0
        context = options.get('context', '')
        model = options.get('model', self.model) if options else self.model

        while retries < self.max_retries:
            try:
                response = self.client.chat.completions.create(
                    messages=[{
                        "role": "system",
                        "content": context
                    }, {
                        "role": "user",
                        "content": input_text,
                    }],
                    temperature=0.7,
                    model=model,
                )
                return response.choices[0].message.content
            except Exception as e:
                retries += 1
                self.model_index = (self.model_index + 1) % len(MODEL_LIST)
                self.model = MODEL_LIST[self.model_index]
                logging.warning("Modelo alterado para: {} motivo: {}".format(self.model, e))
                if options and 'model' in options:
                    # Se um modelo específico foi solicitado e falhou, não tente outros modelos
                    raise
        
        raise Exception(
            "Limite atingido: todos os modelos foram tentados e falharam em três rotações completas"
        )

    def get_available_models(self) -> List[str]:
        return MODEL_LIST.copy()