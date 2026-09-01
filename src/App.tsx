import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import "./app.scss";
import "./component-library.scss";
import "./theme.scss";
import Sidebar from "./components/layout/Sidebar";
import MobileMenu from "./components/layout/MobileMenu";
import WatchlistFilters from "./components/watchlist/WatchlistFilters";
import GuestMigrationPrompt from "./components/account/GuestMigrationPrompt";
import AuthScreen from "./components/AuthScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import ShowList from "./components/ShowList";
import AddShowModal from "./components/AddShowModal";
import ProfilePage from "./components/account/ProfilePage";
import HelpFeedbackPage from "./components/account/HelpFeedbackPage";
import PrivacyDataPage from "./components/account/PrivacyDataPage";
import MyServicesPage from "./components/services/MyServicesPage";
import ComingNextSeasonPage from "./components/roadmap/ComingNextSeasonPage";
import AdminServicesPage from "./components/admin/AdminServicesPage";
import VersionUpdatePrompt from "./components/system/VersionUpdatePrompt";
import { useStreamingServices } from "./hooks/useStreamingServices";
import { useAppVersion } from "./hooks/useAppVersion";
import type { AccountPage } from "./components/account/AccountMenu";
import type { Show, NewShow, ShowStatus } from "./types/show";
import type { Theme } from "./types/theme";
import { Menu, Plus } from "lucide-react";

type Page = "list" | "services" | "roadmap" | "admin" | "profile" | "help" | "privacy";
type AppMode =
  | "loading"
  | "auth"
  | "passwordRecovery"
  | "guest"
  | "account";

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
  streaming_profile: string | null;
  notes: string | null;
  created_at: string;
};

type UserShowInsert = Omit<UserShowRow, "created_at">;

const GUEST_WATCHLIST_KEY = "guestWatchlist";

function isPasswordRecoveryUrl() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash,
  );

  return (
    params.get("type") === "recovery" || hashParams.get("type") === "recovery"
  );
}

function clearAuthCallbackFromUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

const pageTitles: Record<Page, string> = {
  list: "My List",
  services: "My Services",
  roadmap: "Coming Soon",
  admin: "Pending Services",
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
      "user_id, show_id, title, service, status, image_url, season, episode, streaming_profile, notes, created_at",
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
      ...(row.streaming_profile
        ? { streamingProfile: row.streaming_profile }
        : {}),
      ...(row.notes ? { notes: row.notes } : {}),
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
  const [authMessage, setAuthMessage] = useState("");

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

  const watchlistServiceNames = Array.from(
    new Set([...watching, ...wantToWatch, ...completed, ...onHold].map((show) => show.service)),
  );

  const streamingServices = useStreamingServices({
    mode: appMode === "account" ? "account" : "guest",
    user,
    watchlistServices: watchlistServiceNames,
  });
  const appVersion = useAppVersion();

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
    streaming_profile: show.streamingProfile ?? null,
    notes: show.notes ?? null,
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
    streamingProfile,
    notes,
  }: NewShow) => {
    const show = {
      id,
      title,
      service,
      imageUrl,
      season,
      episode,
      streamingProfile,
      notes,
    };

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
        return false;
      }

      setAccountWatchlistError("");
    }

    addShowToState(show, status);
    return true;
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
          streaming_profile: updatedShow.streamingProfile ?? null,
          notes: updatedShow.notes ?? null,
        })
        .eq("user_id", user.id)
        .eq("show_id", updatedShow.id);

      if (error) {
        setAccountWatchlistError("Unable to save show changes.");
        return false;
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
        streamingProfile: updatedShow.streamingProfile,
        notes: updatedShow.notes,
      },
      updatedShow.status,
    );

    return true;
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
    setAuthMessage("");
    setCurrentPage("list");
    setIsAccountOpen(false);
    setAppMode("auth");
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.functions.invoke("delete-account");

    if (error) {
      throw error;
    }

    // The server has already deleted the auth user. Clear the local session and
    // app state even if Supabase can no longer revoke the now-deleted session.
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    localStorage.removeItem("guestMode");
    clearWatchlistState();
    setUser(null);
    setCurrentPage("list");
    setIsAccountOpen(false);
    setShouldShowMigrationPrompt(false);
    setAuthMessage(
      "Your account has been deleted. We're sorry to see you go. Your Where I'm Watching account and saved data have been deleted as requested.",
    );
    setAppMode("auth");
  };

  const handlePasswordRecoveryComplete = async () => {
    await supabase.auth.signOut();
    clearAuthCallbackFromUrl();
    setUser(null);
    setCurrentPage("list");
    setAuthMessage("");
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
    const handleAccountSession = (sessionUser: User) => {
      setUser(sessionUser);

      if (!hasDismissedMigrationPromptRef.current) {
        setShouldShowMigrationPrompt(hasGuestWatchlistShows());
      }

      setIsGuestWatchlistLoaded(false);
      clearWatchlistState();
      setIsAccountWatchlistLoaded(false);
      setAccountWatchlistError("");
      localStorage.removeItem("guestMode");
      setAppMode("account");
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setUser(session?.user ?? null);
        localStorage.removeItem("guestMode");
        setAppMode("passwordRecovery");
        return;
      }

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
        setCurrentPage("list");
        setIsAccountOpen(false);
        hasDismissedMigrationPromptRef.current = false;
        setHasDismissedMigrationPrompt(false);
        setShouldShowMigrationPrompt(false);

        const isGuest = localStorage.getItem("guestMode") === "true";
        setAppMode(isGuest ? "guest" : "auth");
        return;
      }

      if (event === "SIGNED_IN" && session) {
        handleAccountSession(session.user);
      }
    });

    const initializeAuth = async () => {
      const recoveryUrl = isPasswordRecoveryUrl();
      const { data } = await supabase.auth.getSession();

      if (recoveryUrl && data.session) {
        setUser(data.session.user);
        localStorage.removeItem("guestMode");
        setAppMode("passwordRecovery");
        return;
      }

      if (data.session) {
        handleAccountSession(data.session.user);
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

  useEffect(() => {
    if (
      currentPage === "admin" &&
      (appMode !== "account" ||
        (!streamingServices.isLoading && !streamingServices.isAdmin))
    ) {
      setCurrentPage("list");
      setIsAccountOpen(false);
    }
  }, [
    appMode,
    currentPage,
    streamingServices.isAdmin,
    streamingServices.isLoading,
  ]);

  if (appMode === "loading") {
    return null;
  }

  if (appMode === "passwordRecovery") {
    return (
      <div className="app" data-theme={theme}>
        <ResetPasswordScreen onComplete={handlePasswordRecoveryComplete} />
      </div>
    );
  }

  if (appMode === "auth") {
    return (
      <div className="app" data-theme={theme}>
        <AuthScreen
          initialMessage={authMessage}
          onGuestContinue={() => {
            setAuthMessage("");
            setUser(null);
            setCurrentPage("list");
            setIsAccountOpen(false);
            localStorage.setItem("guestMode", "true");
            loadGuestWatchlist();
            setAppMode("guest");
          }}
          onAuthSuccess={() => {
            setAuthMessage("");
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
        isAdmin={streamingServices.isAdmin}
        pendingAdminCount={streamingServices.pendingAdminCount}
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
                  <p role="alert" className="app-error mb-4 text-sm">
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

        {currentPage === "services" && (
          <MyServicesPage
            services={streamingServices.manageableServices}
            selectedNames={
              streamingServices.isConfigured
                ? streamingServices.personalServices
                : streamingServices.effectiveServices
            }
            isConfigured={streamingServices.isConfigured}
            isLoading={streamingServices.isLoading}
            isGuest={appMode === "guest"}
            error={streamingServices.error}
            onToggle={streamingServices.toggleService}
            onAddCustom={streamingServices.addCustomService}
          />
        )}

        {currentPage === "roadmap" && <ComingNextSeasonPage />}

        {currentPage === "admin" && streamingServices.isAdmin && (
          <AdminServicesPage
            verifiedServices={streamingServices.verifiedServices}
            onCatalogChanged={streamingServices.refresh}
          />
        )}

        {currentPage === "profile" && (
          <ProfilePage
            user={user}
            isGuest={appMode === "guest"}
            onSignIn={() => setAppMode("auth")}
          />
        )}

        {currentPage === "help" && <HelpFeedbackPage theme={theme} />}

        {currentPage === "privacy" && (
          <PrivacyDataPage
            isGuest={appMode === "guest"}
            user={user}
            onSignIn={() => setAppMode("auth")}
            onClearGuestData={handleClearGuestData}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </div>

      {currentPage === "list" && (
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary mobile-add-button fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full md:hidden"
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
          isAdmin={streamingServices.isAdmin}
          pendingAdminCount={streamingServices.pendingAdminCount}
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
          serviceOptions={streamingServices.effectiveServices}
          onClose={() => setIsAddOpen(false)}
          onSave={handleAddShow}
          onServiceUsed={streamingServices.ensureService}
        />
      )}

      {showToEdit && (
        <AddShowModal
          show={showToEdit.show}
          initialStatus={showToEdit.status}
          serviceOptions={streamingServices.effectiveServices}
          onClose={() => setShowToEdit(null)}
          onSave={handleEditShow}
          onServiceUsed={streamingServices.ensureService}
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

      {appVersion.updateAvailable && (
        <VersionUpdatePrompt
          latestVersion={appVersion.latestVersion}
          onRefresh={appVersion.refresh}
        />
      )}
    </div>
  );
}

export default App;
