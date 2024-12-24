import logging
import sys
from services.ollama_service import OllamaService

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def test_phi_model():
    try:
        service = OllamaService()
        options = {
            "model": "vanilj/Phi-4:latest",
            "context": "Você é um assistente prestativo."
        }
        response = service.generate_text(
            "Olá, como você está?",
            options=options
        )
        print("Resposta:", response)
    except Exception as e:
        print(f"Erro: {str(e)}")
        logging.exception("Erro detalhado:")

if __name__ == "__main__":
    test_phi_model()
