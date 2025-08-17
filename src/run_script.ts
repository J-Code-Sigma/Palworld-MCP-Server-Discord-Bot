import { spawn } from 'child_process';
import path from 'path';

export function runScript(scriptName: string): void {
    const scriptPath = path.join(__dirname, '../palworld_scripts', scriptName);
    const child = spawn('bash', [scriptPath], { stdio: 'inherit' });

    child.on('exit', code => {
        console.log(`Script exited with code ${code}`);
    });
}
