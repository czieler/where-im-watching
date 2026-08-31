import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { KeyRound, UserRound } from "lucide-react";
import PasswordUpdateForm from "../PasswordUpdateForm";
import AccountPageContainer from "./AccountPageContainer";
import { TextInput } from "../component-library/TextInput";

type ProfilePageProps = {
  user: User | null;
  isGuest: boolean;
  onSignIn: () => void;
};

function ProfilePage({ user, isGuest, onSignIn }: ProfilePageProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (isGuest) {
    return (
      <AccountPageContainer>
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
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer>
        <div className="mb-7">
          <p className="mt-1 opacity-70">Manage your account information.</p>
        </div>

        <div className="rounded-xl border border-black/10 p-6 sm:p-8 dark:border-white/10">
          <div className="max-w-2xl space-y-6">
            <TextInput
              id="email"
              type="email"
              value={user?.email ?? ""}
              readOnly
              label="Email"
            />

            <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
              <div className="flex items-start gap-3">
                <KeyRound size={20} className="mt-0.5 shrink-0" />

                <div className="flex-1">
                  <h3 className="font-semibold">Password</h3>

                  <p className="mt-1 text-sm opacity-70">
                    Change the password you use to sign in.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() =>
                    setIsChangingPassword((current) => !current)
                  }
                >
                  {isChangingPassword ? "Cancel" : "Change"}
                </button>
              </div>

              {isChangingPassword && (
                <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
                  <PasswordUpdateForm
                    onSuccess={() => setIsChangingPassword(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
    </AccountPageContainer>
  );
}

export default ProfilePage;
