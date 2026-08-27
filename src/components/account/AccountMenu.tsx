import {
  User,
  IdCard,
  CircleHelp,
  Shield,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type Page = "list" | "profile" | "help" | "privacy";

type AccountMenuProps = {
  currentPage: Page;
  isOpen: boolean;
  collapsed?: boolean;
  onToggle: () => void;
  onSelect: (page: Page) => void;
};

function AccountMenu({
  currentPage,
  isOpen,
  collapsed = false,
  onToggle,
  onSelect,
}: AccountMenuProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`nav-item flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
          currentPage !== "list" ? "nav-item-active" : ""
        }`}
        title={collapsed ? "Account" : undefined}
      >
        <User className="h-5 w-5 shrink-0" />

        {!collapsed && (
          <>
            <span className="flex-1">Account</span>

            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </>
        )}
      </button>

      {!collapsed && isOpen && (
        <div className="ml-5 mt-1 border-l pl-3">
          <button
            type="button"
            onClick={() => onSelect("profile")}
            className={`nav-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
              currentPage === "profile" ? "nav-item-active" : ""
            }`}
          >
            <IdCard size={15} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("help")}
            className={`nav-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
              currentPage === "help" ? "nav-item-active" : ""
            }`}
          >
            <CircleHelp size={15} />
            <span>Help & Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("privacy")}
            className={`nav-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
              currentPage === "privacy" ? "nav-item-active" : ""
            }`}
          >
            <Shield size={15} />
            <span>Privacy & Data</span>
          </button>

          <button
            type="button"
            className="nav-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
