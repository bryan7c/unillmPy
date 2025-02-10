from typing import Dict, Any, Optional
import logging
from services.cache_manager import CacheManager
from services.provider_interface import ProviderInterface

class BaseLLMService(ProviderInterface):
    def __init__(self):
        self.cache = CacheManager()

    def _check_cache(self, input_text: str, context: str, model: str, no_cache: bool) -> Optional[str]:
        """
        Verifica se existe uma resposta em cache para a entrada fornecida.
        
        Args:
            input_text (str): Texto de entrada
            context (str): Contexto do sistema
            model (str): Nome do modelo
            no_cache (bool): Se True, ignora o cache
            
        Returns:
            Optional[str]: Resposta em cache se encontrada, None caso contrário
        """
        if no_cache:
            logging.info(f"[Cache] Cache desabilitado para esta requisição")
            return None

        # Gera uma chave única para o cache baseada no input, contexto e modelo
        cache_key = f"{input_text}:{context}:{model}"
        logging.info(f"[Cache] Verificando cache com a chave: {cache_key}")
        
        # Verifica se existe resposta em cache
        cached_response = self.cache.get(cache_key)
        if cached_response:
            logging.info(f"[Cache Hit] Resposta encontrada no cache para o modelo {model}")
            return cached_response
        
        logging.info(f"[Cache Miss] Cache não encontrado para o modelo {model}")
        return None

    def _store_in_cache(self, input_text: str, context: str, model: str, response: str, no_cache: bool) -> None:
        """
        Armazena uma resposta no cache.
        
        Args:
            input_text (str): Texto de entrada
            context (str): Contexto do sistema
            model (str): Nome do modelo
            response (str): Resposta a ser armazenada
            no_cache (bool): Se True, não armazena no cache
        """
        if no_cache:
            return

        cache_key = f"{input_text}:{context}:{model}"
        self.cache.set(cache_key, response)
        logging.info(f"[Cache Store] Nova resposta armazenada no cache para o modelo {model}")

    def _get_options_values(self, options: Dict[str, Any], default_model: str) -> tuple[str, str, str, bool]:
        """
        Extrai valores comuns das options.
        
        Args:
            options (Dict[str, Any]): Dicionário de opções
            default_model (str): Modelo padrão a ser usado se não especificado
            
        Returns:
            tuple: (model, context, no_cache)
        """
        model = options.get('model', default_model) if options else default_model
        context = options.get('context', '') if options else ''
        no_cache = options.get('no_cache', False) if options else False
        return model, context, no_cache
