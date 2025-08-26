import { apiClient } from "@/lib/api";
import {
  BooksSearchResponse,
  Book,
  SearchParams,
  UserBook,
  AddBookToLibrary,
  UpdateProgress,
  LibraryStats,
  UserLibraryResponse,
} from "@/types/books";

export const booksService = {
  // Search books using Google Books API
  async searchBooks({
    query,
    maxResults = 10,
    startIndex = 0,
  }: SearchParams): Promise<BooksSearchResponse> {
    const response = await apiClient.get<BooksSearchResponse>("/books/search", {
      params: {
        q: query,
        maxResults,
        startIndex,
      },
    });
    return response.data;
  },

  // Get specific book details
  async getBookById(id: string): Promise<Book> {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },

  // Add book to user library
  async addBookToLibrary(data: AddBookToLibrary): Promise<UserBook> {
    const response = await apiClient.post<UserBook>("/user-books", data);
    return response.data;
  },

  // Get user library
  async getUserLibrary(params?: {
    status?: string;
    isFavorite?: boolean;
    page?: number;
    limit?: number;
  }): Promise<UserLibraryResponse> {
    const response = await apiClient.get<UserLibraryResponse>("/user-books", {
      params,
    });
    return response.data;
  },

  // Get library statistics
  async getLibraryStats(): Promise<LibraryStats> {
    const response = await apiClient.get<LibraryStats>("/user-books/stats");
    return response.data;
  },

  // Get specific book from user library
  async getUserBook(bookId: string): Promise<UserBook> {
    const response = await apiClient.get<UserBook>(`/user-books/${bookId}`);
    return response.data;
  },

  // Update reading progress
  async updateProgress(
    bookId: string,
    data: UpdateProgress
  ): Promise<UserBook> {
    const response = await apiClient.patch<UserBook>(
      `/user-books/${bookId}/progress`,
      data
    );
    return response.data;
  },

  // Remove book from library
  async removeBookFromLibrary(bookId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/user-books/${bookId}`
    );
    return response.data;
  },
};
