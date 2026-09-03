import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useMemo, useState } from "react";

type ServiceComboboxProps = {
  value: string;
  services: string[];
  onChange: (service: string) => void;
};

function ServiceCombobox({ value, services, onChange }: ServiceComboboxProps) {
  const [query, setQuery] = useState("");

  const uniqueServices = useMemo(
    () => Array.from(new Set(services.filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [services],
  );

  const filteredServices =
    query === ""
      ? uniqueServices
      : uniqueServices.filter((service) =>
          service.toLowerCase().includes(query.toLowerCase()),
        );

  const trimmedQuery = query.trim();
  const hasExactMatch = uniqueServices.some(
    (service) => service.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  return (
    <Combobox
      immediate
      value={value}
      onChange={(service: string | null) => {
        if (service) {
          onChange(service);
          setQuery("");
        }
      }}
      onClose={() => setQuery("")}
    >
      <div className="pretty-placeholder relative">
        <ComboboxInput
          required
          id="show-service"
          className="app-input rounded-lg border"
          placeholder=" "
          displayValue={(service: string) => service}
          onChange={(e) => {
            const nextValue = e.target.value;
            setQuery(nextValue);
            // Keep the actual form value in sync with what the user can see.
            // This prevents a visually-filled service field from secretly
            // remaining empty when the user types instead of clicking an option.
            onChange(nextValue);
          }}
        />

        <label htmlFor="show-service">Streaming Service</label>

        <ComboboxOptions className="search-results absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
          {filteredServices.map((service) => (
            <ComboboxOption
              key={service}
              value={service}
              className="search-result cursor-pointer border-b px-4 py-3 last:border-b-0 data-focus:bg-[var(--theme-hover)]"
            >
              {service}
            </ComboboxOption>
          ))}

          {trimmedQuery && !hasExactMatch && (
            <ComboboxOption
              value={trimmedQuery}
              className="search-result cursor-pointer px-4 py-3 data-focus:bg-[var(--theme-hover)]"
            >
              Use &quot;{trimmedQuery}&quot;
            </ComboboxOption>
          )}

          {!trimmedQuery && filteredServices.length === 0 && (
            <div className="px-4 py-3 text-sm opacity-60">
              Type a streaming service name to add one.
            </div>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

export default ServiceCombobox;
