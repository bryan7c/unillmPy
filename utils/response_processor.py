import re

def process_ollama_response(response: str) -> str:
    """
    Remove o conteúdo entre as tags <think></think> da resposta do modelo.
    
    Args:
        response (str): Resposta original do modelo
    
    Returns:
        str: Resposta processada sem o conteúdo das tags think
    """
    # Padrão para encontrar conteúdo entre as tags <think></think>
    pattern = r'<think>.*?</think>'
    
    # Remove todo o conteúdo entre as tags (incluindo as tags)
    processed_response = re.sub(pattern, '', response, flags=re.DOTALL)
    
    # Remove linhas em branco extras que podem ter sido criadas
    processed_response = '\n'.join(line for line in processed_response.splitlines() if line.strip())
    
    return processed_response
