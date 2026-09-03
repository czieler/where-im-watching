import { Fragment, useState, type CSSProperties, type ReactNode } from "react";

export type DataTableCellContext = {
  isExpanded: boolean;
  toggleExpanded: () => void;
  rowsExpandable: boolean;
};

export type DataTableColumn<T> = {
  id: string;
  label: ReactNode;
  width?: CSSProperties["width"];
  align?: "left" | "center" | "right";
  mobileHidden?: boolean;
  render: (row: T, context: DataTableCellContext) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;

  headerMode?: "columns" | "section";
  sectionHeader?: ReactNode;

  collapsible?: boolean;
  defaultCollapsed?: boolean;
  headerExpandIcon?: ReactNode;
  headerCollapseIcon?: ReactNode;

  cellDividers?: "all" | "rows";

  footer?: ReactNode;
  renderExpandedRow?: (row: T) => ReactNode;
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
  defaultExpandedIds?: string[];
  emptyMessage?: ReactNode;
  caption?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  headerMode = "columns",
  sectionHeader,
  collapsible = false,
  defaultCollapsed = false,
  headerExpandIcon = "⌄",
  headerCollapseIcon = "⌃",
  cellDividers = "all",
  footer,
  renderExpandedRow,
  expandIcon = "⌄",
  collapseIcon = "⌃",
  defaultExpandedIds = [],
  emptyMessage = "No rows to display.",
  caption,
}: DataTableProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const rowsExpandable = Boolean(renderExpandedRow);
  const totalColumns = columns.length + (rowsExpandable ? 1 : 0);
  const hasSectionHeader = Boolean(sectionHeader);
  const showColumnHeaders = headerMode === "columns";

  const toggleRow = (rowId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }

      return next;
    });
  };

  const className = [
    "data-table",
    footer ? "data-table--with-footer" : "data-table--without-footer",
    isCollapsed ? "data-table--collapsed" : "",
    hasSectionHeader
      ? "data-table--with-section-header"
      : "data-table--no-section-header",
    showColumnHeaders && !hasSectionHeader
      ? "data-table--standalone-columns"
      : "",
    cellDividers === "rows"
      ? "data-table--row-dividers"
      : "data-table--cell-dividers",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {hasSectionHeader && (
        <div className="data-table__header">
          {collapsible ? (
            <button
              type="button"
              className="data-table__header-toggle"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-expanded={!isCollapsed}
            >
              <span className="data-table__header-content">
                {sectionHeader}
              </span>

              <span className="data-table__header-icon" aria-hidden="true">
                {isCollapsed ? headerExpandIcon : headerCollapseIcon}
              </span>
            </button>
          ) : (
            <div className="data-table__header-static">{sectionHeader}</div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div className="data-table__scroll">
          <table>
            {caption && <caption className="sr-only">{caption}</caption>}

            {showColumnHeaders && (
              <thead>
                <tr>
                  {rowsExpandable && (
                    <th
                      className="data-table__expand-heading"
                      aria-label="Row details"
                    />
                  )}

                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      style={{ width: column.width }}
                      className={[
                        `data-table__cell--${column.align ?? "left"}`,
                        `data-table__column--${column.id}`,
                        column.mobileHidden ? "data-table__column--mobile-hidden" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody>
              {rows.length === 0 ? (
                <tr className="data-table__empty-row">
                  <td className="data-table__empty" colSpan={totalColumns}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowId = getRowId(row);
                  const isExpanded = expandedIds.has(rowId);

                  return (
                    <Fragment key={rowId}>
                      <tr
                        className={`data-table__row ${
                          isExpanded ? "data-table__row--expanded" : ""
                        }`}
                      >
                        {rowsExpandable && (
                          <td className="data-table__expand-cell">
                            <button
                              type="button"
                              className="data-table__expand-button"
                              onClick={() => toggleRow(rowId)}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? `Collapse row ${rowId}`
                                  : `Expand row ${rowId}`
                              }
                            >
                              <span aria-hidden="true">
                                {isExpanded ? collapseIcon : expandIcon}
                              </span>
                            </button>
                          </td>
                        )}

                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={[
                              `data-table__cell--${column.align ?? "left"}`,
                              `data-table__column--${column.id}`,
                              column.mobileHidden ? "data-table__column--mobile-hidden" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {column.render(row, {
                              isExpanded,
                              toggleExpanded: () => toggleRow(rowId),
                              rowsExpandable,
                            })}
                          </td>
                        ))}
                      </tr>

                      {rowsExpandable && isExpanded && (
                        <tr className="data-table__expanded-row">
                          <td colSpan={totalColumns}>
                            <div className="data-table__expanded-content">
                              {renderExpandedRow?.(row)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>

            {footer && (
              <tfoot>
                <tr>
                  <td className="data-table__footer" colSpan={totalColumns}>
                    {footer}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
