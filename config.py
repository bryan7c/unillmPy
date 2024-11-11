import os

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1/')
    OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY', '')
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434/api/')
    GROK_API_KEY = os.getenv('GROK_API_KEY', '')