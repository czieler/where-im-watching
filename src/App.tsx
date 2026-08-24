import { useState } from "react";
import wiwLogo from "./assets/wiw_logo.png";
import ShowList from "./components/ShowList";
import AddShowModal from "./components/AddShowModal";
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

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [selectedService, setSelectedService] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [addTarget, setAddTarget] = useState<"watching" | "wantToWatch">(
    "watching",
  );

  const [watching, setWatching] = useState([
    { title: "The Last of Us", service: "Hulu" },
    { title: "Slow Horses", service: "Apple TV+" },
  ]);

  const [wantToWatch, setWantToWatch] = useState([
    { title: "House of the Dragon", service: "Max" },
    { title: "Ted Lasso", service: "Apple TV+" },
    { title: "Only Murders in the Building", service: "Hulu" },
  ]);

  const [completed, setCompleted] = useState([
    { title: "Breaking Bad", service: "Netflix" },
    { title: "The Good Place", service: "Netflix" },
  ]);

  const [onHold, setOnHold] = useState([
    { title: "Yellowjackets", service: "Paramount+" },
  ]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-slate-200 bg-white transition-all duration-200 md:flex md:flex-col ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-6">
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
            className="flex items-center gap-3 rounded-lg bg-teal-50 px-4 py-3 font-medium text-teal-600"
            title={isSidebarCollapsed ? "My List" : undefined}
          >
            <List className="h-5 w-5 shrink-0" />

            {!isSidebarCollapsed && <span>My List</span>}
          </a>

          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
            title={isSidebarCollapsed ? "Services" : undefined}
          >
            <Layers className="h-5 w-5 shrink-0" />

            {!isSidebarCollapsed && <span>Services</span>}
          </a>

          <div className="mt-auto">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
              title={isSidebarCollapsed ? "Account" : undefined}
            >
              <User className="h-5 w-5 shrink-0" />

              {!isSidebarCollapsed && <span>Account</span>}
            </a>

            <div className="px-4 py-4">
              {isSidebarCollapsed ? (
                <button
                  className="flex w-full items-center justify-center text-slate-600"
                  title="Theme"
                  aria-label="Theme"
                >
                  <Palette className="h-5 w-5" />
                </button>
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
                      id="theme"
                      className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="blues">Blues</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-1/2 -right-4 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* Everything to the right of the sidebar on desktop */}
      <div
        className={`transition-all duration-200 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
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
        <main className="mx-auto max-w-[1440px] px-4 py-6 pb-28 sm:px-6 md:pb-8">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search my list..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-44 appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5"
              >
                <option value="all">All Statuses</option>
                <option value="watching">Watching</option>
                <option value="wantToWatch">Want to Watch</option>
                <option value="completed">Completed</option>
                <option value="onHold">On Hold</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-44 appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5"
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
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
          {(selectedStatus === "all" || selectedStatus === "watching") && (
            <ShowList
              title="Currently Watching"
              shows={filteredWatching}
              onAdd={() => {
                setAddTarget("watching");
                setIsAddOpen(true);
              }}
            />
          )}
          {(selectedStatus === "all" || selectedStatus === "wantToWatch") && (
            <ShowList
              title="Want to Watch"
              shows={filteredWantToWatch}
              onAdd={() => {
                setAddTarget("wantToWatch");
                setIsAddOpen(true);
              }}
            />
          )}
          {(selectedStatus === "all" || selectedStatus === "completed") && (
            <ShowList
              title="Completed"
              shows={filteredCompleted}
              onAdd={() => {
                console.log("Add to Completed");
              }}
              defaultExpanded={false}
            />
          )}
          {(selectedStatus === "all" || selectedStatus === "onHold") && (
            <ShowList
              title="On Hold"
              shows={filteredOnHold}
              onAdd={() => {
                console.log("Add to On Hold");
              }}
              defaultExpanded={false}
            />
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white md:hidden">
          <div className="grid grid-cols-3 items-center">
            <button className="flex flex-col items-center gap-1 py-3 font-semibold text-teal-600">
              <List size={22} />
              <span className="text-xs">My List</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white"
              aria-label="Add show"
            >
              <Plus size={24} />
            </button>

            <button className="flex flex-col items-center gap-1 py-3 text-slate-600">
              <Layers size={22} />
              <span className="text-xs">Services</span>
            </button>
          </div>
        </nav>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-lg">
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
              className="mb-6 flex items-center gap-3 rounded-lg  font-medium text-slate-600 hover:bg-slate-100"
            >
              <User className="h-5 w-5" />
              <span>Account</span>
            </a>

            <label htmlFor="mobile-theme" className="mb-2 block font-semibold">
              Theme
            </label>

            <div className="relative">
              <select
                id="mobile-theme"
                className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="blues">Blues</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </aside>
        </div>
      )}
      {isAddOpen && <AddShowModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
}

export default App;
