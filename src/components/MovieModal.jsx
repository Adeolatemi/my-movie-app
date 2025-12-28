import React, { useEffect, useState } from 'react';
import { tmdbApi } from '../services/api.js';
import { store } from '../store/index.js';

const MovieModal = ({ movie, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(movie);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    const loadMovieDetails = async () => {
      if (!movie.videos) {
        setLoading(true);
        try {
          const details = await tmdbApi.getMovieDetails(movie.id);
          setMovieDetails(details);
          
          // Find trailer
          if (details.videos?.results) {
            const trailerVideo = details.videos.results.find(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );
            setTrailer(trailerVideo);
          }
        } catch (error) {
          console.error('Error loading movie details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        const trailerVideo = movie.videos?.results?.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        );
        setTrailer(trailerVideo);
      }
    };

    // Load existing user rating
    setUserRating(state.user.ratings[movie.id] || 0);
    
    loadMovieDetails();
    return unsubscribe;
  }, [movie, state.user.ratings]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ×
        </button>
        <div className="modal-content">
          <div className="modal-poster-section">
            <img 
              src={tmdbApi.getOptimizedImageUrl(movieDetails.poster_path)}
              alt={`${movieDetails.title} poster`}
              className="modal-poster"
            />
            <div className="modal-actions">
              <button 
                className="favorite-btn large"
                onClick={() => store.toggleFavorite(movieDetails)}
              >
                {state.user.favorites.some(fav => fav.id === movieDetails.id) ? '❤️' : '🤍'} 
                {state.user.favorites.some(fav => fav.id === movieDetails.id) ? 'Remove from' : 'Add to'} Favorites
              </button>
              <button 
                className="watch-btn"
                onClick={() => {
                  store.markAsWatched(movieDetails);
                  store.addToWatchlist(movieDetails);
                }}
              >
                📝 Add to Watchlist
              </button>
              <button 
                className="watch-btn"
                onClick={() => store.markAsWatched(movieDetails)}
                style={{ background: '#4caf50' }}
              >
                ✅ Mark as Watched
              </button>
            </div>
            
            <div className="rating-section">
              <h4>Your Rating:</h4>
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    className={`star ${userRating >= star ? 'active' : ''}`}
                    onClick={() => {
                      setUserRating(star);
                      store.rateMovie(movieDetails.id, star);
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="modal-info">
            <h2>{movieDetails.title}</h2>
            <div className="modal-meta">
              <span className="modal-rating">⭐ {movieDetails.vote_average.toFixed(1)}/10</span>
              <span className="modal-date">
                {movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'TBA'}
              </span>
              <span className="modal-votes">{movieDetails.vote_count.toLocaleString()} votes</span>
              {movieDetails.runtime && (
                <span className="modal-runtime">{movieDetails.runtime} min</span>
              )}
            </div>
            
            {movieDetails.genres && (
              <div className="modal-genres">
                {movieDetails.genres.map(genre => (
                  <span key={genre.id} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            )}
            
            <p className="modal-overview">{movieDetails.overview || 'No description available.'}</p>
            
            {movieDetails.credits?.cast && (
              <div className="modal-cast">
                <h4>Cast</h4>
                <div className="cast-list">
                  {movieDetails.credits.cast.slice(0, 8).map(actor => (
                    <span key={actor.id} className="cast-member">{actor.name}</span>
                  ))}
                </div>
              </div>
            )}
            
            {trailer && (
              <div className="modal-trailer">
                <h4>🎬 Trailer</h4>
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}`}
                  title={`${movieDetails.title} trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="watch-options">
              <a 
                href={`https://www.google.com/search?q=watch+${encodeURIComponent(movieDetails.title)}+${movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : ''}+online`}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-btn"
              >
                🎭 Find Where to Watch
              </a>
              <a 
                href={`https://www.imdb.com/find?q=${encodeURIComponent(movieDetails.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-btn"
                style={{ background: '#f5c518', color: '#000' }}
              >
                🎞️ View on IMDb
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;