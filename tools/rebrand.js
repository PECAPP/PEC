import fs from 'fs';
import path from 'path';

const rootDir = 'c:\\Users\\dubey\\omnifow';
const excludeDirs = ['node_modules', '.git', 'dist', '.gemini'];
const excludeExts = ['.exe', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.lock'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                results = results.concat(walk(filePath));
            }
        } else {
            if (!excludeExts.includes(path.extname(file).toLowerCase()) && file !== 'package-lock.json') {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(rootDir);
console.log(`Found ${files.length} files to process.`);

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        if (content.includes('pec')) {
            content = content.replace(/pec/g, 'pec');
            changed = true;
        }
        if (content.includes('PEC')) {
            content = content.replace(/PEC/g, 'PEC');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Modified: ${file}`);
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
});
