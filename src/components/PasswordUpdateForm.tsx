import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type PasswordUpdateFormProps = {
  submitLabel?: string;
  onSuccess?: () => void;
};

function PasswordUpdateForm({
  submitLabel = "Update Password",
  onSuccess,
}: PasswordUpdateFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage("Your password has been updated.");
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="pretty-placeholder relative">
        <input
          id="new-password"
          required
          minLength={8}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="app-input border pr-12"
          placeholder=" "
          autoComplete="new-password"
        />
        <label htmlFor="new-password">New Password</label>

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="themed-icon absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="pretty-placeholder mt-4">
        <input
          id="confirm-new-password"
          required
          minLength={8}
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="app-input border"
          placeholder=" "
          autoComplete="new-password"
        />
        <label htmlFor="confirm-new-password">Confirm New Password</label>
      </div>

      {errorMessage && (
        <p className="app-error mt-4 text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary mt-6"
      >
        {isSubmitting ? "Updating..." : submitLabel}
      </button>
    </form>
  );
}

export default PasswordUpdateForm;
