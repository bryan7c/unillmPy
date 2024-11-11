# Unillm

Unillm é uma interface unificada para trabalhar com Modelos de Linguagem (LLMs), permitindo a integração com diferentes provedores de LLMs, como OpenAI e outros. Esta aplicação fornece uma API simples para gerar texto, obter embeddings e realizar traduções.

## Funcionalidades

- **Geração de Texto**: Gera texto com base em um prompt fornecido.
- **Obtenção de Embeddings**: Obtém embeddings para um texto fornecido.
- **Tradução de Texto**: Realiza a tradução de um texto para um idioma alvo.

## Tecnologias Utilizadas

- **Python**: Linguagem de programação utilizada.
- **Flask**: Framework para construção de APIs em Python.
- **Requests**: Biblioteca para fazer requisições HTTP.
- **python-dotenv**: Carregamento de variáveis de ambiente a partir de um arquivo `.env`.

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/unillm.git
   cd unillm
   ```

2. Crie um ambiente virtual e ative-o:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows use `venv\Scripts\activate`
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Crie um arquivo `.env` na raiz do projeto e adicione suas chaves de API:
   ```plaintext
   OPENAI_API_KEY=suachave
   OPENAI_BASE_URL=https://api.openai.com/v1/
   OLLAMA_API_KEY=suachave
   OLLAMA_BASE_URL=http://127.0.0.1:11434/api/
   ```

## Execução

Para iniciar o servidor, use o seguinte comando:
```bash
python app.py
```

O servidor estará disponível em `http://localhost:3000`.

## Endpoints

### Gerar Texto

- **POST** `/api/llm/generate-text`
- **Corpo da Requisição**:
  ```json
  {
    "provider": "openai",
    "input": "Seu texto aqui",
    "options": {
      "temperature": 0.7,
      "maxTokens": 100
    }
  }
  ```

### Status do Servidor

- **GET** `/api/llm/status`
- **Resposta**:
  ```json
  {
    "status": "Servidor está funcionando"
  }
  ```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou relatar problemas.

## Licença

Este projeto está licenciado sob a Licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

```bash
python app.py
```


O servidor estará disponível em `http://localhost:3000`.

## Endpoints

### Gerar Texto

- **POST** `/api/llm/generate-text`
- **Corpo da Requisição**:
  ```json
  {
    "provider": "openai",
    "input": "Seu texto aqui",
    "options": {
      "temperature": 0.7,
      "maxTokens": 100
    }
  }
  ```

### Status do Servidor

- **GET** `/api/llm/status`
- **Resposta**:
  ```json
  {
    "status": "Servidor está funcionando"
  }
  ```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou relatar problemas.

## Licença

Este projeto está licenciado sob a Licença ISC. Veja o arquivo `LICENSE` para mais detalhes.