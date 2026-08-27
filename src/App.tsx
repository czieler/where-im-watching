import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import "./app.scss";
import "./theme.scss";
import wiwLogo from "./assets/wiw_logo.png";
import AuthScreen from "./components/AuthScreen";
import ShowList from "./components/ShowList";
import AddShowModal from "./components/AddShowModal";
import AccountMenu from "./components/account/AccountMenu";
import ProfilePage from "./components/account/ProfilePage";
import HelpFeedbackPage from "./components/account/HelpFeedbackPage";
import PrivacyDataPage from "./components/account/PrivacyDataPage";
import type { AccountPage } from "./components/account/AccountMenu";
import type { Show, NewShow, ShowStatus } from "./types/show";
import type { Theme } from "./types/theme";
import {
  List,
  Palette,
  Menu,
  X,
  Plus,
  Search,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";

type Page = "list" | "profile" | "help" | "privacy";
type AppMode = "loading" | "auth" | "guest" | "account";
type GuestWatchlist = {
  watching: Show[];
  wantToWatch: Show[];
  completed: Show[];
  onHold: Show[];
};

type UserShowRow = {
  user_id: string;
  show_id: number;
  title: string;
  service: string;
  status: string;
  image_url: string | null;
  season: number | null;
  episode: number | null;
  created_at: string;
};

type UserShowInsert = Omit<UserShowRow, "created_at">;

const GUEST_WATCHLIST_KEY = "guestWatchlist";

function readGuestWatchlist(): GuestWatchlist | null {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(GUEST_WATCHLIST_KEY) ?? "null",
    );

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const guestWatchlist = parsed as Partial<GuestWatchlist>;

    if (
      !Array.isArray(guestWatchlist.watching) ||
      !Array.isArray(guestWatchlist.wantToWatch) ||
      !Array.isArray(guestWatchlist.completed) ||
      !Array.isArray(guestWatchlist.onHold)
    ) {
      return null;
    }

    return guestWatchlist as GuestWatchlist;
  } catch {
    return null;
  }
}

function hasGuestWatchlistShows() {
  const guestWatchlist = readGuestWatchlist();

  return guestWatchlist
    ? [
        guestWatchlist.watching,
        guestWatchlist.wantToWatch,
        guestWatchlist.completed,
        guestWatchlist.onHold,
      ].some((shows) => shows.length > 0)
    : false;
}

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "blues", label: "Blues" },
];

function App() {
  const [isGuestWatchlistLoaded, setIsGuestWatchlistLoaded] = useState(false);
  const [shouldShowMigrationPrompt, setShouldShowMigrationPrompt] =
    useState(false);
  const [hasDismissedMigrationPrompt, setHasDismissedMigrationPrompt] =
    useState(false);
  const hasDismissedMigrationPromptRef = useRef(false);
  const [isMigratingGuestWatchlist, setIsMigratingGuestWatchlist] =
    useState(false);
  const [migrationError, setMigrationError] = useState("");
  const [isAccountWatchlistLoaded, setIsAccountWatchlistLoaded] =
    useState(false);
  const [accountWatchlistError, setAccountWatchlistError] = useState("");
  const [appMode, setAppMode] = useState<AppMode>("loading");
  const [user, setUser] = useState<User | null>(null);
  const appModeRef = useRef(appMode);
  const userRef = useRef(user);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  appModeRef.current = appMode;
  userRef.current = user;

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    return savedTheme ?? "light";
  });

  const [currentPage, setCurrentPage] = useState<Page>("list");
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showToEdit, setShowToEdit] = useState<{
    show: Show;
    status: ShowStatus;
  } | null>(null);

  const [watching, setWatching] = useState<Show[]>([
    {
      id: 1,
      title: "The Last of Us",
      service: "Hulu",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/563/1409008.jpg",
    },
    {
      id: 2,
      title: "Slow Horses",
      service: "Apple TV+",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/637/1593462.jpg",
    },
  ]);

  const [wantToWatch, setWantToWatch] = useState<Show[]>([
    {
      id: 3,
      title: "House of the Dragon",
      service: "Max",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/627/1568449.jpg",
    },
    {
      id: 4,
      title: "Ted Lasso",
      service: "Apple TV+",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/634/1585930.jpg",
    },
    {
      id: 5,
      title: "Only Murders in the Building",
      service: "Hulu",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/586/1466415.jpg",
    },
  ]);

  const [completed, setCompleted] = useState<Show[]>([
    {
      id: 6,
      title: "Breaking Bad",
      service: "Netflix",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
    },
    {
      id: 7,
      title: "The Good Place",
      service: "Netflix",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/395/989291.jpg",
    },
  ]);

  const [onHold, setOnHold] = useState<Show[]>([
    {
      id: 8,
      title: "Yellowjackets",
      service: "Paramount+",
    },
  ]);

  const serviceOptions = Array.from(
    new Set(
      [...watching, ...wantToWatch, ...completed, ...onHold].map(
        (show) => show.service,
      ),
    ),
  ).sort();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedStatus("all");
    setSelectedService("all");
  };

  const selectPage = (page: Page) => {
    setCurrentPage(page);

    if (page === "list") {
      setIsAccountOpen(false);
    } else {
      setIsAccountOpen(true);
    }

    setIsMobileMenuOpen(false);
  };

  const filteredWatching = watching.filter(
    (show) =>
      show.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedService === "all" || show.service === selectedService),
  );

  const filteredWantToWatch = wantToWatch.filter(
    (show) =>
      show.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedService === "all" || show.service === selectedService),
  );

  const filteredCompleted = completed.filter(
    (show) =>
      show.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedService === "all" || show.service === selectedService),
  );

  const filteredOnHold = onHold.filter(
    (show) =>
      show.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedService === "all" || show.service === selectedService),
  );

  const handleClearGuestData = () => {
    setWatching([]);
    setWantToWatch([]);
    setCompleted([]);
    setOnHold([]);

    localStorage.removeItem(GUEST_WATCHLIST_KEY);
  };

  const addShowToState = (show: Show, status: ShowStatus) => {
    switch (status) {
      case "watching":
        setWatching((current) => [...current, show]);
        break;

      case "wantToWatch":
        setWantToWatch((current) => [...current, show]);
        break;

      case "completed":
        setCompleted((current) => [...current, show]);
        break;

      case "onHold":
        setOnHold((current) => [...current, show]);
        break;
    }
  };

  const removeShowFromState = (id: number) => {
    setWatching((current) => current.filter((show) => show.id !== id));
    setWantToWatch((current) => current.filter((show) => show.id !== id));
    setCompleted((current) => current.filter((show) => show.id !== id));
    setOnHold((current) => current.filter((show) => show.id !== id));
  };

  const toUserShowInsert = (
    userId: string,
    show: Show,
    status: ShowStatus,
  ): UserShowInsert => ({
    user_id: userId,
    show_id: show.id,
    title: show.title,
    service: show.service,
    status,
    image_url: show.imageUrl ?? null,
    season: show.season ?? null,
    episode: show.episode ?? null,
  });

  const loadAccountWatchlist = async (accountUserId: string) => {
    setIsAccountWatchlistLoaded(false);

    const { data, error } = await supabase
      .from("user_shows")
      .select(
        "user_id, show_id, title, service, status, image_url, season, episode, created_at",
      )
      .eq("user_id", accountUserId)
      .order("created_at", { ascending: true });

    if (error) {
      setAccountWatchlistError("Unable to load your watchlist.");
      setIsAccountWatchlistLoaded(true);
      return;
    }

    const showsByStatus: Record<ShowStatus, Show[]> = {
      watching: [],
      wantToWatch: [],
      completed: [],
      onHold: [],
    };

    (data as UserShowRow[]).forEach((row) => {
      if (!(row.status in showsByStatus)) {
        return;
      }

      showsByStatus[row.status as ShowStatus].push({
        id: row.show_id,
        title: row.title,
        service: row.service,
        ...(row.image_url ? { imageUrl: row.image_url } : {}),
        ...(row.season !== null ? { season: row.season } : {}),
        ...(row.episode !== null ? { episode: row.episode } : {}),
      });
    });

    setWatching(showsByStatus.watching);
    setWantToWatch(showsByStatus.wantToWatch);
    setCompleted(showsByStatus.completed);
    setOnHold(showsByStatus.onHold);
    setAccountWatchlistError("");
    setIsAccountWatchlistLoaded(true);
  };

  const handleAddShow = async ({
    id,
    title,
    service,
    status,
    imageUrl,
    season,
    episode,
  }: NewShow) => {
    const show = { id, title, service, imageUrl, season, episode };

    if (appMode === "account" && user) {
      const { error } = await supabase
        .from("user_shows")
        .insert(toUserShowInsert(user.id, show, status));

      if (error) {
        setAccountWatchlistError(
          error.code === "23505"
            ? "That show is already in your list."
            : "Unable to save show.",
        );
        return;
      }

      setAccountWatchlistError("");
    }

    addShowToState(show, status);
    setIsAddOpen(false);
  };

  const handleEditShow = async (updatedShow: NewShow) => {
    if (appMode === "account" && user) {
      const { error } = await supabase
        .from("user_shows")
        .update({
          title: updatedShow.title,
          service: updatedShow.service,
          status: updatedShow.status,
          image_url: updatedShow.imageUrl ?? null,
          season: updatedShow.season ?? null,
          episode: updatedShow.episode ?? null,
        })
        .eq("user_id", user.id)
        .eq("show_id", updatedShow.id);

      if (error) {
        setAccountWatchlistError("Unable to save show changes.");
        return;
      }

      setAccountWatchlistError("");
    }

    removeShowFromState(updatedShow.id);
    addShowToState(
      {
        id: updatedShow.id,
        title: updatedShow.title,
        service: updatedShow.service,
        imageUrl: updatedShow.imageUrl,
        season: updatedShow.season,
        episode: updatedShow.episode,
      },
      updatedShow.status,
    );
    setShowToEdit(null);
  };

  const handleRemoveShow = async (id: number) => {
    if (appMode === "account" && user) {
      const { error } = await supabase
        .from("user_shows")
        .delete()
        .eq("user_id", user.id)
        .eq("show_id", id);

      if (error) {
        setAccountWatchlistError("Unable to remove show.");
        return;
      }

      setAccountWatchlistError("");
    }

    removeShowFromState(id);
  };

  const handleMigrateGuestWatchlist = async () => {
    if (isMigratingGuestWatchlist) {
      return;
    }

    setMigrationError("");

    const guestWatchlist = readGuestWatchlist();

    if (!guestWatchlist) {
      setShouldShowMigrationPrompt(false);
      return;
    }

    if (appMode !== "account" || !user) {
      setMigrationError("Please sign in before bringing your list.");
      return;
    }

    if (!isAccountWatchlistLoaded) {
      setMigrationError("Your account list is still loading. Please try again.");
      return;
    }

    setIsMigratingGuestWatchlist(true);

    try {
      const existingShowIds = new Set(
        [...watching, ...wantToWatch, ...completed, ...onHold].map(
          (show) => show.id,
        ),
      );
      const showsToMigrate: UserShowInsert[] = [];
      const guestShows: { show: Show; status: ShowStatus }[] = [
        ...guestWatchlist.watching.map((show) => ({ show, status: "watching" as const })),
        ...guestWatchlist.wantToWatch.map((show) => ({ show, status: "wantToWatch" as const })),
        ...guestWatchlist.completed.map((show) => ({ show, status: "completed" as const })),
        ...guestWatchlist.onHold.map((show) => ({ show, status: "onHold" as const })),
      ];

      guestShows.forEach(({ show, status }) => {
        if (existingShowIds.has(show.id)) {
          return;
        }

        existingShowIds.add(show.id);
        showsToMigrate.push(toUserShowInsert(user.id, show, status));
      });

      if (showsToMigrate.length > 0) {
        const { error } = await supabase
          .from("user_shows")
          .insert(showsToMigrate);

        if (error) {
          throw error;
        }
      }

      localStorage.removeItem(GUEST_WATCHLIST_KEY);
      setShouldShowMigrationPrompt(false);
      await loadAccountWatchlist(user.id);
    } catch (error) {
      console.error("Unable to migrate guest watchlist:", error);
      setMigrationError("Unable to bring your guest list right now.");
    } finally {
      setIsMigratingGuestWatchlist(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }

    localStorage.removeItem("guestMode");
    hasDismissedMigrationPromptRef.current = false;
    setHasDismissedMigrationPrompt(false);
    setShouldShowMigrationPrompt(false);
    setAppMode("auth");
  };

  const accountPage: AccountPage | null =
    currentPage === "profile" ||
    currentPage === "help" ||
    currentPage === "privacy"
      ? currentPage
      : null;

  const pageTitle =
    currentPage === "list"
      ? "My List"
      : currentPage === "profile"
        ? "Profile"
        : currentPage === "help"
          ? "Help & Feedback"
          : "Privacy & Data";

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setUser(data.session.user);
        if (!hasDismissedMigrationPromptRef.current) {
          setShouldShowMigrationPrompt(hasGuestWatchlistShows());
        }
        setIsGuestWatchlistLoaded(false);
        setWatching([]);
        setWantToWatch([]);
        setCompleted([]);
        setOnHold([]);
        setIsAccountWatchlistLoaded(false);
        setAccountWatchlistError("");
        setAppMode("account");
        return;
      }

      setUser(null);

      const isGuest = localStorage.getItem("guestMode") === "true";

      if (isGuest) {
        setAppMode("guest");
        return;
      }

      setAppMode("auth");
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        return;
      }

      if (
        event === "SIGNED_IN" &&
        appModeRef.current === "account" &&
        userRef.current &&
        userRef.current.id === session?.user.id
      ) {
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        hasDismissedMigrationPromptRef.current = false;
        setHasDismissedMigrationPrompt(false);
        setShouldShowMigrationPrompt(false);

        const isGuest = localStorage.getItem("guestMode") === "true";

        setAppMode(isGuest ? "guest" : "auth");
        return;
      }

      if (event !== "SIGNED_IN") {
        return;
      }

      if (session) {
        setUser(session.user);
        if (!hasDismissedMigrationPromptRef.current) {
          setShouldShowMigrationPrompt(hasGuestWatchlistShows());
        }
        setIsGuestWatchlistLoaded(false);
        setWatching([]);
        setWantToWatch([]);
        setCompleted([]);
        setOnHold([]);
        setIsAccountWatchlistLoaded(false);
        setAccountWatchlistError("");
        localStorage.removeItem("guestMode");
        setAppMode("account");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (appMode !== "guest" || isGuestWatchlistLoaded) {
      return;
    }

    const savedWatchlist = localStorage.getItem(GUEST_WATCHLIST_KEY);

    if (savedWatchlist) {
      try {
        const guestWatchlist: GuestWatchlist = JSON.parse(savedWatchlist);

        setWatching(guestWatchlist.watching);
        setWantToWatch(guestWatchlist.wantToWatch);
        setCompleted(guestWatchlist.completed);
        setOnHold(guestWatchlist.onHold);
      } catch (error) {
        console.error("Unable to restore guest watchlist:", error);
      }
    }

    setIsGuestWatchlistLoaded(true);
  }, [appMode, isGuestWatchlistLoaded]);

  useEffect(() => {
    if (appMode !== "guest" || !isGuestWatchlistLoaded) {
      return;
    }

    const guestWatchlist: GuestWatchlist = {
      watching,
      wantToWatch,
      completed,
      onHold,
    };

    localStorage.setItem(GUEST_WATCHLIST_KEY, JSON.stringify(guestWatchlist));
  }, [
    appMode,
    isGuestWatchlistLoaded,
    watching,
    wantToWatch,
    completed,
    onHold,
  ]);

  useEffect(() => {
    if (appMode !== "account" || !user) {
      return;
    }

    loadAccountWatchlist(user.id);
  }, [appMode, user]);

  if (appMode === "loading") {
    return null;
  }

  if (appMode === "auth") {
    return (
      <div className="app" data-theme={theme}>
        <AuthScreen
          onGuestContinue={() => {
            setUser(null);
            localStorage.setItem("guestMode", "true");
            setAppMode("guest");
          }}
          onAuthSuccess={() => {
            if (!hasDismissedMigrationPromptRef.current) {
              setShouldShowMigrationPrompt(hasGuestWatchlistShows());
            }
            localStorage.removeItem("guestMode");
            setAppMode("account");
          }}
        />
      </div>
    );
  }

  return (
    /*
    <div className="app" data-theme={theme}>
      <AuthScreen />
    </div>
    */

    <div className="app" data-theme={theme}>
      {/* Desktop sidebar */}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 hidden border-r transition-all duration-200 md:flex md:flex-col ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="app-sidebar-header border-b px-4 py-6">
          <div className="flex items-center gap-3">
            <img
              src={wiwLogo}
              alt="Where I'm Watching"
              className="h-12 w-12 shrink-0 object-contain"
            />

            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold">Where I'm Watching</h1>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4">
          <button
            type="button"
            onClick={() => selectPage("list")}
            className={`nav-item flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
              currentPage === "list" ? "nav-item-active" : ""
            }`}
            title={isSidebarCollapsed ? "My List" : undefined}
          >
            <List className="h-5 w-5 shrink-0" />

            {!isSidebarCollapsed && <span>My List</span>}
          </button>

          <AccountMenu
            currentPage={accountPage}
            isOpen={isAccountOpen}
            isGuest={appMode === "guest"}
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsAccountOpen((current) => !current)}
            onSelect={selectPage}
            onSignOut={handleSignOut}
            onSignIn={() => {
              setAppMode("auth");
            }}
          />

          <div className="mt-auto">
            <div className="px-4 py-4">
              {isSidebarCollapsed ? (
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
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
                          key={themeOption.value}
                          onClick={() => {
                            handleThemeChange(themeOption.value);
                            setIsThemeMenuOpen(false);
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
                      onChange={(e) =>
                        handleThemeChange(e.target.value as Theme)
                      }
                      id="theme"
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
                </>
              )}

              {appMode === "guest" && !isSidebarCollapsed && (
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
                      onClick={() => {
                        setAppMode("auth");
                      }}
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
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="sidebar-toggle absolute top-1/2 -right-4 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? "›" : "‹"}
        </button>
      </aside>

      <div
        className={`min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <header className="app-header sticky top-0 z-30 border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-2xl md:hidden"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <h2 className="text-xl font-bold">{pageTitle}</h2>
            </div>
          </div>
        </header>

        {currentPage === "list" && (
          <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 pb-28 sm:px-6 md:pb-8">
            {appMode === "account" && !isAccountWatchlistLoaded ? (
              <p role="status">Loading your watchlist...</p>
            ) : (
              <>
                {accountWatchlistError && (
                  <p role="alert" className="mb-4 text-sm">
                    {accountWatchlistError}
                  </p>
                )}

                <div className="mb-6 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="search-icon absolute left-3 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search my list..."
                  className="app-input w-full rounded-lg border py-2.5 pl-10 pr-10 outline-none"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="search-clear absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-3">
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="app-select w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 lg:w-44"
                  >
                    <option value="all">All Statuses</option>
                    <option value="watching">Watching</option>
                    <option value="wantToWatch">Want to Watch</option>
                    <option value="completed">Completed</option>
                    <option value="onHold">On Hold</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="app-select w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 lg:w-44"
                  >
                    <option value="all">All Services</option>

                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="select-chevron pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              {(searchText !== "" ||
                selectedStatus !== "all" ||
                selectedService !== "all") && (
                <button
                  onClick={clearFilters}
                  className="btn btn-default self-start whitespace-nowrap lg:self-center"
                >
                  Clear All
                </button>
              )}

              <button
                onClick={() => setIsAddOpen(true)}
                className="btn btn-primary hidden self-center whitespace-nowrap md:inline-flex"
              >
                + Add
              </button>
              </div>

              {(selectedStatus === "all" || selectedStatus === "watching") && (
              <ShowList
                title="Currently Watching"
                shows={filteredWatching}
                status="watching"
                onEdit={(show) => setShowToEdit({ show, status: "watching" })}
                onRemove={handleRemoveShow}
              />
            )}

              {(selectedStatus === "all" || selectedStatus === "wantToWatch") && (
              <ShowList
                title="Want to Watch"
                shows={filteredWantToWatch}
                status="wantToWatch"
                onEdit={(show) =>
                  setShowToEdit({ show, status: "wantToWatch" })
                }
                onRemove={handleRemoveShow}
              />
            )}

              {(selectedStatus === "all" || selectedStatus === "completed") && (
              <ShowList
                title="Completed"
                shows={filteredCompleted}
                status="completed"
                defaultExpanded={false}
                onEdit={(show) => setShowToEdit({ show, status: "completed" })}
                onRemove={handleRemoveShow}
              />
            )}

              {(selectedStatus === "all" || selectedStatus === "onHold") && (
              <ShowList
                title="On Hold"
                shows={filteredOnHold}
                status="onHold"
                defaultExpanded={false}
                onEdit={(show) => setShowToEdit({ show, status: "onHold" })}
                onRemove={handleRemoveShow}
              />
                )}
              </>
            )}
          </main>
        )}

        {currentPage === "profile" && (
          <ProfilePage
            user={user}
            isGuest={appMode === "guest"}
            onSignIn={() => {
              setAppMode("auth");
            }}
          />
        )}

        {currentPage === "help" && <HelpFeedbackPage />}

        {currentPage === "privacy" && (
          <PrivacyDataPage
            isGuest={appMode === "guest"}
            theme={theme}
            onSignIn={() => {
              setAppMode("auth");
            }}
            onClearGuestData={handleClearGuestData}
          />
        )}
      </div>

      {currentPage === "list" && (
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg md:hidden"
          aria-label="Add show"
        >
          <Plus size={26} />
        </button>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="mobile-menu-overlay absolute inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="mobile-menu absolute left-0 top-0 h-full w-72 p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Where I'm Watching</h2>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => selectPage("list")}
              className={`nav-item mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium ${
                currentPage === "list" ? "nav-item-active" : ""
              }`}
            >
              <List className="h-5 w-5" />
              <span>My List</span>
            </button>

            <div className="mb-6">
              <AccountMenu
                currentPage={accountPage}
                isOpen={isAccountOpen}
                isGuest={appMode === "guest"}
                onToggle={() => setIsAccountOpen((current) => !current)}
                onSelect={selectPage}
                onSignOut={handleSignOut}
                onSignIn={() => {
                  setAppMode("auth");
                }}
              />
            </div>

            <label htmlFor="mobile-theme" className="mb-2 block font-semibold">
              Theme
            </label>

            <div className="relative">
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as Theme)}
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
      )}

      {isAddOpen && (
        <AddShowModal
          onClose={() => setIsAddOpen(false)}
          onSave={handleAddShow}
        />
      )}

      {showToEdit && (
        <AddShowModal
          show={showToEdit.show}
          initialStatus={showToEdit.status}
          onClose={() => setShowToEdit(null)}
          onSave={handleEditShow}
        />
      )}

      {appMode === "account" &&
        shouldShowMigrationPrompt &&
        !hasDismissedMigrationPrompt && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="modal w-full max-w-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold">
              Bring your guest list with you?
            </h2>

            <p className="mt-4">
              You have shows saved in Guest Mode. Would you like to add them to
              your account so they&apos;re available when you sign in on other
              devices?
            </p>

            {migrationError && (
              <p role="alert" className="mt-4 text-sm">
                {migrationError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  hasDismissedMigrationPromptRef.current = true;
                  setHasDismissedMigrationPrompt(true);
                  setShouldShowMigrationPrompt(false);
                }}
                className="btn btn-default"
                disabled={isMigratingGuestWatchlist}
              >
                Not Now
              </button>

              <button
                type="button"
                onClick={handleMigrateGuestWatchlist}
                className="btn btn-primary"
                disabled={isMigratingGuestWatchlist}
              >
                {isMigratingGuestWatchlist
                  ? "Bringing Your List..."
                  : "Bring My List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
