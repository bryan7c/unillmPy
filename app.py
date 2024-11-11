from flask import Flask
from routes.llm_routes import llm_routes

app = Flask(__name__)
app.register_blueprint(llm_routes, url_prefix='/api/llm')

if __name__ == '__main__':
    app.run(port=3000)