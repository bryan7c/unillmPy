import datetime
from flask import request, jsonify

def api_middleware():
    try:
        # Ensure we have JSON content
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        # Log request details
        print("Request JSON:", request.json)
        print("Request args:", request.args)
        print("Middleware executed:", datetime.datetime.now())
        print("Provider:", request.json.get("provider"))
        print("Model:", request.json.get("options", {}).get("model"))
        
        # Continue with the request
        return None
    except Exception as e:
        print(f"Middleware error: {str(e)}")
        return jsonify({"error": "Invalid JSON format"}), 400