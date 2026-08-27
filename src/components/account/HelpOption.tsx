import type { LucideIcon } from "lucide-react";

type HelpOptionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
};

function HelpOption({
  icon: Icon,
  title,
  description,
  onClick,
}: HelpOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="nav-item flex w-full items-center gap-4 rounded-lg border border-black/10 p-4 text-left dark:border-white/10"
    >
      <Icon size={20} />

      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm opacity-70">{description}</div>
      </div>

      <span className="text-xl opacity-50">›</span>
    </button>
  );
}

export default HelpOption;
