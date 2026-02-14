import { execSync } from 'child_process';

try {
  console.log('Checking current directory...');
  console.log(execSync('pwd').toString());
  console.log('Listing root files...');
  console.log(execSync('ls -la /vercel/share/v0-project/').toString());
  console.log('Checking if node_modules exists...');
  console.log(execSync('ls /vercel/share/v0-project/node_modules/.package-lock.json 2>&1 || echo "node_modules not found"').toString());
  console.log('Checking npm version...');
  console.log(execSync('npm --version').toString());
  console.log('Running npm install...');
  const result = execSync('cd /vercel/share/v0-project && npm install --no-audit --no-fund 2>&1', { timeout: 120000 });
  console.log(result.toString());
  console.log('Install complete!');
} catch (error) {
  console.error('Error:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout.toString());
  if (error.stderr) console.log('stderr:', error.stderr.toString());
}
