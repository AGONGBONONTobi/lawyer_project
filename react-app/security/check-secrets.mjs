import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function findSecrets(text) {
  const findings = new Set();
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) findings.add('clé privée');
  if (/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|gsk_[A-Za-z0-9]{30,}|(?:sk|rk)_live_[A-Za-z0-9]{15,}|sb_secret_[A-Za-z0-9_-]{20,})/.test(text)) findings.add('clé privée de fournisseur');
  for (const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try {
      const claims = JSON.parse(Buffer.from(match[1], 'base64url').toString());
      if (claims.role && claims.role !== 'anon') findings.add('JWT non public');
    } catch { /* Un fragment non décodable n’est pas un JWT identifiable. */ }
  }
  return [...findings];
}

export function forbiddenFilename(name, dist = false) {
  const base = path.basename(name);
  if (/^\.env(?:\.|$)/.test(base) && !/^\.env\.(example|sample)$/.test(base)) return true;
  return dist && (base.startsWith('.') && base !== '.htaccess' || /\.(?:map|sql|ya?ml|log|zip|docx)$/.test(base) || /(^|[/\\])(?:node_modules|\.git)([/\\]|$)/.test(name));
}

function listFiles(root, prefix = '') {
  return readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const name = path.join(prefix, entry.name);
    return entry.isDirectory() ? listFiles(root, name) : [name];
  });
}

export function runCheck(mode) {
  const project = fileURLToPath(new URL('../../', import.meta.url));
  const root = mode === 'dist' ? path.join(project, 'react-app/dist') : project;
  if (!['source', 'dist'].includes(mode)) throw new Error('Usage : check-secrets.mjs source|dist');
  if (!existsSync(root)) throw new Error('Dossier de build absent. Lancer npm run build.');
  const files = mode === 'dist' ? listFiles(root) : readFileSync(0, 'utf8').split('\0').filter(Boolean);
  if (!files.length) throw new Error('Liste de fichiers vide : contrôle interrompu.');
  const errors = [];
  for (const name of new Set(files)) {
    if (!existsSync(path.join(root, name))) continue;
    if (forbiddenFilename(name, mode === 'dist')) errors.push(`${name} : fichier interdit`);
    if (!/\.(?:[cm]?js|jsx|ts|tsx|json|html|css|sql|md|txt|ya?ml|toml|sh)$/.test(name)) continue;
    for (const finding of findSecrets(readFileSync(path.join(root, name), 'utf8'))) errors.push(`${name} : ${finding}`);
  }
  if (mode === 'dist' && !existsSync(path.join(root, '.htaccess'))) errors.push('.htaccess : configuration IONOS absente');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Contrôle ${mode} : aucun secret reconnu ni fichier interdit (${new Set(files).size} fichiers).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { runCheck(process.argv[2]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
