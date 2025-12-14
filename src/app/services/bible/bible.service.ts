import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  BiblePassage,
  BibleVerse,
  BibleTranslation,
} from '../../interfaces/bible';
import {
  API_CONFIG,
  BIBLE_TRANSLATIONS,
  BOOK_NAME_TO_ID,
  MASORETIC_TO_SEPTUAGINT_PSALM,
  SEPTUAGINT_PSALM_SPLITS,
} from '../../config/api.config';

interface BibleVerseResponse {
  data: {
    id: string;
    orgId: string;
    bookId: string;
    chapterId: string;
    bibleId: string;
    reference: string;
    content: string;
    verseCount: number;
    copyright: string;
    next?: { id: string; number: string };
    previous?: { id: string; number: string };
  };
  meta: {
    fumsToken: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BibleService {
  private http = inject(HttpClient);
  private apiKey = API_CONFIG.bible.apiKey || '';
  private baseUrl = API_CONFIG.bible.baseUrl;

  /**
   * Get available Bible translations
   * @param forOldTestament If true, includes OT-only translations (e.g., Septuagint)
   */
  getAvailableTranslations(forOldTestament = false): BibleTranslation[] {
    return BIBLE_TRANSLATIONS.filter((t) => {
      // If requesting for OT, include all translations
      // If requesting for NT/other, exclude OT-only translations
      if (forOldTestament) {
        return true;
      }
      return !t.oldTestamentOnly;
    }).map((t) => ({
      id: t.id,
      name: t.name,
      abbreviation: t.abbreviation,
    }));
  }

  /**
   * Get Bible passage for a reference
   * @param book Book name (e.g., "Isaiah")
   * @param chapter Chapter number (or psalm number if book is "Psalm"/"Psalms")
   * @param startVerse Starting verse number
   * @param endVerse Ending verse number (optional, defaults to startVerse)
   * @param translationId Bible translation ID (defaults to KJV)
   */
  getPassage(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse?: number,
    translationId: string = API_CONFIG.bible.defaultTranslation
  ): Observable<BiblePassage | null> {
    if (!this.apiKey) {
      console.warn(
        'Bible API key not configured. Please set API_CONFIG.bible.apiKey'
      );
      return of(null);
    }

    // Convert book name to api.bible book ID
    const bookId = BOOK_NAME_TO_ID[book];
    if (!bookId) {
      console.error(`Unknown book name: ${book}. Unable to fetch passage.`);
      return of(null);
    }

    const end = endVerse || startVerse;

    // Check if this is a Psalm reading and we're using Septuagint (Brenton LXX)
    const isBrentonSeptuagint = translationId === '6bab4d6c61b31b80-01'; // Brenton LXX ID
    const isPsalm =
      book.toLowerCase() === 'psalm' || book.toLowerCase() === 'psalms';

    if (isBrentonSeptuagint && isPsalm) {
      // Handle Septuagint psalm numbering differences
      return this.getPassageWithSeptuagintPsalms(
        bookId,
        book,
        chapter,
        startVerse,
        end,
        translationId
      );
    }

    // Standard passage fetching for non-Septuagint psalms or other books
    return this.fetchPassage(
      bookId,
      book,
      chapter,
      startVerse,
      end,
      translationId
    );
  }

  /**
   * Get Bible passage with Septuagint psalm numbering conversion
   * Handles the complex differences between Masoretic and Septuagint psalm ordering
   */
  private getPassageWithSeptuagintPsalms(
    bookId: string,
    bookName: string,
    masoraticPsalm: number,
    startVerse: number,
    endVerse: number,
    translationId: string
  ): Observable<BiblePassage | null> {
    // Check if this psalm has splits (like Psalm 9-10 or 114-115)
    const splits = SEPTUAGINT_PSALM_SPLITS[masoraticPsalm];

    if (splits && splits.length > 0) {
      // This psalm is split or combined in Septuagint - fetch from multiple sources
      const requests: Observable<BibleVerseResponse | null>[] = [];

      for (const split of splits) {
        const septuagintPsalm = split.septuagintPsalm;
        const [mapStartVerse, mapEndVerse] = split.masoraticVerses;

        // Determine which verses from this split we actually need
        const verseStart = Math.max(startVerse, mapStartVerse);
        const verseEnd = Math.min(endVerse, mapEndVerse);

        if (verseStart <= verseEnd) {
          // This split contains verses we need
          for (let v = verseStart; v <= verseEnd; v++) {
            const verseId = `${bookId}.${septuagintPsalm}.${v}`;
            requests.push(this.fetchVerse(verseId, translationId));
          }
        }
      }

      if (requests.length === 0) {
        return of(null);
      }

      return forkJoin(requests).pipe(
        map((verseResponses) => {
          const successfulVerses = verseResponses.filter(
            (v): v is BibleVerseResponse => v !== null
          );

          if (successfulVerses.length === 0) {
            return null;
          }

          const allContent = successfulVerses
            .map((v) => v.data.content)
            .join('\n');
          const reference = successfulVerses[0].data.reference;

          const passage: BiblePassage = {
            reference,
            text: this.extractTextFromContent(allContent),
            verses: this.parseVerses(allContent, bookName, masoraticPsalm),
          };

          return passage;
        }),
        catchError((error) => {
          console.error('Error fetching Septuagint psalm passage:', error);
          return of(null);
        })
      );
    } else {
      // Standard Septuagint psalm - just use the mapped psalm number
      const septuagintPsalm = MASORETIC_TO_SEPTUAGINT_PSALM[masoraticPsalm];

      if (septuagintPsalm === undefined) {
        console.error(
          `No Septuagint mapping found for Psalm ${masoraticPsalm}`
        );
        return of(null);
      }

      return this.fetchPassage(
        bookId,
        bookName,
        septuagintPsalm,
        startVerse,
        endVerse,
        translationId
      );
    }
  }

  /**
   * Fetch a Bible passage
   */
  private fetchPassage(
    bookId: string,
    bookName: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
    translationId: string
  ): Observable<BiblePassage | null> {
    // Build list of verse IDs to fetch
    const verseIds: string[] = [];
    for (let v = startVerse; v <= endVerse; v++) {
      verseIds.push(`${bookId}.${chapter}.${v}`);
    }

    // Fetch all verses in parallel
    const verseRequests = verseIds.map((verseId) =>
      this.fetchVerse(verseId, translationId)
    );

    return forkJoin(verseRequests).pipe(
      map((verseResponses) => {
        // Filter out null responses (failed requests)
        const successfulVerses = verseResponses.filter(
          (v): v is BibleVerseResponse => v !== null
        );

        if (successfulVerses.length === 0) {
          return null;
        }

        // Combine all verses into a single passage
        const allContent = successfulVerses
          .map((v) => v.data.content)
          .join('\n');
        const reference = successfulVerses[0].data.reference;

        const passage: BiblePassage = {
          reference,
          text: this.extractTextFromContent(allContent),
          verses: this.parseVerses(allContent, bookName, chapter),
        };

        return passage;
      }),
      catchError((error) => {
        console.error('Error fetching Bible passage:', error);
        return of(null);
      })
    );
  }

  /**
   * Fetch a single verse from the API
   */
  private fetchVerse(
    verseId: string,
    translationId: string
  ): Observable<BibleVerseResponse | null> {
    const url = `${this.baseUrl}/v1/bibles/${translationId}/verses/${verseId}?include-notes=false&include-titles=false`;
    const headers = new HttpHeaders({
      'api-key': this.apiKey,
    });

    return this.http.get<BibleVerseResponse>(url, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching verse ${verseId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Extract plain text from HTML content
   */
  private extractTextFromContent(htmlContent: string): string {
    // Remove HTML tags and decode entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Parse verses from HTML content
   */
  private parseVerses(
    htmlContent: string,
    book: string,
    chapter: number
  ): BibleVerse[] {
    const verses: BibleVerse[] = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Find all verse elements (api.bible uses <span class="v"> for verses)
    const verseElements = tempDiv.querySelectorAll('span.v, [data-number]');

    verseElements.forEach((element) => {
      const dataNumber = element.getAttribute('data-number');
      const verseNum = dataNumber
        ? parseInt(dataNumber, 10)
        : this.extractVerseNumber(element.textContent || '');

      if (verseNum) {
        // Get the parent paragraph's text content
        const parent = element.closest('p');
        const text = parent?.textContent?.trim() || '';

        // Avoid duplicates
        if (!verses.find((v) => v.verse === verseNum)) {
          verses.push({
            book,
            chapter,
            verse: verseNum,
            text,
          });
        }
      }
    });

    // Fallback: if no verse elements found, create a single verse entry
    if (verses.length === 0) {
      verses.push({
        book,
        chapter,
        verse: 1,
        text: tempDiv.textContent || tempDiv.innerText || '',
      });
    }

    return verses;
  }

  /**
   * Extract verse number from text
   */
  private extractVerseNumber(text: string): number | null {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}
