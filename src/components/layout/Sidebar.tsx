import { ChevronDown, List, Palette, User as UserIcon } from "lucide-react";
import wiwLogo from "../../assets/wiw_logo.png";
import AccountMenu from "../account/AccountMenu";
import type { AccountPage } from "../account/AccountMenu";
import type { Theme } from "../../types/theme";

type Page = "list" | "profile" | "help" | "privacy";

type SidebarProps = {
  currentPage: Page;
  accountPage: AccountPage | null;
  isAccountOpen: boolean;
  isGuest: boolean;
  isCollapsed: boolean;
  isThemeMenuOpen: boolean;
  theme: Theme;
  onSelectPage: (page: Page) => void;
  onToggleAccount: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onToggleCollapse: () => void;
  onToggleThemeMenu: () => void;
  onThemeChange: (theme: Theme) => void;
  onCloseThemeMenu: () => void;
};

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "blues", label: "Blues" },
];

function Sidebar({
  currentPage,
  accountPage,
  isAccountOpen,
  isGuest,
  isCollapsed,
  isThemeMenuOpen,
  theme,
  onSelectPage,
  onToggleAccount,
  onSignOut,
  onSignIn,
  onToggleCollapse,
  onToggleThemeMenu,
  onThemeChange,
  onCloseThemeMenu,
}: SidebarProps) {
  return (
    <aside
      className={`app-sidebar fixed inset-y-0 left-0 hidden border-r transition-all duration-200 md:flex md:flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="app-sidebar-header border-b px-4 py-6">
        <div className="flex items-center gap-3">
          <img
            src={wiwLogo}
            alt="Where I'm Watching"
            className="h-12 w-12 shrink-0 object-contain"
          />

          {!isCollapsed && (
            <h1 className="text-xl font-bold">Where I'm Watching</h1>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        <button
          type="button"
          onClick={() => onSelectPage("list")}
          className={`nav-item flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
            currentPage === "list" ? "nav-item-active" : ""
          }`}
          title={isCollapsed ? "My List" : undefined}
        >
          <List className="h-5 w-5 shrink-0" />

          {!isCollapsed && <span>My List</span>}
        </button>

        <AccountMenu
          currentPage={accountPage}
          isOpen={isAccountOpen}
          isGuest={isGuest}
          collapsed={isCollapsed}
          onToggle={onToggleAccount}
          onSelect={onSelectPage}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />

        <div className="mt-auto">
          <div className="px-4 py-4">
            {isCollapsed ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={onToggleThemeMenu}
                  className="nav-item flex w-full items-center justify-center"
                  title="Theme"
                  aria-label="Theme"
                  aria-expanded={isThemeMenuOpen}
                >
                  <Palette className="h-5 w-5" />
                </button>

                {isThemeMenuOpen && (
                  <div className="theme-mini-menu absolute bottom-0 left-full z-50 ml-4 w-36 overflow-hidden rounded-lg border shadow-lg">
                    {themes.map((themeOption) => (
                      <button
                        type="button"
                        key={themeOption.value}
                        onClick={() => {
                          onThemeChange(themeOption.value);
                          onCloseThemeMenu();
                        }}
                        className={`theme-mini-menu-item ${
                          theme === themeOption.value ? "selected" : ""
                        }`}
                      >
                        {themeOption.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <label
                  htmlFor="theme"
                  className="mb-2 block text-sm font-semibold"
                >
                  Theme
                </label>

                <div className="relative">
                  <select
                    value={theme}
                    onChange={(event) =>
                      onThemeChange(event.target.value as Theme)
                    }
                    id="theme"
                    className="theme-select w-full appearance-none rounded-lg border px-3 py-2"
                  >
                    {themes.map((themeOption) => (
                      <option key={themeOption.value} value={themeOption.value}>
                        {themeOption.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </>
            )}

            {isGuest && !isCollapsed && (
              <div className="mt-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 shrink-0" />
                  <div className="font-semibold">Guest Mode</div>
                </div>

                <p className="mt-4 text-sm leading-6 opacity-70">
                  You&apos;re browsing as a guest.
                </p>

                <p className="mt-2 text-sm leading-6 opacity-70">
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="auth-link font-semibold"
                  >
                    Sign up to sync your list
                  </button>{" "}
                  across devices and keep it from being lost if your browser
                  data is cleared or you switch devices.
                </p>

                <p className="mt-3 text-xs leading-5 opacity-60">
                  Your list is only stored in this browser.
                </p>
              </div>
            )}
          </div>
        </div>
      </nav>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="sidebar-toggle absolute top-1/2 -right-4 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}

export default Sidebar;
