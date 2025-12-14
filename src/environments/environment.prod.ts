// In production, API key should come from environment variables
// Set BIBLE_API_KEY environment variable when deploying
export const environment = {
  production: true,
  bibleApiKey: (typeof process !== 'undefined' && process.env?.['BIBLE_API_KEY']) || '',
  bibleApiBaseUrl: 'https://rest.api.bible',
};

