# Unillm

Unillm é uma interface unificada para trabalhar com Modelos de Linguagem (LLMs), permitindo a integração com diferentes provedores de LLMs, como OpenAI e outros. Esta aplicação fornece uma API simples para gerar texto, obter embeddings e realizar traduções.

## Funcionalidades

- **Geração de Texto**: Gera texto com base em um prompt fornecido.
- **Obtenção de Embeddings**: Obtém embeddings para um texto fornecido.
- **Tradução de Texto**: Realiza a tradução de um texto para um idioma alvo.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para JavaScript no lado do servidor.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Express**: Framework para construção de APIs em Node.js.
- **Axios**: Biblioteca para fazer requisições HTTP.
- **dotenv**: Carregamento de variáveis de ambiente a partir de um arquivo `.env`.

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/bryan7c/unillm.git
   cd unillm
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto e adicione suas chaves de API:
   ```plaintext
   OPENAI_API_KEY=suachave
   OPENAI_BASE_URL=https://api.openai.com/v1/
   ```

## Execução

Para iniciar o servidor, use o seguinte comando:
```bash
npm start
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
