type StatCardProps = {
  label: string
  count: number
  color: string
}

function StatCard({ label, count, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>
        {count}
      </p>

      <p className="mt-2 font-semibold text-slate-700">
        {label}
      </p>
    </div>
  )
}

export default StatCard