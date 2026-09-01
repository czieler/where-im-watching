import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Merge, RefreshCw, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { StreamingService } from "../../types/streamingService";
import AccountPageContainer from "../account/AccountPageContainer";
import { Select } from "../component-library/Select";

type PendingService = StreamingService & {
  createdAt?: string;
};

type AdminServicesPageProps = {
  verifiedServices: StreamingService[];
  onCatalogChanged: () => Promise<void>;
};

function AdminServicesPage({
  verifiedServices,
  onCatalogChanged,
}: AdminServicesPageProps) {
  const [pending, setPending] = useState<PendingService[]>([]);
  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-services",
        { body: { action: "list" } },
      );
      if (invokeError) throw invokeError;
      setPending((data?.services ?? []) as PendingService[]);
    } catch (loadError) {
      console.error("Unable to load pending services:", loadError);
      setError("Unable to load pending services.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  const verifiedOptions = useMemo(
    () => [...verifiedServices].sort((a, b) => a.name.localeCompare(b.name)),
    [verifiedServices],
  );

  const runAction = async (
    serviceId: string,
    action: "approve" | "reject" | "merge",
  ) => {
    setBusyId(serviceId);
    setError("");
    try {
      const body: Record<string, string> = { serviceId, action };
      if (action === "merge") {
        const targetId = mergeTargets[serviceId];
        if (!targetId) {
          setError("Choose a verified service to merge into first.");
          return;
        }
        body.mergeIntoId = targetId;
      }

      const { error: invokeError } = await supabase.functions.invoke(
        "admin-services",
        { body },
      );
      if (invokeError) throw invokeError;

      await Promise.all([loadPending(), onCatalogChanged()]);
    } catch (actionError) {
      console.error("Unable to review streaming service:", actionError);
      setError("Unable to update that service.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AccountPageContainer>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="opacity-70">
            Review user-submitted streaming services before they become part of
            the shared catalog.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-default flex items-center gap-2"
          onClick={() => void loadPending()}
          disabled={isLoading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <p className="app-error mb-4 text-sm" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p role="status">Loading pending services...</p>
      ) : pending.length === 0 ? (
        <div className="app-section-card rounded-lg border p-6 text-center">
          <div className="font-semibold">Nothing waiting for review.</div>
          <p className="mt-1 text-sm opacity-60">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((service) => (
            <div key={service.id} className="app-section-card rounded-lg border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="mt-1 text-sm opacity-60">
                    Submitted {service.submissionCount ?? 1} time
                    {(service.submissionCount ?? 1) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => void runAction(service.id, "approve")}
                    disabled={busyId === service.id}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-default flex items-center gap-2"
                    onClick={() => void runAction(service.id, "reject")}
                    disabled={busyId === service.id}
                  >
                    <X size={16} /> Keep Private
                  </button>
                </div>
              </div>

              {verifiedOptions.length > 0 && (
                <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto] [&_.field]:mb-0">
                  <Select
                    id={`merge-${service.id}`}
                    label="Merge with existing service"
                    value={mergeTargets[service.id] ?? ""}
                    onChange={(event) =>
                      setMergeTargets((current) => ({
                        ...current,
                        [service.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Choose a service...</option>
                    {verifiedOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    className="btn btn-default inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    onClick={() => void runAction(service.id, "merge")}
                    disabled={busyId === service.id || !mergeTargets[service.id]}
                  >
                    <Merge size={16} /> Merge
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AccountPageContainer>
  );
}

export default AdminServicesPage;
