export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassage {
  reference: string;
  verses: BibleVerse[];
  text: string; // Combined text of all verses
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
}

// api.bible specific response structures
export interface BibleApiVerse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  content: string;
  verseCount: number;
  copyright: string;
  next?: {
    id: string;
    reference: string;
  };
  previous?: {
    id: string;
    reference: string;
  };
}

export interface BibleApiPassage {
  data: {
    id: string;
    orgId: string;
    bibleId: string;
    bookId: string;
    chapterId: string;
    reference: string;
    content: string;
    verseCount: number;
    copyright: string;
    next?: {
      id: string;
      reference: string;
    };
    previous?: {
      id: string;
      reference: string;
    };
  };
}
