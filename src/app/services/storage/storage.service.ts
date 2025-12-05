import { Injectable, signal } from '@angular/core';

const STORAGE_KEY_PREFERRED_TRANSLATION = 'psalmodia_preferred_translation';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private preferredTranslation = signal<string>('');

  constructor() {
    // Load preferred translation from localStorage on initialization
    this.loadPreferredTranslation();
  }

  /**
   * Get the preferred Bible translation
   */
  getPreferredTranslation(): string {
    return this.preferredTranslation();
  }

  /**
   * Set and save the preferred Bible translation
   */
  setPreferredTranslation(translation: string): void {
    this.preferredTranslation.set(translation);

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_PREFERRED_TRANSLATION, translation);
    } catch (error) {
      console.warn(
        'Failed to save preferred translation to localStorage:',
        error
      );
    }
  }

  /**
   * Load preferred translation from localStorage
   */
  private loadPreferredTranslation(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFERRED_TRANSLATION);
      if (saved) {
        this.preferredTranslation.set(saved);
      }
    } catch (error) {
      console.warn(
        'Failed to load preferred translation from localStorage:',
        error
      );
    }
  }

  /**
   * Clear the preferred translation
   */
  clearPreferredTranslation(): void {
    this.preferredTranslation.set('');

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY_PREFERRED_TRANSLATION);
    } catch (error) {
      console.warn(
        'Failed to clear preferred translation from localStorage:',
        error
      );
    }
  }
}
