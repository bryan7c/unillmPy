from typing import Dict, Any, Optional, List, Union
import logging
from services.cache_manager import CacheManager
from services.provider_interface import ProviderInterface
import time

class BaseLLMService(ProviderInterface):
    def __init__(self):
        self.cache = CacheManager()
        self.model = None  # Deve ser definido pela classe filha

    def generate_text(self, input_text: str, options: Dict[str, Any] = None) -> Union[List[Dict[str, Union[str, float]]], str]:
        """
        Método base para gerar texto. Gerencia múltiplos modelos e tempo de execução.
        """
        try:
            # Verifica se options['model'] é uma lista
            if options and isinstance(options.get('model'), list):
                return self._handle_multiple_models(input_text, options)
            else:
                # Comportamento padrão para um único modelo
                return self._handle_single_model(input_text, options)
        except Exception as e:
            raise RuntimeError(f"Erro ao gerar texto: {str(e)}")

    def _handle_multiple_models(self, input_text: str, options: Dict[str, Any]) -> List[Dict[str, Union[str, float]]]:
        """
        Gerencia a geração de texto para múltiplos modelos.
        """
        responses = []
        for model in options['model']:
            # Cria uma cópia das options para cada modelo
            model_options = options.copy()
            model_options['model'] = model
            
            response_data = self._handle_single_model(input_text, model_options)
            responses.extend(response_data)
        return responses

    def _handle_single_model(self, input_text: str, options: Dict[str, Any]) -> List[Dict[str, Union[str, float]]]:
        """
        Gerencia a geração de texto para um único modelo, incluindo medição de tempo.
        """
        start_time = time.time()
        response = self._generate_single_text(input_text, options)
        execution_time = time.time() - start_time
        
        model = options.get('model', self.model) if options else self.model
        return [{
            'model': model,
            'response': response,
            'execution_time_seconds': round(execution_time, 2)
        }]

    def _check_cache(self, input_text: str, context: str, model: str, no_cache: bool) -> Optional[str]:
        """
        Verifica se existe uma resposta em cache para a entrada fornecida.
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
        """
        if no_cache:
            return

        cache_key = f"{input_text}:{context}:{model}"
        self.cache.set(cache_key, response)
        logging.info(f"[Cache Store] Nova resposta armazenada no cache para o modelo {model}")

    def _get_options_values(self, options: Dict[str, Any], default_model: str) -> tuple[str, str, bool]:
        """
        Extrai valores comuns das options.
        """
        model = options.get('model', default_model) if options else default_model
        context = options.get('context', '') if options else ''
        no_cache = options.get('no_cache', False) if options else False
        return model, context, no_cache

    def _generate_single_text(self, input_text: str, options: Dict[str, Any] = None) -> str:
        """
        Método abstrato que deve ser implementado pelas classes filhas.
        """
        raise NotImplementedError("Este método deve ser implementado pela classe filha")
