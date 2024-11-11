from abc import ABC, abstractmethod

class ILLMService(ABC):
    @abstractmethod
    def generate_text(self, input_text: str, options: dict = None) -> str:
        pass

    @abstractmethod
    def get_embedding(self, input_text: str) -> list:
        pass

    @abstractmethod
    def translate_text(self, input_text: str, target_language: str) -> str:
        pass