import DashboardPanel from "./DashboardPanel"

function DonutChart({ items, title = "Most Purchased Items" }) {
  return (
    <DashboardPanel title={title}>
      <div className="grid items-center gap-5 lg:grid-cols-[170px_minmax(0,1fr)]">
        <div className="mx-auto grid h-40 w-40 place-items-center rounded-full bg-[conic-gradient(#22c55e_0_42%,#3b82f6_42%_61%,#fbbf24_61%_79%,#a78bfa_79%_89%,#fb7185_89%_100%)]">
          <div className="h-20 w-20 rounded-full bg-white" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 text-sm last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${item.color}`}
                />
                <span className="truncate font-extrabold text-slate-950">
                  {item.label}
                </span>
              </span>
              <span className="shrink-0 font-extrabold text-[#0b6b51] [font-variant-numeric:tabular-nums]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  )
}

export default DonutChart
