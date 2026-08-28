import { useEffect, useState } from "react";
import { searchShows, type TVMazeShow } from "../services/tvmaze";

function useShowSearch(title: string) {
  const [searchResults, setSearchResults] = useState<TVMazeShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const trimmedTitle = title.trim();
  const shouldSearch = trimmedTitle.length >= 2;

  useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError("");

        const results = await searchShows(trimmedTitle);
        setSearchResults(results);
      } catch (error) {
        console.error(error);
        setSearchResults([]);
        setSearchError("Unable to search for shows right now.");
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [trimmedTitle, shouldSearch]);

  return {
    searchResults: shouldSearch ? searchResults : [],
    isSearching: shouldSearch ? isSearching : false,
    searchError: shouldSearch ? searchError : "",
  };
}

export default useShowSearch;
