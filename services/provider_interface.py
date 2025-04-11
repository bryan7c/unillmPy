from abc import ABC, abstractmethod
from typing import List, Dict, Any

class ProviderInterface(ABC):
    """Interface base para todos os providers de LLM"""
    
    @abstractmethod
    def generate_text(self, input_text: str, options: dict = None) -> str:
        """Gera texto usando o modelo do provider"""
        pass
    
    @abstractmethod
    def get_available_models(self) -> List[str]:
        """Retorna a lista de modelos disponíveis do provider"""
        pass

    @abstractmethod
    def cancel_requests(self, origin: str = None) -> bool:
        """Cancela todas as requisições em execução para um determinado origin ou todas se origin não for especificado
        
        Args:
            origin: Identificador da origem das requisições a serem canceladas. Se None, cancela todas as requisições.
            
        Returns:
            bool: True se alguma requisição foi cancelada, False caso contrário
        """
        pass
