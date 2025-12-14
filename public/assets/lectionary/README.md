# Lectionary Data Files

This directory contains static lectionary data files in JSON format.

## Current Files

- `rcl-sample.json` - Sample Revised Common Lectionary readings (3 entries for testing)

## Data Format

Each lectionary file should follow this structure:

```json
{
  "name": "Lectionary Name",
  "description": "Description of the lectionary",
  "readings": [
    {
      "date": "YYYY-MM-DD",
      "season": "Advent|Christmas|Epiphany|Lent|Easter|Ordinary Time",
      "week": "First Sunday of Advent",
      "year": "A|B|C",
      "readings": {
        "oldTestament": {
          "book": "Jeremiah",
          "chapter": 33,
          "startVerse": 14,
          "endVerse": 16,
          "citation": "Jeremiah 33:14-16"
        },
        "psalm": {
          "book": "Psalm",
          "chapter": 25,
          "startVerse": 1,
          "endVerse": 10,
          "citation": "Psalm 25:1-10"
        },
        "epistle": {
          "book": "1 Thessalonians",
          "chapter": 3,
          "startVerse": 9,
          "endVerse": 13,
          "citation": "1 Thessalonians 3:9-13"
        },
        "gospel": {
          "book": "Luke",
          "chapter": 21,
          "startVerse": 25,
          "endVerse": 36,
          "citation": "Luke 21:25-36"
        }
      }
    }
  ]
}
```

## Expanding the Data

### Option 1: Manual Entry
You can manually add readings by editing the JSON files. Follow the format above.

### Option 2: Use Online Resources

**Revised Common Lectionary:**
- Oremus Lectionary: https://oremus.org/lectionary.html
- Extract readings and format them according to the JSON structure

**Book of Common Prayer (1979):**
- Wikisource: https://en.wikisource.org/wiki/Book_of_Common_Prayer_(ECUSA)/The_Lectionary
- Extract readings and format them according to the JSON structure

### Option 3: Create Separate Files

You can create separate files for different lectionaries:
- `rcl-year-a.json` - Revised Common Lectionary Year A
- `rcl-year-b.json` - Revised Common Lectionary Year B
- `rcl-year-c.json` - Revised Common Lectionary Year C
- `bcp-1979.json` - Book of Common Prayer 1979

The `LectionaryService` will automatically load any JSON files placed in this directory.

## Liturgical Year Calculation

The lectionary follows a three-year cycle:
- **Year A**: Matthew (starts in Advent 2022, 2025, 2028...)
- **Year B**: Mark (starts in Advent 2023, 2026, 2029...)
- **Year C**: Luke (starts in Advent 2024, 2027, 2030...)

The liturgical year starts on the First Sunday of Advent (the Sunday closest to November 30).

## Notes

- All dates should be in YYYY-MM-DD format
- Not all readings require all four types (oldTestament, psalm, epistle, gospel)
- Some readings may only have a psalm or gospel reading
- The `citation` field should match the standard citation format for the reading

