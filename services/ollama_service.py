import requests
import logging
import os
from config import Config
from services.base_llm_service import BaseLLMService
from typing import List, Dict
from utils.response_processor import process_ollama_response
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class OllamaService(BaseLLMService):
    def __init__(self):
        super().__init__()
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

    def _generate_single_text(self, input_text: str, options: Dict[str, str] = None) -> str:
        # Prepare the request
        url = f"{self.base_url}/generate"
        model, context, no_cache = self._get_options_values(options, self.model)

        # Verifica o cache
        cached_response = self._check_cache(input_text, context, model, no_cache)
        if cached_response:
            return cached_response
        
        payload = {
            "model": model,
            "prompt": input_text,
            "stream": False
        }
        
        # Adicionar system prompt apenas se estiver presente nas options
        if context:
            payload["system"] = context
        
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
            if model == 'deepseek-r1:latest':
                response_text = process_ollama_response(response_text)
            
            # Armazena a resposta no cache
            self._store_in_cache(input_text, context, model, response_text, no_cache)
            
            return response_text
            
        except requests.Timeout:
            logging.error("Timeout ao aguardar resposta do Ollama (180s)")
            raise RuntimeError("Timeout ao aguardar resposta do Ollama (180s)")

    def get_available_models(self) -> List[str]:
        try:
            response = self.session.get(f"{self.base_url}/tags")
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [model['name'] for model in models]
            return []
        except Exception as e:
            logging.error(f"Error getting available models: {str(e)}")
            return []