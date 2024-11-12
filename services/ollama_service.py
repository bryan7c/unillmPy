from langchain_community.llms import Ollama

class OllamaService:
    def __init__(self):
        # Inicializa o modelo Ollama com as configurações necessárias
        self.model = "mistral-nemo:latest"

    def generate_text(self, input_text: str, options: dict = None) -> str:
        # Gera texto usando o modelo Ollama
        llm = Ollama(model=self.model)
        return llm.invoke(f'<system>\n{options.get("context", "")}\n</system>\n\n<user>\n{input_text}\n</user>')