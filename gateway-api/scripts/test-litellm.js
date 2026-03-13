/**
 * @fileoverview Script de validação de cache do LiteLLM
 * @description Realiza duas requisições idênticas ao LiteLLM para comprovar que a segunda
 * está sendo interceptada e respondida pelo Redis em milissegundos.
 */

async function testLiteLlmCache() {
    const url = 'http://localhost:4007/v1/chat/completions';
    const payload = {
        model: 'free-models-text',
        messages: [
            {
                role: 'user',
                content: 'Qual a capital da França? Responda com uma palavra.',
            },
        ],
    };

    const headers = { 'Content-Type': 'application/json' };

    console.log('🔄 Executando chamada 1 (Sem Cache)...');
    const start1 = Date.now();
    const res1 = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (!res1.ok) {
        console.error('❌ Erro na primeira chamada:', await res1.text());
        process.exit(1);
    }

    const data1 = await res1.json();
    const time1 = Date.now() - start1;
    console.log(`✅ Resposta 1: ${data1.choices[0].message.content}`);
    console.log(`⏱️  Tempo: ${time1}ms\n`);

    console.log('🔄 Executando chamada 2 (Deve ser servido pelo Cache)...');
    const start2 = Date.now();
    const res2 = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (!res2.ok) {
        console.error('❌ Erro na segunda chamada:', await res2.text());
        process.exit(1);
    }

    const data2 = await res2.json();
    const time2 = Date.now() - start2;
    console.log(`✅ Resposta 2: ${data2.choices[0].message.content}`);
    console.log(`⏱️  Tempo: ${time2}ms`);

    // Validando se o cache funcionou (assumindo que o cache é pelo menos 3x mais rápido)
    // Validando se o cache funcionou (assumindo que o cache é pelo menos 3x mais rápido)
    if (time2 < time1 / 2 || time2 < 100) {
        console.log('\n🎉 [SUCESSO] Cache do Redis atuando perfeitamente!');
        process.exitCode = 0;
    } else {
        console.log('\n⚠️ [ALERTA] A segunda chamada não pareceu ser muito mais rápida. Verifique o Redis.');
        process.exitCode = 1;
    }
}

testLiteLlmCache().catch(err => {
    console.error('❌ Erro inesperado:', err.message);
    process.exitCode = 1;
});
