import { ChevronDown, ChevronUp, ImageOff, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Show, ShowStatus } from "../types/show";
import ConfirmModal from "./ConfirmModal";
import { DataTable, type DataTableColumn } from "./component-library/DataTable";

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
  const [showToRemove, setShowToRemove] = useState<Show | null>(null);

  const columns = useMemo<DataTableColumn<Show>[]>(
    () => [
      {
        id: "show",
        label: (
          <>
            <span className="show-table-label-desktop">Show</span>
            <span className="show-table-label-mobile">Show Info</span>
          </>
        ),
        width: "42%",
        render: (show, { isExpanded, toggleExpanded, rowsExpandable }) => {
          const hasProgress =
            (status === "watching" || status === "onHold") &&
            (show.season !== undefined || show.episode !== undefined);

          return (
            <div className="show-table-mobile-info">
              <div className="show-table-title-cell">
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

                <div className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{show.title}</span>

                  <div className="show-table-mobile-details">
                    <span>
                      <strong>Progress:</strong>{" "}
                      {hasProgress ? (
                        <>
                          {show.season !== undefined && `S${show.season}`}
                          {show.season !== undefined &&
                            show.episode !== undefined &&
                            " "}
                          {show.episode !== undefined && `E${show.episode}`}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span>
                      <strong>Service:</strong> {show.service}
                    </span>
                    <span>
                      <strong>Profile:</strong>{" "}
                      {show.streamingProfile?.trim() || "—"}
                    </span>
                  </div>
                </div>

                {rowsExpandable && (
                  <button
                    type="button"
                    className="show-table-mobile-expand themed-icon"
                    onClick={toggleExpanded}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Hide notes for ${show.title}` : `Show notes for ${show.title}`}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "progress",
        label: "Progress",
        width: "14%",
        mobileHidden: true,
        render: (show) => {
          if (
            (status !== "watching" && status !== "onHold") ||
            (show.season === undefined && show.episode === undefined)
          ) {
            return <span className="text-muted">—</span>;
          }

          return (
            <span className="text-muted text-sm font-medium">
              {show.season !== undefined && `S${show.season}`}
              {show.season !== undefined && show.episode !== undefined && " "}
              {show.episode !== undefined && `E${show.episode}`}
            </span>
          );
        },
      },
      {
        id: "service",
        label: "Service",
        width: "18%",
        mobileHidden: true,
        render: (show) => (
          <span className="text-muted text-sm font-medium">{show.service}</span>
        ),
      },
      {
        id: "profile",
        label: "Profile",
        width: "16%",
        mobileHidden: true,
        render: (show) => (
          <span className="text-muted text-sm font-medium">
            {show.streamingProfile?.trim() || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        width: "10%",
        align: "right",
        render: (show) => (
          <div className="show-table-actions">
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
        ),
      },
    ],
    [onEdit, status],
  );

  return (
    <>
      <section className="show-table-section">
        <DataTable
          columns={columns}
          rows={shows}
          getRowId={(show) => String(show.id)}
          headerMode="columns"
          sectionHeader={
            <div className="show-table-section-header">
              <h3>{title}</h3>
              <span className="show-count">{shows.length}</span>
            </div>
          }
          collapsible
          defaultCollapsed={!defaultExpanded}
          headerExpandIcon={<ChevronDown size={20} />}
          headerCollapseIcon={<ChevronUp size={20} />}
          cellDividers="rows"
          renderExpandedRow={(show) => (
            <div className="show-notes">
              <strong>Notes</strong>
              {show.notes?.trim() ? (
                <p>{show.notes}</p>
              ) : (
                <p className="show-notes-empty">No notes</p>
              )}
            </div>
          )}
          expandIcon={<ChevronDown size={18} />}
          collapseIcon={<ChevronUp size={18} />}
          emptyMessage={
            <div className="empty-state">
              <p className="font-semibold">No shows found</p>
              <p className="mt-1 text-sm">
                Try changing your search or filters.
              </p>
            </div>
          }
          caption={`${title} shows`}
        />
      </section>

      {showToRemove && (
        <ConfirmModal
          title="Remove Show?"
          message={`Are you sure you want to remove "${showToRemove.title}"?`}
          onCancel={() => setShowToRemove(null)}
          onConfirm={() => {
            onRemove(showToRemove.id);
            setShowToRemove(null);
          }}
        />
      )}
    </>
  );
}

export default ShowList;
