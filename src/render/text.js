export function renderText(type, data) {
  switch (type) {
    case 'band':
      return [
        `background: ${data.background}`,
        data.headliner,
        'WITH SPECIAL GUESTS:',
        ...data.guests,
      ].join('\n');
    case 'album':
      return [
        data.artist,
        data.title,
        `text color: #${data.textColor}`,
        `background: ${data.background}`,
      ].join('\n');
    case 'lyrics':
      return [data.title, '', ...data.lines].join('\n');
    case 'song':
      return [`In the key of ${data.key}`, ...data.lines.map((line) => line.replaceAll(' ', '    '))].join('\n');
    case 'jokes':
      return `${data.joke.replaceAll('<BR>', '\n').replaceAll('<I>', '').replaceAll('</I>', '')}\n\n${data.author}`;
    case 'advice':
      return `${data.quote}\n\n--${data.author} (${data.date})`;
    case 'essay':
      return [data.title, '', ...data.paragraphs].join('\n\n');
    case 'comic':
      return [
        data.title,
        ...data.panes.flatMap((pane, index) => [
          `pane ${index + 1}: ${pane.text}`,
          `speaker: ${pane.speaker}`,
          ...pane.cells.map((cell) => `sprite: comic/${cell}`),
        ]),
      ].join('\n');
    case 'translate':
      return data;
    default:
      throw new Error(`Unknown generator: ${type}`);
  }
}
