import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LectionaryService } from '../../services/lectionary/lectionary.service';
import { BibleService } from '../../services/bible/bible.service';
import { StorageService } from '../../services/storage/storage.service';
import {
  LectionaryReading,
  ReadingReference,
} from '../../interfaces/lectionary';
import { BiblePassage, BibleTranslation } from '../../interfaces/bible';
import {
  BIBLE_TRANSLATIONS,
  OLD_TESTAMENT_BOOKS,
  API_CONFIG,
} from '../../config/api.config';

interface ReadingWithText {
  reference: ReadingReference;
  passage: BiblePassage | null;
  loading: boolean;
  error: string | null;
  usedTranslation?: string; // Track which translation was actually used (may differ from selected)
  selectedTranslation?: string; // The translation that was requested
}

@Component({
  selector: 'app-readings',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './readings.component.html',
  styleUrl: './readings.component.scss',
})
export class ReadingsComponent {
  private lectionaryService = inject(LectionaryService);
  private bibleService = inject(BibleService);
  private storageService = inject(StorageService);

  // Selected date (defaults to today)
  selectedDate = signal<Date>(new Date());

  // Selected translation
  selectedTranslation = signal<string>('');

  // Available translations
  availableTranslations: BibleTranslation[] = [];

  // Lectionary readings for selected date
  lectionaryReading = signal<LectionaryReading | null>(null);
  lectionaryLoading = signal<boolean>(false);
  lectionaryError = signal<string | null>(null);

  // Bible passages for each reading
  readingsWithText = signal<Map<string, ReadingWithText>>(new Map());

  constructor() {
    // Initialize translations (show all, including OT-only ones)
    this.availableTranslations =
      this.bibleService.getAvailableTranslations(true);

    // Load preferred translation or use default
    const preferred = this.storageService.getPreferredTranslation();
    const defaultTranslation =
      BIBLE_TRANSLATIONS.find((t) => !t.oldTestamentOnly)?.id ||
      BIBLE_TRANSLATIONS[0]?.id ||
      '';
    this.selectedTranslation.set(preferred || defaultTranslation);

    // Load readings when date or translation changes
    effect(() => {
      const date = this.selectedDate();
      const translation = this.selectedTranslation();
      this.loadReadings(date, translation);
    });
  }

  /**
   * Load lectionary readings and Bible text for the selected date
   */
  private async loadReadings(date: Date, translation: string): Promise<void> {
    this.lectionaryLoading.set(true);
    this.lectionaryError.set(null);
    this.readingsWithText.set(new Map());

    try {
      // Get lectionary readings
      this.lectionaryService.getReadingsForDate(date).subscribe({
        next: (reading) => {
          if (!reading) {
            this.lectionaryError.set('No readings available for this date.');
            this.lectionaryLoading.set(false);
            return;
          }

          this.lectionaryReading.set(reading);

          // Load Bible text for each reading
          const readingsMap = new Map<string, ReadingWithText>();

          const readingTypes = [
            { key: 'oldTestament', ref: reading.readings.oldTestament },
            { key: 'psalm', ref: reading.readings.psalm },
            { key: 'epistle', ref: reading.readings.epistle },
            { key: 'gospel', ref: reading.readings.gospel },
          ];

          for (const { key, ref } of readingTypes) {
            if (ref) {
              readingsMap.set(key, {
                reference: ref,
                passage: null,
                loading: true,
                error: null,
                selectedTranslation: translation,
              });

              this.loadBibleText(ref, translation, key);
            }
          }

          this.readingsWithText.set(readingsMap);
          this.lectionaryLoading.set(false);
        },
        error: (error) => {
          this.lectionaryError.set(
            'Failed to load readings. Please try again.'
          );
          this.lectionaryLoading.set(false);
          console.error('Error loading readings:', error);
        },
      });
    } catch (error) {
      this.lectionaryError.set('Failed to load readings. Please try again.');
      this.lectionaryLoading.set(false);
      console.error('Error loading readings:', error);
    }
  }

  /**
   * Load Bible text for a reading reference
   */
  private loadBibleText(
    reference: ReadingReference,
    translation: string,
    key: string
  ): void {
    const startVerse = reference.startVerse || 1;
    const endVerse = reference.endVerse || startVerse;

    // Determine if this is an Old Testament reading
    const isOldTestament = this.isOldTestamentBook(reference.book);

    // Get the appropriate translation
    // If Septuagint is selected but this is not OT, use default translation
    const translationToUse = this.getTranslationForReading(
      translation,
      isOldTestament
    );

    this.bibleService
      .getPassage(
        reference.book,
        reference.chapter,
        startVerse,
        endVerse,
        translationToUse
      )
      .subscribe({
        next: (passage) => {
          const current = this.readingsWithText();
          const updated = new Map(current);
          const reading = updated.get(key);

          if (reading) {
            updated.set(key, {
              ...reading,
              passage,
              loading: false,
              error: passage ? null : 'Failed to load passage',
              usedTranslation: translationToUse,
            });
          }

          this.readingsWithText.set(updated);
        },
        error: (error) => {
          const current = this.readingsWithText();
          const updated = new Map(current);
          const reading = updated.get(key);

          if (reading) {
            updated.set(key, {
              ...reading,
              passage: null,
              loading: false,
              error: 'Failed to load Bible text',
              usedTranslation: translationToUse,
            });
          }

          this.readingsWithText.set(updated);
          console.error('Error loading Bible text:', error);
        },
      });
  }

  /**
   * Handle date change
   */
  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  /**
   * Handle translation change
   */
  onTranslationChange(translation: string): void {
    this.selectedTranslation.set(translation);
    this.storageService.setPreferredTranslation(translation);

    // Reload Bible text with new translation
    const reading = this.lectionaryReading();
    if (reading) {
      const readingsMap = new Map<string, ReadingWithText>();

      const readingTypes = [
        { key: 'oldTestament', ref: reading.readings.oldTestament },
        { key: 'psalm', ref: reading.readings.psalm },
        { key: 'epistle', ref: reading.readings.epistle },
        { key: 'gospel', ref: reading.readings.gospel },
      ];

      for (const { key, ref } of readingTypes) {
        if (ref) {
          readingsMap.set(key, {
            reference: ref,
            passage: null,
            loading: true,
            error: null,
          });

          this.loadBibleText(ref, translation, key);
        }
      }

      this.readingsWithText.set(readingsMap);
    }
  }

  /**
   * Get reading title based on type
   */
  getReadingTitle(key: string): string {
    const titles: Record<string, string> = {
      oldTestament: 'Old Testament',
      psalm: 'Psalm',
      epistle: 'Epistle',
      gospel: 'Gospel',
    };
    return titles[key] || key;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Go to today's readings
   */
  goToToday(): void {
    this.selectedDate.set(new Date());
  }

  /**
   * Check if a book is in the Old Testament
   */
  private isOldTestamentBook(book: string): boolean {
    return OLD_TESTAMENT_BOOKS.some(
      (otBook) => otBook.toLowerCase() === book.toLowerCase()
    );
  }

  /**
   * Get the appropriate translation for a reading
   * If Septuagint is selected but reading is not OT, fall back to default
   */
  private getTranslationForReading(
    selectedTranslation: string,
    isOldTestament: boolean
  ): string {
    const translation = BIBLE_TRANSLATIONS.find(
      (t) => t.id === selectedTranslation
    );

    // If translation is OT-only and this is not an OT reading, use default
    if (translation?.oldTestamentOnly && !isOldTestament) {
      const defaultTranslation = BIBLE_TRANSLATIONS.find(
        (t) => !t.oldTestamentOnly
      )?.id;
      return defaultTranslation || API_CONFIG.bible.defaultTranslation;
    }

    return selectedTranslation;
  }

  /**
   * Get the name of a translation by its ID
   */
  getTranslationName(translationId: string): string {
    const translation = BIBLE_TRANSLATIONS.find((t) => t.id === translationId);
    return translation ? `${translation.abbreviation}` : 'Unknown';
  }

  /**
   * Check if the used translation differs from the selected translation
   */
  isTranslationDifferent(reading: ReadingWithText): boolean {
    return !!(
      reading.usedTranslation &&
      reading.selectedTranslation &&
      reading.usedTranslation !== reading.selectedTranslation
    );
  }
}
