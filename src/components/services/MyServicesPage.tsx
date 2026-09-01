import { useState } from "react";
import { Plus } from "lucide-react";
import AccountPageContainer from "../account/AccountPageContainer";
import { TextInput } from "../component-library/TextInput";
import type { StreamingService } from "../../types/streamingService";

type MyServicesPageProps = {
  services: StreamingService[];
  selectedNames: string[];
  isConfigured: boolean;
  isLoading: boolean;
  isGuest: boolean;
  error: string;
  onToggle: (service: StreamingService, selected: boolean) => Promise<void>;
  onAddCustom: (name: string) => Promise<void>;
};

function MyServicesPage({
  services,
  selectedNames,
  isConfigured,
  isLoading,
  isGuest,
  error,
  onToggle,
  onAddCustom,
}: MyServicesPageProps) {
  const [customService, setCustomService] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [localError, setLocalError] = useState("");
  const selected = new Set(selectedNames.map((name) => name.toLowerCase()));

  const handleAdd = async () => {
    const name = customService.trim();
    if (!name || isAdding) return;

    setIsAdding(true);
    setLocalError("");
    try {
      await onAddCustom(name);
      setCustomService("");
    } catch {
      setLocalError("Unable to add that service right now.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AccountPageContainer>
      <p className="mb-2 opacity-70">
        Choose the streaming services you actually use. Add Show will prioritize
        this list instead of making you scroll through services you don't have.
      </p>

      {!isConfigured && (
        <p className="mb-6 text-sm opacity-60">
          You haven't customized this yet, so the app is currently using your
          existing watchlist (or the standard service list) as a fallback.
        </p>
      )}

      {isGuest && (
        <div className="app-section-card mb-6 rounded-lg border p-4 text-sm">
          Guest service preferences are stored only in this browser. Sign in to
          sync them across devices and submit new services for review.
        </div>
      )}

      {(error || localError) && (
        <p className="app-error mb-4 text-sm" role="alert">
          {localError || error}
        </p>
      )}

      {isLoading ? (
        <p role="status">Loading streaming services...</p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => {
            const isSelected = selected.has(service.name.toLowerCase());
            return (
              <label
                key={service.id}
                className="app-section-card flex cursor-pointer items-center gap-3 rounded-lg border p-4"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(event) => void onToggle(service, event.target.checked)}
                />
                <span className="flex-1 font-medium">{service.name}</span>
                {service.moderationStatus !== "verified" && (
                  <span className="rounded-full border px-2 py-1 text-xs opacity-60">
                    {service.moderationStatus === "pending" ? "Pending review" : "Private"}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="app-section-card mt-7 rounded-lg border p-4">
        <h3 className="font-semibold">Don't see your service?</h3>
        <p className="mt-1 text-sm opacity-65">
          Add it here. {isGuest ? "It will stay private to this browser." : "You can use it immediately while it waits for admin review."}
        </p>
        <div className="mt-4 flex h-10 items-stretch gap-2">
          <div className="min-w-0 flex-1 [&_.field]:mb-0 [&_.field]:h-full [&_.field__control]:h-full [&_input]:h-full">
            <TextInput
              id="custom-streaming-service"
              label="Streaming service"
              compact
              value={customService}
              onChange={(event) => setCustomService(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAdd();
                }
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary inline-flex h-full shrink-0 items-center justify-center gap-2 whitespace-nowrap"
            onClick={() => void handleAdd()}
            disabled={!customService.trim() || isAdding}
          >
            <Plus size={16} />
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </AccountPageContainer>
  );
}

export default MyServicesPage;
