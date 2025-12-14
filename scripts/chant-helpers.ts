const accentFirstStanzaTones = new Set(['1', '2', '5', '6', '8']);
const articles = new Set(['a', 'an', 'the']);

export interface LineAnnotation {
  lineIndex: number;
  original_line: string;
  annotated_line: string;
  syllables: number;
  caesuraIndex?: number; // 1-based syllable index for the caesura
  primaryAccentSyllable?: number; // 1-based syllable index of the accent
}

export function annotateLine(
  line: string,
  lineIndex: number,
  tone?: string
): LineAnnotation {
  const tokens = tokenize(line);
  const syllableCounts = tokens.map((t) => countSyllables(t.core));
  const totalSyllables = syllableCounts.reduce((a, b) => a + b, 0);

  const caesuraTarget = Math.max(1, totalSyllables - 4);
  const caesuraWordIndex = findWordIndexForSyllable(
    caesuraTarget,
    syllableCounts
  );

  const firstStanzaSyllables = countFirstStanzaSyllables(
    tokens,
    syllableCounts
  );
  const usesFirstStanzaAccent = tone
    ? accentFirstStanzaTones.has(normalizeTone(tone))
    : false;

  let accentTarget: number | undefined;
  if (usesFirstStanzaAccent && firstStanzaSyllables >= 2) {
    accentTarget = Math.max(1, firstStanzaSyllables - 1);
  } else {
    accentTarget = Math.max(1, totalSyllables - 4);
  }

  // If the accent lands on an article, shift forward one syllable when possible
  if (accentTarget) {
    const accentWordIdxDraft = findWordIndexForSyllable(
      accentTarget,
      syllableCounts
    );
    const accentWord =
      accentWordIdxDraft !== undefined
        ? tokens[accentWordIdxDraft]?.core
        : undefined;
    if (accentWord && isArticle(accentWord) && accentTarget < totalSyllables) {
      accentTarget += 1;
    }
  }

  const accentWordIndex = accentTarget
    ? findWordIndexForSyllable(accentTarget, syllableCounts)
    : undefined;

  const annotatedTokens = tokens.map((t, idx) => {
    const needsCaesura = caesuraWordIndex === idx;
    const needsAccent = accentWordIndex === idx;
    let prefix = t.leading || '';
    if (needsCaesura && needsAccent) {
      prefix += '/^';
    } else if (needsCaesura) {
      prefix += '/';
    } else if (needsAccent) {
      prefix += '^';
    }
    return `${prefix}${t.core}${t.trailing ?? ''}`;
  });

  return {
    lineIndex,
    original_line: line,
    annotated_line: annotatedTokens.join(' '),
    syllables: totalSyllables,
    caesuraIndex: caesuraTarget,
    primaryAccentSyllable: accentTarget,
  };
}

export function countSyllables(word: string): number {
  if (!word) return 0;
  const clean = word.toLowerCase();
  const vowelGroups = clean.match(/[aeiouyáéíóúàèìòùâêîôûäëïöü]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (
    clean.endsWith('e') &&
    count > 1 &&
    !clean.endsWith('ee') &&
    !clean.endsWith('le')
  ) {
    count -= 1;
  }
  return Math.max(1, count);
}

function tokenize(
  line: string
): Array<{ leading?: string; core: string; trailing?: string }> {
  const rawTokens = line.split(/\s+/).filter(Boolean);
  return rawTokens.map((token) => {
    const leading = token.match(/^["'“”‘’(\[]+/)?.[0];
    const trailing = token.match(/[.,;:!?"'“”‘’)&\]]+$/)?.[0];
    const core = token
      .replace(/^["'“”‘’(\[]+/, '')
      .replace(/[.,;:!?"'“”‘’)&\]]+$/, '');
    return { leading, core, trailing };
  });
}

function findWordIndexForSyllable(
  target: number,
  syllableCounts: number[]
): number | undefined {
  let acc = 0;
  for (let i = 0; i < syllableCounts.length; i++) {
    acc += syllableCounts[i];
    if (acc >= target) return i;
  }
  return syllableCounts.length ? syllableCounts.length - 1 : undefined;
}

function countFirstStanzaSyllables(
  tokens: Array<{ core: string }>,
  syllableCounts: number[]
): number {
  let total = 0;
  for (let i = 0; i < tokens.length; i++) {
    total += syllableCounts[i] ?? 0;
    if (/[;,]/.test(tokens[i].core)) break;
    if (hasTerminalPunctuation(tokens[i].trailing)) break;
  }
  return total;
}

function hasTerminalPunctuation(trailing?: string): boolean {
  if (!trailing) return false;
  return /[;,]/.test(trailing);
}

function normalizeTone(tone: string): string {
  return tone
    .trim()
    .toLowerCase()
    .replace(/[^\da-z]/g, '');
}

export function isArticle(word: string): boolean {
  return articles.has(word.toLowerCase());
}
