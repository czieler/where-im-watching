import { Database, Shield, Trash2 } from "lucide-react";

function PrivacyDataPage() {
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

              <div className="text-sm opacity-70">
                Your shows, services, watch statuses, and account preferences
                are associated with your account.
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="nav-item flex w-full items-start gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10">
            <Shield size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="font-semibold">Privacy</div>

              <div className="text-sm opacity-70">
                Learn how Where I'm Watching stores and uses your account
                information.
              </div>

              <button type="button" className="btn btn-default mt-4">
                View Privacy Information
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="nav-item flex w-full items-start gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10">
            <Trash2 size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="font-semibold">Delete Account</div>

              <div className="text-sm opacity-70">
                Permanently delete your account and its associated data. This
                cannot be undone.
              </div>

              <button type="button" className="btn btn-default mt-4">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PrivacyDataPage;
