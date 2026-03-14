
const url = 'http://localhost:4007/v1/chat/completions';
const payload = {
    model: 'free-models-text',
    messages: [
        {
            role: 'user',
            content: 'Say hello',
        },
    ],
};

async function inspect() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-default-key'
            },
            body: JSON.stringify(payload),
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

inspect();
