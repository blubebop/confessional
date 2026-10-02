// Usage: node components/my-game/boundary-audit.cjs <pristine-template-directory>
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const baseline = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(baseline, 'SKILL.md'))) {
  throw new Error('Provide the pristine downloaded Ape Church template directory.');
}
const permitted = (name) => name === 'metadata.json'
  || name.startsWith('components/my-game/') || name.startsWith('public/my-game/');
function files(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const name = prefix + entry.name;
    return entry.isDirectory() ? files(path.join(dir, entry.name), name + '/') : [name];
  });
}
const originalFiles = files(baseline);
const originalSet = new Set(originalFiles);
const violations = [];
let protectedCount = 0;
for (const name of originalFiles) {
  if (permitted(name)) continue;
  protectedCount++;
  const local = path.join(root, name);
  if (!fs.existsSync(local)) violations.push(`Missing protected file: ${name}`);
  else if (!fs.readFileSync(local).equals(fs.readFileSync(path.join(baseline, name)))) {
    violations.push(`Modified protected file: ${name}`);
  }
}
// Respect the template's own ignore rules for dependencies and generated output.
const currentFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
for (const name of currentFiles) {
  if (!permitted(name) && !originalSet.has(name)) violations.push(`Unexpected source file: ${name}`);
}
for (const name of ['components/confessional', 'public/confessional']) {
  if (fs.existsSync(path.join(root, name))) violations.push(`Unexpected old directory: ${name}`);
}
for (const name of files(path.join(root, 'components/my-game'))) {
  if (!/\.(tsx?|css|cjs)$/.test(name) || name === 'boundary-audit.cjs') continue;
  const text = fs.readFileSync(path.join(root, 'components/my-game', name), 'utf8');
  if (/@\/components\/confessional\/|\/confessional\/(card|banner)\.png|public\/confessional/.test(text)) {
    violations.push(`Stale import/asset reference: components/my-game/${name}`);
  }
}
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'metadata.json'), 'utf8'));
for (const key of ['thumbnail', 'banner']) {
  if (!metadata[key].startsWith('/my-game/') || !fs.existsSync(path.join(root, 'public', metadata[key]))) {
    violations.push(`Invalid ${key} path: ${metadata[key]}`);
  }
}
const result = { status: violations.length ? 'FAIL' : 'PASS', protectedFilesCompared: protectedCount,
  allowedPaths: ['components/my-game/', 'public/my-game/', 'metadata.json'], violations,
  note: 'Dependencies and build artifacts ignored by the unchanged template .gitignore are not source modifications.' };
console.info(JSON.stringify(result, null, 2));
process.exitCode = violations.length ? 1 : 0;
