import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import wiwLogo from "../assets/wiw_logo.png";

type AuthMode = "signIn" | "signUp" | "forgotPassword";

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === "signUp";
  const isForgotPassword = mode === "forgotPassword";

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
                onClick={() => setMode("signIn")}
                className={`auth-tab flex-1 pb-3 font-semibold ${
                  mode === "signIn" ? "active" : ""
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setMode("signUp")}
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

          <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
            <div className="pretty-placeholder">
              <input
                id="auth-email"
                required
                type="email"
                className="app-input border"
                placeholder=" "
              />
              <label htmlFor="auth-email">Email</label>
            </div>

            {!isForgotPassword && (
              <div className="pretty-placeholder relative mt-4">
                <input
                  id="auth-password"
                  required
                  type={showPassword ? "text" : "password"}
                  className="app-input border pr-12"
                  placeholder=" "
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

            {isSignUp && !isForgotPassword && (
              <div className="pretty-placeholder mt-4">
                <input
                  required
                  id="auth-confirm-password"
                  type="password"
                  className="app-input border"
                  placeholder=" "
                />
                <label htmlFor="auth-confirm-password">Confirm Password</label>
              </div>
            )}

            {mode === "signIn" && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgotPassword")}
                  className="auth-link text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary mt-6 w-full">
              {isForgotPassword
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

              <button type="button" className="btn btn-default w-full">
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
              onClick={() => setMode("signIn")}
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
