import { ChevronUp, ChevronDown, ImageOff, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import type { Show, ShowStatus } from "../types/show";
import ConfirmModal from "./ConfirmModal";

type ShowListProps = {
  title: string;
  shows: Show[];
  status: ShowStatus;
  onEdit: (show: Show) => void;
  onRemove: (id: number) => void;
  defaultExpanded?: boolean;
};

function ShowList({
  title,
  shows,
  status,
  onEdit,
  onRemove,
  defaultExpanded = true,
}: ShowListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showToRemove, setShowToRemove] = useState<Show | null>(null);

  return (
    <>
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
                    key={show.id}
                    className="show-list-row flex items-center justify-between border-b px-5 py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {show.imageUrl ? (
                        <img
                          src={show.imageUrl}
                          alt=""
                          className="h-12 w-9 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="image-placeholder flex h-12 w-9 shrink-0 items-center justify-center rounded">
                          <ImageOff size={16} />
                        </div>
                      )}

                      <span className="font-semibold">{show.title}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {(status === "watching" || status === "onHold") &&
                        (show.season !== undefined ||
                          show.episode !== undefined) && (
                          <span className="text-muted text-sm font-medium">
                            {show.season !== undefined && `S${show.season}`}
                            {show.season !== undefined &&
                              show.episode !== undefined &&
                              " "}
                            {show.episode !== undefined && `E${show.episode}`}
                          </span>
                        )}

                      <span className="text-muted text-sm font-medium">
                        {show.service}
                      </span>

                      <button
                        type="button"
                        onClick={() => onEdit(show)}
                        className="themed-icon"
                        aria-label={`Edit ${show.title}`}
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowToRemove(show)}
                        className="themed-icon"
                        aria-label={`Remove ${show.title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

      {showToRemove && (
        <ConfirmModal
          title="Remove Show?"
          message={`Are you sure you want to remove "${showToRemove.title}"?`}
          onCancel={() => setShowToRemove(null)}
          onConfirm={() => {
            onRemove(showToRemove!.id);
            setShowToRemove(null);
          }}
        />
      )}
    </>
  );
}

export default ShowList;
