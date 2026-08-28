import { ChevronDown, Search, X } from "lucide-react";

type WatchlistFiltersProps = {
  searchText: string;
  selectedStatus: string;
  selectedService: string;
  serviceOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onClearFilters: () => void;
  onAddShow: () => void;
};

function WatchlistFilters({
  searchText,
  selectedStatus,
  selectedService,
  serviceOptions,
  onSearchChange,
  onStatusChange,
  onServiceChange,
  onClearFilters,
  onAddShow,
}: WatchlistFiltersProps) {
  const hasActiveFilters =
    searchText !== "" || selectedStatus !== "all" || selectedService !== "all";

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="search-icon absolute left-3 top-1/2 -translate-y-1/2"
        />

        <input
          type="text"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search my list..."
          className="app-input w-full rounded-lg border py-2.5 pl-10 pr-10 outline-none"
        />

        {searchText && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="search-clear absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-3">
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value)}
            className="app-select w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 lg:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="watching">Watching</option>
            <option value="wantToWatch">Want to Watch</option>
            <option value="completed">Completed</option>
            <option value="onHold">On Hold</option>
          </select>

          <ChevronDown
            size={16}
            className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>

        <div className="relative">
          <select
            value={selectedService}
            onChange={(event) => onServiceChange(event.target.value)}
            className="app-select w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 lg:w-44"
          >
            <option value="all">All Services</option>

            {serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="btn btn-default self-start whitespace-nowrap lg:self-center"
        >
          Clear All
        </button>
      )}

      <button
        type="button"
        onClick={onAddShow}
        className="btn btn-primary hidden self-center whitespace-nowrap md:inline-flex"
      >
        + Add
      </button>
    </div>
  );
}

export default WatchlistFilters;
