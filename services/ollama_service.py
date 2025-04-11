import requests
import logging
import os
from config import Config
from services.base_llm_service import BaseLLMService
from typing import List, Dict
from utils.response_processor import process_ollama_response
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from threading import Lock
from collections import defaultdict

class OllamaService(BaseLLMService):
    def __init__(self):
        super().__init__()
        self.model = "llama3.2:latest"  # This matches exactly with what's available in Ollama
        # Force the use of host.docker.internal in Docker environment
        if os.path.exists('/.dockerenv'):
            self.base_url = 'http://host.docker.internal:11434/api'
        else:
            self.base_url = Config.OLLAMA_BASE_URL.rstrip('/')
        
        # Timeout fixo de 10 minutos
        self.request_timeout = 600
        
        # Controle de sessões por origem
        self._sessions_lock = Lock()
        self._origin_sessions = defaultdict(lambda: None)
        
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
        
        # Obter a origem da requisição
        origin = options.get('origin', 'default') if options else 'default'

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
        
        # Criar nova sessão para esta requisição
        new_session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        new_session.mount("http://", adapter)
        new_session.mount("https://", adapter)
        
        # Cancelar sessão anterior da mesma origem se existir
        with self._sessions_lock:
            current_session = self._origin_sessions[origin]
            if current_session:
                try:
                    current_session.close()
                    logging.info(f"Cancelando requisição anterior da origem: {origin}")
                except:
                    pass
            self._origin_sessions[origin] = new_session
        
        try:
            response = new_session.post(url, json=payload, timeout=self.request_timeout)
            logging.info(f"Ollama response status: {response.status_code}")
            
            if response.status_code != 200:
                logging.error(f"Ollama error response: {response.text}")
                raise RuntimeError(f"Ollama retornou erro {response.status_code}: {response.text}")
            
            # Parse the response
            result = response.json()
            response_text = result.get('response', '')
            
            response_text = process_ollama_response(response_text)
            
            # Armazena a resposta no cache
            self._store_in_cache(input_text, context, model, response_text, no_cache)
            
            return response_text
            
        except requests.Timeout:
            logging.error(f"Timeout ao aguardar resposta do Ollama ({self.request_timeout}s)")
            raise RuntimeError(f"Timeout ao aguardar resposta do Ollama ({self.request_timeout}s)")
        except requests.RequestException as e:
            if "Connection aborted" in str(e):
                logging.info(f"Requisição anterior da origem {origin} cancelada por nova requisição")
                raise RuntimeError(f"Requisição da origem {origin} cancelada por nova solicitação")
            raise e

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
            
    def cancel_requests(self, origin: str = None) -> bool:
        """Cancela todas as requisições em execução para um determinado origin ou todas se origin não for especificado"""
        cancelled = False
        
        with self._sessions_lock:
            if origin:
                # Cancela apenas a sessão da origem especificada
                current_session = self._origin_sessions.get(origin)
                if current_session:
                    try:
                        current_session.close()
                        self._origin_sessions[origin] = None
                        cancelled = True
                        logging.info(f"Requisição cancelada para origem: {origin}")
                    except Exception as e:
                        logging.error(f"Erro ao cancelar requisição para origem {origin}: {str(e)}")
            else:
                # Cancela todas as sessões ativas
                for org, session in self._origin_sessions.items():
                    if session:
                        try:
                            session.close()
                            self._origin_sessions[org] = None
                            cancelled = True
                            logging.info(f"Requisição cancelada para origem: {org}")
                        except Exception as e:
                            logging.error(f"Erro ao cancelar requisição para origem {org}: {str(e)}")
        
        return cancelled