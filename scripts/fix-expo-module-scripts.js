const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(packageRoot, 'node_modules');
const shimPath = path.join(packageRoot, 'node_modules', 'expo-module-scripts', 'tsconfig.base');
const targetPath = path.join(packageRoot, 'node_modules', 'expo-module-scripts', 'tsconfig.base.json');

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

if (!fs.existsSync(shimPath)) {
  fs.writeFileSync(shimPath, '{\n  "extends": "./tsconfig.base.json"\n}\n');
}

for (const entry of fs.readdirSync(nodeModulesPath, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('expo-')) {
    continue;
  }

  const tsconfigPath = path.join(nodeModulesPath, entry.name, 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    continue;
  }

  const current = fs.readFileSync(tsconfigPath, 'utf8');
  const next = current.replace('"expo-module-scripts/tsconfig.base"', '"../expo-module-scripts/tsconfig.base.json"');

  if (next !== current) {
    fs.writeFileSync(tsconfigPath, next);
  }
}

const expoModulesCoreTsconfigPath = path.join(nodeModulesPath, 'expo-modules-core', 'tsconfig.json');

if (fs.existsSync(expoModulesCoreTsconfigPath)) {
  const current = fs.readFileSync(expoModulesCoreTsconfigPath, 'utf8');
  const withoutExtends = current.replace(/\s*"extends":\s*"[^"]+",\r?\n/, '');
  const next = withoutExtends.includes('"declaration": true')
    ? withoutExtends
    : withoutExtends.replace('"outDir": "./build",', '"outDir": "./build",\n    "declaration": true,');

  if (next !== current) {
    fs.writeFileSync(expoModulesCoreTsconfigPath, next);
  }
}