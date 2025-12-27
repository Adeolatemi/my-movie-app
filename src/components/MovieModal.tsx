import React, { useEffect } from 'react';
import { Movie } from '../types/movie';
import { tmdbService } from '../services/tmdb';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
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
          <img 
            src={tmdbService.getImageUrl(movie.poster_path)}
            alt={`${movie.title} poster`}
            className="modal-poster"
          />
          <div className="modal-info">
            <h2>{movie.title}</h2>
            <div className="modal-meta">
              <p className="modal-rating">⭐ {movie.vote_average.toFixed(1)}/10</p>
              <p className="modal-date">
                Released: {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
              </p>
              <p className="modal-votes">{movie.vote_count.toLocaleString()} votes</p>
            </div>
            <p className="modal-overview">{movie.overview || 'No description available.'}</p>
            <div className="watch-options">
              <a 
                href={`https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+online`}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-btn"
              >
                Find Where to Watch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};