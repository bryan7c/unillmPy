import requests
import logging
import os
from config import Config
from services.provider_interface import ProviderInterface
from typing import List

class OllamaService(ProviderInterface):
    def __init__(self):
        self.model = "llama3.1:latest"  # This matches exactly with what's available in Ollama
        # Force the use of host.docker.internal in Docker environment
        if os.path.exists('/.dockerenv'):
            self.base_url = 'http://host.docker.internal:11434/api'
        else:
            self.base_url = Config.OLLAMA_BASE_URL.rstrip('/')
        logging.info(f"Initializing OllamaService with base_url: {self.base_url}")

    def generate_text(self, input_text: str, options: dict = None) -> str:
        try:
            # Prepare the request
            url = f"{self.base_url}/generate"
            payload = {
                "model": options.get('model', self.model),
                "prompt": input_text,
                "stream": False
            }
            
            # Adicionar system prompt apenas se estiver presente nas options
            if options and options.get('context'):
                payload["system"] = options['context']
            
            logging.info(f"Sending request to Ollama: URL={url}, payload={payload}")
            
            # Make the request with a longer timeout
            response = requests.post(url, json=payload, timeout=60)
            
            # Log the response for debugging
            logging.info(f"Ollama response status: {response.status_code}")
            if response.status_code != 200:
                logging.error(f"Ollama error response: {response.text}")
                raise RuntimeError(f"Ollama retornou erro {response.status_code}: {response.text}")
            
            # Parse the response
            result = response.json()
            return result.get('response', '')
            
        except requests.exceptions.Timeout:
            logging.error("Request to Ollama timed out after 60 seconds")
            raise RuntimeError("A requisição para o Ollama excedeu o tempo limite de 60 segundos")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error in generate_text: {str(e)}")
            raise RuntimeError(f"Falha na comunicação com Ollama: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error in generate_text: {str(e)}")
            raise

    def get_available_models(self) -> List[str]:
        try:
            url = f"{self.base_url}/tags"
            response = requests.get(url)
            response.raise_for_status()
            models = response.json()['models']
            return [model['name'] for model in models]
        except Exception as e:
            logging.error(f"Erro ao obter lista de modelos do Ollama: {str(e)}")
            return []