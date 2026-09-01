import { ChevronDown, List, X, Tv, Clapperboard, ShieldCheck } from "lucide-react";
import AccountMenu from "../account/AccountMenu";
import type { AccountPage } from "../account/AccountMenu";
import type { Theme } from "../../types/theme";

type Page = "list" | "services" | "roadmap" | "admin" | "profile" | "help" | "privacy";

type MobileMenuProps = {
  currentPage: Page;
  accountPage: AccountPage | null;
  isAccountOpen: boolean;
  isGuest: boolean;
  theme: Theme;
  isAdmin: boolean;
  pendingAdminCount: number;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
  onToggleAccount: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onThemeChange: (theme: Theme) => void;
};

function MobileMenu({
  currentPage,
  accountPage,
  isAccountOpen,
  isGuest,
  theme,
  isAdmin,
  pendingAdminCount,
  onClose,
  onSelectPage,
  onToggleAccount,
  onSignOut,
  onSignIn,
  onThemeChange,
}: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="mobile-menu-overlay absolute inset-0" onClick={onClose} />

      <aside className="mobile-menu absolute left-0 top-0 h-full w-72 p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Where I'm Watching</h2>

          <button type="button" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectPage("list")}
          className={`nav-item mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium ${
            currentPage === "list" ? "nav-item-active" : ""
          }`}
        >
          <List className="h-5 w-5" />
          <span>My List</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPage("services")}
          className={`nav-item mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium ${currentPage === "services" ? "nav-item-active" : ""}`}
        >
          <Tv className="h-5 w-5" />
          <span>My Services</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPage("roadmap")}
          className={`nav-item mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium ${currentPage === "roadmap" ? "nav-item-active" : ""}`}
        >
          <Clapperboard className="h-5 w-5" />
          <span>Coming Soon</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onSelectPage("admin")}
            className={`nav-item mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium ${currentPage === "admin" ? "nav-item-active" : ""}`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="flex flex-1 items-center justify-between">Admin{pendingAdminCount > 0 && <span className="rounded-full border px-2 py-0.5 text-xs">{pendingAdminCount}</span>}</span>
          </button>
        )}

        <div className="mb-6">
          <AccountMenu
            currentPage={accountPage}
            isOpen={isAccountOpen}
            isGuest={isGuest}
            onToggle={onToggleAccount}
            onSelect={onSelectPage}
            onSignOut={onSignOut}
            onSignIn={onSignIn}
          />
        </div>

        <label htmlFor="mobile-theme" className="mb-2 block font-semibold">
          Theme
        </label>

        <div className="relative">
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as Theme)}
            id="mobile-theme"
            className="theme-select w-full appearance-none rounded-lg border px-3 py-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="blues">Blues</option>
          </select>

          <ChevronDown
            size={16}
            className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </aside>
    </div>
  );
}

export default MobileMenu;
