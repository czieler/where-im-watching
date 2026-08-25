import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Show } from "../types/show";

type ShowListProps = {
  title: string;
  shows: Show[];
  defaultExpanded?: boolean;
};

function ShowList({ title, shows, defaultExpanded = true }: ShowListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="mb-10">
      <div className="show-list overflow-hidden rounded-xl border shadow-sm">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="show-list-header flex cursor-pointer items-center justify-between px-5 py-3"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{title}</h3>

            <span className="show-count rounded-full px-2 py-0.5 text-sm font-semibold">
              {shows.length}
            </span>
          </div>

          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isExpanded && (
          <>
            {shows.length > 0 ? (
              shows.map((show) => (
                <div
                  key={show.title}
                  className="show-list-row flex items-center justify-between border-b px-5 py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {show.imageUrl && (
                      <img
                        src={show.imageUrl}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded object-cover"
                      />
                    )}

                    <span className="font-semibold">{show.title}</span>
                  </div>

                  <span className="show-service text-sm font-medium">
                    {show.service}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state px-5 py-8 text-center">
                <p className="font-semibold">No shows found</p>
                <p className="mt-1 text-sm">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ShowList;
