import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type PrettySelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

function PrettySelect({
  id,
  label,
  className = "",
  children,
  ...props
}: PrettySelectProps) {
  return (
    <div className="pretty-select">
      <select id={id} className={`app-select ${className}`} {...props}>
        {children}
      </select>

      <label htmlFor={id}>{label}</label>

      <ChevronDown size={16} className="select-chevron pointer-events-none" />
    </div>
  );
}

export default PrettySelect;
