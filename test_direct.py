import requests
import logging
import sys

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def test_phi4_direct():
    try:
        base_url = 'http://localhost:11434/api'
        url = f"{base_url}/generate"
        
        payload = {
            "model": "vanilj/Phi-4:latest",
            "prompt": "Qual a cor do céu?",
            "stream": False
        }
        
        logging.info(f"Enviando requisição para: {url}")
        logging.info(f"Payload: {payload}")
        
        response = requests.post(url, json=payload, timeout=30)
        
        logging.info(f"Status da resposta: {response.status_code}")
        logging.info(f"Conteúdo da resposta: {response.text}")
        
        if response.status_code == 500:
            logging.error(f"Detalhes do erro: {response.text}")
        else:
            result = response.json()
            print("\nResposta do modelo:", result.get('response', ''))
            
    except Exception as e:
        logging.error(f"Erro na requisição: {str(e)}")
        raise

if __name__ == "__main__":
    test_phi4_direct()
