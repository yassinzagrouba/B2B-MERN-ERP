import { useState } from 'react';
import SearchBar from '../ui/SearchBar';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  initialSearchTerm?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  onPriceRangeChange?: (min: number, max: number) => void;
  className?: string;
}

const ProductFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearch,
  initialSearchTerm = '',
  priceRange,
  onPriceRangeChange,
  className = '',
}: ProductFilterProps) => {
  const [minPrice, setMinPrice] = useState(priceRange?.min || 0);
  const [maxPrice, setMaxPrice] = useState(priceRange?.max || 1000);

  const handlePriceRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPriceRangeChange) {
      onPriceRangeChange(minPrice, maxPrice);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      {/* Search */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Search</h2>
        <SearchBar onSearch={onSearch} initialValue={initialSearchTerm} />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Categories</h2>
        <div className="space-y-2">
          <div
            onClick={() => onCategoryChange('')}
            className={`cursor-pointer p-2 rounded transition ${
              selectedCategory === ''
                ? 'bg-indigo-100 text-indigo-800'
                : 'hover:bg-gray-100'
            }`}
          >
            All Categories
          </div>
          {categories.map((category) => (
            <div
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`cursor-pointer p-2 rounded transition ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range (if enabled) */}
      {onPriceRangeChange && (
        <div>
          <h2 className="text-lg font-medium mb-3">Price Range</h2>
          <form onSubmit={handlePriceRangeSubmit}>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded text-sm transition"
            >
              Apply Filter
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
