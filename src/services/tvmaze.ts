export type TVMazeShow = {
  id: number;
  name: string;
  premiered: string | null;
  status: string;
  genres: string[];
  image: {
    medium: string;
    original: string;
  } | null;
  network: {
    name: string;
  } | null;
  webChannel: {
    name: string;
  } | null;
};

type TVMazeSearchResult = {
  score: number;
  show: TVMazeShow;
};

export async function searchShows(query: string): Promise<TVMazeShow[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response = await fetch(
    `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmedQuery)}`,
  );

  if (!response.ok) {
    throw new Error(`TVmaze search failed: ${response.status}`);
  }

  const results: TVMazeSearchResult[] = await response.json();

  return results.map((result) => result.show);
}
