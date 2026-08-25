import { useEffect, useState } from "react";
import { searchShows, type TVMazeShow } from "../services/tvmaze";

function useShowSearch(title: string) {
  const [searchResults, setSearchResults] = useState<TVMazeShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 2) {
      setSearchResults([]);
      setSearchError("");
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
  }, [title]);

  return {
    searchResults,
    isSearching,
    searchError,
  };
}

export default useShowSearch;
