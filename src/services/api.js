class ApiService {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    return this.requestWithRetry(url, options, cacheKey);
  }

  async requestWithRetry(url, options, cacheKey, attempt = 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        if (response.status === 429 && attempt <= this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          return this.requestWithRetry(url, options, cacheKey, attempt + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return data;
    } catch (error) {
      if (attempt <= this.retryAttempts && !error.message.includes('HTTP 4')) {
        await this.delay(this.retryDelay * attempt);
        return this.requestWithRetry(url, options, cacheKey, attempt + 1);
      }
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getMovies(category = 'popular', page = 1, filters = {}) {
    let endpoint = `/movie/${category}?page=${page}`;
    
    if (filters.genre) endpoint += `&with_genres=${filters.genre}`;
    if (filters.year) endpoint += `&year=${filters.year}`;
    if (filters.rating) endpoint += `&vote_average.gte=${filters.rating}`;
    if (filters.sortBy) endpoint += `&sort_by=${filters.sortBy}`;
    
    return this.request(endpoint);
  }

  async searchMovies(query, page = 1) {
    return this.request(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getMovieDetails(movieId) {
    return this.request(`/movie/${movieId}?append_to_response=videos,credits,reviews,similar`);
  }

  async getGenres() {
    return this.request('/genre/movie/list');
  }

  async getTrending(timeWindow = 'day') {
    return this.request(`/trending/movie/${timeWindow}`);
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  clearCache() {
    this.cache.clear();
  }

  getOptimizedImageUrl(path, isMobile = false) {
    if (!path) return '/placeholder.jpg';
    const size = isMobile ? 'w300' : 'w500';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbApi = new ApiService('https://api.themoviedb.org/3', import.meta.env.VITE_TMDB_API_KEY);