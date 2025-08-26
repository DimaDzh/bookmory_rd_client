export interface VolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  publishedDate?: string;
  publisher?: string;
  language?: string;
}

export interface Book {
  id: string;
  kind?: string;
  selfLink?: string;
  volumeInfo: VolumeInfo;
}

export interface BooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: Book[];
}

export interface SearchParams {
  query: string;
  maxResults?: number;
  startIndex?: number;
}

// User library types
export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: "WANT_TO_READ" | "READING" | "FINISHED" | "PAUSED" | "DNF";
  currentPage: number;
  rating?: number;
  review?: string;
  isFavorite: boolean;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    coverUrl?: string;
    totalPages: number;
    googleBooksId: string;
    language?: string;
    publisher?: string;
    publishedDate?: string;
    genres: string[];
  };
  progressPercentage: number;
}

export interface AddBookToLibrary {
  bookId: string; // Google Books ID
  status?: "WANT_TO_READ" | "READING" | "FINISHED" | "PAUSED" | "DNF";
  isFavorite?: boolean;
}

export interface UpdateProgress {
  currentPage?: number;
  status?: "WANT_TO_READ" | "READING" | "FINISHED" | "PAUSED" | "DNF";
  rating?: number;
  review?: string;
  isFavorite?: boolean;
}

export interface LibraryStats {
  totalBooks: number;
  currentlyReading: number;
  finished: number;
  wantToRead: number;
  paused: number;
  didNotFinish: number;
  favorites: number;
  averageRating: number;
  totalPagesRead: number;
}

export interface UserLibraryResponse {
  books: UserBook[];
  total: number;
  page: number;
  totalPages: number;
}
