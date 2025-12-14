import { Injectable, signal } from '@angular/core';

export interface Tone {
  filename: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToneService {
  // Static list of consolidated tone SVG files (16 tones)
  private readonly toneFiles: string[] = [
    '1A.svg',
    '1B.svg',
    '2.svg',
    '3A.svg',
    '4.svg',
    '5.svg',
    '6A.svg',
    '6B.svg',
    '6C.svg',
    '7.svg',
    '8.svg',
    'P.svg',
  ];

  /**
   * Converts a tone filename to a user-friendly display name
   * Examples:
   * "1A.svg" -> "Tone 1A"
   * "2.svg" -> "Tone 2"
   * "6A.svg" -> "Tone 6A"
   * "P.svg" -> "Tone P"
   */
  private convertToDisplayName(filename: string): string {
    // Remove .svg extension
    const nameWithoutExt = filename.replace('.svg', '');

    // Handle consolidated patterns like "1A", "1B", "2", "3A", etc.
    const consolidatedPattern = /^(\d+)([A-Z]?)$|^([A-Z])$/;
    const match = nameWithoutExt.match(consolidatedPattern);
    if (match) {
      if (match[3]) {
        // Tone P pattern
        return `Tone ${match[3]}`;
      } else {
        // Tone 1-8 with optional letter (1A, 1B, 2, 3A, etc.)
        return `Tone ${match[1]}${match[2] || ''}`;
      }
    }

    // Fallback: return the filename without extension
    return nameWithoutExt;
  }

  /**
   * Get all available tones with their display names
   */
  getAvailableTones(): Tone[] {
    return this.toneFiles.map((filename) => ({
      filename,
      displayName: this.convertToDisplayName(filename),
    }));
  }

  /**
   * Get the full path to a tone SVG file
   */
  getTonePath(filename: string): string {
    return `/assets/psalms/tones/sarum/${filename}`;
  }
}
