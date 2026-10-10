import { describe, expect, it } from 'vitest';
import { Dictionary, weightDictionary } from '../src/engine/Dictionary.js';
import { GeneratorEngine } from '../src/engine/GeneratorEngine.js';
import { createRng } from '../src/engine/rng.js';

describe('dictionary weighting', () => {
  it('duplicates by rank unless the 1-in-5 roll is zero', () => {
    const raw = { _NOUN: [['cat', 3], ['dog', 1]] };
    const weighted = weightDictionary(raw, () => 0.5);
    expect(weighted._NOUN).toEqual(['cat', 'cat', 'cat', 'dog']);
    const flat = weightDictionary(raw, () => 0);
    expect(flat._NOUN).toEqual(['cat', 'dog']);
  });
});

describe('GeneratorEngine', () => {
  const engine = new GeneratorEngine(new Dictionary({
    _NOUN: ['cat'],
    _ADJECTIVE: ['red'],
    _ARTICLE: ['the'],
  }), createRng(2));

  it('expands nested tokens and cleans punctuation', () => {
    const text = engine.expand('_ARTICLE _ADJECTIVE _NOUN .');
    expect(engine.cleanup(text).trim()).toBe('the red cat.');
  });

  it('throws on a missing token', () => {
    expect(() => engine.pick('_NOPE')).toThrow(/Missing token: _NOPE/);
  });

  it('stops if a literal underscore is not a token', () => {
    const stuck = new GeneratorEngine(new Dictionary({ _NOUN: ['pre_fix'] }), () => 0);
    expect(stuck.expand('_NOUN').trim()).toBe('pre_fix');
  });
});
