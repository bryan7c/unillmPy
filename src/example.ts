import { LLMServiceFactory } from './factories/LLMServiceFactory';

async function main() {
  const openaiProvider = LLMServiceFactory.getService('openai');

  // Uso normal
  const openaiResponse = await openaiProvider.generateText('Olá, como vai?', {
    temperature: 0.7,
    maxTokens: 100
  });
  console.log(openaiResponse);

  // TODO Uso com streaming
}

main().catch(console.error); 