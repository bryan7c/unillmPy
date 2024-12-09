from flask import Blueprint
from controllers.llm_controller import generate_text
from middlewares.api_middleware import api_middleware

llm_routes = Blueprint('llm_routes', __name__)

# Usando o decorator diretamente na função
@llm_routes.route("/generate-text", methods=["POST"])
def generate_text_route():
    api_middleware()  # Chama o middleware manualmente
    return generate_text()

# Rota para verificar o status do servidor
@llm_routes.route("/status", methods=["GET"])
def status():
    return {"status": "Servidor está funcionando"}