import datetime
from flask import request

def api_middleware():
    # Aqui você pode adicionar lógica de middleware, se necessário
    print(request.json)
    print(request.args)
    print("Middleware executado:", datetime.datetime.now())
    print('Provider:', request.json.get('provider'))
    print('Model:', request.json.get('options', {}).get('model'))
    # Chame o próximo middleware ou a rota
    return None  # Retorne None para continuar o fluxo