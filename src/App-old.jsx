import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [category, setCategory] = useState('now_playing');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('movieflix-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('movieflix-watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('movieflix-theme');
    return saved ? saved === 'dark' : true;
  });
  const [toast, setToast] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [movieReviews, setMovieReviews] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [yearRange, setYearRange] = useState([1990, 2024]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [apiMetrics, setApiMetrics] = useState({ calls: 0, avgTime: 0 });
  const [compareMovies, setCompareMovies] = useState([]);
  const [faqOpen, setFaqOpen] = useState({});
  const observerRef = useRef();
  const lastMovieRef = useRef();

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  const genres = [
    { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }, { id: 16, name: 'Animation' }, { id: 80, name: 'Crime' }
  ];

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('movieflix-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Save favorites and watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('movieflix-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('movieflix-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Dev panel keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDevPanel(!showDevPanel);
      }
      if (e.key === 'Escape' && selectedMovie) {
        closeModal();
      }
      if (e.key === '/' && !selectedMovie) {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMovie, showDevPanel]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      question: "How do I add movies to my favorites?",
      answer: "Click the heart icon (🤍) on any movie card or in the movie details modal. Favorited movies will show a red heart (❤️) and be saved to your browser."
    },
    {
      question: "What's the difference between Favorites and Watchlist?",
      answer: "Favorites are movies you've enjoyed, while Watchlist contains movies you want to watch later. Use the heart icon for favorites and the document icon for watchlist."
    },
    {
      question: "How do I compare movies?",
      answer: "Click the compare icon (🔄) on up to 3 movies, then click the 'Compare' button in the header to see them side-by-side."
    },
    {
      question: "Can I export my favorites list?",
      answer: "Yes! When you have favorites, an 'Export' button appears in the header. Click it to download your favorites as a JSON file."
    },
    {
      question: "How do I use the advanced filters?",
      answer: "Use the dropdown menus to filter by genre and sort order. Adjust the sliders for minimum rating and year range. Click 'Reset Filters' to clear all filters."
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: "Press '/' to focus the search bar, 'Esc' to close modals, and 'Ctrl+D' to toggle the developer panel with performance metrics."
    },
    {
      question: "Where is my data stored?",
      answer: "Your favorites, watchlist, and theme preferences are stored locally in your browser. They'll persist between sessions but won't sync across devices."
    },
    {
      question: "How do I find where to watch a movie?",
      answer: "Click on any movie to open its details, then click 'Find Where to Watch' to search for streaming options on Google."
    }
  ];

  const toggleWatchlist = (movie) => {
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
      showToast('Removed from watchlist', 'info');
    } else {
      setWatchlist([...watchlist, movie]);
      showToast('Added to watchlist', 'success');
    }
  };

  const toggleCompare = (movie) => {
    if (compareMovies.find(m => m.id === movie.id)) {
      setCompareMovies(compareMovies.filter(m => m.id !== movie.id));
    } else if (compareMovies.length < 3) {
      setCompareMovies([...compareMovies, movie]);
      showToast(`Added to comparison (${compareMovies.length + 1}/3)`, 'info');
    } else {
      showToast('Maximum 3 movies for comparison', 'error');
    }
  };

  const exportFavorites = () => {
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movieflix-favorites.json';
    a.click();
    showToast('Favorites exported successfully', 'success');
  };

  const measureApiCall = async (apiCall, endpoint) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      setApiMetrics(prev => ({
        calls: prev.calls + 1,
        avgTime: (prev.avgTime * prev.calls + duration) / (prev.calls + 1)
      }));
      return result;
    } catch (error) {
      throw error;
    }
  };

  const fetchSimilarMovies = async (movieId) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`);
      const data = await response.json();
      setSimilarMovies(data.results.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch similar movies:', err);
    }
  };

  const fetchMovieReviews = async (movieId) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${API_KEY}`);
      const data = await response.json();
      setMovieReviews(data.results.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch movie reviews:', err);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await measureApiCall(
        () => fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`),
        'movie-details'
      );
      const data = await response.json();
      setMovieDetails(data);
      await fetchSimilarMovies(movieId);
      await fetchMovieReviews(movieId);
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  };

  const fetchMovies = useCallback(async (searchQuery = '', pageNum = 1, append = false, movieCategory = category) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint;
      if (searchQuery) {
        endpoint = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
      } else {
        const categoryMap = {
          now_playing: 'now_playing',
          popular: 'popular',
          top_rated: 'top_rated',
          upcoming: 'upcoming'
        };
        endpoint = `https://api.themoviedb.org/3/movie/${categoryMap[movieCategory]}?api_key=${API_KEY}&page=${pageNum}`;
        
        // Add filters
        if (selectedGenre) endpoint += `&with_genres=${selectedGenre}`;
        if (minRating > 0) endpoint += `&vote_average.gte=${minRating}`;
        if (yearRange[0] !== 1990 || yearRange[1] !== 2024) {
          endpoint += `&primary_release_date.gte=${yearRange[0]}-01-01&primary_release_date.lte=${yearRange[1]}-12-31`;
        }
        endpoint += `&sort_by=${sortBy}`;
      }
      
      const response = await measureApiCall(
        () => fetch(endpoint),
        searchQuery ? 'search' : movieCategory
      );
      if (!response.ok) throw new Error('Failed to fetch movies');
      
      const data = await response.json();
      setMovies(prev => append ? [...prev, ...data.results] : data.results);
      setHasMore(pageNum < data.total_pages);
    } catch (err) {
      setError(err.message);
      showToast('Failed to load movies', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_KEY, category, selectedGenre, minRating, yearRange, sortBy]);

  const getDisplayMovies = () => {
    if (showFavorites) return favorites;
    if (showWatchlist) return watchlist;
    return movies;
  };

  const resetFilters = () => {
    setSelectedGenre('');
    setYearRange([1990, 2024]);
    setMinRating(0);
    setSortBy('popularity.desc');
    setSearchTerm('');
    setShowFavorites(false);
    setShowWatchlist(false);
  };

  // Infinite scroll observer - DISABLED
  // const lastMovieElementRef = useCallback(node => {
  //   if (loading) return;
  //   if (observerRef.current) observerRef.current.disconnect();
  //   observerRef.current = new IntersectionObserver(entries => {
  //     if (entries[0].isIntersecting && hasMore) {
  //       setPage(prevPage => prevPage + 1);
  //     }
  //   });
  //   if (node) observerRef.current.observe(node);
  // }, [loading, hasMore]);

  useEffect(() => {
    fetchMovies(searchTerm, 1, false, category);
    setPage(1);
  }, [fetchMovies, searchTerm, category]);

  // Remove automatic page loading
  // useEffect(() => {
  //   if (page > 1) {
  //     fetchMovies(searchTerm, page, true, category);
  //   }
  // }, [page]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchTerm('');
    setPage(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(searchTerm, nextPage, true, category);
  };

  const openModal = async (movie) => {
    setSelectedMovie(movie);
    setMovieDetails(null);
    setSimilarMovies([]);
    setMovieReviews([]);
    await fetchMovieDetails(movie.id);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setMovieDetails(null);
    setSimilarMovies([]);
    setMovieReviews([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && selectedMovie) {
        closeModal();
      }
      if (e.key === '/' && !selectedMovie) {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMovie]);

  if (error) {
    return (
      <div className="error" role="alert">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => fetchMovies(searchTerm, 1)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <h1>🎬 MovieFlix</h1>
            <p>Discover your next favorite movie</p>
          </div>
          <div className="utility-buttons">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {favorites.length > 0 && (
              <button className="export-btn" onClick={exportFavorites}>
                💾 Export
              </button>
            )}
            {compareMovies.length > 0 && (
              <button className="compare-btn" onClick={() => setSelectedMovie('compare')}>
                🔄 Compare ({compareMovies.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <input
              type="search"
              placeholder="Search movies... (Press / to focus)"
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search movies"
              className="search-input"
            />
          </div>
          <div className="view-toggles">
            <button 
              className={`view-btn ${!showFavorites && !showWatchlist ? 'active' : ''}`}
              onClick={() => { setShowFavorites(false); setShowWatchlist(false); }}
            >
              🎬 All
            </button>
            <button 
              className={`view-btn ${showFavorites ? 'active' : ''}`}
              onClick={() => { setShowFavorites(true); setShowWatchlist(false); }}
            >
              ❤️ Favorites ({favorites.length})
            </button>
            <button 
              className={`view-btn ${showWatchlist ? 'active' : ''}`}
              onClick={() => { setShowWatchlist(true); setShowFavorites(false); }}
            >
              📝 Watchlist ({watchlist.length})
            </button>
          </div>
        </div>
        
        {!searchTerm && !showFavorites && !showWatchlist && (
          <>
            <div className="category-filters">
              {[
                { key: 'now_playing', label: 'Now Playing' },
                { key: 'popular', label: 'Popular' },
                { key: 'top_rated', label: 'Top Rated' },
                { key: 'upcoming', label: 'Upcoming' }
              ].map(cat => (
                <button
                  key={cat.key}
                  className={`category-btn ${category === cat.key ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="advanced-filters">
              <select 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="release_date.desc">Newest First</option>
                <option value="release_date.asc">Oldest First</option>
              </select>
              
              <div className="rating-filter">
                <label>Min Rating: {minRating}+</label>
                <input 
                  type="range" 
                  min="0" 
                  max="9" 
                  step="0.5" 
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="rating-slider"
                />
              </div>
              
              <div className="year-filter">
                <label>Year: {yearRange[0]} - {yearRange[1]}</label>
                <input 
                  type="range" 
                  min="1990" 
                  max="2024" 
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="year-slider"
                />
                <input 
                  type="range" 
                  min="1990" 
                  max="2024" 
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="year-slider"
                />
              </div>
              
              <button className="reset-filters" onClick={resetFilters}>
                🔄 Reset Filters
              </button>
            </div>
          </>
        )}
      </header>
      
      <main className="main-content">
        {loading && movies.length === 0 ? (
          <div className="loading" aria-live="polite">
            <div className="skeleton-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-poster"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-rating"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : getDisplayMovies().length === 0 ? (
          <div className="empty-state">
            <h2>No movies found</h2>
            <p>{showFavorites ? 'No favorites yet' : showWatchlist ? 'No movies in watchlist' : 'Try searching for something else'}</p>
          </div>
        ) : (
          <div className="movie-grid" role="grid">
            {getDisplayMovies().map((movie, index) => {
              const isFavorite = favorites.some(fav => fav.id === movie.id);
              const isInWatchlist = watchlist.some(item => item.id === movie.id);
              const isInComparison = compareMovies.some(m => m.id === movie.id);
              
              return (
                <div 
                  key={movie.id}
                  className="movie-card" 
                  role="gridcell" 
                  tabIndex="0"
                  onClick={() => openModal(movie)}
                  onKeyDown={(e) => e.key === 'Enter' && openModal(movie)}
                >
                  <div className="movie-poster">
                    <img 
                      src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.jpg'}
                      alt={`${movie.title} poster`}
                      loading="lazy"
                      onError={(e) => e.target.src = '/placeholder.jpg'}
                    />
                    <div className="movie-actions">
                      <button 
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(movie);
                        }}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite ? '❤️' : '🤍'}
                      </button>
                      <button 
                        className={`watchlist-btn ${isInWatchlist ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(movie);
                        }}
                        aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        {isInWatchlist ? '📝' : '📄'}
                      </button>
                      <button 
                        className={`compare-btn ${isInComparison ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(movie);
                        }}
                        aria-label="Add to comparison"
                      >
                        {isInComparison ? '✅' : '🔄'}
                      </button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3 title={movie.title}>{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="rating" aria-label={`Rating: ${movie.vote_average} out of 10`}>
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="release-date">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {hasMore && !showFavorites && !showWatchlist && (
          <div className="load-more-container">
            <button 
              onClick={loadMore} 
              disabled={loading}
              className="load-more-btn"
              aria-label="Load more movies"
            >
              {loading ? 'Loading...' : 'Load More Movies'}
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="quick-links">
              <button onClick={() => handleCategoryChange('now_playing')}>Now Playing</button>
              <button onClick={() => handleCategoryChange('popular')}>Popular</button>
              <button onClick={() => handleCategoryChange('top_rated')}>Top Rated</button>
              <button onClick={() => handleCategoryChange('upcoming')}>Upcoming</button>
            </div>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <p>&copy; 2024 MovieFlix. All rights reserved.</p>
            <p>Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a></p>
            <p className="developer-credit">
              Developed by <strong>Adeola</strong> | 
              <a href="https://github.com/Adeolatemi" target="_blank" rel="noopener noreferrer" className="github-link">
                🔗 GitHub
              </a>
            </p>
          </div>
          <div className="footer-section">
            <h4>Stats & Shortcuts</h4>
            <p>Favorites: {favorites.length} movies</p>
            <p>Press <kbd>/</kbd> to search, <kbd>Esc</kbd> to close</p>
          </div>
          <div className="footer-section">
            <h4>FAQ</h4>
            <div className="quick-links">
              <button onClick={() => setSelectedMovie('faq')}>Frequently Asked Questions</button>
            </div>
          </div>
        </div>
      </footer>

      {selectedMovie === 'faq' ? (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal faq-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMovie(null)}>×</button>
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-container">
                {faqData.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <button 
                      className={`faq-question ${faqOpen[index] ? 'active' : ''}`}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-icon">{faqOpen[index] ? '▲' : '▼'}</span>
                    </button>
                    <div className={`faq-answer ${faqOpen[index] ? 'active' : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : selectedMovie === 'compare' ? (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal comparison-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMovie(null)}>×</button>
            <div className="comparison-content">
              <h2>Movie Comparison</h2>
              <div className="comparison-grid">
                {compareMovies.map(movie => (
                  <div key={movie.id} className="comparison-card">
                    <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} />
                    <h3>{movie.title}</h3>
                    <p>⭐ {movie.vote_average.toFixed(1)}/10</p>
                    <p>{new Date(movie.release_date).getFullYear()}</p>
                    <button onClick={() => toggleCompare(movie)}>Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCompareMovies([])} className="clear-comparison">
                Clear All
              </button>
            </div>
          </div>
        </div>
      ) : selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal} aria-label="Close modal">×</button>
            <div className="modal-content">
              <div className="modal-poster-section">
                <img 
                  src={selectedMovie.poster_path ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}` : '/placeholder.jpg'}
                  alt={`${selectedMovie.title} poster`}
                  className="modal-poster"
                />
                <div className="modal-actions">
                  <button 
                    className={`favorite-btn large ${favorites.some(fav => fav.id === selectedMovie.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedMovie)}
                  >
                    {favorites.some(fav => fav.id === selectedMovie.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                  </button>
                  <button 
                    className={`watchlist-btn large ${watchlist.some(item => item.id === selectedMovie.id) ? 'active' : ''}`}
                    onClick={() => toggleWatchlist(selectedMovie)}
                  >
                    {watchlist.some(item => item.id === selectedMovie.id) ? '📝 In Watchlist' : '📄 Add to Watchlist'}
                  </button>
                  <button 
                    className="share-btn"
                    onClick={() => {
                      navigator.share ? 
                        navigator.share({ title: selectedMovie.title, url: window.location.href }) :
                        navigator.clipboard.writeText(`Check out ${selectedMovie.title} on MovieFlix!`);
                      showToast('Link copied to clipboard', 'success');
                    }}
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                <div className="modal-meta">
                  <span className="modal-rating">⭐ {selectedMovie.vote_average.toFixed(1)}/10</span>
                  <span className="modal-date">Released: {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'TBA'}</span>
                  <span className="modal-votes">{selectedMovie.vote_count.toLocaleString()} votes</span>
                </div>
                
                {movieDetails && (
                  <>
                    <div className="modal-genres">
                      {movieDetails.genres?.map(genre => (
                        <span key={genre.id} className="genre-tag">{genre.name}</span>
                      ))}
                    </div>
                    
                    {movieDetails.runtime && (
                      <p className="modal-runtime">🕰️ {movieDetails.runtime} minutes</p>
                    )}
                    
                    {movieDetails.credits?.cast && (
                      <div className="modal-cast">
                        <h4>Cast</h4>
                        <div className="cast-list">
                          {movieDetails.credits.cast.slice(0, 5).map(actor => (
                            <span key={actor.id} className="cast-member">{actor.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {movieDetails.videos?.results?.length > 0 && (
                      <div className="modal-trailer">
                        <h4>Trailer</h4>
                        <iframe
                          width="100%"
                          height="315"
                          src={`https://www.youtube.com/embed/${movieDetails.videos.results[0].key}`}
                          title="Movie trailer"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </>
                )}
                
                <p className="modal-overview">{selectedMovie.overview || 'No description available.'}</p>
                
                {movieReviews.length > 0 && (
                  <div className="modal-reviews">
                    <h4>User Reviews</h4>
                    {movieReviews.map(review => (
                      <div key={review.id} className="review">
                        <h5>By {review.author}</h5>
                        <p>{review.content.substring(0, 200)}...</p>
                        <span className="review-rating">⭐ {review.author_details.rating || 'N/A'}/10</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {similarMovies.length > 0 && (
                  <div className="similar-movies">
                    <h4>Similar Movies</h4>
                    <div className="similar-grid">
                      {similarMovies.map(movie => (
                        <div key={movie.id} className="similar-card" onClick={() => openModal(movie)}>
                          <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} />
                          <p>{movie.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="watch-options">
                  <a 
                    href={`https://www.google.com/search?q=watch+${encodeURIComponent(selectedMovie.title)}+online`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-btn"
                  >
                    🎬 Find Where to Watch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      {showDevPanel && (
        <div className="dev-panel">
          <div className="dev-panel-content">
            <h3>🔧 Developer Panel</h3>
            <div className="dev-metrics">
              <p>API Calls: {apiMetrics.calls}</p>
              <p>Avg Response Time: {apiMetrics.avgTime.toFixed(2)}ms</p>
              <p>Favorites: {favorites.length}</p>
              <p>Watchlist: {watchlist.length}</p>
              <p>Theme: {darkMode ? 'Dark' : 'Light'}</p>
            </div>
            <div className="dev-actions">
              <button onClick={() => localStorage.clear()}>Clear Storage</button>
              <button onClick={() => setApiMetrics({ calls: 0, avgTime: 0 })}>Reset Metrics</button>
              <button onClick={() => console.log({ favorites, watchlist, movies })}>Log Data</button>
            </div>
            <p className="dev-hint">Press Ctrl+D to toggle</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;