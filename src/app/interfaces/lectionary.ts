export interface LectionaryReading {
  date: Date;
  readings: {
    oldTestament?: ReadingReference;
    psalm?: ReadingReference;
    epistle?: ReadingReference;
    gospel?: ReadingReference;
  };
}

export interface ReadingReference {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  citation: string; // e.g., "Isaiah 40:1-11"
}

// Removed LectionaryResponse interface - no longer using external API
