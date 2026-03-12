# OmniBridge

**OmniBridge** é o Gateway de Inteligência Artificial centralizado do ecossistema HUB. Ele unifica o consumo de grandes modelos de linguagem (LLMs) como OpenAI, Anthropic, Google Gemini e Ollama (local) em uma única interface padronizada, roteando todas as chamadas através de um proxy inteligente.

---

## 🏗 Arquitetura

O projeto divide-se estruturalmente em três componentes conteinerizados que rodam orquestrados via Docker Compose:

1. **LiteLLM (`:4007`)**: Motor central em Python/FastAPI encarregado da unificação de provedores, tradução de APIs (tudo vira padrão OpenAI) e balanço de carga (Load Balancing) entre chaves disponíveis (gratuitas ou pagas).
2. **Redis (`:6379`)**: Banco em memória utilizado pelo LiteLLM para realizar **Semantic Caching**, onde as respostas a prompts idênticos são retornadas sem custo instantaneamente, e para gestão de Rate Limits.
3. **Gateway API (`:3001`)**: Backend nativo do OmniBridge escrito em **NestJS (Node.js)** que consome e orquestra chamadas com o LiteLLM. Realiza validações, injeção de agentes de prompt com configurações pré-definidas e executa processamento paralelo avançado.

> *Para uma visão aprofundada da arquitetura e fluxos de uso, consulte `OMNIBRIDGE.md` na raiz do repositório pai (HUB).*

---

## 🚀 Como Executar

Certifique-se de que possui [Docker](https://www.docker.com/) e Docker Compose instalados.

1. Configure as variáveis de ambiente:
   - Duplique o arquivo `.env.example` (se houver) para `.env` dentro de `gateway-api/` (ou preencha `.env` caso já criado).
   - O LiteLLM abstrai todas as API Keys através de `litellm/config.yaml`.
2. Para instanciar a _stack_ completa em modo de tempo de execução, execute:

```bash
docker compose up -d --build
```

### Verificação

Você pode verificar os serviços expostos acessando sua respectiva porta (definida no arquivo central do HUB `PORTAS.md`):

- **API NestJS (Gateway):** http://localhost:3001
- **LiteLLM Proxy:** http://localhost:4007

## 📁 Estrutura do Repositório

```text
/OmniBridge
├── docker-compose.yml          # Manifesto que inicializa a stack
├── litellm/                    # Arquivos de configuração do motor de proxy IA
│   └── config.yaml             # Mapeamento do Load Balance e roteamento
├── gateway-api/                # Cérebro orquestrador (NestJS + TypeScript)
│   ├── src/                    # Controllers, Serviços e lógica de Agentes
│   └── scripts/                # Testes puramente de infraestrutura (ex: teste de cache)
└── README.md
```

## 🛠 Comandos Úteis

```bash
# Derrubar a stack inteira e remover os containers
docker compose down

# Limpar o cache do Redis (reset completo)
docker-compose exec redis redis-cli flushall

# Ver os logs ao vivo do Gateway
docker logs -f omnibridge-api
```
