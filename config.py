import os

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1/')
    OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY', '')
    
    # Determina se está rodando em Docker
    IN_DOCKER = os.path.exists('/.dockerenv')
    
    # Se estiver em Docker, usa host.docker.internal, senão usa OLLAMA_HOST
    OLLAMA_HOST = 'host.docker.internal' if IN_DOCKER else os.getenv('OLLAMA_HOST', 'localhost')
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', f'http://{OLLAMA_HOST}:11434/api/')
    
    # Configuração de timeout para o Ollama (em segundos)
    OLLAMA_TIMEOUT = int(os.getenv('OLLAMA_TIMEOUT', 180))  # 3 minutos por padrão
    
    GROK_API_KEY = os.getenv('GROK_API_KEY', '')
    
    # Configurações do servidor Flask
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 3001))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'