from langchain_ollama import OllamaLLM

class OllamaService:
    def __init__(self):
        # Inicializa o modelo Ollama com as configurações necessárias
        self.model = "mistral-nemo:latest"

    def generate_text(self, input_text: str, options: dict = None) -> str:
        # Gera texto usando o modelo Ollama
        llm = OllamaLLM(model=self.model)
        context = options.get('context') if options else None
        return llm.invoke(input_text, context=context)