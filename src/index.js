import { registerBlockType } from '@wordpress/blocks';
import { createElement, useEffect, useRef } from '@wordpress/element';
import dictionary from './data/dictionary.json';
import { GENERATORS } from './session.js';
import { mount } from './mount.js';
import './style.css';

const TITLES = {
  band: 'Band Names',
  album: 'Album Covers',
  lyrics: 'Song Lyrics',
  song: 'Chord Progressions',
  jokes: 'Jokes',
  advice: 'Advice',
  essay: 'Essays',
  comic: 'Comics',
  translate: 'Translator',
};

function Edit({ name }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    return mount(ref.current, name, {
      ...(window.leonsRandomGenerators || {}),
      dictionary,
    });
  }, [name]);
  const config = window.leonsRandomGenerators || {};
  return createElement(
    'div',
    { className: 'lrg-editor' },
    name === 'album' && config.hasFlickrKey === false
      ? createElement(
        'p',
        { className: 'lrg-notice' },
        'Flickr API key is not set. Covers use a random color until one is saved. ',
        createElement('a', { href: config.settingsUrl }, 'Settings'),
      )
      : null,
    createElement('div', { ref }),
  );
}

GENERATORS.forEach((name) => {
  registerBlockType(`leons-random-generators/${name}`, {
    apiVersion: 3,
    title: `LRG ${TITLES[name]}`,
    category: 'leons-random-generators',
    icon: 'randomize',
    edit: () => createElement(Edit, { name }),
    save: () => null,
  });
});
