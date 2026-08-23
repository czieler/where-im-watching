import { useState } from "react";
import wiwLogo from "./assets/wiw_logo.png";
import StatCard from "./components/StatCard";
import ShowList from "./components/ShowList";

const stats = [
  { label: "Watching", count: 12, color: "text-teal-600" },
  { label: "Want to Watch", count: 8, color: "text-slate-600" },
  { label: "Completed", count: 24, color: "text-slate-600" },
  { label: "On Hold", count: 5, color: "text-slate-500" },
];

function App() {
  const [watching, setWatching] = useState([
    { title: "The Last of Us", service: "Hulu" },
    { title: "Slow Horses", service: "Apple TV+" },
  ]);

  const [wantToWatch, setWantToWatch] = useState([
    { title: "House of the Dragon", service: "Max" },
    { title: "Ted Lasso", service: "Apple TV+" },
    { title: "Only Murders in the Building", service: "Hulu" },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <img
              src={wiwLogo}
              alt="Where I'm Watching"
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-xl font-bold">Where I'm Watching</h1>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4">
          <a
            href="#"
            className="rounded-lg bg-teal-50 px-4 py-3 font-medium text-teal-600"
          >
            Overview
          </a>

          <a
            href="#"
            className="rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
          >
            My List
          </a>

          <a
            href="#"
            className="rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
          >
            Search
          </a>

          <a
            href="#"
            className="rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
          >
            Account
          </a>
        </nav>
      </aside>

      {/* Everything to the right of the sidebar on desktop */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button className="text-2xl md:hidden" aria-label="Open menu">
                ☰
              </button>

              <h2 className="text-xl font-bold">Overview</h2>
            </div>

            <button className="text-xl" aria-label="Notifications">
              🔔
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 md:pb-8">
          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                count={stat.count}
                color={stat.color}
              />
            ))}
          </section>

          <ShowList
            title="Currently Watching"
            shows={watching}
            onAdd={() => console.log("Add to Watching")}
          />
          <ShowList
            title="Currently Watching"
            shows={wantToWatch}
            onAdd={() => console.log("Add to Want to Watch")}
          />
        </main>

        {/* Mobile bottom navigation */}
        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white md:hidden">
          <div className="grid grid-cols-5 items-center">
            <button className="py-4 text-sm font-semibold text-teal-600">
              Home
            </button>

            <button className="py-4 text-sm text-slate-600">My List</button>

            <button
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-2xl text-white"
              aria-label="Add show"
            >
              +
            </button>

            <button className="py-4 text-sm text-slate-600">Search</button>

            <button className="py-4 text-sm text-slate-600">Account</button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
