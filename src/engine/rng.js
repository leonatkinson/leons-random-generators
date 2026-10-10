export function createRng(seed) {
  let state = seed >>> 0;
  if (state === 0) {
    state = 1;
  }
  return function rng() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
