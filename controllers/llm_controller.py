from flask import request, jsonify
from factories.llm_service_factory import LLMServiceFactory

def generate_text():
    data = request.json
    provider = data.get('provider')
    input_text = data.get('input')
    options = data.get('options', {})

    llm_service = LLMServiceFactory.get_service(provider)

    try:
        result = llm_service.generate_text(input_text, options)
        return jsonify({'result': result.replace('\n', ' ')})
    except Exception as error:
        return jsonify({'error': str(error)}), 500