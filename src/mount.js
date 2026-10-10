import { createSession } from './session.js';
import { Translator } from './generators/Translator.js';
import { renderHtml } from './render/html.js';
import { toPng } from 'html-to-image';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function attachPhoto(data, config) {
  if (!config.albumPhotoUrl) {
    return data;
  }
  try {
    const response = await fetch(config.albumPhotoUrl, { credentials: 'same-origin' });
    if (!response.ok) {
      return data;
    }
    const body = await response.json();
    if (body && body.src && !body.fallback) {
      return { ...data, src: body.src, pageUrl: body.pageUrl || '' };
    }
  } catch {
    return data;
  }
  return data;
}

function watchImage(data, output, imagesUrl) {
  if (!data.src) {
    return;
  }
  const image = new Image();
  image.onerror = () => {
    output.innerHTML = renderHtml('album', { ...data, src: null, pageUrl: null }, imagesUrl);
  };
  image.src = data.src;
}

export function mount(root, type, config) {
  if (!root || root.dataset.lrgMounted === '1') {
    return () => {};
  }
  root.dataset.lrgMounted = '1';
  root.classList.add('lrg-root');
  let cancelled = false;
  const output = document.createElement('div');
  output.className = 'lrg-output';
  const cleanup = () => {
    cancelled = true;
    root.dataset.lrgMounted = '';
    root.replaceChildren();
  };

  if (type === 'translate') {
    const note = document.createElement('p');
    note.className = 'lrg-note';
    note.textContent = 'The translator will make the submitted text more meaningful.';
    const area = document.createElement('textarea');
    area.className = 'lrg-translate-input';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button-primary wp-element-button';
    button.textContent = 'Translate Text';
    root.append(note, area, output, button);
    button.addEventListener('click', () => {
      if (cancelled) {
        return;
      }
      const translator = new Translator(config.dictionary, Math.random);
      output.innerHTML = renderHtml('translate', translator.translate(area.value), config.imagesUrl);
    });
    return cleanup;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button button-primary wp-element-button lrg-regenerate';
  button.textContent = 'Regenerate';

  let downloadButton = null;
  if (type === 'album' || type === 'comic') {
    downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.className = 'button button-secondary wp-element-button lrg-download';
    downloadButton.textContent = 'Download';
    downloadButton.style.marginLeft = '8px';
    downloadButton.addEventListener('click', async () => {
      downloadButton.disabled = true;
      try {
        if (type === 'album') {
          const albumEl = output.querySelector('.lrg-album');
          if (!albumEl) return;
          const width = 800;
          const height = 800;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          const bgStyle = albumEl.style.backgroundImage;
          const bgColor = albumEl.style.backgroundColor;

          if (bgStyle && bgStyle.includes('url(')) {
            const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
            if (match && match[1]) {
              const imgUrl = match[1];
              await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const sRatio = img.width / img.height;
                  const dRatio = width / height;
                  let renderWidth = width;
                  let renderHeight = height;
                  let offsetX = 0;
                  let offsetY = 0;

                  if (sRatio > dRatio) {
                    renderWidth = height * sRatio;
                    offsetX = (width - renderWidth) / 2;
                  } else {
                    renderHeight = width / sRatio;
                    offsetY = (height - renderHeight) / 2;
                  }

                  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
                  resolve();
                };
                img.onerror = () => {
                  ctx.fillStyle = bgColor || '#000';
                  ctx.fillRect(0, 0, width, height);
                  resolve();
                };
                img.src = imgUrl;
              });
            } else {
              ctx.fillStyle = bgColor || '#000';
              ctx.fillRect(0, 0, width, height);
            }
          } else {
            ctx.fillStyle = bgColor || '#000';
            ctx.fillRect(0, 0, width, height);
          }

          // Draw texts
          const artistEl = albumEl.querySelectorAll('.lrg-album-artist');
          const titleEl = albumEl.querySelectorAll('.lrg-album-title');

          ctx.font = 'bold 48px arial, helvetica, sans-serif';
          if (artistEl[0]) {
            ctx.fillStyle = 'rgba(17, 17, 17, 0.4)';
            ctx.fillText(artistEl[0].textContent, width * 0.044, height * 0.044 + 48);
          }
          if (artistEl[1]) {
            ctx.fillStyle = window.getComputedStyle(artistEl[1]).color || '#fff';
            ctx.fillText(artistEl[1].textContent, width * 0.04, height * 0.04 + 48);
          }

          ctx.font = 'bold 24px arial, helvetica, sans-serif';
          ctx.textAlign = 'right';
          if (titleEl[0]) {
            ctx.fillStyle = 'rgba(17, 17, 17, 0.4)';
            ctx.fillText(titleEl[0].textContent, width * (0.402 + 0.56), height * 0.902 + 24);
          }
          if (titleEl[1]) {
            ctx.fillStyle = window.getComputedStyle(titleEl[1]).color || '#fff';
            ctx.fillText(titleEl[1].textContent, width * (0.4 + 0.56), height * 0.90 + 24);
          }
          ctx.textAlign = 'left';

          const albumTitleText = titleEl[1] && titleEl[1].textContent ? titleEl[1].textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'cover';
          const filename = `lrg-album-${albumTitleText}.png`;

          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (type === 'comic') {
          const comicContainer = document.createElement('div');
          comicContainer.style.background = '#fff';
          comicContainer.style.padding = '12px';
          comicContainer.style.boxSizing = 'border-box';
          comicContainer.style.width = '800px';
          comicContainer.style.fontFamily = 'arial, helvetica, sans-serif';

          const titleEl = output.querySelector('.lrg-title');
          const tableEl = output.querySelector('.lrg-comic');
          if (!tableEl) return;

          if (titleEl) {
            const tClone = titleEl.cloneNode(true);
            tClone.style.fontSize = '24px';
            tClone.style.marginBottom = '12px';
            comicContainer.appendChild(tClone);
          }

          const tClone = tableEl.cloneNode(true);
          tClone.style.width = '100%';
          comicContainer.appendChild(tClone);

          document.body.appendChild(comicContainer);
          const dataUrl = await toPng(comicContainer, { cacheBust: true });
          document.body.removeChild(comicContainer);

          const comicTitleText = titleEl ? titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'comic';
          const filename = `lrg-comic-${comicTitleText}.png`;

          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        console.error(err);
      } finally {
        downloadButton.disabled = false;
      }
    });
  }

  if (downloadButton) {
    root.append(output, button, downloadButton);
  } else {
    root.append(output, button);
  }

  const run = async () => {
    button.disabled = true;
    if (type === 'album') {
      output.textContent = 'Loading...';
    }
    try {
      if (cancelled) {
        return;
      }
      const session = createSession(config.dictionary);
      let data = session[type].generate();
      if (type === 'album') {
        data = await attachPhoto(data, config);
      }
      if (cancelled) {
        return;
      }
      output.innerHTML = renderHtml(type, data, config.imagesUrl);
      if (type === 'album') {
        watchImage(data, output, config.imagesUrl);
      }
    } catch (error) {
      output.textContent = error && error.message ? error.message : 'Generator failed';
    } finally {
      button.disabled = false;
    }
  };
  button.addEventListener('click', run);
  run();
  return cleanup;
}
