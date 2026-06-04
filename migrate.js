const fs = require('fs');
const path = require('path');

console.log("Starting monorepo structural migration...");

function mv(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} to ${dest}`);
  }
}

function rm(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`Removed ${p}`);
  }
}

function replace(filePath, searchRegex, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(searchRegex, replacement);
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

// 1. Create structure
['apps', 'apps/frontend', 'apps/server', 'packages', 'packages/shared', 'docs'].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 2. Move .txt files
['PRODUCTION_READY_GUIDE.txt', 'SETUP_GUIDE.txt'].forEach(f => {
  if (fs.existsSync(f)) {
    const newName = f.replace('.txt', '.md');
    mv(f, path.join('docs', newName));
  }
});

// 3. Move server and shared
if (fs.existsSync('server/package.json')) {
  fs.readdirSync('server').forEach(f => {
    mv(path.join('server', f), path.join('apps/server', f));
  });
  rm('server');
}

if (fs.existsSync('shared/package.json')) {
  fs.readdirSync('shared').forEach(f => {
    mv(path.join('shared', f), path.join('packages/shared', f));
  });
  rm('shared');
}

// 4. Move frontend files
const frontendFiles = [
  'src', 'public', 'components.json', 'middleware.ts', 'next-env.d.ts', 
  'next.config.mjs', 'postcss.config.js', 'tailwind.config.ts', 
  '.eslintrc.json', 'tsconfig.json', 'Dockerfile'
];

frontendFiles.forEach(f => {
  mv(f, path.join('apps/frontend', f));
});

// 5. Cleanups
rm('bun.lock');
rm('.cph');
rm('dist');

const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  let gi = fs.readFileSync(gitignorePath, 'utf8');
  if (!gi.includes('.cph')) {
    fs.writeFileSync(gitignorePath, gi + '\n# CPH extension\n.cph/\n');
  }
}

// 6. Splitting package.json
const rootPkgRaw = fs.readFileSync('package.json', 'utf8');
const rootPkg = JSON.parse(rootPkgRaw);
const frontendPkg = {
  name: "pec-frontend",
  version: "0.1.0",
  private: true,
  scripts: {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  dependencies: { ...rootPkg.dependencies, "@pec/shared": "*" },
  devDependencies: { ...rootPkg.devDependencies }
};

delete frontendPkg.devDependencies['turbo'];
delete frontendPkg.devDependencies['concurrently'];
delete frontendPkg.devDependencies['kill-port'];
delete frontendPkg.devDependencies['globals'];
delete frontendPkg.devDependencies['eslint'];

fs.writeFileSync('apps/frontend/package.json', JSON.stringify(frontendPkg, null, 2));

const newRootPkg = {
  name: "pec-campus-erp",
  private: true,
  version: "0.0.0",
  packageManager: "npm@11.7.0",
  workspaces: ["apps/*", "packages/*"],
  scripts: {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "setup": "npm install && npm --prefix apps/server run db:push && npm --prefix apps/server run prisma:generate && npm --prefix apps/server run db:seed",
    "prod:docker": "docker compose up -d --build",
    "prod:docker:down": "docker compose down",
    "clean": "turbo run clean"
  },
  devDependencies: {
    "turbo": rootPkg.devDependencies.turbo,
    "concurrently": rootPkg.devDependencies.concurrently,
    "kill-port": "^2.0.1"
  }
};
fs.writeFileSync('package.json', JSON.stringify(newRootPkg, null, 2));

// 7. Update apps/frontend/tsconfig.json references
const feTsPath = 'apps/frontend/tsconfig.json';
if (fs.existsSync(feTsPath)) {
  let feTs = JSON.parse(fs.readFileSync(feTsPath, 'utf8'));
  if (feTs.references) {
    feTs.references = [{ "path": "../../packages/shared" }];
  }
  if (feTs.compilerOptions && feTs.compilerOptions.paths) {
    if (feTs.compilerOptions.paths["@shared/*"]) {
      feTs.compilerOptions.paths["@shared/*"] = ["../../packages/shared/*"];
    }
  }
  if (feTs.exclude) {
    feTs.exclude = feTs.exclude.filter(e => e !== 'server');
  }
  fs.writeFileSync(feTsPath, JSON.stringify(feTs, null, 2));
}

// 8. Update apps/server/tsconfig.json references
const serverTsPath = 'apps/server/tsconfig.json';
if (fs.existsSync(serverTsPath)) {
  replace(serverTsPath, /"\.\.\/shared/g, '"../../packages/shared');
}

// 9. Update Dockerfiles and docker-compose
replace('apps/frontend/Dockerfile', /COPY shared \.\/shared/g, 'COPY packages/shared ./packages/shared');
replace('apps/frontend/Dockerfile', /COPY src \.\/src/g, 'COPY packages/shared ./packages/shared\nCOPY apps/frontend ./apps/frontend');
// The standalone logic
replace('apps/frontend/Dockerfile', /COPY --from=builder \/app\/\.next\/standalone \.\//g, 'COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./');
replace('apps/frontend/Dockerfile', /COPY --from=builder --chown=nextjs:nodejs \/app\/\.next\/static \.\/\.next\/static/g, 'COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static');
replace('apps/frontend/Dockerfile', /CMD \["node", "server\.js"\]/g, 'CMD ["node", "apps/frontend/server.js"]');
// Also building requires package.json
replace('apps/frontend/Dockerfile', /COPY package\*\.json \.\//g, 'COPY package*.json ./\nCOPY apps/frontend/package*.json ./apps/frontend/\nCOPY packages/shared/package*.json ./packages/shared/\n');
replace('apps/frontend/Dockerfile', /RUN npm install --legacy-peer-deps/g, 'RUN npm install\nWORKDIR /app/apps/frontend');
// Remove old duplicates from apps/frontend/Dockerfile
replace('apps/frontend/Dockerfile', /COPY public \.\/public\nCOPY middleware\.ts \.\/\nCOPY next-env\.d\.ts \.\/\nCOPY next\.config\.mjs \.\/\nCOPY postcss\.config\.js \.\/\nCOPY tailwind\.config\.ts \.\/\nCOPY components\.json \.\/\n/g, '');


replace('apps/server/Dockerfile', /COPY server\/package\*\.json \.\/server\//g, 'COPY apps/server/package*.json ./apps/server/');
replace('apps/server/Dockerfile', /COPY server\/tsconfig\*\.json \.\/server\//g, 'COPY apps/server/tsconfig*.json ./apps/server/');
replace('apps/server/Dockerfile', /COPY shared \.\/shared/g, 'COPY packages/shared ./packages/shared');
replace('apps/server/Dockerfile', /WORKDIR \/app\/server/g, 'WORKDIR /app/apps/server');
replace('apps/server/Dockerfile', /COPY server \.\/server/g, 'COPY apps/server ./apps/server');
replace('apps/server/Dockerfile', /COPY --from=builder \/app\/server\//g, 'COPY --from=builder /app/apps/server/');
replace('apps/server/Dockerfile', /RUN npm install --legacy-peer-deps\nWORKDIR \/app\/apps\/server\nRUN npm install --legacy-peer-deps/g, 'RUN npm install --legacy-peer-deps');


replace('docker-compose.yml', /dockerfile: \.\/server\/Dockerfile/g, 'dockerfile: ./apps/server/Dockerfile');
replace('docker-compose.yml', /dockerfile: \.\/Dockerfile/g, 'dockerfile: ./apps/frontend/Dockerfile');

replace('docker-compose.dev.yml', /\- \.\/server:\/app/g, '- ./apps/server:/app');
replace('docker-compose.dev.yml', /\- \.\/shared:\/shared/g, '- ./packages/shared:/shared');
replace('docker-compose.dev.yml', /\- \.\/:\/app/g, '- ./apps/frontend:/app');
replace('docker-compose.dev.yml', /\- \/app\/server/g, '');

const rootTs = {
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true
  }
};
fs.writeFileSync('tsconfig.json', JSON.stringify(rootTs, null, 2));

console.log("Migration complete!");
