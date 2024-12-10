import logging
from groq import Groq
from config import Config
import requests
import os

MODEL_LIST = [
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
    "llama3-8b-8192",
]

class GroqService:
    def __init__(self):
        # Inicializa o modelo Groq com as configurações necessárias
        self.client = Groq(api_key=Config.GROK_API_KEY)
        self.model_index = 0
        self.max_retries = len(MODEL_LIST) * 3  # Máximo de 3 rotações completas pela lista

    def get_models(self):
        api_key = Config.GROK_API_KEY
        url = "https://api.groq.com/openai/v1/models"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        response = requests.get(url, headers=headers)

        print(response.json())

    def generate_text(self, input_text: str, options: dict = None) -> str:
        retries = 0
        context = options.get('context', '')

        while retries < self.max_retries:
            model = MODEL_LIST[self.model_index]
            
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
                logging.warning("Modelo alterado para: {} motivo: {}".format(MODEL_LIST[self.model_index], e))
        
        raise Exception(
            "Limite atingido: todos os modelos foram tentados e falharam em três rotações completas"
        )