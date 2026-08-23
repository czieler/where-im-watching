import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

type Show = {
  title: string;
  service: string;
};

type ShowListProps = {
  title: string;
  shows: Show[];
  onAdd: () => void;
};

function ShowList({ title, shows, onAdd }: ShowListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <section className="mb-10 mt-8">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex cursor-pointer items-center justify-between bg-[var(--color-accent)] px-5 py-3 text-white"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{title}</h3>

            <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-semibold">
              {shows.length}
            </span>
          </div>

          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isExpanded &&
          shows.map((show) => (
            <div
              key={show.title}
              className="flex items-center justify-between border-b border-slate-200 px-5 py-4 last:border-b-0"
            >
              <span className="font-semibold">{show.title}</span>

              <span className="text-sm font-medium text-slate-500">
                {show.service}
              </span>
            </div>
          ))}
      </div>

      <div className="mt-3 flex justify-end">
        <button onClick={onAdd} className="btn btn-primary">
          + Add
        </button>
      </div>
    </section>
  );
}

export default ShowList;
