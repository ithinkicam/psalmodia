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

export interface LectionaryResponse {
  date: string; // ISO date string
  readings: {
    oldTestament?: ReadingReference;
    psalm?: ReadingReference;
    epistle?: ReadingReference;
    gospel?: ReadingReference;
  };
}
