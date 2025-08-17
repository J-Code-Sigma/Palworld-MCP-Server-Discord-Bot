export async function askOllama(prompt: string, model?: string): Promise<string> {
    // Use global fetch when available (Node 18+). Otherwise dynamically import node-fetch.
    let fetchFn: any = (typeof fetch !== 'undefined') ? fetch : undefined;
    if (!fetchFn) {
        try {
            const mod = await import('node-fetch');
            fetchFn = mod.default ?? mod;
        } catch (err) {
            return 'Ollama client error: fetch is not available and node-fetch could not be loaded.';
        }
    }

    try {
        let modelToUse = model;

        // If no model explicitly provided, try to discover available models from local Ollama
        if (!modelToUse) {
            try {
                const modelsRes = await fetchFn('http://localhost:11434/models');
                if (modelsRes.ok) {
                    const modelsData = await modelsRes.json();
                    // modelsData may be array of names or objects — try to extract a name
                    if (Array.isArray(modelsData) && modelsData.length > 0) {
                        const first = modelsData[0];
                        modelToUse = typeof first === 'string' ? first : (first.name || first.id || undefined);
                    }
                }
            } catch (e) {
                // ignore discovery error and fall back to returning helpful message below
            }
        }

        if (!modelToUse) {
            return 'No Ollama model specified or available locally. Pull a model (for example: `ollama pull llama3`) or pass --model <model-name>.';
        }

        const payload: any = { prompt, model: modelToUse };

        const res = await fetchFn('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            return `Ollama returned ${res.status}: ${text}`;
        }

        const data = await res.json();

        // Ollama responses vary by endpoint/version. Try common fields first.
        if (data.output_text) return data.output_text;
        if (data.response) return data.response;
        if (typeof data === 'string') return data;
        return JSON.stringify(data);
    } catch (err: any) {
        return `Ollama error: ${err.message || String(err)}`;
    }
}