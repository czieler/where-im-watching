import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import wiwLogo from "../assets/wiw_logo.png";
import { supabase } from "../lib/supabaseClient";

type AuthMode = "signIn" | "signUp" | "forgotPassword";

type AuthScreenProps = {
  onGuestContinue: () => void;
  onAuthSuccess: () => void;
};

function AuthScreen({ onGuestContinue, onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isSignUp = mode === "signUp";
  const isForgotPassword = mode === "forgotPassword";

  const clearMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearMessages();
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearMessages();
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setMessage(
          "If an account exists for that email, a password reset link has been sent.",
        );

        return;
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          onAuthSuccess();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm your account before signing in.",
        );

        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      onAuthSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8">
      <div className="auth-card grid w-full max-w-4xl overflow-hidden rounded-2xl border shadow-lg md:grid-cols-2">
        {/* Intro */}
        <div className="auth-intro flex flex-col justify-center p-8 md:p-10">
          <img
            src={wiwLogo}
            alt="Where I'm Watching"
            className="mb-6 h-20 w-20 object-contain"
          />

          <h1 className="text-3xl font-bold">Where I'm Watching</h1>

          <p className="text-muted mt-4">
            Keep track of what you're watching, where you're watching it, and
            what you want to watch next.
          </p>

          <div className="mt-8 space-y-4">
            <p>✓ Track shows across streaming services</p>
            <p>✓ Organize Watching, Want to Watch, Completed, and On Hold</p>
            <p>✓ Search and add shows with TVmaze</p>
            <p>✓ Sync your list across devices</p>
          </div>
        </div>

        {/* Auth form */}
        <div className="auth-form p-8 md:p-10">
          {!isForgotPassword && (
            <div className="mb-8 flex border-b">
              <button
                type="button"
                onClick={() => changeMode("signIn")}
                className={`auth-tab flex-1 pb-3 font-semibold ${
                  mode === "signIn" ? "active" : ""
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => changeMode("signUp")}
                className={`auth-tab flex-1 pb-3 font-semibold ${
                  mode === "signUp" ? "active" : ""
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold">
            {isForgotPassword
              ? "Reset your password"
              : isSignUp
                ? "Create your account"
                : "Welcome back"}
          </h2>

          <p className="text-muted mt-2">
            {isForgotPassword
              ? "Enter your email and we'll send you a link to reset your password."
              : isSignUp
                ? "Create an account to save and sync your watchlist."
                : "Sign in to continue to your watchlist."}
          </p>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="pretty-placeholder">
              <input
                id="auth-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-input border"
                placeholder=" "
                autoComplete="email"
              />

              <label htmlFor="auth-email">Email</label>
            </div>

            {!isForgotPassword && (
              <div className="pretty-placeholder relative mt-4">
                <input
                  id="auth-password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input border pr-12"
                  placeholder=" "
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />

                <label htmlFor="auth-password">Password</label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="themed-icon absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {isSignUp && (
              <div className="pretty-placeholder mt-4">
                <input
                  required
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input border"
                  placeholder=" "
                  autoComplete="new-password"
                />

                <label htmlFor="auth-confirm-password">Confirm Password</label>
              </div>
            )}

            {mode === "signIn" && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => changeMode("forgotPassword")}
                  className="auth-link text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 text-sm" role="alert">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="mt-4 text-sm" role="status">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary mt-6 w-full"
            >
              {isSubmitting
                ? "Please wait..."
                : isForgotPassword
                  ? "Send Reset Link"
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
            </button>
          </form>

          {!isForgotPassword ? (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="auth-divider h-px flex-1" />
                <span className="text-muted text-sm">or</span>
                <div className="auth-divider h-px flex-1" />
              </div>

              <button
                type="button"
                onClick={onGuestContinue}
                className="btn btn-default w-full"
              >
                Continue as Guest
              </button>

              <p className="text-muted mt-3 text-center text-xs leading-relaxed">
                Guest data is stored in this browser and may be lost if browser
                or site data is cleared. Create an account anytime to save and
                sync your list.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => changeMode("signIn")}
              className="auth-link mt-6 w-full text-center text-sm font-medium"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
