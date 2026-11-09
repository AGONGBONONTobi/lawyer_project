import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHref } from '../src/lib/safeHref.js';
import { validatePublicEnvironment } from '../security/public-env.mjs';
import { retiredResponse } from '../supabase/functions/manage-users/retired.mjs';

test('les liens du back office refusent les protocoles exécutables et les URLs ambiguës', () => {
  for (const value of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test', 'vbscript:msgbox(1)', '//evil.example', '/\\evil.example', 'java\nscript:alert(1)', null]) assert.equal(safeHref(value), null);
});
test('les liens usuels et les ancres du site restent utilisables', () => {
  for (const value of ['https://example.org', 'http://example.org', '/confidentialite', '#contact', 'mailto:cabinet@example.org', 'tel:+33123456789']) assert.equal(safeHref(value), value);
});
test('aucune clé serveur ne peut être fournie à Vite', () => {
  const privileged = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.test`;
  assert.throws(() => validatePublicEnvironment({ VITE_SUPABASE_ANON_KEY: privileged }), /privilégié/);
  assert.throws(() => validatePublicEnvironment({ VITE_SUPABASE_ANON_KEY: 'sb_secret_example' }), /serveur/);
  assert.throws(() => validatePublicEnvironment({ VITE_SERVICE_ROLE_KEY: 'test' }), /non autorisée/);
  assert.throws(() => validatePublicEnvironment({ VITE_SUPABASE_URL: 'http://remote.example' }), /HTTPS/);
  assert.doesNotThrow(() => validatePublicEnvironment({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: 'sb_publishable_example' }));
});
test('l’ancien endpoint de gestion des comptes répond toujours 410 sans CORS permissif', async () => {
  const response = retiredResponse();
  assert.equal(response.status, 410);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match((await response.json()).error, /retiré/);
});

// Le scanner ne révèle jamais les valeurs trouvées dans ses messages.
import { findSecrets, forbiddenFilename } from '../security/check-secrets.mjs';
test('le scanner distingue une clé Supabase publique d’un jeton privilégié', () => {
  const jwt = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
  assert.deepEqual(findSecrets(jwt('anon')), []);
  assert.deepEqual(findSecrets(jwt('service_role')), ['JWT non public']);
  assert.deepEqual(findSecrets(jwt('authenticated')), ['JWT non public']);
});
test('le livrable accepte .htaccess et exclut les environnements et les sources privées', () => {
  assert.equal(forbiddenFilename('.htaccess', true), false);
  assert.equal(forbiddenFilename('.env.example'), false);
  for (const file of ['.env', '.env.local', 'assets/bundle.js.map', 'dump.sql', '.git/config']) assert.equal(forbiddenFilename(file, true), true);
});
