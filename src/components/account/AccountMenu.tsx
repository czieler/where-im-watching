import type { LucideIcon } from "lucide-react";
import {
  User,
  IdCard,
  CircleHelp,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type AccountPage = "profile" | "help" | "privacy";

type AccountMenuProps = {
  currentPage: AccountPage | null;
  isOpen: boolean;
  isGuest: boolean;
  collapsed?: boolean;
  onToggle: () => void;
  onSelect: (page: AccountPage) => void;
  onSignOut: () => void;
  onSignIn: () => void;
};

type AccountMenuItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  variant: "sidebar" | "flyout";
  onClick: () => void;
};

const accountPages: {
  page: AccountPage;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    page: "profile",
    label: "Profile",
    icon: IdCard,
  },
  {
    page: "help",
    label: "Help & Feedback",
    icon: CircleHelp,
  },
  {
    page: "privacy",
    label: "Privacy & Data",
    icon: Shield,
  },
];

function AccountMenuItem({
  icon: Icon,
  label,
  active = false,
  variant,
  onClick,
}: AccountMenuItemProps) {
  const className =
    variant === "flyout"
      ? `theme-mini-menu-item account-mini-menu-item ${
          active ? "selected" : ""
        }`
      : `nav-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
          active ? "nav-item-active" : ""
        }`;

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function AccountMenu({
  currentPage,
  isOpen,
  isGuest,
  collapsed = false,
  onToggle,
  onSelect,
  onSignOut,
  onSignIn,
}: AccountMenuProps) {
  const handleSelect = (page: AccountPage) => {
    onSelect(page);

    if (collapsed) {
      onToggle();
    }
  };

  const handleAccountAction = () => {
    if (isGuest) {
      onSignIn();
    } else {
      onSignOut();
    }

    if (collapsed) {
      onToggle();
    }
  };

  const renderAccountPages = (variant: "sidebar" | "flyout") =>
    accountPages.map(({ page, label, icon }) => (
      <AccountMenuItem
        key={page}
        icon={icon}
        label={label}
        variant={variant}
        active={currentPage === page}
        onClick={() => handleSelect(page)}
      />
    ));

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={`nav-item mx-auto flex h-11 w-11 items-center justify-center rounded-lg ${
            currentPage !== null ? "nav-item-active" : ""
          }`}
          title="Account"
          aria-label="Account"
          aria-expanded={isOpen}
        >
          <User className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="theme-mini-menu absolute left-full top-0 z-50 ml-4 w-52 overflow-hidden rounded-lg border shadow-lg">
            {renderAccountPages("flyout")}

            <AccountMenuItem
              icon={isGuest ? LogIn : LogOut}
              label={isGuest ? "Sign In / Sign Up" : "Sign Out"}
              variant="flyout"
              onClick={handleAccountAction}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`nav-item flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
          currentPage !== null ? "nav-item-active" : ""
        }`}
        aria-expanded={isOpen}
      >
        <User className="h-5 w-5 shrink-0" />

        <span className="flex-1">Account</span>

        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="ml-5 mt-1 border-l pl-3">
          {renderAccountPages("sidebar")}

          <AccountMenuItem
            icon={isGuest ? LogIn : LogOut}
            label={isGuest ? "Sign In / Sign Up" : "Sign Out"}
            variant="sidebar"
            onClick={handleAccountAction}
          />
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
