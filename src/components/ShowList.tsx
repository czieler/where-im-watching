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
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>

        <div className="flex items-center gap-6">
          <button onClick={onAdd} className="btn btn-primary">
            + Add
          </button>

          <a href="#">See all</a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {shows.map((show) => (
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
    </section>
  );
}

export default ShowList;
