from flask import request, jsonify
from factories.llm_service_factory import LLMServiceFactory
import logging

def generate_text():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        provider = data.get('provider')
        if not provider:
            return jsonify({"error": "Provider is required"}), 400

        input_text = data.get('input')
        if not input_text:
            return jsonify({"error": "Input text is required"}), 400

        options = data.get('options', {})
        
        # Extrair origem do header ou usar default
        origin = request.headers.get('X-Origin', 'default')
        if 'origin' not in options:  # Não sobrescrever se já existir nas options
            options['origin'] = origin

        try:
            llm_service = LLMServiceFactory.get_service(provider)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        try:
            result = llm_service.generate_text(input_text, options)
            return jsonify({'result': result})
        except Exception as error:
            logging.error(f"Error generating text: {str(error)}")
            return jsonify({'error': str(error)}), 500

    except Exception as e:
        logging.error(f"Unexpected error in generate_text: {str(e)}")
        return jsonify({'error': "Internal server error"}), 500

def list_models():
    try:
        provider = request.args.get('provider')
        if not provider:
            return jsonify({"error": "Provider is required"}), 400

        try:
            llm_service = LLMServiceFactory.get_service(provider)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        try:
            models = llm_service.get_available_models()
            return jsonify({'models': models})
        except Exception as error:
            logging.error(f"Error listing models: {str(error)}")
            return jsonify({'error': str(error)}), 500

    except Exception as e:
        logging.error(f"Unexpected error in list_models: {str(e)}")
        return jsonify({'error': str(e)}), 500