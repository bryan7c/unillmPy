# Unillm

Unillm é uma interface unificada para trabalhar com Modelos de Linguagem (LLMs), permitindo a integração com diferentes provedores de LLMs, como OpenAI e outros. Esta aplicação fornece uma API simples para gerar texto, obter embeddings e realizar traduções.

## Funcionalidades

- **Geração de Texto**: Gera texto com base em um prompt fornecido.
- **Obtenção de Embeddings**: Obtém embeddings para um texto fornecido.
- **Tradução de Texto**: Realiza a tradução de um texto para um idioma alvo.
- **Listagem de Modelos**: Retorna a lista de modelos disponíveis para cada provider.
- **Processamento de Respostas**: Remove automaticamente o conteúdo entre tags <think></think> nas respostas do modelo deepseek-r1.
- **Controle de Requisições por Origem**: Sistema que permite isolar e controlar requisições por origem, evitando que requisições de diferentes aplicações interfiram entre si.

## Provedores e Modelos Suportados

### OpenAI
- gpt-4
- gpt-3.5-turbo

### Ollama
- llama3.1:latest
- llama3.2:latest
- llama3.2-vision:latest
- fluffy/magnum-v4-9b:latest
- llava:13b
- dolphin-mixtral:latest
- deepseek-r1:latest

### Groq
- mixtral-8x7b-32768
- llama2-70b-4096

## Tecnologias Utilizadas

- **Python**: Linguagem de programação utilizada.
- **Flask**: Framework para construção de APIs em Python.
- **Requests**: Biblioteca para fazer requisições HTTP.
- **python-dotenv**: Carregamento de variáveis de ambiente a partir de um arquivo `.env`.

## Instalação

### Método 1: Instalação Local

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

### Método 2: Usando Docker

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/unillm.git
   cd unillm
   ```

2. Construa e inicie os containers usando Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Configuração

### Configuração Local
Crie um arquivo `.env` na raiz do projeto e adicione suas chaves de API:
```plaintext
OPENAI_API_KEY=suachave
OPENAI_BASE_URL=https://api.openai.com/v1/
OLLAMA_API_KEY=suachave
OLLAMA_BASE_URL=http://127.0.0.1:11434/api/
GROQ_API_KEY=suachave
```

### Configuração com Docker
Se estiver usando Docker, use esta configuração no `.env`:
```plaintext
OPENAI_API_KEY=suachave
OPENAI_BASE_URL=https://api.openai.com/v1/
OLLAMA_API_KEY=suachave
OLLAMA_BASE_URL=http://host.docker.internal:11434/api/
GROQ_API_KEY=suachave
```

## Controle de Requisições por Origem

A aplicação possui um sistema de controle de requisições que permite isolar chamadas de diferentes origens, evitando que uma aplicação interfira nas requisições de outra.

### Como Funciona

- Cada requisição pode especificar uma origem de duas formas:
  1. Através do header `X-Origin` (recomendado)
  2. Através do parâmetro `origin` nas opções
- Requisições da mesma origem são controladas em conjunto
- Uma nova requisição da origem A cancela automaticamente requisições anteriores da origem A
- Requisições de origens diferentes não interferem entre si
- Timeout fixo de 10 minutos por requisição

### Exemplo de Uso

#### Usando Header (Recomendado)
```bash
# Usando curl
curl -X POST \
  -H "X-Origin: aplicacao_a" \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama", "input": "Seu prompt aqui", "options": {"model": "llama3.2:latest"}}' \
  http://localhost:3001/api/llm/generate-text
```

```python
# Usando requests
import requests

headers = {
    'X-Origin': 'aplicacao_a',
    'Content-Type': 'application/json'
}

data = {
    'provider': 'ollama',
    'input': 'Seu prompt aqui',
    'options': {'model': 'llama3.2:latest'}
}

response = requests.post('http://localhost:3001/api/llm/generate-text', 
                        headers=headers, 
                        json=data)
```

#### Usando Options (Alternativa)
```python
options = {
    'origin': 'aplicacao_a',
    'model': 'llama3.2:latest'
}
resultado = service.generate_text("Seu prompt aqui", options)
```

### Retrocompatibilidade

- Aplicações existentes continuam funcionando sem modificações
- Requisições sem origem especificada (sem header e sem opção) usam 'default' como origem
- O header `X-Origin` tem prioridade sobre o parâmetro `origin` nas opções
- O sistema de cancelamento funciona normalmente para requisições sem origem

## Configuração para Acesso em Rede

Para tornar a aplicação acessível de outras máquinas na rede:

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Configure o arquivo `.env`:
   - `FLASK_HOST`: Mantenha como `0.0.0.0` para permitir acesso externo
   - `FLASK_PORT`: Porta em que o servidor irá rodar (padrão: 3001)
   - `OLLAMA_HOST`: IP da máquina onde o Ollama está rodando
     - Se o Ollama estiver na mesma máquina, use `localhost`
     - Se estiver em outra máquina, use o IP dela (exemplo: `192.168.1.100`)

3. Inicie o servidor:
   ```bash
   python app.py
   ```

4. Acesse a aplicação de outras máquinas usando:
   ```
   http://<IP-DA-MAQUINA>:3001
   ```
   Substitua `<IP-DA-MAQUINA>` pelo IP da máquina onde o servidor está rodando.

**Nota**: Certifique-se de que:
- A porta 3001 está liberada no firewall do Windows
- O Ollama está acessível na rede se estiver em outra máquina

## Configuração para Docker

Se você estiver usando Docker, a aplicação detectará automaticamente e usará `host.docker.internal` para se comunicar com o Ollama na máquina host. Para executar:

1. Construa a imagem Docker:
   ```bash
   docker build -t unillm .
   ```

2. Execute o container:
   ```bash
   docker run -p 3001:3001 --env-file .env unillm
   ```

3. Acesse a aplicação:
   - De dentro da máquina host: `http://localhost:3001`
   - De outras máquinas na rede: `http://<IP-DA-MAQUINA-HOST>:3001`

**Nota**: Se você estiver usando Docker no Windows:
- O Ollama deve estar rodando na máquina host
- O Docker Desktop precisa estar configurado para usar o WSL 2
- Certifique-se de que a porta 3001 está liberada no firewall do Windows

## Configuração para Docker Compose

Para executar a aplicação usando Docker Compose:

1. Certifique-se de que o Ollama está rodando na máquina host

2. Execute:
   ```bash
   docker-compose up --build
   ```

3. Acesse a aplicação:
   - De dentro da máquina host: `http://localhost:3001`
   - De outras máquinas na rede: `http://<IP-DA-MAQUINA-HOST>:3001`

**Nota**: Se você estiver usando Docker no Windows:
- O Docker Desktop precisa estar configurado para usar o WSL 2
- Certifique-se de que a porta 3001 está liberada no firewall do Windows
- O Ollama deve estar rodando na máquina host antes de iniciar o container

Para parar a aplicação:
```bash
docker-compose down
```

## Execução

### Execução Local
Para iniciar o servidor localmente, use o seguinte comando:
```bash
python app.py
```

### Execução com Docker
Se você estiver usando Docker, o serviço já estará rodando após executar `docker-compose up -d`.

O servidor estará disponível em `http://localhost:3001`.

## Endpoints

### Gerar Texto

- **POST** `/api/llm/generate-text`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Corpo da Requisição**:
  ```json
  {
    "provider": "openai",
    "input": "Seu texto aqui",
    "options": {
      "model": "gpt-3.5-turbo",
      "context": "Contexto opcional para o modelo",
      "no_cache": false
    }
  }
  ```
- **Parâmetros**:
  - `provider` (obrigatório): O provedor LLM a ser usado ("openai", "ollama" ou "groq")
  - `input` (obrigatório): O texto de entrada para o modelo
  - `options` (opcional): Configurações adicionais
    - `model`: O modelo específico a ser usado
    - `context`: Contexto adicional para o modelo (system prompt)
    - `no_cache`: Se true, ignora o cache e sempre faz uma nova requisição ao modelo (padrão: false)
- **Resposta**:
  ```json
  {
    "response": "Texto gerado pelo modelo",
    "model": "nome-do-modelo-usado",
    "provider": "nome-do-provider",
    "processing_time": "tempo-de-processamento-em-segundos"
  }
  ```

Exemplos de requisição para cada provider:

**OpenAI**:
```json
{
  "provider": "openai",
  "input": "Qual é a capital do Brasil?",
  "options": {
    "temperature": 0.7,
    "maxTokens": 100
  }
}
```

**Ollama**:
```json
{
  "provider": "ollama",
  "input": "Qual é a capital do Brasil?",
  "options": {
    "model": "llama3.1:latest",
    "context": "Você é um professor de geografia"
  }
}
```

**Groq**:
```json
{
  "provider": "groq",
  "input": "Qual é a capital do Brasil?",
  "options": {
    "temperature": 0.7,
    "model": "mixtral-8x7b-32768"
  }
}
```

### Obter Embeddings

- **POST** `/api/llm/embeddings`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Corpo da Requisição**:
  ```json
  {
    "provider": "openai",
    "input": "Seu texto aqui",
    "options": {
      "model": "text-embedding-ada-002"
    }
  }
  ```
- **Parâmetros**:
  - `provider` (obrigatório): O provedor a ser usado ("openai")
  - `input` (obrigatório): O texto para o qual obter embeddings
  - `options` (opcional): Configurações adicionais
    - `model`: O modelo específico para embeddings a ser usado
- **Resposta**:
  ```json
  {
    "embedding": [0.123, 0.456, ...],
    "model": "nome-do-modelo-usado",
    "provider": "nome-do-provider",
    "processing_time": "tempo-de-processamento-em-segundos"
  }
  ```

### Traduzir Texto

- **POST** `/api/llm/translate`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Corpo da Requisição**:
  ```json
  {
    "provider": "openai",
    "input": "Seu texto a ser traduzido aqui",
    "target_language": "en",
    "options": {
      "model": "gpt-3.5-turbo"
    }
  }
  ```
- **Parâmetros**:
  - `provider` (obrigatório): O provedor LLM a ser usado ("openai", "ollama" ou "groq")
  - `input` (obrigatório): O texto a ser traduzido
  - `target_language` (obrigatório): O código do idioma alvo (ex: "en", "es", "fr")
  - `options` (opcional): Configurações adicionais
    - `model`: O modelo específico a ser usado
- **Resposta**:
  ```json
  {
    "translation": "Texto traduzido",
    "source_language": "Idioma de origem detectado ou especificado",
    "target_language": "Idioma alvo",
    "model": "nome-do-modelo-usado",
    "provider": "nome-do-provider",
    "processing_time": "tempo-de-processamento-em-segundos"
  }
  ```

### Listagem de Modelos
- **GET** `/api/llm/models?provider=string`
- **Parâmetros de consulta**:
  - `provider`: Nome do provider (openai, ollama, groq)
- **Resposta**:
  ```json
  {
    "models": ["modelo1", "modelo2", ...]
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