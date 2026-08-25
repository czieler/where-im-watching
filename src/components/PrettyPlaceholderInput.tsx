import type { InputHTMLAttributes } from "react";

type PrettyPlaceholderInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function PrettyPlaceholderInput({
  id,
  label,
  className = "",
  ...props
}: PrettyPlaceholderInputProps) {
  return (
    <div className="pretty-placeholder">
      <input
        id={id}
        placeholder=" "
        className={`app-input ${className}`}
        {...props}
      />

      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default PrettyPlaceholderInput;
