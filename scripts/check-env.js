import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';

console.log("CWD:", process.cwd());
console.log("__dirname workaround:", import.meta.url);

// Check if node_modules exists in various locations
const paths = [
  '/vercel/share/v0-project',
  '/vercel/share/v0-project/node_modules',
  '.',
  './node_modules',
];

for (const p of paths) {
  console.log(`Exists ${p}:`, existsSync(p));
}

try {
  const ls = execSync('ls -la', { encoding: 'utf-8' });
  console.log("ls -la (cwd):\n", ls);
} catch (e) {
  console.log("ls error:", e.message);
}

try {
  const which = execSync('which pnpm || which npm || echo "no pkg manager"', { encoding: 'utf-8' });
  console.log("Package manager:", which.trim());
} catch (e) {
  console.log("which error:", e.message);
}

try {
  const nodeV = execSync('node --version', { encoding: 'utf-8' });
  console.log("Node version:", nodeV.trim());
} catch (e) {
  console.log("node version error:", e.message);
}
