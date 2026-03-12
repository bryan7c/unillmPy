# OmniBridge: Gateway API

Este diretório contém o cérebro lógico do **OmniBridge**, construído utilizando a poderosa framework [Nest](https://github.com/nestjs/nest) (Node.js) em TypeScript e o **Vercel AI SDK**. 

A função desta API é blindar o ecossistema interno, atuando como o ponto único de entrada para chamadas de IA. Em vez de aplicações consumirem o roteador base (LiteLLM) puramente, elas fazem chamadas para cá a fim de utilizar autenticação customizada, fluxos complexos de agentes (System Prompts controlados) e envios com processamento paralelo (Fan-out).

## Instalação e Execução (Standalone para Dev)

Embora esta API deva rodar preferencialmente atrelada ao proxy via Docker (veja o README na raiz de `OmniBridge`), você pode operar ela em standalone para debugging ou TDD:

```bash
$ npm install
```

Rodando localmente:

```bash
# desenvolvimento padrão
$ npm run start

# watch mode para desenvolvedores
$ npm run start:dev

# produção compilada (na dist/)
$ npm run start:prod
```

## Testes Automatizados (TDD First)

O projeto prioriza 100% de cobertura de código nos módulos vitais.

```bash
# rodar os testes unitários via Vitest
$ npm run test

# verificação visual de teste (watch mode)
$ npm run test:watch

# test coverage - métricas completas
$ npm run test:cov

# validando isoladamente se o cache do redis+litellm está de pé
$ npm run test:litellm
```

## Estrutura do Módulo Vercel AI

O ecossistema é adaptado para total compatibilidade com os tipos generativos padrão do OpenAI por debaixo dos panos através da biblioteca `@ai-sdk/openai-compatible`.

* Lógica de conexão (LlmService): `src/modules/llm/`
* Serviço de Integração Automática (OpenRouter Sync): `src/modules/openrouter-sync/`
