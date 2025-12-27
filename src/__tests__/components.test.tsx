import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { Movie } from '../types/movie';

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'Test overview',
  poster_path: '/test.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  vote_count: 1000,
  genre_ids: [28, 12],
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie',
  popularity: 100,
  video: false
};

describe('MovieCard', () => {
  it('renders movie information correctly', () => {
    const mockOnClick = vi.fn();
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('⭐ 8.5')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('gridcell'));
    expect(mockOnClick).toHaveBeenCalledWith(mockMovie);
  });
});

describe('SearchBar', () => {
  it('calls onSearch with debounced input', async () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    }, { timeout: 500 });
  });
});