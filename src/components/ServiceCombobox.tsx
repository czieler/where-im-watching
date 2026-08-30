import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";

const knownServices = [
  "Netflix",
  "Hulu",
  "Max",
  "Apple TV+",
  "Paramount+",
  "Peacock",
  "Prime Video",
  "Disney+",
];

type ServiceComboboxProps = {
  value: string;
  onChange: (service: string) => void;
};

function ServiceCombobox({ value, onChange }: ServiceComboboxProps) {
  const [query, setQuery] = useState("");

  const filteredServices =
    query === ""
      ? knownServices
      : knownServices.filter((service) =>
          service.toLowerCase().includes(query.toLowerCase()),
        );

  const trimmedQuery = query.trim();

  const hasExactMatch = knownServices.some(
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
    >
      <div className="pretty-placeholder relative">
        <ComboboxInput
          required
          id="show-service"
          className="app-input rounded-lg border"
          placeholder=" "
          displayValue={(service: string) => service}
          onChange={(e) => setQuery(e.target.value)}
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
              Use "{trimmedQuery}"
            </ComboboxOption>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

export default ServiceCombobox;
