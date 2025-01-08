from flask import Flask
from flask_cors import CORS
from routes.llm_routes import llm_routes
from config import Config

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas as rotas

app.register_blueprint(llm_routes, url_prefix='/api/llm')

if __name__ == '__main__':
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
