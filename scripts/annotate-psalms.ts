#!/usr/bin/env node
import { promises as fs } from 'fs';
import * as path from 'path';
import { annotateLine, LineAnnotation } from './chant-helpers';

// Minimal shared types based on the app's Psalm service
interface Psalm {
  psalm_number: number;
  latin_name?: string;
  text: string;
  annotated_text?: string;
  chant_annotations?: LineAnnotation[];
  chant_tone?: string;
}

interface PsalmCollection {
  version: string;
  name: string;
  description?: string;
  psalms: Psalm[];
}

interface CliOptions {
  input: string;
  outDir: string;
  tone?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  const opts: Partial<CliOptions> = {};
  while (args.length) {
    const arg = args.shift();
    if (!arg) continue;
    switch (arg) {
      case '--input':
      case '-i':
        opts.input = args.shift();
        break;
      case '--outDir':
      case '-o':
        opts.outDir = args.shift();
        break;
      case '--tone':
      case '-t':
        opts.tone = args.shift();
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        // Ignore unknown flags for now
        break;
    }
  }

  if (!opts.input) {
    throw new Error(
      'Missing required --input path to a psalm collection or single psalm JSON file.'
    );
  }

  return {
    input: path.resolve(opts.input),
    outDir: path.resolve(opts.outDir || 'public/assets/psalms/annotated'),
    tone: opts.tone,
  };
}

function printHelp(): void {
  // Keep help terse for now
  console.log(`Usage: annotate-psalms --input <file> [--outDir <dir>] [--tone <tone>]

  --input, -i   Path to a psalm collection JSON (with psalms: []) or an individual psalm JSON
  --outDir, -o  Output directory (default: public/assets/psalms/annotated)
  --tone, -t    Optional tone id/name to store with annotations
  --help, -h    Show this help
`);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(filePath: string): Promise<T> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  const data = JSON.stringify(value, null, 2);
  await fs.writeFile(filePath, data, 'utf8');
}

function annotatePsalm(psalm: Psalm, tone?: string): Psalm {
  const lines = psalm.text.split(/\r?\n/);
  const annotations: LineAnnotation[] = lines.map((line, idx) =>
    annotateLine(line, idx, tone)
  );
  const annotatedText = annotations.map((a) => a.annotated_line).join('\n');

  return {
    ...psalm,
    annotated_text: annotatedText,
    chant_annotations: annotations,
    ...(tone ? { chant_tone: tone } : {}),
  } as Psalm;
}

async function processFile(opts: CliOptions): Promise<void> {
  const input = await readJson<any>(opts.input);
  await ensureDir(opts.outDir);

  if (Array.isArray(input?.psalms)) {
    const collection = input as PsalmCollection;
    const annotated: PsalmCollection = {
      ...collection,
      description: collection.description || 'Annotated psalm collection',
      psalms: collection.psalms.map((psalm) => annotatePsalm(psalm, opts.tone)),
    };
    const filename = path
      .basename(opts.input)
      .replace(/\.json$/i, '.annotated.json');
    const outPath = path.join(opts.outDir, filename);
    await writeJson(outPath, annotated);
    console.log(`Annotated collection written to ${outPath}`);
    return;
  }

  if (
    typeof input?.psalm_number === 'number' &&
    typeof input?.text === 'string'
  ) {
    const psalm = input as Psalm;
    const annotated = annotatePsalm(psalm, opts.tone);
    const filename = path
      .basename(opts.input)
      .replace(/\.json$/i, '.annotated.json');
    const outPath = path.join(opts.outDir, filename);
    await writeJson(outPath, annotated);
    console.log(`Annotated psalm written to ${outPath}`);
    return;
  }

  throw new Error(
    'Unrecognized input format. Expected a collection with psalms[] or a single psalm object.'
  );
}

async function main() {
  try {
    const opts = parseArgs(process.argv.slice(2));
    await processFile(opts);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

void main();
