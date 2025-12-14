# API Setup Instructions

## Bible API (api.bible)

The application is configured to use the Bible API with environment variables for secure API key management.

### Development Setup

The API key is configured in `src/environments/environment.ts` for local development:

```typescript
export const environment = {
  production: false,
  bibleApiKey: 'fX9BEcYPcIuH_U-nfZ7u8',
  bibleApiBaseUrl: 'https://rest.api.bible',
};
```

**Note**: The `environment.ts` file should be added to `.gitignore` to prevent committing API keys to version control.

### Production Setup

For production deployments, use environment variables:

1. **Set the environment variable**:

   ```bash
   export BIBLE_API_KEY=your_api_key_here
   ```

2. **Or in your deployment platform**:

   - Set `BIBLE_API_KEY` as an environment variable
   - The application will automatically use it from `process.env`

3. **The production environment** (`src/environments/environment.prod.ts`) reads from `process.env.BIBLE_API_KEY`

### API Endpoint

The application uses the REST API endpoint: `https://rest.api.bible`

### Security Note

- The `environment.ts` file is in `.gitignore` to prevent committing API keys
- Use `environment.example.ts` as a template for other developers
- Never commit actual API keys to version control

### Available Translations

The following translations are pre-configured:

- **King James (Authorised) Version** (KJV) - Default
- **New American Standard Bible 2020** (NASB 2020)
- **American Standard Version Bible Translation** (ASVBT)
- **Douay-Rheims American 1899** (DRA 1899)
- **Brenton English Septuagint (Updated Spelling and Formatting)** (Brenton LXX) - Old Testament only

**Note**: The Brenton Septuagint is automatically used only for Old Testament readings. If selected for New Testament readings, the system will automatically fall back to the default translation (KJV).

### Translation IDs

The translation IDs in `src/app/config/api.config.ts` may need to be verified using the api.bible API:

1. Use the api.bible `/v1/bibles` endpoint to list all available translations
2. Find the correct IDs for:
   - ASVBT (American Standard Version Bible Translation)
   - Douay-Rheims American 1899
   - Brenton English Septuagint
3. Update the placeholder IDs (`ASVBT_ID`, `DOUAY_RHEIMS_1899_ID`, `BRENTON_SEPTUAGINT_ID`) in the config file

The KJV and NASB 2020 IDs are already configured, but may need verification.

## Lectionary Data

The lectionary readings feature uses **static JSON data files** stored locally. This approach provides:

- **Reliability**: No dependency on external APIs
- **Performance**: Fast local data access
- **Flexibility**: Easy to expand with additional readings
- **Offline Support**: Works without internet connection

### Current Implementation

The application loads lectionary data from JSON files in `public/assets/lectionary/`:

- **Sample Data**: `rcl-sample.json` contains 3 sample readings for testing
- **Format**: See `public/assets/lectionary/README.md` for data structure
- **Loading**: Data is loaded on application startup and cached in memory

### Expanding the Lectionary Data

To add more readings, you have several options:

1. **Manual Entry**: Edit the JSON files following the format in `public/assets/lectionary/README.md`

2. **Use Online Resources**:

   - **Revised Common Lectionary**: https://oremus.org/lectionary.html
   - **Book of Common Prayer (1979)**: https://en.wikisource.org/wiki/Book_of_Common_Prayer_(ECUSA)/The_Lectionary
   - Extract readings and format them according to the JSON structure

3. **Create Separate Files**: You can create files for different lectionaries:
   - `rcl-year-a.json`, `rcl-year-b.json`, `rcl-year-c.json` for RCL
   - `bcp-1979.json` for Book of Common Prayer

### Liturgical Year

The lectionary follows a three-year cycle:

- **Year A**: Matthew (2022, 2025, 2028...)
- **Year B**: Mark (2023, 2026, 2029...)
- **Year C**: Luke (2024, 2027, 2030...)

The liturgical year starts on the First Sunday of Advent (Sunday closest to November 30).

### Data Sources

**Revised Common Lectionary (RCL)**:

- Used by many Protestant and Anglican churches
- Three-year cycle with readings for Sundays and major feasts
- Available at: https://oremus.org/lectionary.html

**Book of Common Prayer (BCP) 1979**:

- Episcopal Church lectionary
- Also follows a three-year cycle
- Available at: https://en.wikisource.org/wiki/Book_of_Common_Prayer_(ECUSA)/The_Lectionary

## Local Storage

The application automatically saves your preferred Bible translation to browser local storage. This preference persists across sessions.
