import { Injectable } from '@angular/core';
import { ReadingReference } from '../../interfaces/lectionary';

/**
 * Lectionary Data Service
 * 
 * Provides static lectionary data for Revised Common Lectionary (RCL)
 * and Book of Common Prayer (BCP) lectionaries.
 * 
 * The lectionary follows a three-year cycle:
 * - Year A: Matthew (starts in Advent 2022, 2025, 2028...)
 * - Year B: Mark (starts in Advent 2023, 2026, 2029...)
 * - Year C: Luke (starts in Advent 2024, 2027, 2030...)
 */

export interface LectionaryEntry {
  date: string; // YYYY-MM-DD format
  season?: string; // e.g., "Advent", "Christmas", "Epiphany", "Lent", "Easter", "Ordinary Time"
  week?: string; // e.g., "First Sunday of Advent"
  readings: {
    oldTestament?: ReadingReference;
    psalm?: ReadingReference;
    epistle?: ReadingReference;
    gospel?: ReadingReference;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LectionaryDataService {
  /**
   * Determine the liturgical year (A, B, or C) for a given date
   * The liturgical year starts on the First Sunday of Advent
   */
  getLiturgicalYear(date: Date): 'A' | 'B' | 'C' {
    // Find the First Sunday of Advent for the year
    // Advent starts on the Sunday closest to November 30
    const year = date.getFullYear();
    const adventStart = this.getFirstSundayOfAdvent(year);
    
    // If the date is before Advent, use the previous year's cycle
    const liturgicalYear = date < adventStart ? year - 1 : year;
    
    // Year A: 2022, 2025, 2028... (years where year % 3 === 2)
    // Year B: 2023, 2026, 2029... (years where year % 3 === 0)
    // Year C: 2024, 2027, 2030... (years where year % 3 === 1)
    const remainder = liturgicalYear % 3;
    
    if (remainder === 2) return 'A';
    if (remainder === 0) return 'B';
    return 'C';
  }

  /**
   * Get the First Sunday of Advent for a given year
   * Advent starts on the Sunday closest to November 30
   */
  private getFirstSundayOfAdvent(year: number): Date {
    // November 30 of the given year
    const nov30 = new Date(year, 10, 30); // Month is 0-indexed
    
    // Find the Sunday on or before November 30
    const dayOfWeek = nov30.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    
    const firstSunday = new Date(nov30);
    firstSunday.setDate(nov30.getDate() - daysToSubtract);
    
    return firstSunday;
  }

  /**
   * Get readings for a specific date
   * This will look up the date in the static lectionary data
   */
  getReadingsForDate(date: Date): LectionaryEntry | null {
    const dateStr = this.formatDate(date);
    const year = this.getLiturgicalYear(date);
    
    // Try to find exact date match first
    const exactMatch = this.findReadingByDate(dateStr);
    if (exactMatch) {
      return exactMatch;
    }
    
    // If no exact match, try to find by liturgical year and approximate date
    // This is a fallback for dates not in the database
    return null;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Find reading by exact date
   * This searches the static lectionary database
   */
  private findReadingByDate(dateStr: string): LectionaryEntry | null {
    // This will be populated with actual lectionary data
    // For now, return null - data will be loaded from JSON files
    return null;
  }

  /**
   * Get sample readings for testing
   * This provides a few example readings to demonstrate the structure
   */
  getSampleReadings(): LectionaryEntry[] {
    return [
      {
        date: '2024-12-01', // First Sunday of Advent, Year C
        season: 'Advent',
        week: 'First Sunday of Advent',
        readings: {
          oldTestament: {
            book: 'Jeremiah',
            chapter: 33,
            startVerse: 14,
            endVerse: 16,
            citation: 'Jeremiah 33:14-16',
          },
          psalm: {
            book: 'Psalm',
            chapter: 25,
            startVerse: 1,
            endVerse: 10,
            citation: 'Psalm 25:1-10',
          },
          epistle: {
            book: '1 Thessalonians',
            chapter: 3,
            startVerse: 9,
            endVerse: 13,
            citation: '1 Thessalonians 3:9-13',
          },
          gospel: {
            book: 'Luke',
            chapter: 21,
            startVerse: 25,
            endVerse: 36,
            citation: 'Luke 21:25-36',
          },
        },
      },
      {
        date: '2024-12-25', // Christmas Day
        season: 'Christmas',
        week: 'Christmas Day',
        readings: {
          oldTestament: {
            book: 'Isaiah',
            chapter: 9,
            startVerse: 2,
            endVerse: 7,
            citation: 'Isaiah 9:2-7',
          },
          psalm: {
            book: 'Psalm',
            chapter: 96,
            citation: 'Psalm 96',
          },
          epistle: {
            book: 'Titus',
            chapter: 2,
            startVerse: 11,
            endVerse: 14,
            citation: 'Titus 2:11-14',
          },
          gospel: {
            book: 'Luke',
            chapter: 2,
            startVerse: 1,
            endVerse: 20,
            citation: 'Luke 2:1-20',
          },
        },
      },
    ];
  }
}

