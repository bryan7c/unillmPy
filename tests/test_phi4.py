import requests
import json

def test_phi4():
    try:
        url = 'http://localhost:11434/api/generate'
        payload = {
            "model": "vanilj/Phi-4:latest",
            "prompt": "Olá, como você está?",
            "stream": False
        }
        
        print("Enviando requisição...")
        print("Payload:", json.dumps(payload, indent=2))
        
        response = requests.post(url, json=payload)
        
        print("\nStatus da resposta:", response.status_code)
        print("Headers:", dict(response.headers))
        
        if response.status_code == 500:
            print("\nDetalhes do erro:")
            print(response.text)
        else:
            print("\nResposta:")
            print(json.dumps(response.json(), indent=2))
            
    except Exception as e:
        print(f"Erro na requisição: {str(e)}")

if __name__ == "__main__":
    test_phi4()
