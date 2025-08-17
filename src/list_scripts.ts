import fs from 'fs';
import path from 'path';

export function listScripts(): string[] {
    const scriptsDir = path.join(__dirname, '../palworld_scripts');
    if (!fs.existsSync(scriptsDir)) return [];
    return fs.readdirSync(scriptsDir).filter(file => file.endsWith('.sh') || file.endsWith('.js') || file.endsWith('.ts'));
}
