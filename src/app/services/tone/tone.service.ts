import { Injectable, signal } from '@angular/core';

export interface Tone {
  filename: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToneService {
  // Static list of all available tone SVG files
  private readonly toneFiles: string[] = [
    '1 A 1.svg',
    '1 A 2.svg',
    '1 A 3.svg',
    '1 A 4.svg',
    '1 A 5.svg',
    '1 A 6.svg',
    '1 A 7.svg',
    '1 A 8.svg',
    '1 A 9.svg',
    '1 A 10.svg',
    '1 A 11.svg',
    '1 A 12.svg',
    '1 A 13.svg',
    '1 B 1.svg',
    '1 B 2.svg',
    '1 B 3.svg',
    '1 B 4.svg',
    '1 B 5.svg',
    '1 B 6.svg',
    '1 B 7.svg',
    '1 B 8.svg',
    '1 B 9.svg',
    '1 B 10.svg',
    '1 B 11.svg',
    '1 B 12.svg',
    '1 B 13.svg',
    '2 1.svg',
    '2 2.svg',
    '3_1.svg',
    '4.1.svg',
    '4_1.svg',
    '4_8.svg',
    '4_9.svg',
    '5_1.svg',
    '5_2.svg',
    '5_3.svg',
    '6_A.svg',
    '6_B.svg',
    '6_C.svg',
    '7_1.svg',
    '7_3.svg',
    '7_4.svg',
    '7_4 (1).svg',
    '7_5.svg',
    '7_6.svg',
    '7_7.svg',
    '8_1.svg',
    '8_2.svg',
    '8_3.svg',
    '8_4.svg',
    '8_5.svg',
    'P_1.svg',
    'P_2.svg'
  ];

  /**
   * Converts a tone filename to a user-friendly display name
   * Examples:
   * "1 A 1.svg" -> "Tone 1A, Variation 1"
   * "2 1.svg" -> "Tone 2, Variation 1"
   * "3_1.svg" -> "Tone 3, Variation 1"
   * "P_1.svg" -> "Tone P, Variation 1"
   */
  private convertToDisplayName(filename: string): string {
    // Remove .svg extension
    const nameWithoutExt = filename.replace('.svg', '');
    
    // Handle patterns like "1 A 1", "1 B 2" (Tone 1A, Variation 1)
    const pattern1 = /^(\d+)\s+([A-Z])\s+(\d+)$/;
    const match1 = nameWithoutExt.match(pattern1);
    if (match1) {
      return `Tone ${match1[1]}${match1[2]}, Variation ${match1[3]}`;
    }
    
    // Handle patterns like "2 1", "2 2" (Tone 2, Variation 1)
    const pattern2 = /^(\d+)\s+(\d+)$/;
    const match2 = nameWithoutExt.match(pattern2);
    if (match2) {
      return `Tone ${match2[1]}, Variation ${match2[2]}`;
    }
    
    // Handle patterns like "3_1", "4_8", "5_1" (Tone 3, Variation 1)
    const pattern3 = /^(\d+)_(\d+)$/;
    const match3 = nameWithoutExt.match(pattern3);
    if (match3) {
      return `Tone ${match3[1]}, Variation ${match3[2]}`;
    }
    
    // Handle patterns like "4.1" (Tone 4, Variation 1)
    const pattern4 = /^(\d+)\.(\d+)$/;
    const match4 = nameWithoutExt.match(pattern4);
    if (match4) {
      return `Tone ${match4[1]}, Variation ${match4[2]}`;
    }
    
    // Handle patterns like "6_A", "6_B", "6_C" (Tone 6A, Tone 6B, Tone 6C)
    const pattern5 = /^(\d+)_([A-Z])$/;
    const match5 = nameWithoutExt.match(pattern5);
    if (match5) {
      return `Tone ${match5[1]}${match5[2]}`;
    }
    
    // Handle patterns like "7_4 (1)" (Tone 7, Variation 4 (1))
    const pattern6 = /^(\d+)_(\d+)\s+\((\d+)\)$/;
    const match6 = nameWithoutExt.match(pattern6);
    if (match6) {
      return `Tone ${match6[1]}, Variation ${match6[2]} (${match6[3]})`;
    }
    
    // Handle patterns like "P_1", "P_2" (Tone P, Variation 1)
    const pattern7 = /^([A-Z])_(\d+)$/;
    const match7 = nameWithoutExt.match(pattern7);
    if (match7) {
      return `Tone ${match7[1]}, Variation ${match7[2]}`;
    }
    
    // Fallback: return the filename without extension
    return nameWithoutExt;
  }

  /**
   * Get all available tones with their display names
   */
  getAvailableTones(): Tone[] {
    return this.toneFiles.map(filename => ({
      filename,
      displayName: this.convertToDisplayName(filename)
    }));
  }

  /**
   * Get the full path to a tone SVG file
   */
  getTonePath(filename: string): string {
    return `/assets/psalms/tones/sarum/${filename}`;
  }
}

