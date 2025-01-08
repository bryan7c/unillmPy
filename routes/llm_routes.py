from flask import Blueprint
from controllers.llm_controller import generate_text, list_models
from middlewares.api_middleware import api_middleware
import socket

llm_routes = Blueprint('llm_routes', __name__)

# Usando o decorator diretamente na função
@llm_routes.route("/generate-text", methods=["POST"])
def generate_text_route():
    api_middleware()  # Chama o middleware manualmente
    return generate_text()

# Rota para listar modelos disponíveis
@llm_routes.route("/models", methods=["GET"])
def list_models_route():
    api_middleware()  # Chama o middleware manualmente
    return list_models()

# Rota para verificar o status do servidor
@llm_routes.route("/status", methods=["GET"])
def status():
    ip_address = socket.gethostbyname(socket.gethostname())  # Obtém o IP da máquina
    return {"status": "Servidor está funcionando", "ip": ip_address}