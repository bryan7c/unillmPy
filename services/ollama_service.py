import requests
import logging
import os
from config import Config

class OllamaService:
    def __init__(self):
        self.model = "llama3.1:latest"  # This matches exactly with what's available in Ollama
        # Force the use of host.docker.internal in Docker environment
        if os.path.exists('/.dockerenv'):
            self.base_url = 'http://host.docker.internal:11434/api'
        else:
            self.base_url = Config.OLLAMA_BASE_URL.rstrip('/')
        logging.info(f"Initializing OllamaService with base_url: {self.base_url}")

    def generate_text(self, input_text: str, options: dict = None) -> str:
        try:
            # Prepare the request
            url = f"{self.base_url}/generate"
            payload = {
                "model": options.get('model', self.model),  # Use model from options if provided
                "prompt": input_text,
                "system": options.get('context') if options else None,
                "stream": False
            }
            
            logging.info(f"Sending request to Ollama: URL={url}, payload={payload}")
            
            # Make the request with a longer timeout
            response = requests.post(url, json=payload, timeout=30)
            
            # Log the response for debugging
            logging.info(f"Ollama response status: {response.status_code}")
            logging.info(f"Ollama response content: {response.text}")
            
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            return result.get('response', '')
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error in generate_text: {str(e)}")
            raise RuntimeError(f"Failed to communicate with Ollama: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error in generate_text: {str(e)}")
            raise