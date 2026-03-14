
const url = 'http://localhost:3001/api/chat/free';
const payload = {
    messages: [
        {
            role: 'user',
            content: 'Olá, qual o seu modelo?',
        },
    ]
};

async function test() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-default-key' // Ajuste se houver auth
            },
            body: JSON.stringify(payload),
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response (last 500 chars):', text.slice(-500));
        
        if (text.includes('google/') || text.includes('meta-llama/') || text.includes('openrouter/')) {
             console.log('\n🎉 [SUCESSO] Modelo real encontrado na resposta!');
        } else {
             console.log('\n⚠️ [ALERTA] Modelo real não encontrado. Verifique os metadados.');
        }
    } catch (e) {
        console.error(e);
    }
}

test();
