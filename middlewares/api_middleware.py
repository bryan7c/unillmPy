from flask import request

def api_middleware():
    # Aqui você pode adicionar lógica de middleware, se necessário
    print("Middleware executado")
    # Chame o próximo middleware ou a rota
    return None  # Retorne None para continuar o fluxo