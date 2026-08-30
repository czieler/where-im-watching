import { useId, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
  requiredIndicatorPosition?: "bottom" | "left";
};

export function Textarea({
  label,
  error,
  helperText,
  requiredIndicatorPosition = "bottom",
  id: providedId,
  className = "",
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  ...textareaProps
}: TextareaProps) {
  const id = useId();
  const textareaId = providedId ?? id;
  const messageId = `${id}-message`;
  const describedBy =
    [ariaDescribedby, error || helperText ? messageId : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      className={`field ${textareaProps.required ? `field--required field--required-${requiredIndicatorPosition}` : ""} ${textareaProps.disabled ? "field--disabled" : ""} ${error ? "field--error" : ""}`}
    >
      <div className="field__control">
        <textarea
          {...textareaProps}
          id={textareaId}
          className={className}
          placeholder=" "
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy}
        />
        <label htmlFor={textareaId}>
          {label}
          {textareaProps.required && <span aria-hidden="true"> *</span>}
        </label>
      </div>
      {(error || helperText) && (
        <small id={messageId} className="field__message">
          {error || helperText}
        </small>
      )}
    </div>
  );
}
