import { Movie, TMDBResponse } from '../types/movie';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

class TMDBService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getNowPlaying(page = 1): Promise<TMDBResponse> {
    return this.fetchData<TMDBResponse>(`/movie/now_playing&page=${page}`);
  }

  async searchMovies(query: string, page = 1): Promise<TMDBResponse> {
    return this.fetchData<TMDBResponse>(`/search/movie&query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getPopularMovies(page = 1): Promise<TMDBResponse> {
    return this.fetchData<TMDBResponse>(`/movie/popular&page=${page}`);
  }

  async getTopRatedMovies(page = 1): Promise<TMDBResponse> {
    return this.fetchData<TMDBResponse>(`/movie/top_rated&page=${page}`);
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder.jpg';
  }
}

export const tmdbService = new TMDBService();