import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';
import { tmdbApi } from '../services/api.js';

const Dashboard = () => {
  const [state, setState] = useState(store.getState());
  const [dashboardData, setDashboardData] = useState({
    trending: [],
    topRated: [],
    upcoming: [],
    stats: {}
  });

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    loadDashboardData();
    return unsubscribe;
  }, []);

  const loadDashboardData = async () => {
    try {
      const [trending, topRated, upcoming] = await Promise.all([
        tmdbApi.getTrending('day'),
        tmdbApi.getMovies('top_rated', 1),
        tmdbApi.getMovies('upcoming', 1)
      ]);

      setDashboardData({
        trending: trending.results.slice(0, 5),
        topRated: topRated.results.slice(0, 5),
        upcoming: upcoming.results.slice(0, 5),
        stats: {
          totalMovies: trending.total_results,
          cacheSize: tmdbApi.getCacheStats().size
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, trend, color = 'blue' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-trend">{trend}</span>
      </div>
      <div className="stat-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  const MovieWidget = ({ title, movies, icon }) => (
    <div className="dashboard-widget">
      <div className="widget-header">
        <h3><span className="widget-icon">{icon}</span> {title}</h3>
        <button 
          className="widget-action"
          onClick={() => {
            console.log('View All clicked for:', title);
            store.setActiveView('movies');
          }}
        >
          View All
        </button>
      </div>
      <div className="widget-content">
        <div className="movie-list">
          {movies.map(movie => (
            <div 
              key={movie.id} 
              className="movie-item"
              onClick={() => {
                console.log('Movie clicked:', movie.title);
                // This would need to be passed from parent component
                // For now, just log the click
              }}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                alt={movie.title}
                className="movie-thumb"
              />
              <div className="movie-info">
                <h4>{movie.title}</h4>
                <p>⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatCard
          title="Total Favorites"
          value={state.user.favorites.length}
          icon="❤️"
          trend="+12%"
          color="red"
        />
        <StatCard
          title="Watchlist Items"
          value={state.user.watchlist.length}
          icon="📝"
          trend="+8%"
          color="blue"
        />
        <StatCard
          title="API Calls"
          value={state.analytics.apiCalls}
          icon="🔄"
          trend="+24%"
          color="green"
        />
        <StatCard
          title="Cache Size"
          value={dashboardData.stats.cacheSize}
          icon="💾"
          trend="Optimal"
          color="purple"
        />
      </div>

      <div className="dashboard-widgets">
        <MovieWidget
          title="Trending Today"
          movies={dashboardData.trending}
          icon="🔥"
        />
        <MovieWidget
          title="Top Rated"
          movies={dashboardData.topRated}
          icon="⭐"
        />
        <MovieWidget
          title="Coming Soon"
          movies={dashboardData.upcoming}
          icon="🎬"
        />
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>🚀 Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => store.setActiveView('movies')}>
              Browse Movies
            </button>
            <button onClick={() => tmdbApi.clearCache()}>
              Clear Cache
            </button>
            <button onClick={() => store.setActiveView('analytics')}>
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;