import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ChevronDown, ImageOff } from "lucide-react";
import { useState } from "react";
import type { NewShow, Show, ShowStatus } from "../types/show";
import useShowSearch from "../hooks/useShowSearch";
import type { TVMazeShow } from "../services/tvmaze";
import ServiceCombobox from "./ServiceCombobox";
import { Select } from "./component-library/Select";
import { Textarea } from "./component-library/Textarea";
import { TextInput } from "./component-library/TextInput";

type AddShowModalProps = {
  show?: Show;
  initialStatus?: ShowStatus;
  onClose: () => void;
  onSave: (show: NewShow) => void;
};

function AddShowModal({
  show,
  initialStatus = "watching",
  onClose,
  onSave,
}: AddShowModalProps) {
  const [title, setTitle] = useState(show?.title ?? "");
  const [status, setStatus] = useState<ShowStatus>(initialStatus);
  const [service, setService] = useState(show?.service ?? "Hulu");
  const [season, setSeason] = useState(
    show?.season === undefined ? "" : String(show.season),
  );
  const [episode, setEpisode] = useState(
    show?.episode === undefined ? "" : String(show.episode),
  );
  const [streamingProfile, setStreamingProfile] = useState(
    show?.streamingProfile ?? "",
  );
  const [notes, setNotes] = useState(show?.notes ?? "");
  const [selectedShow, setSelectedShow] = useState<TVMazeShow | null>(null);

  const { searchResults, isSearching, searchError } = useShowSearch(
    selectedShow ? "" : title,
  );

  const handleShowSelected = (selected: TVMazeShow | null) => {
    setSelectedShow(selected);
    if (selected) {
      setTitle(selected.name);
    }
  };

  const handleSubmit = () => {
    const parseProgress = (value: string) =>
      value === "" ? undefined : Number(value);
    const cleanOptionalText = (value: string) => value.trim() || undefined;

    if (show) {
      onSave({
        ...show,
        service,
        status,
        season: parseProgress(season),
        episode: parseProgress(episode),
        streamingProfile: cleanOptionalText(streamingProfile),
        notes: cleanOptionalText(notes),
      });
      return;
    }

    if (!selectedShow) {
      return;
    }

    onSave({
      id: selectedShow.id,
      title: selectedShow.name,
      service,
      status,
      imageUrl: selectedShow.image?.medium,
      season: parseProgress(season),
      episode: parseProgress(episode),
      streamingProfile: cleanOptionalText(streamingProfile),
      notes: cleanOptionalText(notes),
    });
  };

  const canEditProgress = status === "watching" || status === "onHold";

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="modal max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">{show ? "Edit Show" : "Add Show"}</h2>

        <div className="mt-6">
          {!show && (
            <>
              <Combobox
                immediate
                value={selectedShow}
                onChange={handleShowSelected}
              >
                <div className="pretty-placeholder relative">
                  <ComboboxInput
                    id="show-title"
                    required
                    className="app-input rounded-lg border"
                    placeholder=" "
                    displayValue={(value: TVMazeShow | null) =>
                      value?.name ?? title
                    }
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSelectedShow(null);
                    }}
                  />
                  <label htmlFor="show-title">Show Title</label>

                  <ComboboxOptions className="search-results absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border shadow-lg empty:hidden">
                    {isSearching && (
                      <div className="p-3 text-sm">Searching...</div>
                    )}
                    {!isSearching &&
                      searchResults.map((result) => (
                        <ComboboxOption
                          key={result.id}
                          value={result}
                          className="search-result flex cursor-pointer items-center gap-3 border-b p-3 text-left last:border-b-0 data-focus:bg-[var(--theme-hover)]"
                        >
                          {result.image ? (
                            <img
                              src={result.image.medium}
                              alt=""
                              className="h-16 w-11 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="image-placeholder flex h-16 w-11 shrink-0 items-center justify-center rounded">
                              <ImageOff size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold">{result.name}</div>
                            <div className="mt-1 text-sm">
                              {result.premiered?.slice(0, 4)}
                              {(result.network || result.webChannel) && (
                                <>
                                  {" · "}
                                  {result.network?.name ??
                                    result.webChannel?.name}
                                </>
                              )}
                            </div>
                          </div>
                        </ComboboxOption>
                      ))}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {searchError && <p className="mt-2 text-sm">{searchError}</p>}

              {selectedShow && (
                <div className="detail-card mt-4 flex gap-4 rounded-lg border p-4">
                  {selectedShow.image ? (
                    <img
                      src={selectedShow.image.medium}
                      alt={`${selectedShow.name} poster`}
                      className="h-28 w-20 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="image-placeholder flex h-28 w-20 shrink-0 items-center justify-center rounded">
                      <ImageOff size={24} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold">{selectedShow.name}</h3>
                    {selectedShow.premiered && (
                      <p className="mt-1 text-sm">
                        Premiered {selectedShow.premiered.slice(0, 4)}
                      </p>
                    )}
                    {(selectedShow.network || selectedShow.webChannel) && (
                      <p className="mt-1 text-sm">
                        {selectedShow.network?.name ??
                          selectedShow.webChannel?.name}
                      </p>
                    )}
                    {selectedShow.genres.length > 0 && (
                      <p className="mt-1 text-sm">
                        {selectedShow.genres.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {show && (
            <div className="detail-card flex gap-4 rounded-lg border p-4">
              {show.imageUrl ? (
                <img
                  src={show.imageUrl}
                  alt={`${show.title} poster`}
                  className="h-28 w-20 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="image-placeholder flex h-28 w-20 shrink-0 items-center justify-center rounded">
                  <ImageOff size={24} />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold">{show.title}</h3>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Select
              required
              id="show-status"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShowStatus)}
              dropdownIcon={<ChevronDown size={18} />}
            >
              <option value="watching">Watching</option>
              <option value="wantToWatch">Want to Watch</option>
              <option value="completed">Completed</option>
              <option value="onHold">On Hold</option>
            </Select>
          </div>

          {canEditProgress && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TextInput
                id="show-season"
                label="Season"
                type="number"
                min="1"
                step="1"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              />
              <TextInput
                id="show-episode"
                label="Episode"
                type="number"
                min="1"
                step="1"
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
              />
            </div>
          )}

          <div className="mt-4">
            <ServiceCombobox value={service} onChange={setService} />
          </div>

          <div className="mt-4">
            <TextInput
              id="show-streaming-profile"
              label="Streaming Profile"
              value={streamingProfile}
              onChange={(e) => setStreamingProfile(e.target.value)}
              helperText="Optional — for example, “Mine,” “Spouse,” or “Kids.”"
            />
          </div>

          <div className="mt-4">
            <Textarea
              id="show-notes"
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-default">
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!show && !selectedShow}
          >
            {show ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddShowModal;
