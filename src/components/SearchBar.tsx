import React, { useState, useCallback } from 'react';
import { debounce } from '../utils/debounce';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search movies..." 
}) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(
    debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          aria-label="Search movies"
          className="search-input"
        />
        {value && (
          <button 
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};