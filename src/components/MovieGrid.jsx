import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';
import { tmdbApi } from '../services/api.js';

const MovieGrid = ({ onMovieClick }) => {
  const [state, setState] = useState(store.getState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
    sortBy: 'popularity.desc'
  });

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    
    window.addEventListener('resize', handleResize);
    loadGenres();
    loadMovies();
    
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadGenres = async () => {
    try {
      const data = await tmdbApi.getGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadMovies = async () => {
    if (state.isSearching) return; // Don't reload if searching
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tmdbApi.getMovies(state.filters.category, 1, {
        ...state.filters,
        ...filters
      });
      store.setState({ 
        movies: data.results || [],
        totalPages: data.total_pages || 1,
        currentPage: data.page || 1
      });
    } catch (err) {
      setError('Failed to load movies. Please try again.');
      console.error('Movie loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      try {
        const details = await tmdbApi.getMovieDetails(movie.id);
        console.log('Movie clicked:', details);
      } catch (error) {
        console.error('Error loading movie details:', error);
      }
    }
  };

  const handleFilterChange = async (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    setLoading(true);
    try {
      const data = await tmdbApi.getMovies(state.filters.category, 1, newFilters);
      store.setState({ 
        movies: data.results || [],
        totalPages: data.total_pages || 1,
        currentPage: 1
      });
    } catch (err) {
      setError('Failed to filter movies.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setLoading(true);
    try {
      const data = await tmdbApi.getMovies(state.filters.category, page, {
        ...state.filters,
        ...filters
      });
      store.setState({ 
        movies: data.results || [],
        totalPages: data.total_pages || 1,
        currentPage: page
      });
    } catch (err) {
      setError('Failed to load page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    store.updateFilters({ category });
    setLoading(true);
    
    try {
      const data = await tmdbApi.getMovies(category, 1, state.filters);
      store.setState({ 
        movies: data.results || [],
        totalPages: data.total_pages || 1,
        currentPage: 1
      });
    } catch (err) {
      setError('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-grid-view">
      <div className="grid-header">
        <h2>🎬 {state.isSearching ? `Search: "${state.searchQuery}"` : 'Movie Collection'}</h2>
        <div className="grid-filters">
          <select 
            value={state.filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={loading || state.isSearching}
          >
            <option value="popular">Popular Movies</option>
            <option value="top_rated">Top Rated</option>
            <option value="now_playing">Now Playing</option>
            <option value="upcoming">Coming Soon</option>
          </select>
        </div>
      </div>
      
      {!state.isSearching && (
        <div className="advanced-filters">
          <div className="filter-row">
            <select 
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              disabled={loading}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            
            <select 
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              disabled={loading}
            >
              <option value="">All Years</option>
              {Array.from({length: 35}, (_, i) => 2024 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              disabled={loading}
            >
              <option value="">All Ratings</option>
              <option value="7">7+ Stars</option>
              <option value="8">8+ Stars</option>
              <option value="9">9+ Stars</option>
            </select>
            
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              disabled={loading}
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Newest</option>
              <option value="revenue.desc">Highest Grossing</option>
            </select>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadMovies}>Retry</button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading amazing movies...</p>
        </div>
      ) : (
        <div className="movies-grid">
          {state.movies.map(movie => (
            <div 
              key={movie.id} 
              className="movie-card-dashboard"
              onClick={() => handleMovieClick(movie)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={tmdbApi.getOptimizedImageUrl(movie.poster_path, isMobile)}
                alt={`${movie.title} poster`}
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="movie-info">
                <h3 title={movie.title}>{movie.title}</h3>
                <div className="movie-meta">
                  <span className="rating">⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="year">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    store.toggleFavorite(movie);
                  }}
                  aria-label={`${state.user.favorites.some(fav => fav.id === movie.id) ? 'Remove from' : 'Add to'} favorites`}
                >
                  {state.user.favorites.some(fav => fav.id === movie.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {state.movies.length === 0 && !loading && !error && (
        <div className="empty-state">
          <p>No movies found. Try a different category.</p>
        </div>
      )}
      
      {state.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage <= 1 || loading}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            <span>Page {state.currentPage} of {state.totalPages}</span>
          </div>
          
          <button 
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage >= state.totalPages || loading}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieGrid;