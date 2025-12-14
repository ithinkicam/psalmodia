#!/usr/bin/env node
import { promises as fs } from 'fs';
import * as path from 'path';
import { getConsolidatedTone } from '../src/app/config/tone-consolidation';

interface Psalm {
  psalm_number: number;
  latin_name?: string;
  text: string;
  annotated_text?: string;
  part?: number;
  recommended_tone?: string;
}

interface PsalmCollection {
  version: string;
  name: string;
  description?: string;
  psalms: Psalm[];
}

// Mapping from Psalm Tone Table CSV
const toneMapping: Record<string, string> = {
  '1': '1B',
  '2': '3A',
  '3': '2',
  '4': '8',
  '5': '1A',
  '6': '8',
  '7': '1A',
  '8': '5',
  '9': '6C',
  '10': '8',
  '11': '5',
  '12': '4',
  '13': '3A',
  '14': '7',
  '15': '3A',
  '16': '8',
  '17': '7',
  '18 1': '1B',
  '18 2': '2',
  '19': '4',
  '20': '3A',
  '21': '8',
  '22': '2',
  '23': '6A',
  '24': '7',
  '25': '1A',
  '26': '6B',
  '27': '7',
  '28': '4',
  '29': '5',
  '30': '1B',
  '31': '8',
  '32': '1A',
  '33': '2',
  '34': '7',
  '35': '1A',
  '36': '2',
  '37 1': '1B',
  '37 2': '1A',
  '38': '4',
  '39': '2',
  '40': '6A',
  '41': '3A',
  '42': '5',
  '43': '5',
  '44': '7',
  '45': '8',
  '46': '5',
  '47': '7',
  '48': '1A',
  '49': '2',
  '50': '3A',
  '51': '4',
  '52': '7',
  '53': '3A',
  '54': '4',
  '55': '1A',
  '56': '1B',
  '57': '8',
  '58': '7',
  '59': '4',
  '60': '6C',
  '61': '8',
  '62': '4',
  '63': '1B',
  '64': '2',
  '65': '7',
  '66': '1B',
  '67': '8',
  '68': '8',
  '69': '2',
  '70': '4',
  '71': '4',
  '72': '6C',
  '73': '7',
  '74': '2',
  '75': '1A',
  '76': '8',
  '77': '2',
  '78 1': '1B',
  '78 2': '2',
  '79': '8',
  '80': '4',
  '81': '3A',
  '82': '8',
  '83': '7',
  '84': '3A',
  '85': '4',
  '86': '1B',
  '87': '7',
  '88': '4',
  '89 1': '1B',
  '89 2': '5',
  '90': '1A',
  '91': '8',
  '92': '6C',
  '93': '5',
  '94': '4',
  '95': '3A',
  '96': '8',
  '97': '5',
  '98': '6A',
  '99': '4',
  '100': '8',
  '101': '7',
  '102': '1A',
  '103': '5',
  '104': '3A',
  '105 1': '6B',
  '105 2': '1A',
  '106 1': '6C',
  '106 2': '1A',
  '107 1': '8',
  '107 2': '1A',
  '108': '8',
  '109': '4',
  '110': '3A',
  '111': '4',
  '112': '7',
  '113': '5',
  '114': 'P',
  '115': 'P',
  '116': '2',
  '117': 'P',
  '118': '1A',
  '119 Aleph': '3A',
  '119 Beth': '3A',
  '119 Gimel': '7',
  '119 Daleth': '7',
  '119 He': '1A',
  '119 Waw': '1A',
  '119 Zayin': '1A',
  '119 Heth': '4',
  '119 Yodh': '1B',
  '119 Lamedh': '2',
  '119 Mem': '2',
  '119 Nun': '7',
  '119 Samekh': '7',
  '119 Ayin': '7',
  '119 Pe': '5',
  '119 Sadhe': '5',
  '119 Qoph': '1A',
  '119 Resh': '1A',
  '119 Shin': '3A',
  '119 Taw': '3A',
  '120': '1A',
  '121': '1B',
  '122': '4',
  '123': '1B',
  '124': '7',
  '125': '8',
  '126': '1A',
  '127': '2',
  '128': '3A',
  '129': '4',
  '130': '4',
  '131': '8',
  '132': '6C',
  '133': '8',
  '134': '8',
  '135': '7',
  '136': '3A',
  '137': '1A',
  '138': '5',
  '139': '1B',
  '140': '3A',
  '141': '8',
  '142': '6B',
  '143': '7',
  '144': '1B',
  '145': '5',
  '146': '4',
  '147': '8',
  '148': '7',
  '149': '6C',
  '150': 'P',
};

async function readJson(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath: string, data: any): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json, 'utf8');
}

function getPsalmKey(psalm: Psalm): string {
  if (psalm.part) {
    return `${psalm.psalm_number} ${psalm.part === 1 ? '1' : psalm.part}`;
  }
  return psalm.psalm_number.toString();
}

async function migrateIndividualPsalms(
  dir: string,
  description: string
): Promise<void> {
  console.log(`\nProcessing ${description}...`);
  const files = await fs.readdir(dir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  let updated = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(dir, file);
    const psalm = (await readJson(filePath)) as Psalm;

    const key = getPsalmKey(psalm);
    const consolidatedTone = toneMapping[key];

    if (consolidatedTone && !psalm.recommended_tone) {
      psalm.recommended_tone = consolidatedTone;
      await writeJson(filePath, psalm);
      updated++;
    }
  }

  console.log(`Updated ${updated} files in ${description}`);
}

async function migrateCollection(
  filePath: string,
  description: string
): Promise<void> {
  console.log(`\nProcessing ${description}...`);
  const collection = (await readJson(filePath)) as PsalmCollection;

  let updated = 0;
  for (const psalm of collection.psalms) {
    const key = getPsalmKey(psalm);
    const consolidatedTone = toneMapping[key];

    if (consolidatedTone && !psalm.recommended_tone) {
      psalm.recommended_tone = consolidatedTone;
      updated++;
    }
  }

  if (updated > 0) {
    await writeJson(filePath, collection);
  }

  console.log(`Updated ${updated} psalms in ${description}`);
}

async function main() {
  try {
    const basePath = path.join(process.cwd(), 'public/assets/psalms');

    // Migrate Coverdale individual psalms
    await migrateIndividualPsalms(
      path.join(basePath, 'coverdale'),
      'Coverdale individual psalm files'
    );

    // Migrate collections
    await migrateCollection(
      path.join(basePath, 'psalms-1979-bcp.json'),
      'psalms-1979-bcp.json collection'
    );

    await migrateCollection(
      path.join(basePath, 'psalms-coverdale.json'),
      'psalms-coverdale.json collection'
    );

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

void main();
