import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve('src');
const files = [];

function getFiles(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
            files.push(fullPath);
        }
    }
}

getFiles(srcDir);

const graph = {};

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    // Simple regex to catch imports
    const importRegex = /import\s+(?:.*from\s+)?['"]([^'"]+)['"]/g;
    const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
    graph[relPath] = [];

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        let target = match[1];
        if (target.startsWith('@/')) {
            target = target.replace('@/', '');
        } else if (target.startsWith('.')) {
            const dir = path.dirname(relPath);
            target = path.normalize(path.join(dir, target)).replace(/\\/g, '/');
            if (target.startsWith('..')) {
                // outside src? skip for now or fix
                continue;
            }
        } else {
            continue; // Skip node_modules
        }

        // Normalize target (handle missing extensions)
        const possibleExts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
        for (const ext of possibleExts) {
            const p = path.join(srcDir, target + ext);
            if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
                const neighbor = target + (ext.startsWith('/') ? ext : (ext || ''));
                graph[relPath].push(neighbor);
                break;
            }
        }
    }
}

function findCycle(node, visited, stack, pathList) {
    visited[node] = true;
    stack[node] = true;
    pathList.push(node);

    for (const neighbor of (graph[node] || [])) {
        if (!visited[neighbor]) {
            if (findCycle(neighbor, visited, stack, pathList)) return true;
        } else if (stack[neighbor]) {
            console.log('CYCLE DETECTED:', pathList.join(' -> '), ' -> ', neighbor);
            return true;
        }
    }

    stack[node] = false;
    pathList.pop();
    return false;
}

const visited = {};
for (const node in graph) {
    if (!visited[node]) {
        findCycle(node, visited, {}, []);
    }
}
console.log('Analysis Complete');
