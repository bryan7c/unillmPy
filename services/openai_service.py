import requests
from config import Config

class OpenAIService:
    def generate_text(self, input_text: str, options: dict = None) -> str:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {Config.OPENAI_API_KEY}'
        }
        data = {
            'model': 'gpt-4o-mini',
            'messages': [{'role': 'user', 'content': input_text}],
            **(options or {})
        }
        response = requests.post(f"{Config.OPENAI_BASE_URL}/completions", json=data, headers=headers)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']