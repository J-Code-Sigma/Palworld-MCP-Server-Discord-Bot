import { listScripts } from './list_scripts';
import { runScript } from './run_script';
import { askOllama } from './ai/ollama';

const main = async () => {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('No command provided. Available commands: list, run <scriptName>, ask');
        return;
    }

    const command = args[0];

    switch (command) {
        case 'list':
            const scripts = listScripts();
            console.log('Available scripts:', scripts);
            break;
        case 'run':
            if (args.length < 2) {
                console.log('Please provide a script name to run.');
                return;
            }
            const scriptName = args[1];
            await runScript(scriptName);
            break;
        case 'ask':
            if (args.length < 2) {
                console.log('Please provide a prompt for Ollama.');
                return;
            }
            {
                // detect --model or -m flag
                let model: string | undefined = process.env.OLLAMA_MODEL || 'llama3';
                const modelFlagIndex = args.findIndex(a => a === '--model' || a === '-m');
                let promptParts: string[] = [];
                if (modelFlagIndex !== -1) {
                    model = args[modelFlagIndex + 1];
                    promptParts = args.slice(1).filter((_, i) => i !== modelFlagIndex && i !== modelFlagIndex - 1);
                } else {
                    promptParts = args.slice(1);
                }

                const prompt = promptParts.join(' ');
                const response = await askOllama(prompt, model);
                console.log('AI Response:', response);
            }
            break;
        default:
            console.log('Unknown command. Available commands: list, run <scriptName>, ask');
    }
};

main();