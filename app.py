from flask import Flask
from flask_cors import CORS
from routes.llm_routes import llm_routes

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas as rotas

app.register_blueprint(llm_routes, url_prefix='/api/llm')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
