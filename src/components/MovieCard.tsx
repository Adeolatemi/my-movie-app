import React from 'react';
import { Movie } from '../types/movie';
import { tmdbService } from '../services/tmdb';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <div 
      className="movie-card" 
      role="gridcell" 
      tabIndex={0}
      onClick={() => onClick(movie)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(movie)}
      aria-label={`View details for ${movie.title}`}
    >
      <img 
        src={tmdbService.getImageUrl(movie.poster_path)}
        alt={`${movie.title} poster`}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.jpg';
        }}
      />
      <div className="movie-info">
        <h3 title={movie.title}>{movie.title}</h3>
        <span className="rating" aria-label={`Rating: ${movie.vote_average} out of 10`}>
          ⭐ {movie.vote_average.toFixed(1)}
        </span>
        <p className="release-date">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
        </p>
      </div>
    </div>
  );
};