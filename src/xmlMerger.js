const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';

/**
 * Merge multiple deck XML documents into one deck file.
 * Cards are concatenated in the order of the input strings.
 * @param {string[]} xmlStrings
 * @returns {string}
 */
export function mergeDecks(xmlStrings) {
  if (!xmlStrings.length) {
    throw new Error('Select at least one deck to merge');
  }

  const parser = new DOMParser();
  const cards = [];

  for (const xml of xmlStrings) {
    const doc = parser.parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('Invalid deck XML');
    }

    const deck = doc.getElementsByTagName('deck')[0];
    if (!deck) {
      throw new Error('Deck XML must contain a <deck> root element');
    }

    const deckCards = deck.getElementsByTagName('card');
    for (let i = 0; i < deckCards.length; i++) {
      const card = deckCards[i];
      cards.push({
        blueprintId: card.getAttribute('blueprintId') ?? '',
        horizontal: card.getAttribute('horizontal') ?? 'false',
        title: card.getAttribute('title') ?? '',
      });
    }
  }

  const lines = [XML_DECLARATION, '<deck>'];
  for (const card of cards) {
    lines.push(formatCardLine(card));
  }
  lines.push('</deck>');
  return `${lines.join('\r\n')}\r\n`;
}

/**
 * Build a download filename from selected deck names.
 * Shared prefixes (e.g. "Dark MotF ") are only included once.
 * @param {string[]} fileNames
 * @returns {string}
 */
export function mergedFileName(fileNames) {
  const stems = fileNames.map((name) => name.replace(/\.txt$/i, ''));
  if (stems.length === 0) {
    return 'merged deck.txt';
  }
  if (stems.length === 1) {
    return `merged ${stems[0]}.txt`;
  }

  const prefix = commonPrefix(stems);
  const parts = [stems[0]];
  for (let i = 1; i < stems.length; i++) {
    const stem = stems[i];
    parts.push(stem.startsWith(prefix) ? stem.slice(prefix.length).trim() : stem);
  }
  return `merged ${parts.join(' ')}.txt`;
}

function commonPrefix(stems) {
  let prefix = stems[0];
  for (let i = 1; i < stems.length; i++) {
    const stem = stems[i];
    let j = 0;
    while (j < prefix.length && j < stem.length && prefix[j] === stem[j]) {
      j++;
    }
    prefix = prefix.slice(0, j);
  }
  return prefix;
}

function formatCardLine({ blueprintId, horizontal, title }) {
  return `    <card blueprintId="${escapeXmlAttr(blueprintId)}" horizontal="${escapeXmlAttr(horizontal)}" title="${escapeXmlAttr(title)}"/>`;
}

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
