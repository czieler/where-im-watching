import type { User } from "@supabase/supabase-js";
import { KeyRound, UserRound } from "lucide-react";

type ProfilePageProps = {
  user: User | null;
  isGuest: boolean;
  onSignIn: () => void;
};

function ProfilePage({ user, isGuest, onSignIn }: ProfilePageProps) {
  if (isGuest) {
    return (
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="max-w-4xl">
          <div className="mb-7">
            <p className="mt-1 opacity-70">
              You're currently using Where I'm Watching as a guest.
            </p>
          </div>

          <div className="nav-item flex w-full items-start gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10">
            <UserRound size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="font-semibold">Guest Mode</div>

              <div className="mt-1 text-sm leading-6 opacity-70">
                Your list is stored in this browser. Create an account or sign
                in to save your data to your account and sync it across devices.
              </div>

              <button
                type="button"
                onClick={onSignIn}
                className="btn btn-primary mt-4"
              >
                Sign In or Create Account
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="max-w-4xl">
        <div className="mb-7">
          <p className="mt-1 opacity-70">Manage your account information.</p>
        </div>

        <div className="rounded-xl border border-black/10 p-6 sm:p-8 dark:border-white/10">
          <div className="max-w-2xl space-y-6">
            <div className="pretty-placeholder">
              <input
                required
                id="email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="app-input w-full rounded-lg border px-4 py-2.5 outline-none"
              />

              <label htmlFor="email">Email</label>
            </div>

            <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
              <div className="flex items-start gap-3">
                <KeyRound size={20} className="mt-0.5 shrink-0" />

                <div className="flex-1">
                  <h3 className="font-semibold">Password</h3>

                  <p className="mt-1 text-sm opacity-70">
                    Change the password you use to sign in.
                  </p>
                </div>

                <button type="button" className="btn btn-default">
                  Change
                </button>
              </div>
            </div>

            <button type="button" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
