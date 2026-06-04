const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Starting phase 2 refactor...");

function execCmd(cmd, cwd = process.cwd()) {
  console.log(`Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd });
  } catch (e) {
    console.error(`Failed: ${cmd}`, e);
  }
}

function mv(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} to ${dest}`);
  }
}

// 1. Rename mobile subfolders
const mobilePath = path.join(process.cwd(), 'mobile');
if (fs.existsSync(mobilePath)) {
  execCmd('git mv Faculty_App faculty_app', mobilePath);
  execCmd('git mv pec_app student_app', mobilePath);
  execCmd('git commit -m "chore: standardize flutter app folder names to snake_case"', mobilePath);
}

// 2. Add Husky, Prettier, lint-staged to root
const rootPkgPath = 'package.json';
const rootPkgRaw = fs.readFileSync(rootPkgPath, 'utf8');
const rootPkg = JSON.parse(rootPkgRaw);
rootPkg.devDependencies = {
  ...rootPkg.devDependencies,
  "husky": "^9.0.11",
  "lint-staged": "^15.2.2",
  "prettier": "^3.2.5"
};
rootPkg.scripts.prepare = "husky";
rootPkg["lint-staged"] = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
};
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

// Init husky
execCmd('npm install');
execCmd('npx husky init');
fs.writeFileSync('.husky/pre-commit', 'npx lint-staged\n');

// 3. Create Root Prettier & ESLint
const prettierRc = {
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
};
fs.writeFileSync('.prettierrc', JSON.stringify(prettierRc, null, 2));

const rootEslint = {
  "root": true,
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn"
  }
};
fs.writeFileSync('.eslintrc.json', JSON.stringify(rootEslint, null, 2));

// Update apps/frontend/.eslintrc.json
const frontendEslint = {
  "extends": [
    "../../.eslintrc.json",
    "next/core-web-vitals"
  ]
};
fs.writeFileSync('apps/frontend/.eslintrc.json', JSON.stringify(frontendEslint, null, 2));

// Update apps/server/.eslintrc.js
const serverEslintPath = 'apps/server/.eslintrc.js';
if (fs.existsSync(serverEslintPath)) {
  const newServerEslint = `module.exports = {
  extends: ['../../.eslintrc.json', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};`;
  fs.writeFileSync(serverEslintPath, newServerEslint);
}

// 4. Move frontend component folders into features
const componentsPath = path.join('apps', 'frontend', 'src', 'components');
const featuresPath = path.join('apps', 'frontend', 'src', 'features');
if (!fs.existsSync(featuresPath)) fs.mkdirSync(featuresPath, { recursive: true });

const foldersToMove = ['academic-calendar', 'attendance', 'campus-map', 'chat', 'clubs', 'timetable', 'landing', 'help'];
foldersToMove.forEach(f => {
  const src = path.join(componentsPath, f);
  const dest = path.join(featuresPath, f);
  mv(src, dest);
});

// A small utility to replace strings in files to fix imports
function replaceInFiles(dir, replacements) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath, replacements);
    } else if (fullPath.match(/\.(ts|tsx|js|jsx)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [search, replacement] of replacements) {
        if (content.includes(search)) {
          // simple global replace
          content = content.split(search).join(replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

// Perform replacements to fix the moved folders
const replacements = foldersToMove.map(f => [
  `@/components/${f}`,
  `@/features/${f}`
]);

replaceInFiles(path.join('apps', 'frontend', 'src'), replacements);

console.log("Phase 2 refactor complete!");
