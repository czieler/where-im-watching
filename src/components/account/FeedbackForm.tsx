import type { FormEvent, ReactNode } from "react";

type FeedbackFormProps = {
  children: ReactNode;
  submitLabel: string;
  isSubmitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function FeedbackForm({
  children,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: FeedbackFormProps) {
  return (
    <form className="max-w-2xl space-y-6" onSubmit={onSubmit}>
      {children}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="btn btn-default"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="app-error text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default FeedbackForm;
