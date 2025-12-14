/**
 * Tone Consolidation Mapping
 * Maps all 37 original St. Dunstan tone variations to 16 consolidated tones
 */

export interface ToneMapping {
  originalTone: string;
  consolidatedTone: string;
  displayName: string;
}

export const TONE_CONSOLIDATION_MAP: ToneMapping[] = [
  // Tone 1A variants (all 1 A * and 1 A B)
  { originalTone: '1 A 1', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 2', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 3', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 4', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 5', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 6', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 7', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 8', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 9', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 10', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 11', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 12', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A 13', consolidatedTone: '1A', displayName: 'Tone 1A' },
  { originalTone: '1 A B', consolidatedTone: '1A', displayName: 'Tone 1A' },

  // Tone 1B variants (all 1 B *)
  { originalTone: '1 B 1', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 2', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 3', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 4', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 5', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 6', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 7', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 8', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 9', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 10', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 11', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 12', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 B 13', consolidatedTone: '1B', displayName: 'Tone 1B' },
  { originalTone: '1 2', consolidatedTone: '1B', displayName: 'Tone 1B' },

  // Tone 2 variants (2, 2 PA, 2 A)
  { originalTone: '2 1', consolidatedTone: '2', displayName: 'Tone 2' },
  { originalTone: '2 2', consolidatedTone: '2', displayName: 'Tone 2' },
  { originalTone: '2 PA', consolidatedTone: '2', displayName: 'Tone 2' },
  { originalTone: '2 A 5', consolidatedTone: '2', displayName: 'Tone 2' },

  // Tone 3A (all 3 A *)
  { originalTone: '3 A 1', consolidatedTone: '3A', displayName: 'Tone 3A' },
  { originalTone: '3 A 2', consolidatedTone: '3A', displayName: 'Tone 3A' },
  { originalTone: '3 A 4', consolidatedTone: '3A', displayName: 'Tone 3A' },
  { originalTone: '3 A 5', consolidatedTone: '3A', displayName: 'Tone 3A' },
  { originalTone: '3 A 6', consolidatedTone: '3A', displayName: 'Tone 3A' },

  // Tone 4 (all 4 *)
  { originalTone: '4 1', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 4', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 5', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 6', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 7', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 8', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 9', consolidatedTone: '4', displayName: 'Tone 4' },
  { originalTone: '4 10', consolidatedTone: '4', displayName: 'Tone 4' },

  // Tone 5 (all 5 *)
  { originalTone: '5 1', consolidatedTone: '5', displayName: 'Tone 5' },
  { originalTone: '5 2', consolidatedTone: '5', displayName: 'Tone 5' },
  { originalTone: '5 3', consolidatedTone: '5', displayName: 'Tone 5' },

  // Tone 6A (6 A)
  { originalTone: '6 A', consolidatedTone: '6A', displayName: 'Tone 6A' },

  // Tone 6B (6 B)
  { originalTone: '6 B', consolidatedTone: '6B', displayName: 'Tone 6B' },

  // Tone 6C (6 C)
  { originalTone: '6 C', consolidatedTone: '6C', displayName: 'Tone 6C' },

  // Tone 7 (all 7 *)
  { originalTone: '7 1', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 2', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 3', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 4', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 5', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 6', consolidatedTone: '7', displayName: 'Tone 7' },
  { originalTone: '7 7', consolidatedTone: '7', displayName: 'Tone 7' },

  // Tone 8 (all 8 *)
  { originalTone: '8 1', consolidatedTone: '8', displayName: 'Tone 8' },
  { originalTone: '8 2', consolidatedTone: '8', displayName: 'Tone 8' },
  { originalTone: '8 3', consolidatedTone: '8', displayName: 'Tone 8' },
  { originalTone: '8 4', consolidatedTone: '8', displayName: 'Tone 8' },
  { originalTone: '8 5', consolidatedTone: '8', displayName: 'Tone 8' },
  { originalTone: '8 6', consolidatedTone: '8', displayName: 'Tone 8' },

  // Tone P (PA)
  { originalTone: 'PA', consolidatedTone: 'P', displayName: 'Tone P' },
];

/**
 * Get consolidated tone from original tone string
 */
export function getConsolidatedTone(originalTone: string): string {
  const mapping = TONE_CONSOLIDATION_MAP.find(
    (m) => m.originalTone === originalTone
  );
  return mapping ? mapping.consolidatedTone : originalTone;
}

/**
 * Get all unique consolidated tones
 */
export function getUniqueTones(): string[] {
  const unique = new Set(TONE_CONSOLIDATION_MAP.map((m) => m.consolidatedTone));
  return Array.from(unique).sort();
}
