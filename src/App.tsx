import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import "./app.scss";
import "./theme.scss";
import Sidebar from "./components/layout/Sidebar";
import MobileMenu from "./components/layout/MobileMenu";
import WatchlistFilters from "./components/watchlist/WatchlistFilters";
import GuestMigrationPrompt from "./components/account/GuestMigrationPrompt";
import AuthScreen from "./components/AuthScreen";
import ShowList from "./components/ShowList";
import AddShowModal from "./components/AddShowModal";
import ProfilePage from "./components/account/ProfilePage";
import HelpFeedbackPage from "./components/account/HelpFeedbackPage";
import PrivacyDataPage from "./components/account/PrivacyDataPage";
import type { AccountPage } from "./components/account/AccountMenu";
import type { Show, NewShow, ShowStatus } from "./types/show";
import type { Theme } from "./types/theme";
import { Menu, Plus } from "lucide-react";

type Page = "list" | "profile" | "help" | "privacy";
type AppMode = "loading" | "auth" | "guest" | "account";

type WatchlistByStatus = {
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

const pageTitles: Record<Page, string> = {
  list: "My List",
  profile: "Profile",
  help: "Help & Feedback",
  privacy: "Privacy & Data",
};

function readGuestWatchlist(): WatchlistByStatus | null {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(GUEST_WATCHLIST_KEY) ?? "null",
    );

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const guestWatchlist = parsed as Partial<WatchlistByStatus>;

    if (
      !Array.isArray(guestWatchlist.watching) ||
      !Array.isArray(guestWatchlist.wantToWatch) ||
      !Array.isArray(guestWatchlist.completed) ||
      !Array.isArray(guestWatchlist.onHold)
    ) {
      return null;
    }

    return guestWatchlist as WatchlistByStatus;
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

async function fetchAccountWatchlist(
  accountUserId: string,
): Promise<WatchlistByStatus> {
  const { data, error } = await supabase
    .from("user_shows")
    .select(
      "user_id, show_id, title, service, status, image_url, season, episode, created_at",
    )
    .eq("user_id", accountUserId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const showsByStatus: WatchlistByStatus = {
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

  return showsByStatus;
}

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

  useEffect(() => {
    appModeRef.current = appMode;
    userRef.current = user;
  }, [appMode, user]);

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

  const [watching, setWatching] = useState<Show[]>([]);
  const [wantToWatch, setWantToWatch] = useState<Show[]>([]);
  const [completed, setCompleted] = useState<Show[]>([]);
  const [onHold, setOnHold] = useState<Show[]>([]);

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
    setIsAccountOpen(page !== "list");
    setIsMobileMenuOpen(false);
  };

  const normalizedSearchText = searchText.toLowerCase();

  const filterShows = (shows: Show[]) =>
    shows.filter(
      (show) =>
        show.title.toLowerCase().includes(normalizedSearchText) &&
        (selectedService === "all" || show.service === selectedService),
    );

  const filteredWatching = filterShows(watching);
  const filteredWantToWatch = filterShows(wantToWatch);
  const filteredCompleted = filterShows(completed);
  const filteredOnHold = filterShows(onHold);

  const clearWatchlistState = useCallback(() => {
    setWatching([]);
    setWantToWatch([]);
    setCompleted([]);
    setOnHold([]);
  }, []);

  const setWatchlistState = useCallback((watchlist: WatchlistByStatus) => {
    setWatching(watchlist.watching);
    setWantToWatch(watchlist.wantToWatch);
    setCompleted(watchlist.completed);
    setOnHold(watchlist.onHold);
  }, []);

  const loadGuestWatchlist = useCallback(() => {
    const guestWatchlist = readGuestWatchlist();

    if (guestWatchlist) {
      setWatchlistState(guestWatchlist);
    }

    setIsGuestWatchlistLoaded(true);
  }, [setWatchlistState]);

  const handleClearGuestData = () => {
    clearWatchlistState();
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

  const loadAccountWatchlist = useCallback(
    async (accountUserId: string) => {
      try {
        const watchlist = await fetchAccountWatchlist(accountUserId);

        setWatchlistState(watchlist);
        setAccountWatchlistError("");
      } catch {
        setAccountWatchlistError("Unable to load your watchlist.");
      } finally {
        setIsAccountWatchlistLoaded(true);
      }
    },
    [setWatchlistState],
  );

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
      setMigrationError(
        "Your account list is still loading. Please try again.",
      );
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
        ...guestWatchlist.watching.map((show) => ({
          show,
          status: "watching" as const,
        })),
        ...guestWatchlist.wantToWatch.map((show) => ({
          show,
          status: "wantToWatch" as const,
        })),
        ...guestWatchlist.completed.map((show) => ({
          show,
          status: "completed" as const,
        })),
        ...guestWatchlist.onHold.map((show) => ({
          show,
          status: "onHold" as const,
        })),
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

  const pageTitle = pageTitles[currentPage];

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setUser(data.session.user);

        if (!hasDismissedMigrationPromptRef.current) {
          setShouldShowMigrationPrompt(hasGuestWatchlistShows());
        }

        setIsGuestWatchlistLoaded(false);
        clearWatchlistState();
        setIsAccountWatchlistLoaded(false);
        setAccountWatchlistError("");
        setAppMode("account");
        return;
      }

      setUser(null);

      const isGuest = localStorage.getItem("guestMode") === "true";

      if (isGuest) {
        loadGuestWatchlist();
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
        clearWatchlistState();
        setIsAccountWatchlistLoaded(false);
        setAccountWatchlistError("");
        localStorage.removeItem("guestMode");
        setAppMode("account");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearWatchlistState, loadGuestWatchlist]);

  useEffect(() => {
    if (appMode !== "guest" || !isGuestWatchlistLoaded) {
      return;
    }

    const guestWatchlist: WatchlistByStatus = {
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

    let cancelled = false;

    fetchAccountWatchlist(user.id)
      .then((watchlist) => {
        if (cancelled) {
          return;
        }

        setWatchlistState(watchlist);
        setAccountWatchlistError("");
        setIsAccountWatchlistLoaded(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setAccountWatchlistError("Unable to load your watchlist.");
        setIsAccountWatchlistLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [appMode, user, setWatchlistState]);

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
            loadGuestWatchlist();
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
    <div className="app" data-theme={theme}>
      <Sidebar
        currentPage={currentPage}
        accountPage={accountPage}
        isAccountOpen={isAccountOpen}
        isGuest={appMode === "guest"}
        isCollapsed={isSidebarCollapsed}
        isThemeMenuOpen={isThemeMenuOpen}
        theme={theme}
        onSelectPage={selectPage}
        onToggleAccount={() => setIsAccountOpen((current) => !current)}
        onSignOut={handleSignOut}
        onSignIn={() => setAppMode("auth")}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        onToggleThemeMenu={() => setIsThemeMenuOpen((current) => !current)}
        onThemeChange={handleThemeChange}
        onCloseThemeMenu={() => setIsThemeMenuOpen(false)}
      />

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

                <WatchlistFilters
                  searchText={searchText}
                  selectedStatus={selectedStatus}
                  selectedService={selectedService}
                  serviceOptions={serviceOptions}
                  onSearchChange={setSearchText}
                  onStatusChange={setSelectedStatus}
                  onServiceChange={setSelectedService}
                  onClearFilters={clearFilters}
                  onAddShow={() => setIsAddOpen(true)}
                />

                {(selectedStatus === "all" ||
                  selectedStatus === "watching") && (
                  <ShowList
                    title="Currently Watching"
                    shows={filteredWatching}
                    status="watching"
                    onEdit={(show) =>
                      setShowToEdit({ show, status: "watching" })
                    }
                    onRemove={handleRemoveShow}
                  />
                )}

                {(selectedStatus === "all" ||
                  selectedStatus === "wantToWatch") && (
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

                {(selectedStatus === "all" ||
                  selectedStatus === "completed") && (
                  <ShowList
                    title="Completed"
                    shows={filteredCompleted}
                    status="completed"
                    defaultExpanded={false}
                    onEdit={(show) =>
                      setShowToEdit({ show, status: "completed" })
                    }
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
            onSignIn={() => setAppMode("auth")}
          />
        )}

        {currentPage === "help" && <HelpFeedbackPage />}

        {currentPage === "privacy" && (
          <PrivacyDataPage
            isGuest={appMode === "guest"}
            theme={theme}
            onSignIn={() => setAppMode("auth")}
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
        <MobileMenu
          currentPage={currentPage}
          accountPage={accountPage}
          isAccountOpen={isAccountOpen}
          isGuest={appMode === "guest"}
          theme={theme}
          onClose={() => setIsMobileMenuOpen(false)}
          onSelectPage={selectPage}
          onToggleAccount={() => setIsAccountOpen((current) => !current)}
          onSignOut={handleSignOut}
          onSignIn={() => setAppMode("auth")}
          onThemeChange={handleThemeChange}
        />
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
          <GuestMigrationPrompt
            isMigrating={isMigratingGuestWatchlist}
            error={migrationError}
            onMigrate={handleMigrateGuestWatchlist}
            onDismiss={() => {
              hasDismissedMigrationPromptRef.current = true;
              setHasDismissedMigrationPrompt(true);
              setShouldShowMigrationPrompt(false);
            }}
          />
        )}
    </div>
  );
}

export default App;
