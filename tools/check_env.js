
const fs = require('fs');
const path = require('path');

const envs = [
    { name: '.env.local', path: path.join(__dirname, '../.env.local') },
    { name: 'server/.env', path: path.join(__dirname, '../server/.env') }
];

console.log('\x1b[36m%s\x1b[0m', '--- Checking Environment Files ---');

envs.forEach(env => {
    if (fs.existsSync(env.path)) {
        console.log(`\x1b[32m✔\x1b[0m ${env.name} found`);
    } else {
        console.log(`\x1b[31m✘\x1b[0m ${env.name} MISSING`);
    }
});

// Basic check for required variables in .env.local
try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    const required = ['NEXT_PUBLIC_API_URL', 'INTERNAL_API_URL'];
    required.forEach(v => {
        if (!envContent.includes(v)) {
            console.log(`\x1b[33m⚠\x1b[0m ${v} might be missing in .env.local`);
        }
    });
} catch (e) { }

console.log('\x1b[36m%s\x1b[0m', '--- Done ---');
