import React, { useState, useEffect, useCallback } from 'react';
import { store } from '../store/index.js';
import { tmdbApi } from '../services/api.js';
import { debounce } from '../utils/debounceSearch.js';
import Sidebar from './Sidebar.jsx';
import Dashboard from './Dashboard.jsx';
import MovieGrid from './MovieGrid.jsx';
import Analytics from './Analytics.jsx';
import Settings from './Settings.jsx';
import MovieModal from './MovieModal.jsx';

const DashboardLayout = () => {
  const [state, setState] = useState(store.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.view-controls') && !event.target.closest('.quick-actions')) {
        setShowViewOptions(false);
        setShowMoreActions(false);
      }
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        try {
          const results = await tmdbApi.searchMovies(query);
          setSearchResults(results.results || []);
          setShowSearchResults(true);
          
          // Update main movie grid with search results
          store.setState({ 
            movies: results.results || [],
            totalPages: results.total_pages || 1,
            currentPage: 1,
            isSearching: true,
            searchQuery: query
          });
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else if (query.length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
        setShowAllResults(false);
        
        // Reset to category view
        store.setState({ isSearching: false, searchQuery: '' });
        const data = await tmdbApi.getMovies(state.filters.category, 1, state.filters);
        store.setState({ 
          movies: data.results || [],
          totalPages: data.total_pages || 1,
          currentPage: 1
        });
      }
    }, 300),
    [state.filters]
  );

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  const handleMovieClick = async (movie) => {
    try {
      console.log('Clicking movie:', movie.title);
      const details = await tmdbApi.getMovieDetails(movie.id);
      setSelectedMovie(details);
      setShowSearchResults(false);
      setShowAllResults(false);
    } catch (error) {
      console.error('Error loading movie details:', error);
      // Fallback to basic movie data if API fails
      setSelectedMovie(movie);
      setShowSearchResults(false);
      setShowAllResults(false);
    }
  };

  const viewOptions = [
    { id: 'grid', icon: '📋', label: 'Grid View', description: 'Classic movie grid' },
    { id: 'list', icon: '📜', label: 'List View', description: 'Detailed list format' },
    { id: 'cards', icon: '🃏', label: 'Card View', description: 'Enhanced cards' },
    { id: 'table', icon: '📊', label: 'Table View', description: 'Sortable table' },
    { id: 'masonry', icon: '🧱', label: 'Masonry', description: 'Pinterest-style layout' },
    { id: 'carousel', icon: '🎠', label: 'Carousel', description: 'Sliding view' }
  ];

  const quickActions = [
    { id: 'favorites', icon: '❤️', label: 'My Favorites', count: state.user.favorites.length },
    { id: 'watchlist', icon: '📝', label: 'Watchlist', count: state.user.watchlist.length },
    { id: 'trending', icon: '🔥', label: 'Trending' },
    { id: 'export', icon: '💾', label: 'Export Data' }
  ];

  const moreActions = [
    { id: 'history', icon: '📚', label: 'Watch History', count: 42 },
    { id: 'recommendations', icon: '🎯', label: 'For You', count: 15 },
    { id: 'collections', icon: '📂', label: 'Collections', count: 8 },
    { id: 'reviews', icon: '⭐', label: 'My Reviews', count: 23 },
    { id: 'share', icon: '🔗', label: 'Share Lists' },
    { id: 'sync', icon: '🔄', label: 'Sync Data' }
  ];

  const renderActiveView = () => {
    switch (state.ui.activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'movies':
        return <MovieGrid onMovieClick={handleMovieClick} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>🎬 MovieFlix Dashboard</h1>
            <p>Professional Movie Analytics Platform</p>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <input
                type="search"
                placeholder="Search movies, actors, directors..."
                value={searchTerm}
                onChange={handleSearch}
                className="dashboard-search"
              />
              <button className="search-btn">🔍</button>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.slice(0, showAllResults ? searchResults.length : 8).map(movie => (
                    <div 
                      key={movie.id} 
                      className="search-result-item"
                      onClick={() => handleMovieClick(movie)}
                    >
                      <img 
                        src={tmdbApi.getOptimizedImageUrl(movie.poster_path, true)}
                        alt={movie.title}
                        className="search-result-poster"
                      />
                      <div className="search-result-info">
                        <h4>{movie.title}</h4>
                        <p>⭐ {movie.vote_average.toFixed(1)} • {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 8 && !showAllResults && (
                    <div 
                      className="search-result-more"
                      onClick={() => setShowAllResults(true)}
                    >
                      +{searchResults.length - 8} more results - Click to show all
                    </div>
                  )}
                  {showAllResults && searchResults.length > 8 && (
                    <div 
                      className="search-result-more"
                      onClick={() => setShowAllResults(false)}
                    >
                      Show less results
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="quick-actions">
              {quickActions.map(action => (
                <button 
                  key={action.id} 
                  className="quick-action-btn"
                  onClick={() => {
                    console.log('Quick action clicked:', action.label);
                    // Add functionality based on action.id
                    if (action.id === 'favorites') {
                      store.setActiveView('movies');
                    } else if (action.id === 'trending') {
                      store.setActiveView('movies');
                    }
                  }}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                  {action.count !== undefined && (
                    <span className="action-count">{action.count}</span>
                  )}
                </button>
              ))}
              
              <button 
                className="view-more-btn"
                onClick={() => setShowMoreActions(!showMoreActions)}
              >
                <span className="action-icon">{showMoreActions ? '▲' : '▼'}</span>
                <span className="action-label">{showMoreActions ? 'Less' : 'More'}</span>
              </button>
              
              {showMoreActions && (
                <div className="more-actions-dropdown">
                  <div className="more-actions-grid">
                    {moreActions.map(action => (
                      <button 
                        key={action.id} 
                        className="more-action-btn"
                        onClick={() => {
                          console.log('More action clicked:', action.label);
                          // Add functionality here
                        }}
                      >
                        <span className="action-icon">{action.icon}</span>
                        <div className="action-content">
                          <span className="action-label">{action.label}</span>
                          {action.count !== undefined && (
                            <span className="action-count">{action.count}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="actions-footer">
                    <small>🚀 More features coming soon!</small>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="header-right">
            <div className="view-controls">
              <button 
                className="view-options-btn"
                onClick={() => setShowViewOptions(!showViewOptions)}
              >
                👁️ View Options
              </button>
              {showViewOptions && (
                <div className="view-dropdown">
                  <div className="dropdown-header">
                    <span>🎯 View Options</span>
                    <button 
                      className="close-dropdown"
                      onClick={() => setShowViewOptions(false)}
                    >
                      ✕
                    </button>
                  </div>
                  {viewOptions.map(option => (
                    <button 
                      key={option.id} 
                      className={`view-option ${state.ui.viewMode === option.id ? 'active' : ''}`}
                      onClick={() => {
                        store.setState({
                          ui: { ...state.ui, viewMode: option.id }
                        });
                        setShowViewOptions(false);
                      }}
                    >
                      <span className="option-icon">{option.icon}</span>
                      <div className="option-content">
                        <span className="option-label">{option.label}</span>
                        <span className="option-description">{option.description}</span>
                      </div>
                      {state.ui.viewMode === option.id && <span className="active-indicator">✓</span>}
                    </button>
                  ))}
                  <div className="dropdown-footer">
                    <small>💡 Tip: Use keyboard shortcuts for quick switching</small>
                  </div>
                </div>
              )}
            </div>
            
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-value">{state.user.favorites.length}</span>
                <span className="stat-label">Favorites</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{state.user.watched?.length || 0}</span>
                <span className="stat-label">Watched</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{store.getUserStats().avgRating || '0.0'}</span>
                <span className="stat-label">Avg Rating</span>
              </div>
            </div>
            
            <button 
              className="theme-toggle"
              onClick={() => store.setState({
                user: { ...state.user, theme: state.user.theme === 'dark' ? 'light' : 'dark' }
              })}
            >
              {state.user.theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>
        
        <div className="dashboard-content">
          {renderActiveView()}
        </div>
        
        {selectedMovie && (
          <MovieModal 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
          />
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;