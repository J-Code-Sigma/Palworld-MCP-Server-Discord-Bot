import { listScripts } from './list';

export function runScript(scriptName: string): void {
    const availableScripts = listScripts();
    if (!availableScripts.includes(scriptName)) {
        console.error(`Script "${scriptName}" not found.`);
        return;
    }

    // Logic to run the specific script
    console.log(`Running script: ${scriptName}`);
    // Here you would include the actual execution logic for the script
}