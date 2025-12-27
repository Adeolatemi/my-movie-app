import React from 'react';

type Category = 'now_playing' | 'popular' | 'top_rated';

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories = [
  { key: 'now_playing' as const, label: 'Now Playing' },
  { key: 'popular' as const, label: 'Popular' },
  { key: 'top_rated' as const, label: 'Top Rated' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="category-filter">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          className={`category-btn ${activeCategory === key ? 'active' : ''}`}
          onClick={() => onCategoryChange(key)}
          aria-pressed={activeCategory === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
};