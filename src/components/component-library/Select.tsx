import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  dropdownIcon?: ReactNode;
  requiredIndicatorPosition?: "bottom" | "left";
};

export function Select({
  label,
  options,
  error,
  helperText,
  dropdownIcon,
  requiredIndicatorPosition = "bottom",
  id: providedId,
  className = "",
  children,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  ...selectProps
}: SelectProps) {
  const id = useId();
  const selectId = providedId ?? id;
  const messageId = `${id}-message`;

  const describedBy =
    [ariaDescribedby, error || helperText ? messageId : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  const optionNodes: ReactNode = options?.map((option) => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  ));

  return (
    <div
      className={`field ${
        selectProps.required
          ? `field--required field--required-${requiredIndicatorPosition}`
          : ""
      } ${selectProps.disabled ? "field--disabled" : ""} ${
        error ? "field--error" : ""
      }`}
    >
      <div className="field__control field__control--select">
        <select
          {...selectProps}
          id={selectId}
          className={className}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy}
        >
          {options && (
            <option value="" disabled>
              Select one
            </option>
          )}

          {optionNodes}
          {children}
        </select>

        <label htmlFor={selectId}>
          {label}
          {selectProps.required && <span aria-hidden="true"> *</span>}
        </label>

        {dropdownIcon && (
          <span className="field__select-icon" aria-hidden="true">
            {dropdownIcon}
          </span>
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
