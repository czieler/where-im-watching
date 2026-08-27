import { useState } from "react";
import {
  Database,
  Shield,
  Trash2,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ComingSoon from "../ComingSoon";
import type { Theme } from "../../types/theme";

type PrivacyView = "main" | "yourData" | "deleteAccount";

type PrivacyDataPageProps = {
  isGuest: boolean;
  theme: Theme;
  onSignIn: () => void;
};

function PrivacyDataPage({ isGuest, theme, onSignIn }: PrivacyDataPageProps) {
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [guestDataCleared, setGuestDataCleared] = useState(false);
  const [privacyView, setPrivacyView] = useState<PrivacyView>("main");

  const handleClearGuestData = () => {
    localStorage.removeItem("guestShows");
    setGuestDataCleared(true);
  };

  if (privacyView === "yourData") {
    return (
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="max-w-4xl">
          <button
            type="button"
            onClick={() => setPrivacyView("main")}
            className="mb-4 text-sm font-medium opacity-70 hover:opacity-100"
          >
            ← Back to Privacy & Data
          </button>

          <ComingSoon
            theme={theme}
            title="Coming next season..."
            message="Your data download isn't streaming yet, but it's on our watchlist for a future release."
          />
        </div>
      </main>
    );
  }

  if (privacyView === "deleteAccount") {
    return (
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="max-w-4xl">
          <button
            type="button"
            onClick={() => setPrivacyView("main")}
            className="mb-4 text-sm font-medium opacity-70 hover:opacity-100"
          >
            ← Back to Privacy & Data
          </button>

          <ComingSoon
            theme={theme}
            title="Coming next season..."
            message="Account deletion isn't streaming yet, but it's on our watchlist for a future release."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="max-w-4xl">
        <div className="mb-7">
          <p className="mt-1 opacity-70">
            Manage your account data and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {/* Your Data */}
          <div className="nav-item flex w-full items-start gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10">
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
                    Your watch list and account data are associated with your
                    Where I&apos;m Watching account.
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrivacyView("yourData")}
                    className="btn btn-default mt-4"
                  >
                    View / Download Your Data
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Privacy */}
          <div className="nav-item rounded-lg border border-black/10 dark:border-white/10">
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
                    : "When signed in, your list and account-related data are associated with your authenticated account."}
                </p>

                <p className="mt-3">
                  Show search information is provided by TVmaze.
                </p>
              </div>
            )}
          </div>

          {/* Data Removal */}
          <div className="nav-item flex w-full items-start gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10">
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
                    Permanently delete your account and its associated data.
                    This cannot be undone.
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrivacyView("deleteAccount")}
                    className="btn btn-default mt-4"
                  >
                    Delete Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PrivacyDataPage;
