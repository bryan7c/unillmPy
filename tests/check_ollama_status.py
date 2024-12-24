import requests

def check_ollama_status():
    try:
        # Verificar modelos disponíveis
        response = requests.get('http://localhost:11434/api/tags')
        print("Status da requisição:", response.status_code)
        print("Modelos disponíveis:", response.json())
    except Exception as e:
        print(f"Erro ao conectar com Ollama: {str(e)}")

if __name__ == "__main__":
    check_ollama_status()
