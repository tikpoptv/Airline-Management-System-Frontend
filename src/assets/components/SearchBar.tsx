import './SearchBar.css'; // your custom CSS
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
    const [query, setQuery] = useState('');
  
    const handleSearch = () => {
      console.log('Searching for:', query);
      // Add your search logic here
    };
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    };
  
    return (
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <FaSearch className="search-icon" onClick={handleSearch} />
      </div>
    );
  };
  
  export default SearchBar;