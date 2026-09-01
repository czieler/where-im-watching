import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ChevronDown, ImageOff } from "lucide-react";
import { useMemo, useState } from "react";
import { LAST_SERVICE_KEY } from "../services/streamingServices";
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
  serviceOptions: string[];
  onClose: () => void;
  onSave: (show: NewShow) => boolean | Promise<boolean>;
  onServiceUsed?: (service: string) => void | Promise<void>;
};

function AddShowModal({
  show,
  initialStatus = "watching",
  serviceOptions,
  onClose,
  onSave,
  onServiceUsed,
}: AddShowModalProps) {
  const [title, setTitle] = useState(show?.title ?? "");
  const [status, setStatus] = useState<ShowStatus>(initialStatus);
  const defaultService = useMemo(() => {
    if (show?.service) return show.service;
    const lastService = localStorage.getItem(LAST_SERVICE_KEY);
    if (lastService && serviceOptions.includes(lastService)) return lastService;
    return serviceOptions[0] ?? "";
  }, [serviceOptions, show?.service]);
  const [service, setService] = useState(defaultService);
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
  const [addAnother, setAddAnother] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { searchResults, isSearching, searchError } = useShowSearch(
    selectedShow ? "" : title,
  );

  const handleShowSelected = (selected: TVMazeShow | null) => {
    setSelectedShow(selected);
    if (selected) {
      setTitle(selected.name);
      setSubmitError("");
    }
  };

  const resetForAnother = () => {
    setTitle("");
    setSelectedShow(null);
    setSeason("");
    setEpisode("");
    setStreamingProfile("");
    setNotes("");
  };

  const handleSubmit = async () => {
    const parseProgress = (value: string) =>
      value === "" ? undefined : Number(value);
    const cleanOptionalText = (value: string) => value.trim() || undefined;
    const cleanService = service.trim();

    if (!show && !selectedShow) {
      setSubmitError("Please select a show from the search results.");
      return;
    }

    if (!cleanService) {
      setSubmitError("Please choose or enter a streaming service.");
      return;
    }

    setSubmitError("");
    setIsSaving(true);

    try {
      const payload: NewShow = show
        ? {
            ...show,
            service: cleanService,
            status,
            season: parseProgress(season),
            episode: parseProgress(episode),
            streamingProfile: cleanOptionalText(streamingProfile),
            notes: cleanOptionalText(notes),
          }
        : {
            id: selectedShow!.id,
            title: selectedShow!.name,
            service: cleanService,
            status,
            imageUrl:
              selectedShow!.image?.medium ?? selectedShow!.image?.original,
            season: parseProgress(season),
            episode: parseProgress(episode),
            streamingProfile: cleanOptionalText(streamingProfile),
            notes: cleanOptionalText(notes),
          };

      const saved = await onSave(payload);
      if (!saved) {
        setSubmitError(
          show
            ? "Unable to save your changes. Please try again."
            : "Unable to add this show. It may already be in your list.",
        );
        return;
      }

      localStorage.setItem(LAST_SERVICE_KEY, cleanService);
      try {
        await onServiceUsed?.(cleanService);
      } catch (serviceError) {
        console.error("Show saved, but the streaming-service preference could not be updated:", serviceError);
      }

      if (!show && addAnother) {
        resetForAnother();
      } else {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canEditProgress = status === "watching" || status === "onHold";

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        className="modal max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">{show ? "Edit Show" : "Add Show"}</h2>

        <div className="mt-6">
          {!show && (
            <>
              <Combobox immediate value={selectedShow} onChange={handleShowSelected}>
                <div className="pretty-placeholder relative">
                  <ComboboxInput
                    id="show-title"
                    required
                    className="app-input rounded-lg border"
                    placeholder=" "
                    displayValue={(value: TVMazeShow | null) => value?.name ?? title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setSelectedShow(null);
                    }}
                  />
                  <label htmlFor="show-title">Show Title</label>

                  <ComboboxOptions className="search-results absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border shadow-lg empty:hidden">
                    {isSearching && <div className="p-3 text-sm">Searching...</div>}
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
                                  {result.network?.name ?? result.webChannel?.name}
                                </>
                              )}
                            </div>
                          </div>
                        </ComboboxOption>
                      ))}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {searchError && (
                <p className="app-error mt-2 text-sm" role="alert">
                  {searchError}
                </p>
              )}

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
                        {selectedShow.network?.name ?? selectedShow.webChannel?.name}
                      </p>
                    )}
                    {selectedShow.genres.length > 0 && (
                      <p className="mt-1 text-sm">{selectedShow.genres.join(" · ")}</p>
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
              onChange={(event) => setStatus(event.target.value as ShowStatus)}
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
                onChange={(event) => setSeason(event.target.value)}
              />
              <TextInput
                id="show-episode"
                label="Episode"
                type="number"
                min="1"
                step="1"
                value={episode}
                onChange={(event) => setEpisode(event.target.value)}
              />
            </div>
          )}

          <div className="mt-4">
            <ServiceCombobox
              value={service}
              services={serviceOptions}
              onChange={(nextService) => {
                setService(nextService);
                if (nextService.trim()) setSubmitError("");
              }}
            />
          </div>

          <div className="mt-4">
            <TextInput
              id="show-streaming-profile"
              label="Streaming Profile"
              value={streamingProfile}
              onChange={(event) => setStreamingProfile(event.target.value)}
              helperText="Optional — for example, “Mine,” “Spouse,” or “Kids.”"
            />
          </div>

          <div className="mt-4">
            <Textarea
              id="show-notes"
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </div>
        </div>

        {submitError && (
          <p className="app-error mt-4 text-sm" role="alert">
            {submitError}
          </p>
        )}

        {!show && (
          <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={addAnother}
              onChange={(event) => setAddAnother(event.target.checked)}
            />
            <span>Add another show after saving</span>
          </label>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-default"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : show ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddShowModal;
