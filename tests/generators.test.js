import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { renderText } from '../src/render/text.js';
import { createSession, GENERATORS } from '../src/session.js';
import { fixture, longFixture } from './fixture.js';

function text(type, seed, raw = fixture) {
  const session = createSession(raw, createRng(seed));
  const data = type === 'translate'
    ? session.translate.translate(' the cat sees the dog. ')
    : session[type].generate();
  return renderText(type, data);
}

describe('generators', () => {
  it.each(GENERATORS.filter((type) => type !== 'translate'))('%s is stable for a seed and differs for another', (type) => {
    const first = text(type, 1);
    const second = text(type, 1);
    const other = text(type, 2);
    expect(first.length).toBeGreaterThan(0);
    expect(second).toBe(first);
    expect(other).not.toBe(first);
    expect(first).toMatchSnapshot();
  });

  it('redraws long band names until the rng allows one', () => {
    let calls = 0;
    const rng = () => {
      calls += 1;
      return calls > 400 ? 0 : 0.95;
    };
    const session = createSession(longFixture, rng);
    const data = session.band.generate();
    expect(data.headliner.length).toBeGreaterThan(0);
    expect(data.guests).toHaveLength(7);
    expect(data.background).toMatch(/^band\/\d+\.jpg$/);
  });

  it('keeps chord structure off the skipped first template', () => {
    const session = createSession(fixture, createRng(9));
    const data = session.song.generate();
    expect(data.structureIndex).toBeGreaterThanOrEqual(1);
    expect(data.structureIndex).toBeLessThan(5);
    expect(data.key).toMatch(/^[A-G]#?$/);
    expect(data.lines.join(' ')).toMatch(/[A-G]/);
    expect(data.lines.join('')).not.toMatch(/[^A-G#m7\s]/);
  });

  it('replaces a known translator word once and keeps unknown words', () => {
    const session = createSession({
      _NOUN: [['cat', 3], ['dog', 2]],
      _ADJECTIVE: [['red', 1]],
    }, createRng(3));
    const once = session.translate.translate(' the cat sat. the cat ran.');
    expect(once.toLowerCase()).not.toContain(' cat ');
    expect(once.toLowerCase()).toContain('sat');
    const unknown = session.translate.translate('xyzzy');
    expect(unknown).toBe('Xyzzy');
  });

  it('builds a three-pane comic with a speaking character', () => {
    const session = createSession(fixture, createRng(4));
    const data = session.comic.generate();
    expect(data.panes).toHaveLength(3);
    for (const pane of data.panes) {
      expect(pane.cells).toHaveLength(3);
      expect(pane.cells.some((cell) => /\d\.gif$/.test(cell) && !cell.startsWith('thing') && cell !== 'clear.gif')).toBe(true);
      expect(pane.text.length).toBeGreaterThan(0);
    }
  });

  it('answers a forced why line with because', () => {
    const session = createSession(fixture, createRng(5));
    const comic = session.comic;
    comic.engine.dictionary.set('_WHY', ['why']);
    comic.lineForm = ['_WHY DOES _SUBJECT _VERBIPL ?'];
    comic.useWhy = 1;
    comic.lastQuestion = '';
    comic.specialNoun = 'cat';
    const question = comic.getLine();
    const answer = comic.getLine();
    expect(question).toContain('WHY');
    expect(answer.startsWith('BECAUSE ')).toBe(true);
  });
});
