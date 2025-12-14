import { promises as fs } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';

interface CoverdalePsalm {
  psalm_number: number;
  latin_name: string;
  text: string;
  annotated_text: string;
}

async function parseCoverdalePsalms(
  inputFile: string,
  outputDir: string
): Promise<void> {
  console.log(`Reading ${inputFile}...`);
  const content = await fs.readFile(inputFile, 'utf8');
  const lines = content.split('\n');

  const psalms: CoverdalePsalm[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Match "Psalm N. [LatinName]" or just "Psalm N."
    const psalmMatch = line.match(/^Psalm\s+(\d+)\.\s*(.*)$/);
    if (!psalmMatch) {
      i++;
      continue;
    }

    const psalmNum = parseInt(psalmMatch[1], 10);
    const latinOnFirstLine = psalmMatch[2].trim();

    i++; // Move to next line

    // Check if next line is a part marker (I., II., III., etc.)
    const parts: Array<{
      partNum: string;
      partLatin: string;
      lines: string[];
    }> = [];
    let firstPartLatin = latinOnFirstLine;

    // Collect part lines or direct text lines
    while (i < lines.length) {
      const currentLine = lines[i];
      const trimmed = currentLine.trim();

      // Check if it's a psalm header
      if (trimmed.match(/^Psalm\s+\d+\./)) {
        break; // Next psalm
      }

      // Check if it's a part marker
      const partMatch = trimmed.match(/^([IVX]+)\.\s+(.+)$/);
      if (partMatch) {
        // Save previous part if any
        if (parts.length > 0 || firstPartLatin) {
          const partLatin =
            parts.length === 0
              ? firstPartLatin
              : parts[parts.length - 1].partLatin;
          const partLines =
            parts.length === 0 ? [] : parts[parts.length - 1].lines;
          parts.push({
            partNum: partMatch[1],
            partLatin: partMatch[2].trim(),
            lines: [],
          });
        } else {
          parts.push({
            partNum: partMatch[1],
            partLatin: partMatch[2].trim(),
            lines: [],
          });
        }
        i++;
        continue;
      }

      // Skip service labels
      if (trimmed.match(/^\s*(Morning|Evening|Prayer)\s*\.?\s*$/i)) {
        i++;
        continue;
      }

      // Collect text lines
      if (trimmed) {
        if (parts.length === 0) {
          // Single-part psalm (no parts yet)
          parts.push({
            partNum: 'I',
            partLatin: firstPartLatin,
            lines: [],
          });
        }
        parts[parts.length - 1].lines.push(currentLine);
      }

      i++;
    }

    // Save all parts for this psalm
    for (const part of parts) {
      if (part.lines.length === 0) continue;
      const psalm: CoverdalePsalm = {
        psalm_number: psalmNum,
        latin_name: part.partLatin,
        text: cleanPsalmText(part.lines.join('\n')),
        annotated_text: '',
      };
      psalm.annotated_text = annotatePsalmText(psalm.text);
      psalms.push(psalm);
    }
  }

  // Write individual files
  mkdirSync(outputDir, { recursive: true });
  for (const psalm of psalms) {
    // Check if it's a multi-part psalm (has multiple entries with same number but different parts)
    const multiPartCount = psalms.filter(
      (p) => p.psalm_number === psalm.psalm_number
    ).length;

    let filename: string;
    if (multiPartCount > 1) {
      // Find which part this is
      const samePsalmCount = psalms.filter(
        (p) => p.psalm_number === psalm.psalm_number && p === psalm
      ).length;
      // Count how many psalms with same number appear before this one
      let partIndex = 1;
      for (const other of psalms) {
        if (other.psalm_number === psalm.psalm_number) {
          if (other === psalm) break;
          partIndex++;
        }
      }
      filename = `psalm_${psalm.psalm_number}_${partIndex}.json`;
    } else {
      filename = `psalm_${psalm.psalm_number}.json`;
    }

    const outPath = path.join(outputDir, filename);
    const data = JSON.stringify(psalm, null, 2);
    writeFileSync(outPath, data, 'utf8');
    console.log(`  Written ${filename}`);
  }

  console.log(`\nParsed ${psalms.length} psalms into ${outputDir}`);
}

function cleanPsalmText(text: string): string {
  // Replace * with actual line breaks for stanzas
  const cleaned = text
    .replace(/\s*\n\s*/g, ' ') // Join wrapped lines
    .replace(/\s*\*\s*/g, '\n') // Replace * with newlines
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.match(/^Amen\.?$/i))
    .join('\n');
  return cleaned;
}

function annotatePsalmText(text: string): string {
  const lines = text.split('\n');
  const annotated = lines
    .map((line, idx) => convertCoverdalemarkers(line, idx))
    .join('\n');
  return annotated;
}

function convertCoverdalemarkers(line: string, lineIndex: number): string {
  // Replace accented vowels with ^ marker before the vowel
  const vowelMap: Record<string, string> = {
    á: '^a',
    é: '^e',
    í: '^i',
    ó: '^o',
    ú: '^u',
    à: '^a',
    è: '^e',
    ì: '^i',
    ò: '^o',
    ù: '^u',
    â: '^a',
    ê: '^e',
    î: '^i',
    ô: '^o',
    û: '^u',
    ä: '^a',
    ë: '^e',
    ï: '^i',
    ö: '^o',
    ü: '^u',
  };

  let result = line;

  // Replace accented vowels with ^ + base vowel
  for (const [accented, replacement] of Object.entries(vowelMap)) {
    result = result.replace(new RegExp(accented, 'g'), replacement);
  }

  // For lines after 0 (second stanza onwards), add / before the first ^ marker
  if (lineIndex > 0 && result.includes('^')) {
    result = result.replace(/\^/, '/^');
  }

  return result;
}

async function main() {
  try {
    const inputFile =
      '/Users/cameronlewis/Dev/psalmodia/public/assets/psalms/annotated/coverdale/coverdale-psalms.txt';
    const outputDir =
      '/Users/cameronlewis/Dev/psalmodia/public/assets/psalms/coverdale';
    await parseCoverdalePsalms(inputFile, outputDir);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

void main();
