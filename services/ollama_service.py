import requests
import logging
import os
import time
from config import Config
from services.provider_interface import ProviderInterface
from typing import List, Dict, Union
from utils.response_processor import process_ollama_response
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class OllamaService(ProviderInterface):
    def __init__(self):
        self.model = "llama3.1:latest"  # This matches exactly with what's available in Ollama
        # Force the use of host.docker.internal in Docker environment
        if os.path.exists('/.dockerenv'):
            self.base_url = 'http://host.docker.internal:11434/api'
        else:
            self.base_url = Config.OLLAMA_BASE_URL.rstrip('/')
        
        # Configurar retry strategy
        retry_strategy = Retry(
            total=3,  # número total de tentativas
            backoff_factor=1,  # tempo entre tentativas: {backoff_factor} * (2 ** ({número da tentativa} - 1))
            status_forcelist=[500, 502, 503, 504]  # status HTTP para retry
        )
        
        # Criar sessão com retry
        self.session = requests.Session()
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        logging.info(f"Initializing OllamaService with base_url: {self.base_url}")

    def generate_text(self, input_text: str, options: Dict[str, Union[str, List[str]]] = None) -> Union[str, List[Dict[str, str]]]:
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
                return self._generate_single_text(input_text, options)
                
        except Exception as e:
            logging.error(f"Error generating text: {str(e)}")
            raise

    def _generate_single_text(self, input_text: str, options: Dict[str, str] = None) -> str:
        # Prepare the request
        url = f"{self.base_url}/generate"
        payload = {
            "model": options.get('model', self.model) if options else self.model,
            "prompt": input_text,
            "stream": False
        }
        
        # Adicionar system prompt apenas se estiver presente nas options
        if options and options.get('context'):
            payload["system"] = options['context']
        
        logging.info(f"Sending request to Ollama: URL={url}, payload={payload}")
        
        # Aumentar o timeout para 180 segundos (3 minutos)
        try:
            response = self.session.post(url, json=payload, timeout=180)
            logging.info(f"Ollama response status: {response.status_code}")
            
            if response.status_code != 200:
                logging.error(f"Ollama error response: {response.text}")
                raise RuntimeError(f"Ollama retornou erro {response.status_code}: {response.text}")
            
            # Parse the response
            result = response.json()
            response_text = result.get('response', '')
            
            # Processa a resposta se o modelo for deepseek-r1:latest
            model = options.get('model', self.model) if options else self.model
            if model == 'deepseek-r1:latest':
                response_text = process_ollama_response(response_text)
            
            return response_text
            
        except requests.Timeout:
            logging.error("Timeout ao aguardar resposta do Ollama (180s)")
            raise RuntimeError("O modelo está demorando muito para responder. Por favor, tente novamente ou use um modelo mais leve.")
        except requests.RequestException as e:
            logging.error(f"Erro na requisição ao Ollama: {str(e)}")
            raise RuntimeError(f"Erro ao comunicar com o Ollama: {str(e)}")

    def get_available_models(self) -> List[str]:
        try:
            url = f"{self.base_url}/tags"
            response = self.session.get(url)
            response.raise_for_status()
            models = response.json()['models']
            return [model['name'] for model in models]
        except Exception as e:
            logging.error(f"Erro ao obter lista de modelos do Ollama: {str(e)}")
            return []