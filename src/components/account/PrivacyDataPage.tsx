import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Database,
  Shield,
  Trash2,
  LogIn,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import AccountPageContainer from "./AccountPageContainer";
import { TextInput } from "../component-library/TextInput";

type PrivacyDataPageProps = {
  isGuest: boolean;
  user: User | null;
  onSignIn: () => void;
  onClearGuestData: () => void;
  onDeleteAccount: () => Promise<void>;
};

function PrivacyDataPage({
  isGuest,
  user,
  onSignIn,
  onClearGuestData,
  onDeleteAccount,
}: PrivacyDataPageProps) {
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [guestDataCleared, setGuestDataCleared] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleClearGuestData = () => {
    onClearGuestData();
    setGuestDataCleared(true);
  };

  const handleDownloadData = async () => {
    if (!user || isDownloading) {
      return;
    }

    setDownloadError("");
    setIsDownloading(true);

    try {
      const { data, error } = await supabase
        .from("user_shows")
        .select(
          "show_id, title, service, status, image_url, season, episode, streaming_profile, notes, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        account: {
          email: user.email ?? null,
          createdAt: user.created_at,
        },
        watchlist: data ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `where-im-watching-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to download account data:", error);
      setDownloadError("Unable to download your data right now.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE" || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      await onDeleteAccount();
    } catch (error) {
      console.error("Unable to delete account:", error);
      setDeleteError("Unable to delete your account right now. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <AccountPageContainer>
        <div className="mb-7">
          <p className="mt-1 opacity-70">
            Manage your account data and privacy.
          </p>
        </div>

        <div className="space-y-3">
          <div className="nav-item flex w-full items-start gap-4 rounded-lg border app-section-card p-4 text-left">
            <Database size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="font-semibold">Your Data</div>

              {isGuest ? (
                <>
                  <div className="mt-1 text-sm leading-6 opacity-70">
                    Your watch list and app data are stored only in this browser
                    while you&apos;re using Guest Mode.
                  </div>

                  <button
                    type="button"
                    onClick={onSignIn}
                    className="auth-link mt-3 flex items-center gap-2 text-sm font-semibold"
                  >
                    <LogIn size={15} />
                    Sign in or create an account to sync your data
                  </button>
                </>
              ) : (
                <>
                  <div className="mt-1 text-sm leading-6 opacity-70">
                    Download a copy of your account information and saved
                    watchlist as a JSON file.
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadData}
                    disabled={isDownloading}
                    className="btn btn-default mt-4 flex items-center gap-2"
                  >
                    <Download size={16} />
                    {isDownloading ? "Preparing..." : "Download My Data"}
                  </button>

                  {downloadError && (
                    <p className="app-error mt-3 text-sm" role="alert">
                      {downloadError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="nav-item rounded-lg border app-section-card">
            <button
              type="button"
              onClick={() => setShowPrivacyInfo((current) => !current)}
              className="flex w-full items-start gap-4 p-4 text-left"
              aria-expanded={showPrivacyInfo}
            >
              <Shield size={20} className="mt-0.5 shrink-0" />

              <div className="flex-1">
                <div className="font-semibold">Privacy</div>

                <div className="mt-1 text-sm leading-6 opacity-70">
                  Learn how Where I&apos;m Watching stores and uses your data.
                </div>
              </div>

              {showPrivacyInfo ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

            {showPrivacyInfo && (
              <div className="px-4 pb-4 pl-12 text-sm leading-6 opacity-70">
                <p>
                  Where I&apos;m Watching stores only the information needed to
                  provide the app&apos;s features.
                </p>

                <p className="mt-3">
                  {isGuest
                    ? "In Guest Mode, your list is stored locally in this browser and is not synced to an account."
                    : "When signed in, your list and account-related data are associated with your authenticated account and stored in Supabase."}
                </p>

                <p className="mt-3">
                  Show search information and artwork are provided by{" "}
                  <a
                    href="https://www.tvmaze.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline"
                  >
                    TVmaze
                  </a>
                  . Authentication emails are delivered through Resend.
                </p>
              </div>
            )}
          </div>

          <div className="nav-item flex w-full items-start gap-4 rounded-lg border app-section-card p-4 text-left">
            <Trash2 size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="font-semibold">
                {isGuest ? "Clear Guest Data" : "Delete Account"}
              </div>

              {isGuest ? (
                <>
                  <div className="mt-1 text-sm leading-6 opacity-70">
                    Remove the Where I&apos;m Watching list stored in this
                    browser.
                  </div>

                  <button
                    type="button"
                    onClick={handleClearGuestData}
                    className="btn btn-default mt-4"
                  >
                    Clear Guest Data
                  </button>

                  {guestDataCleared && (
                    <p className="mt-3 text-sm opacity-70" role="status">
                      Guest data has been cleared.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="mt-1 text-sm leading-6 opacity-70">
                    Permanently delete your account and saved watchlist. This
                    cannot be undone.
                  </div>

                  {!showDeleteConfirmation ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="btn btn-default mt-4"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="mt-4 max-w-lg rounded-lg border app-section-card p-4">
                      <p className="text-sm font-semibold">
                        Type DELETE to confirm permanent account deletion.
                      </p>

                      <div className="mt-4">
                        <TextInput
                          id="delete-account-confirmation"
                          required
                          value={deleteConfirmation}
                          onChange={(event) =>
                            setDeleteConfirmation(event.target.value)
                          }
                          label="Type DELETE"
                          autoComplete="off"
                        />
                      </div>

                      {deleteError && (
                        <p className="app-error mt-3 text-sm" role="alert">
                          {deleteError}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={
                            deleteConfirmation !== "DELETE" || isDeleting
                          }
                          className="btn btn-primary"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Permanently Delete Account"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmation("");
                            setDeleteError("");
                          }}
                          disabled={isDeleting}
                          className="btn btn-default"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
    </AccountPageContainer>
  );
}

export default PrivacyDataPage;
