import { environment } from '../../environments/environment';

/**
 * API Configuration
 *
 * API keys are loaded from environment variables for security.
 * - Development: Uses environment.ts (not committed to git)
 * - Production: Uses environment variables or environment.prod.ts
 *
 * To set API key in production:
 * - Set BIBLE_API_KEY environment variable
 * - Or update environment.prod.ts (not recommended for production)
 */

export const API_CONFIG = {
  bible: {
    baseUrl: environment.bibleApiBaseUrl,
    apiKey: environment.bibleApiKey,
    defaultTranslation: 'de4e12af7f28f599-01', // KJV (King James Authorised Version)
  },
  // Lectionary data is loaded from static JSON files in public/assets/lectionary/
  // See public/assets/lectionary/README.md for more information
};

// Bible translations available on api.bible
//
// To find correct translation IDs:
// 1. Use your API key to call: GET https://rest.api.bible/v1/bibles
// 2. Search the response for the translation name
// 3. Use the 'id' field from the response
//
// Example curl command:
// curl -H "api-key: YOUR_API_KEY" https://rest.api.bible/v1/bibles
export const BIBLE_TRANSLATIONS: Array<{
  id: string;
  name: string;
  abbreviation: string;
  oldTestamentOnly?: boolean; // If true, only use for OT readings
}> = [
  {
    id: 'de4e12af7f28f599-01', // engKJV - King James (Authorised) Version
    name: 'King James (Authorised) Version',
    abbreviation: 'KJV',
  },
  {
    id: '9879dbb7cfe39e4d-01', // NASB 2020 - New American Standard Bible 2020
    name: 'New American Standard Bible 2020',
    abbreviation: 'NASB 2020',
  },
  {
    id: '685d1470fe4d5c3b-01', // ASVBT - American Standard Version Bible Translation
    name: 'American Standard Version Bible Translation',
    abbreviation: 'ASVBT',
  },
  {
    id: '179568874c45066f-01', // Douay-Rheims American 1899
    name: 'Douay-Rheims American 1899',
    abbreviation: 'DRA 1899',
  },
  {
    id: '6bab4d6c61b31b80-01', // Brenton English Septuagint (Updated Spelling and Formatting)
    name: 'Brenton English Septuagint (Updated Spelling and Formatting)',
    abbreviation: 'Brenton LXX',
    oldTestamentOnly: true, // Only for Old Testament readings
  },
];

// Old Testament books (for determining if a reading should use Septuagint)
export const OLD_TESTAMENT_BOOKS = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalm',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Song of Songs',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
];

// Book name to api.bible book ID mapping
// api.bible uses book abbreviations like 'GEN', 'PSA', 'MAT', etc.
export const BOOK_NAME_TO_ID: { [key: string]: string } = {
  // Old Testament
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '1Samuel': '1SA',
  '2 Samuel': '2SA',
  '2Samuel': '2SA',
  '1 Kings': '1KI',
  '1Kings': '1KI',
  '2 Kings': '2KI',
  '2Kings': '2KI',
  '1 Chronicles': '1CH',
  '1Chronicles': '1CH',
  '2 Chronicles': '2CH',
  '2Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalm: 'PSA',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
  'Song of Songs': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',

  // New Testament
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '1Corinthians': '1CO',
  '2 Corinthians': '2CO',
  '2Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '1Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '2Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '1Timothy': '1TI',
  '2 Timothy': '2TI',
  '2Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '1Peter': '1PE',
  '2 Peter': '2PE',
  '2Peter': '2PE',
  '1 John': '1JN',
  '1John': '1JN',
  '2 John': '2JN',
  '2John': '2JN',
  '3 John': '3JN',
  '3John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',
};

/**
 * Septuagint Psalm Numbering Mapping
 *
 * The Septuagint (Greek OT, used by Brenton LXX) uses different psalm numbers
 * than the Masoretic Text (used by most English translations).
 *
 * Key differences:
 * - Psalms 1-8: Same numbering
 * - Psalm 9 in Masoretic = Psalms 9-10 in Septuagint (combined as Psalm 9 in LXX)
 * - Psalm 10 in Masoretic = Part of Psalm 9 in Septuagint
 * - Psalms 11-113 in Masoretic = Psalms 10-112 in Septuagint (offset by 1)
 * - Psalm 114-115 in Masoretic = Psalm 113 in Septuagint (combined)
 * - Psalm 116 in Masoretic = Psalms 114-115 in Septuagint (split)
 * - Psalm 117 in Masoretic = Psalm 116 in Septuagint
 * - Psalms 118-146 in Masoretic = Psalms 117-145 in Septuagint (offset by 1)
 * - Psalm 147 in Masoretic = Psalms 146-147 in Septuagint (split)
 * - Psalm 148-150 in Masoretic = Psalms 148-150 in Septuagint (same)
 *
 * This mapping converts Masoretic psalm numbers to Septuagint numbers.
 */
export const MASORETIC_TO_SEPTUAGINT_PSALM: { [key: number]: number } = {
  // Psalms 1-8: No change
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  // Psalm 9-10: Special case - both map to LXX Psalm 9
  9: 9,
  10: 9,
  // Psalms 11-113: Offset by -1
  11: 10,
  12: 11,
  13: 12,
  14: 13,
  15: 14,
  16: 15,
  17: 16,
  18: 17,
  19: 18,
  20: 19,
  21: 20,
  22: 21,
  23: 22,
  24: 23,
  25: 24,
  26: 25,
  27: 26,
  28: 27,
  29: 28,
  30: 29,
  31: 30,
  32: 31,
  33: 32,
  34: 33,
  35: 34,
  36: 35,
  37: 36,
  38: 37,
  39: 38,
  40: 39,
  41: 40,
  42: 41,
  43: 42,
  44: 43,
  45: 44,
  46: 45,
  47: 46,
  48: 47,
  49: 48,
  50: 49,
  51: 50,
  52: 51,
  53: 52,
  54: 53,
  55: 54,
  56: 55,
  57: 56,
  58: 57,
  59: 58,
  60: 59,
  61: 60,
  62: 61,
  63: 62,
  64: 63,
  65: 64,
  66: 65,
  67: 66,
  68: 67,
  69: 68,
  70: 69,
  71: 70,
  72: 71,
  73: 72,
  74: 73,
  75: 74,
  76: 75,
  77: 76,
  78: 77,
  79: 78,
  80: 79,
  81: 80,
  82: 81,
  83: 82,
  84: 83,
  85: 84,
  86: 85,
  87: 86,
  88: 87,
  89: 88,
  90: 89,
  91: 90,
  92: 91,
  93: 92,
  94: 93,
  95: 94,
  96: 95,
  97: 96,
  98: 97,
  99: 98,
  100: 99,
  101: 100,
  102: 101,
  103: 102,
  104: 103,
  105: 104,
  106: 105,
  107: 106,
  108: 107,
  109: 108,
  110: 109,
  111: 110,
  112: 111,
  113: 112,
  // Psalms 114-115: Combined as Psalm 113 in LXX
  114: 113,
  115: 113,
  // Psalm 116: Split into LXX Psalms 114-115
  116: 114, // Primary mapping for Psalm 116
  // Psalm 117: Becomes 116 in LXX
  117: 116,
  // Psalms 118-146: Offset by -1
  118: 117,
  119: 118,
  120: 119,
  121: 120,
  122: 121,
  123: 122,
  124: 123,
  125: 124,
  126: 125,
  127: 126,
  128: 127,
  129: 128,
  130: 129,
  131: 130,
  132: 131,
  133: 132,
  134: 133,
  135: 134,
  136: 135,
  137: 136,
  138: 137,
  139: 138,
  140: 139,
  141: 140,
  142: 141,
  143: 142,
  144: 143,
  145: 144,
  146: 145,
  // Psalm 147: Split into LXX Psalms 146-147
  147: 146, // Primary mapping for Psalm 147
  // Psalms 148-150: No change
  148: 148,
  149: 149,
  150: 150,
};

/**
 * Septuagint Psalm Range Mapping
 *
 * Some Masoretic psalms need to be split when using Septuagint numbering.
 * This mapping defines what happens for verse ranges.
 */
export const SEPTUAGINT_PSALM_SPLITS: {
  [masoraticPsalm: number]: Array<{
    septuagintPsalm: number;
    masoraticVerses: [number, number];
  }>;
} = {
  // Psalm 9-10 in Masoretic are combined as Psalm 9 in Septuagint
  // Verses 1-22 of Masoretic Psalm 9 map to Psalm 9 in LXX
  // Verses 1-20 of Masoretic Psalm 10 map to Psalm 10 in LXX (which is actually part of LXX Psalm 9)
  9: [{ septuagintPsalm: 9, masoraticVerses: [1, 22] }],
  10: [{ septuagintPsalm: 9, masoraticVerses: [1, 20] }],
  // Psalm 114-115 combined as 113 in LXX
  114: [{ septuagintPsalm: 113, masoraticVerses: [1, 11] }],
  115: [{ septuagintPsalm: 113, masoraticVerses: [1, 18] }],
  // Psalm 116 split into 114-115 in LXX
  116: [
    { septuagintPsalm: 114, masoraticVerses: [1, 9] },
    { septuagintPsalm: 115, masoraticVerses: [10, 19] },
  ],
  // Psalm 147 split into 146-147 in LXX
  147: [
    { septuagintPsalm: 146, masoraticVerses: [1, 11] },
    { septuagintPsalm: 147, masoraticVerses: [12, 20] },
  ],
};
