interface SortOptionsProps {
  sortBy: string;
  onSortChange: (sortOption: string) => void;
}

const SortOptions = ({ sortBy, onSortChange }: SortOptionsProps) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
  ];

  return (
    <div className="flex items-center justify-end mb-4">
      <label htmlFor="sort" className="mr-2 text-sm text-gray-600">
        Sort by:
      </label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortOptions;
