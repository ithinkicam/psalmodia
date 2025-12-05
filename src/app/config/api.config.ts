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
    defaultTranslation: 'de4e12af7f28f599-02', // ESV (English Standard Version)
  },
  lectionary: {
    baseUrl: 'https://lectionary.app/api', // May need to verify actual endpoint
    // Alternative: Use static data if API unavailable
  },
};

// Common Bible translations available on api.bible
export const BIBLE_TRANSLATIONS: Array<{
  id: string;
  name: string;
  abbreviation: string;
}> = [
  {
    id: 'de4e12af7f28f599-02',
    name: 'English Standard Version',
    abbreviation: 'ESV',
  },
  {
    id: '06125adad2d5898a-01',
    name: 'New International Version',
    abbreviation: 'NIV',
  },
  {
    id: '9879dbb7cfe39e4d-01',
    name: 'New American Standard Bible',
    abbreviation: 'NASB',
  },
  {
    id: 'de4e12af7f28f599-01',
    name: 'King James Version',
    abbreviation: 'KJV',
  },
  {
    id: '65eec8e0b60e656b-01',
    name: 'New Living Translation',
    abbreviation: 'NLT',
  },
  {
    id: '592420522e16049f-01',
    name: 'Christian Standard Bible',
    abbreviation: 'CSB',
  },
];
