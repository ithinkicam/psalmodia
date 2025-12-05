import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
  BiblePassage,
  BibleVerse,
  BibleApiPassage,
  BibleTranslation,
} from '../../interfaces/bible';
import { API_CONFIG, BIBLE_TRANSLATIONS } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class BibleService {
  private http = inject(HttpClient);
  private apiKey = API_CONFIG.bible.apiKey || '';
  private baseUrl = API_CONFIG.bible.baseUrl;

  /**
   * Get available Bible translations
   */
  getAvailableTranslations(): BibleTranslation[] {
    return BIBLE_TRANSLATIONS.map((t) => ({
      id: t.id,
      name: t.name,
      abbreviation: t.abbreviation,
    }));
  }

  /**
   * Get Bible passage for a reference
   * @param book Book name (e.g., "Isaiah")
   * @param chapter Chapter number
   * @param startVerse Starting verse number
   * @param endVerse Ending verse number (optional, defaults to startVerse)
   * @param translationId Bible translation ID (defaults to ESV)
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

    const verseRange =
      endVerse && endVerse !== startVerse
        ? `${startVerse}-${endVerse}`
        : startVerse.toString();

    const reference = `${book} ${chapter}:${verseRange}`;
    const encodedReference = encodeURIComponent(reference);
    
    // api.bible REST API endpoint format
    const url = `${this.baseUrl}/v1/bibles/${translationId}/passages/${encodedReference}`;
    const headers = new HttpHeaders({
      'api-key': this.apiKey,
    });

    return this.http.get<BibleApiPassage>(url, { headers }).pipe(
      map((response) => {
        const passage: BiblePassage = {
          reference: response.data.reference,
          text: this.extractTextFromContent(response.data.content),
          verses: this.parseVerses(response.data.content, book, chapter),
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
    const verseElements = tempDiv.querySelectorAll('span.v, .v');

    verseElements.forEach((element, index) => {
      const verseNum = this.extractVerseNumber(element.textContent || '');
      if (verseNum) {
        verses.push({
          book,
          chapter,
          verse: verseNum,
          text: element.textContent?.trim() || '',
        });
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
