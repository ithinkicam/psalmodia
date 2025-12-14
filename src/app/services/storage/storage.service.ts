import { Injectable, signal } from '@angular/core';

const STORAGE_KEY_PREFERRED_TRANSLATION = 'psalmodia_preferred_translation';
const STORAGE_KEY_PREFERRED_PSALM_VERSION = 'psalmodia_preferred_psalm_version';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private preferredTranslation = signal<string>('');
  private preferredPsalmVersion = signal<string>('1979-bcp');

  constructor() {
    // Load preferred values from localStorage on initialization
    this.loadPreferredTranslation();
    this.loadPreferredPsalmVersion();
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

  /**
   * Get the preferred psalm version
   */
  getPreferredPsalmVersion(): string {
    return this.preferredPsalmVersion();
  }

  /**
   * Set and save the preferred psalm version
   */
  setPreferredPsalmVersion(version: string): void {
    this.preferredPsalmVersion.set(version);

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_PREFERRED_PSALM_VERSION, version);
    } catch (error) {
      console.warn(
        'Failed to save preferred psalm version to localStorage:',
        error
      );
    }
  }

  /**
   * Load preferred psalm version from localStorage
   */
  private loadPreferredPsalmVersion(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFERRED_PSALM_VERSION);
      if (saved) {
        this.preferredPsalmVersion.set(saved);
      }
    } catch (error) {
      console.warn(
        'Failed to load preferred psalm version from localStorage:',
        error
      );
    }
  }

  /**
   * Clear the preferred psalm version
   */
  clearPreferredPsalmVersion(): void {
    this.preferredPsalmVersion.set('1979-bcp');

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY_PREFERRED_PSALM_VERSION);
    } catch (error) {
      console.warn(
        'Failed to clear preferred psalm version from localStorage:',
        error
      );
    }
  }
}
