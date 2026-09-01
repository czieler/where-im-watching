import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
  clearIcon?: ReactNode;
  requiredIndicatorPosition?: "bottom" | "left";
  compact?: boolean;
};

export function TextInput({
  label,
  error,
  helperText,
  clearable = false,
  onClear,
  clearIcon = "×",
  requiredIndicatorPosition = "bottom",
  compact = false,
  id: providedId,
  className = "",
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  ...inputProps
}: TextInputProps) {
  const id = useId();
  const inputId = providedId ?? id;
  const messageId = `${id}-message`;

  const describedBy =
    [ariaDescribedby, error || helperText ? messageId : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={`field ${
        inputProps.required
          ? `field--required field--required-${requiredIndicatorPosition}`
          : ""
      } ${inputProps.disabled ? "field--disabled" : ""} ${
        error ? "field--error" : ""
      } ${compact ? "field--compact" : ""}`}
    >
      <div className="field__control">
        <input
          {...inputProps}
          id={inputId}
          className={className}
          placeholder=" "
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy}
        />

        <label htmlFor={inputId}>
          {label}
          {inputProps.required && <span aria-hidden="true"> *</span>}
        </label>

        {clearable && inputProps.value && !inputProps.disabled && (
          <button
            className="field__clear"
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label}`}
          >
            <span aria-hidden="true">{clearIcon}</span>
          </button>
        )}
      </div>

      {(error || helperText) && (
        <small id={messageId} className="field__message">
          {error || helperText}
        </small>
      )}
    </div>
  );
}
