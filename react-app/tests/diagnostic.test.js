import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, orienter, libelleQuestion, libelleReponse } from '../src/lib/diagnostic.js';

const base = { naissance: 'etranger', parent: 'non', documents: 'non', perte: 'non', residence: 'hors', age: 'adulte', mariage: 'non', enfant: 'non', fratrie: 'non', langue: 'aucun', ressources: 'non', demande: 'non' };

test('12 questions, identifiants et valeurs uniques', () => {
  assert.equal(QUESTIONS.length, 12);
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 12);
  for (const q of QUESTIONS) {
    assert.equal(new Set(q.options.map(o => o[0])).size, q.options.length);
    assert.ok(q.options.some(([value]) => value === base[q.id]));
  }
});
test('un recours reste prioritaire même avec plusieurs pistes', () => {
  const result = orienter({ ...base, demande: 'refus', parent: 'francais', documents: 'dix', perte: 'oui' });
  assert.equal(result[0].id, 'recours');
  assert.equal(result[0].urgent, true);
  assert.equal(result.length, 3);
});
test('le refus de CNF utilise une piste distincte du refus de naturalisation', () => {
  assert.equal(orienter({ ...base, demande: 'cnf' })[0].id, 'recours-cnf');
});
test('un parent né en France ne suffit pas à conclure à une filiation française', () => {
  const result = orienter({ ...base, parent: 'ne-france' });
  assert.ok(!result.some(r => r.id === 'filiation'));
  assert.ok(orienter({ ...base, naissance: 'france', parent: 'ne-france' }).some(r => r.id === 'origine'));
});
test('la filiation est examinée pour un parent français à la naissance', () => {
  assert.equal(orienter({ ...base, parent: 'francais' })[0].id, 'filiation');
});
test('ascendant : les trois critères interrogés sont nécessaires', () => {
  const senior = { ...base, age: 'senior', enfant: 'oui', residence: 'vingtcinq' };
  assert.ok(orienter(senior).some(r => r.id === 'ascendant'));
  for (const patch of [{ age: 'adulte' }, { enfant: 'non' }, { residence: 'dix' }]) {
    assert.ok(!orienter({ ...senior, ...patch }).some(r => r.id === 'ascendant'));
  }
});
test('quatre ans de mariage donnent une piste avec les réserves sur cinq ans', () => {
  const result = orienter({ ...base, mariage: 'quatre' });
  assert.equal(result[0].id, 'mariage');
  assert.match(result[0].text, /cinq ans/);
  assert.ok(!orienter({ ...base, mariage: 'moins' }).some(r => r.id === 'mariage'));
});
test('cinq ans de résidence ne deviennent pas une promesse d’éligibilité', () => {
  assert.equal(orienter({ ...base, residence: 'cinq' })[0].id, 'decret');
  assert.match(orienter({ ...base, residence: 'cinq', langue: 'b2', ressources: 'oui' })[0].text, /aucune issue n’est garantie/);
  assert.ok(!orienter({ ...base, residence: 'moins' }).some(r => r.id === 'decret'));
});
test('les mineurs ne reçoivent pas les pistes de déclaration pour adultes', () => {
  const result = orienter({ ...base, age: 'mineur', fratrie: 'deux', mariage: 'quatre', residence: 'cinq' });
  assert.ok(!result.some(r => ['fratrie', 'mariage', 'decret'].includes(r.id)));
  assert.ok(result.some(r => r.id === 'mineur'));
});
test('pas de piste ne signifie pas absence de droits', () => {
  const [result] = orienter(base);
  assert.equal(result.id, 'bilan');
  assert.match(result.text, /n’excluent pas/);
});
test('libelleQuestion et libelleReponse traduisent fidèlement questions et réponses', () => {
  assert.equal(libelleQuestion('naissance'), 'Où êtes-vous né(e) ?');
  assert.equal(libelleReponse('naissance', 'france'), 'En France');
  assert.equal(libelleReponse('naissance', 'etranger'), 'À l’étranger');
  assert.equal(libelleReponse('inconnu', 'test'), 'test');
});

