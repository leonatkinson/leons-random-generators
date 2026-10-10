function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function joinUrl(base, path) {
  return `${String(base || '').replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

function hexByte(value) {
  return Math.max(0, Math.min(255, Math.trunc(value))).toString(16).padStart(2, '0');
}

function lyricColors(index, listSize) {
  const background = `ff${hexByte(((listSize - index) / listSize) * 255)}${hexByte((index / listSize) * 128)}`;
  const foreground = `00${hexByte(((listSize - index) / listSize) * 128)}${hexByte((index / listSize) * 128)}`;
  return { background, foreground };
}

function jokeHtml(value) {
  return escapeHtml(value)
    .replaceAll('&lt;BR&gt;', '<br>')
    .replaceAll('&lt;I&gt;', '<i>')
    .replaceAll('&lt;/I&gt;', '</i>');
}

export function renderHtml(type, data, imagesUrl) {
  switch (type) {
    case 'band':
      return `<div class="lrg-band" style="background-image:url('${escapeHtml(joinUrl(imagesUrl, data.background))}')">
        <p class="lrg-band-kicker">IN CONCERT...</p>
        <p class="lrg-band-head">${escapeHtml(data.headliner).replaceAll('-', '&shy;-')}</p>
        <p class="lrg-band-kicker lrg-band-guests">WITH SPECIAL GUESTS:</p>
        ${data.guests.map((name) => `<p class="lrg-band-name">${escapeHtml(name).replaceAll('-', '&shy;-')}</p>`).join('')}
      </div>`;
    case 'album': {
      const image = data.src
        ? `background-image:url('${escapeHtml(data.src)}');background-position:center;background-repeat:no-repeat;`
        : `background-color:${escapeHtml(data.background)};`;
      const credit = data.pageUrl
        ? `<p class="lrg-credit">Original image: <a target="_blank" rel="noopener noreferrer" href="${escapeHtml(data.pageUrl)}">${escapeHtml(data.pageUrl)}</a></p>`
        : '';
      return `<div class="lrg-album" style="${image}">
        <div class="lrg-album-artist lrg-album-shadow">${escapeHtml(data.artist)}</div>
        <div class="lrg-album-artist" style="color:#${escapeHtml(data.textColor)}">${escapeHtml(data.artist)}</div>
        <div class="lrg-album-title lrg-album-shadow">${escapeHtml(data.title)}</div>
        <div class="lrg-album-title" style="color:#${escapeHtml(data.textColor)}">${escapeHtml(data.title)}</div>
      </div>
      ${credit}
      <p class="lrg-note">If you want another one, use Regenerate. To save this image, take a screenshot.</p>`;
    }
    case 'lyrics':
      return `<h3 class="lrg-title">${escapeHtml(data.title)}</h3>
        <table class="lrg-lyrics">${data.lines.map((line, index) => {
          const colors = lyricColors(index, data.lines.length);
          const shown = line === '' ? '&nbsp;' : escapeHtml(line);
          return `<tr><td style="background:#${colors.background};color:#${colors.foreground}">${shown}</td></tr>`;
        }).join('')}</table>`;
    case 'song':
      return `<p>In the key of ${escapeHtml(data.key)}</p>
        ${data.lines.map((line) => `<p class="lrg-chords">${escapeHtml(line).replaceAll(' ', '&nbsp;&nbsp;&nbsp;&nbsp;')}</p>`).join('')}`;
    case 'jokes':
      return `<p class="lrg-prose">${jokeHtml(data.joke)}</p><p class="lrg-byline">${escapeHtml(data.author)}</p>`;
    case 'advice':
      return `<p class="lrg-prose">${escapeHtml(data.quote)}</p><p class="lrg-byline">--${escapeHtml(data.author)} (${escapeHtml(data.date)})</p>`;
    case 'essay':
      return `<h3 class="lrg-title">${escapeHtml(data.title)}</h3>${data.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}`;
    case 'comic':
      return `<h3 class="lrg-title">${escapeHtml(data.title)}</h3>
        <table class="lrg-comic">
          <tr>${data.panes.map((pane, index) => `<td class="${index === 0 ? 'lrg-comic-text-first' : 'lrg-comic-text'}" style="background:#${escapeHtml(pane.color)}">${escapeHtml(pane.text)}</td>`).join('')}</tr>
          <tr>${data.panes.map((pane, index) => `<td class="${index === 0 ? 'lrg-comic-arrow-first' : 'lrg-comic-arrow'}" style="background:#${escapeHtml(pane.color)}"><img src="${escapeHtml(joinUrl(imagesUrl, `comic/arrow_${pane.speaker}.gif`))}" width="210" height="20" alt=""></td>`).join('')}</tr>
          <tr>${data.panes.map((pane, index) => `<td class="${index === 0 ? 'lrg-comic-cell-first' : 'lrg-comic-cell'}" style="background:#${escapeHtml(pane.color)}">${pane.cells.map((cell) => `<img src="${escapeHtml(joinUrl(imagesUrl, `comic/${cell}`))}" width="70" height="140" alt="">`).join('')}</td>`).join('')}</tr>
        </table>
        <p class="lrg-note">Some of the characters in the strip are based on Sam Brown's artwork, available at <a href="https://www.explodingdog.com">www.explodingdog.com</a>.</p>`;
    case 'translate':
      return data.split(/\n+/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    default:
      return `<p>${escapeHtml(data)}</p>`;
  }
}
