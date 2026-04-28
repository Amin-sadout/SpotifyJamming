import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = () => {
    const trimmedInput = searchInput.trim();

    if (trimmedInput === "") {
      return;
    }

    onSearch(trimmedInput);
    setSearchInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by song title, artist, or album"
      />

      <button onClick={handleSearch}>Search</button>
    </div>
  );
}