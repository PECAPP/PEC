const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const currentDir = process.cwd();
const srcDir = path.join(currentDir, 'src');

if (fs.existsSync(srcDir)) {
  walk(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath);
      if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
        console.log('Stripping BOM from:', filePath);
        fs.writeFileSync(filePath, content.slice(3));
      }
    }
  });
}
