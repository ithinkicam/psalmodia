import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import {
  LectionaryReading,
  ReadingReference,
} from '../../interfaces/lectionary';
import {
  LectionaryDataService,
  LectionaryEntry,
} from './lectionary-data.service';

interface LectionaryDataFile {
  name: string;
  description: string;
  readings: LectionaryEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class LectionaryService {
  private http = inject(HttpClient);
  private dataService = inject(LectionaryDataService);
  private lectionaryCache: Map<string, LectionaryEntry> = new Map();
  private dataLoaded = false;

  constructor() {
    // Load static lectionary data on initialization
    this.loadStaticLectionaryData();
  }

  /**
   * Get lectionary readings for a specific date
   * Loads from local static JSON files
   * @param date The date to get readings for
   */
  getReadingsForDate(date: Date): Observable<LectionaryReading | null> {
    // Format date as YYYY-MM-DD
    const dateStr = this.formatDate(date);

    // If data is loaded, check cache
    if (this.dataLoaded) {
      return of(this.getCachedReading(date, dateStr));
    }

    // Otherwise, wait for data to load (should be very quick)
    return new Observable((observer) => {
      // Poll until data is loaded or timeout
      const maxAttempts = 10;
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (this.dataLoaded || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          const reading = this.getCachedReading(date, dateStr);
          observer.next(reading);
          observer.complete();
        }
      }, 50);
    });
  }

  /**
   * Get cached reading for a date
   */
  private getCachedReading(
    date: Date,
    dateStr: string
  ): LectionaryReading | null {
    const cached = this.lectionaryCache.get(dateStr);
    if (cached) {
      return this.convertEntryToReading(cached, date);
    }
    return null;
  }

  /**
   * Load static lectionary data from JSON files
   * Supports multiple files - add more files to load additional lectionaries
   */
  private loadStaticLectionaryData(): void {
    const lectionaryFiles = [
      'assets/lectionary/rcl-sample.json',
      // Add more files here as you expand the lectionary data
      // 'assets/lectionary/rcl-year-a.json',
      // 'assets/lectionary/rcl-year-b.json',
      // 'assets/lectionary/rcl-year-c.json',
      // 'assets/lectionary/bcp-1979.json',
    ];

    let loadedCount = 0;
    const totalFiles = lectionaryFiles.length;

    lectionaryFiles.forEach((file) => {
      this.http
        .get<LectionaryDataFile>(file)
        .pipe(
          catchError((error) => {
            // Silently skip files that don't exist
            console.debug(`Lectionary file not found: ${file}`);
            return of(null);
          })
        )
        .subscribe((data) => {
          if (data && data.readings) {
            data.readings.forEach((entry) => {
              this.lectionaryCache.set(entry.date, entry);
            });
            loadedCount++;
            console.log(`Loaded ${data.readings.length} entries from ${file}`);
          }

          // Mark as loaded when all files are processed
          if (loadedCount === totalFiles || this.lectionaryCache.size > 0) {
            this.dataLoaded = true;
            console.log(
              `Lectionary data loaded: ${this.lectionaryCache.size} total entries`
            );
          }
        });
    });
  }

  /**
   * Convert LectionaryEntry to LectionaryReading
   */
  private convertEntryToReading(
    entry: LectionaryEntry,
    date: Date
  ): LectionaryReading {
    return {
      date,
      readings: entry.readings,
    };
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
   * Parse a citation string into a ReadingReference
   * Example: "Isaiah 40:1-11" -> { book: "Isaiah", chapter: 40, startVerse: 1, endVerse: 11 }
   */
  parseCitation(citation: string): ReadingReference | null {
    // Match patterns like "Isaiah 40:1-11" or "Psalm 23" or "John 3:16"
    const match = citation.match(
      /^(\d*\s*[A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/
    );

    if (!match) {
      return null;
    }

    const book = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
    const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

    return {
      book,
      chapter,
      startVerse,
      endVerse,
      citation,
    };
  }
}
