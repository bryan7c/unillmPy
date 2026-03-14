
const { streamText } = require('ai');
const { createOpenAICompatible } = require('@ai-sdk/openai-compatible');

// Mocking minimal requirement to get a result object
const provider = createOpenAICompatible({
    name: 'test',
    baseURL: 'http://localhost:1234'
});

async function main() {
    try {
        const result = streamText({
            model: provider.chatModel('test'),
            messages: [{ role: 'user', content: 'hi' }]
        });
        
        console.log('Methods on result:');
        Object.getOwnPropertyNames(Object.getPrototypeOf(result)).forEach(m => console.log('- ' + m));
        
        // Also check instance properties
        console.log('Instance properties:');
        Object.keys(result).forEach(m => console.log('- ' + m));
    } catch (e) {
        console.error('Error (expected if no backend):', e.message);
        // Even if it fails to call, we might see the object structure
    }
}

main();
