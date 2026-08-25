import { useState } from "react";
import "./app.scss";
import "./theme.scss";
import wiwLogo from "./assets/wiw_logo.png";
import ShowList from "./components/ShowList";
import AddShowModal from "./components/AddShowModal";
import type { NewShow } from "./types/show";
import {
  List,
  Layers,
  User,
  Palette,
  Menu,
  X,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";

type Theme = "light" | "dark" | "blues";

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "blues", label: "Blues" },
];

function App() {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    return savedTheme ?? "light";
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [watching, setWatching] = useState([
    {
      id: 1,
      title: "The Last of Us",
      service: "Hulu",
      imageUrl:
        "	https://static.tvmaze.com/uploads/images/medium_portrait/563/1409008.jpg",
    },
    {
      id: 2,
      title: "Slow Horses",
      service: "Apple TV+",
      imageUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/637/1593462.jpg",
    },
  ]);

  const [wantToWatch, setWantToWatch] = useState([
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

  const [completed, setCompleted] = useState([
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
      imagUrl:
        "https://static.tvmaze.com/uploads/images/medium_portrait/395/989291.jpg",
    },
  ]);

  const [onHold, setOnHold] = useState([
    { id: 8, title: "Yellowjackets", service: "Paramount+" },
  ]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedStatus("all");
    setSelectedService("all");
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

  const handleAddShow = ({ title, service, status, imageUrl }: NewShow) => {
    const show = { title, service, imageUrl };

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

    setIsAddOpen(false);
  };

  const handleRemoveShow = (id: number) => {
    setWatching((current) => current.filter((show) => show.id !== id));
    setWantToWatch((current) => current.filter((show) => show.id !== id));
    setCompleted((current) => current.filter((show) => show.id !== id));
    setOnHold((current) => current.filter((show) => show.id !== id));
  };

  return (
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
          <a
            href="#"
            className="nav-item nav-item-active flex items-center gap-3 rounded-lg px-4 py-3 font-medium"
            title={isSidebarCollapsed ? "My List" : undefined}
          >
            <List className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>My List</span>}
          </a>

          <a
            href="#"
            className="nav-item flex items-center gap-3 rounded-lg px-4 py-3 font-medium"
            title={isSidebarCollapsed ? "Services" : undefined}
          >
            <Layers className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>Services</span>}
          </a>

          <div className="mt-auto">
            <a
              href="#"
              className="nav-item flex items-center gap-3 rounded-lg px-4 py-3 font-medium"
              title={isSidebarCollapsed ? "Account" : undefined}
            >
              <User className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Account</span>}
            </a>

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

      {/* Everything to the right of the sidebar on desktop */}
      <div
        className={`min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Top bar */}
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

              <h2 className="text-xl font-bold">My List</h2>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 pb-28 sm:px-6 md:pb-8">
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
                  <option value="Hulu">Hulu</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Paramount+">Paramount+</option>
                  <option value="Apple TV+">Apple TV+</option>
                  <option value="Max">Max</option>
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
              onRemove={handleRemoveShow}
            />
          )}

          {(selectedStatus === "all" || selectedStatus === "wantToWatch") && (
            <ShowList
              title="Want to Watch"
              shows={filteredWantToWatch}
              onRemove={handleRemoveShow}
            />
          )}

          {(selectedStatus === "all" || selectedStatus === "completed") && (
            <ShowList
              title="Completed"
              shows={filteredCompleted}
              defaultExpanded={false}
              onRemove={handleRemoveShow}
            />
          )}

          {(selectedStatus === "all" || selectedStatus === "onHold") && (
            <ShowList
              title="On Hold"
              shows={filteredOnHold}
              defaultExpanded={false}
              onRemove={handleRemoveShow}
            />
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 border-t md:hidden">
          <div className="grid grid-cols-3 items-center">
            <button className="mobile-nav-active flex flex-col items-center gap-1 py-3 font-semibold">
              <List size={22} />
              <span className="text-xs">My List</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="btn-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              aria-label="Add show"
            >
              <Plus size={24} />
            </button>

            <button className="nav-item flex flex-col items-center gap-1 py-3">
              <Layers size={22} />
              <span className="text-xs">Services</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="mobile-menu-overlay absolute inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="mobile-menu absolute left-0 top-0 h-full w-72 p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Settings</h2>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <a
              href="#"
              className="nav-item mb-6 flex items-center gap-3 rounded-lg font-medium"
            >
              <User className="h-5 w-5" />
              <span>Account</span>
            </a>

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
          onAdd={handleAddShow}
        />
      )}
    </div>
  );
}

export default App;
