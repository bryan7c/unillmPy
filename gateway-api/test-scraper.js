async function testApi() {
    const targetUrl = 'https://openrouter.ai/api/v1/models';
    console.log('Fetching API:', targetUrl);
    const response = await fetch(targetUrl);
    const data = await response.json();
    const allModels = data.data || [];

    const freeModels = allModels
        .filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
        .map(m => m.id);

    console.log('Encontrados (API):', freeModels.length);
    if (freeModels.length > 0) {
        console.log(freeModels.slice(0, 5));
    }
}

testApi().catch(console.error);
