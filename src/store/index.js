class Store {
  constructor() {
    this.state = {
      movies: [],
      loading: false,
      error: null,
      isSearching: false,
      searchQuery: '',
      totalPages: 1,
      currentPage: 1,
      filters: {
        category: 'popular',
        genre: '',
        year: '',
        rating: 0,
        sortBy: 'popularity.desc'
      },
      user: {
        favorites: this.loadFromStorage('favorites', []),
        watchlist: this.loadFromStorage('watchlist', []),
        watched: this.loadFromStorage('watched', []),
        ratings: this.loadFromStorage('ratings', {}),
        theme: this.loadFromStorage('theme', 'dark')
      },
      ui: {
        selectedMovie: null,
        showSidebar: true,
        activeView: 'dashboard',
        viewMode: 'grid'
      },
      analytics: {
        apiCalls: 0,
        avgResponseTime: 0,
        cacheHits: 0
      }
    };
    
    this.subscribers = [];
    this.middleware = [];
    
    // Initialize the app
    this.init();
  }

  async init() {
    try {
      // Load initial movies
      await this.loadMovies(this.state.filters);
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    this.middleware.forEach(fn => fn(prevState, this.state));
    this.subscribers.forEach(callback => callback(this.state, prevState));
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  addMiddleware(fn) {
    this.middleware.push(fn);
  }

  async loadMovies(filters = {}) {
    this.setState({ loading: true, error: null });
    
    try {
      const { tmdbApi } = await import('../services/api.js');
      const data = await tmdbApi.getMovies(filters.category || 'popular', 1, filters);
      
      this.setState({
        movies: data.results || [],
        loading: false,
        totalPages: data.total_pages || 1,
        currentPage: data.page || 1,
        analytics: {
          ...this.state.analytics,
          apiCalls: this.state.analytics.apiCalls + 1
        }
      });
    } catch (error) {
      console.error('Store loadMovies error:', error);
      this.setState({ 
        error: error.message || 'Failed to load movies', 
        loading: false,
        movies: [] // Ensure movies is always an array
      });
    }
  }

  updateFilters(newFilters) {
    const filters = { ...this.state.filters, ...newFilters };
    this.setState({ filters });
    this.loadMovies(filters);
  }

  toggleFavorite(movie) {
    const favorites = this.state.user.favorites;
    const isFavorite = favorites.some(fav => fav.id === movie.id);
    
    const updatedFavorites = isFavorite
      ? favorites.filter(fav => fav.id !== movie.id)
      : [...favorites, movie];
    
    this.setState({
      user: { ...this.state.user, favorites: updatedFavorites }
    });
  }

  addToWatchlist(movie) {
    const watchlist = this.state.user.watchlist;
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    
    if (!isInWatchlist) {
      this.setState({
        user: { ...this.state.user, watchlist: [...watchlist, movie] }
      });
    }
  }

  markAsWatched(movie) {
    const watched = this.state.user.watched;
    const isWatched = watched.some(item => item.id === movie.id);
    
    if (!isWatched) {
      this.setState({
        user: { 
          ...this.state.user, 
          watched: [...watched, { ...movie, watchedAt: new Date().toISOString() }]
        }
      });
    }
  }

  rateMovie(movieId, rating) {
    this.setState({
      user: {
        ...this.state.user,
        ratings: { ...this.state.user.ratings, [movieId]: rating }
      }
    });
  }

  getUserStats() {
    const { favorites, watchlist, watched, ratings } = this.state.user;
    const ratingValues = Object.values(ratings);
    const avgRating = ratingValues.length > 0 
      ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1)
      : 0;
    
    const genresWatched = new Set();
    watched.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => genresWatched.add(genre.name));
      }
    });
    
    return {
      favoritesCount: favorites.length,
      watchlistCount: watchlist.length,
      watchedCount: watched.length,
      ratingsCount: ratingValues.length,
      avgRating,
      genresExplored: genresWatched.size
    };
  }

  setActiveView(view) {
    this.setState({
      ui: { ...this.state.ui, activeView: view }
    });
  }

  loadFromStorage(key, defaultValue) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(`movieflix-${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

const persistenceMiddleware = (prevState, newState) => {
  if (prevState.user.favorites !== newState.user.favorites) {
    localStorage.setItem('movieflix-favorites', JSON.stringify(newState.user.favorites));
  }
  if (prevState.user.watchlist !== newState.user.watchlist) {
    localStorage.setItem('movieflix-watchlist', JSON.stringify(newState.user.watchlist));
  }
  if (prevState.user.watched !== newState.user.watched) {
    localStorage.setItem('movieflix-watched', JSON.stringify(newState.user.watched));
  }
  if (prevState.user.ratings !== newState.user.ratings) {
    localStorage.setItem('movieflix-ratings', JSON.stringify(newState.user.ratings));
  }
  if (prevState.user.theme !== newState.user.theme) {
    localStorage.setItem('movieflix-theme', newState.user.theme);
    document.documentElement.setAttribute('data-theme', newState.user.theme);
  }
};

export const store = new Store();
store.addMiddleware(persistenceMiddleware);