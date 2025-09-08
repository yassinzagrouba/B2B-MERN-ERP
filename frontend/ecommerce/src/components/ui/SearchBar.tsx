import { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const SearchBar = ({
  onSearch,
  initialValue = '',
  placeholder = 'Search products...',
  buttonText = 'Search',
  className = '',
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="rounded-r-none"
        fullWidth
        data-testid="search-input"
      />
      <Button
        type="submit"
        className="rounded-l-none"
        variant="primary"
        data-testid="search-button"
      >
        {buttonText}
      </Button>
    </form>
  );
};

export default SearchBar;
