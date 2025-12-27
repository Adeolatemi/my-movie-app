import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types/movie';
import { tmdbService } from '../services/tmdb';

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'now_playing' | 'popular' | 'top_rated'>('now_playing');

  const fetchMovies = useCallback(async (
    query = '', 
    pageNum = 1, 
    append = false,
    movieCategory = category
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (query) {
        response = await tmdbService.searchMovies(query, pageNum);
      } else {
        switch (movieCategory) {
          case 'popular':
            response = await tmdbService.getPopularMovies(pageNum);
            break;
          case 'top_rated':
            response = await tmdbService.getTopRatedMovies(pageNum);
            break;
          default:
            response = await tmdbService.getNowPlaying(pageNum);
        }
      }
      
      setMovies(prev => append ? [...prev, ...response.results] : response.results);
      setHasMore(pageNum < response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchMovies(searchTerm, 1, false, category);
    setPage(1);
  }, [fetchMovies, searchTerm, category]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(searchTerm, nextPage, true, category);
  }, [fetchMovies, searchTerm, page, category]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((newCategory: typeof category) => {
    setCategory(newCategory);
    setSearchTerm('');
    setPage(1);
  }, []);

  const retry = useCallback(() => {
    fetchMovies(searchTerm, 1, false, category);
  }, [fetchMovies, searchTerm, category]);

  return {
    movies,
    loading,
    error,
    hasMore,
    searchTerm,
    category,
    loadMore,
    handleSearch,
    handleCategoryChange,
    retry
  };
};