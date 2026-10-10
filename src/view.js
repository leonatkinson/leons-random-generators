import dictionary from './data/dictionary.json';
import { mount } from './mount.js';

const config = {
  ...(window.leonsRandomGenerators || {}),
  dictionary,
};

document.querySelectorAll('.lrg-block[data-generator]').forEach((element) => {
  mount(element, element.dataset.generator, config);
});
