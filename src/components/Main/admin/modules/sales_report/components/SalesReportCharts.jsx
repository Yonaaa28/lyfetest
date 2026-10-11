import { formatPeso } from "../utils/salesReportUtils"

function TopPurchasedDonut({ items }) {
  const gradientStops = [
    "#4f7cff 0 40%",
    "#8b5cf6 40% 60%",
    "#fbbf24 60% 75%",
    "#fb923c 75% 90%",
    "#fb7185 90% 100%",
  ].join(",")

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] 2xl:rounded-[28px] 2xl:px-5 2xl:py-5">
      <h2 className="text-base font-extrabold text-slate-900 2xl:text-lg">
        Most Purchased Items
      </h2>
      <div className="mt-4 grid min-w-0 flex-1 items-center gap-4 sm:grid-cols-[minmax(7rem,8rem)_minmax(0,1fr)] 2xl:mt-5 2xl:grid-cols-[minmax(8.5rem,0.85fr)_minmax(0,1fr)]">
        <div className="relative mx-auto h-32 w-32 2xl:h-40 2xl:w-40">
          <div
            className="grid h-full w-full place-items-center rounded-full"
            style={{ background: `conic-gradient(${gradientStops})` }}
          >
            <div className="h-16 w-16 rounded-full bg-white 2xl:h-22 2xl:w-22" />
          </div>
        </div>

        <div className="min-w-0 space-y-1.5 2xl:space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center justify-between gap-2 text-xs font-semibold text-slate-600"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-extrabold text-slate-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function SalesSnapshotCard({ snapshot }) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] 2xl:rounded-[28px] 2xl:px-5 2xl:py-5">
      <div>
        <p className="text-base font-extrabold text-slate-900 2xl:text-lg">
          Sales Snapshot
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Current report view
        </p>
      </div>

      {snapshot ? (
        <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
            <p className="text-xs font-extrabold uppercase text-emerald-700">
              Highest Day
            </p>
            <p className="mt-1.5 text-lg font-extrabold text-slate-950">
              {snapshot.highestDay.label}
            </p>
            <p className="mt-1 text-sm font-bold text-[#00675b] [font-variant-numeric:tabular-nums]">
              {formatPeso(snapshot.highestDay.value)}
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <span className="text-sm font-bold text-slate-500">
                Total Sales
              </span>
              <span className="text-sm font-extrabold text-slate-950 [font-variant-numeric:tabular-nums]">
                {formatPeso(snapshot.totalSales)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <span className="text-sm font-bold text-slate-500">
                Average / Day
              </span>
              <span className="text-sm font-extrabold text-slate-950 [font-variant-numeric:tabular-nums]">
                {formatPeso(snapshot.averageSales)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-500">
                Lowest Day
              </span>
              <span className="text-sm font-extrabold text-slate-950">
                {snapshot.lowestDay.label}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-base font-semibold text-slate-500">
            No sales data available.
          </p>
        </div>
      )}
    </article>
  )
}

function SalesReportCharts({ chartPoints, topPurchasedItems }) {
  const safeChartPoints = chartPoints.filter(
    (point) => typeof point.value === "number"
  )
  const highestDay = safeChartPoints.reduce(
    (highestPoint, point) =>
      !highestPoint || point.value > highestPoint.value ? point : highestPoint,
    null
  )
  const averageSales = safeChartPoints.length
    ? safeChartPoints.reduce((total, point) => total + point.value, 0) /
      safeChartPoints.length
    : 0
  const lowestDay = safeChartPoints.reduce(
    (lowestPoint, point) =>
      !lowestPoint || point.value < lowestPoint.value ? point : lowestPoint,
    null
  )
  const totalSales = safeChartPoints.reduce(
    (total, point) => total + point.value,
    0
  )
  const salesSnapshot =
    highestDay && lowestDay
      ? {
          highestDay,
          lowestDay,
          totalSales,
          averageSales,
        }
      : null

  return (
    <div className="grid h-full min-w-0 items-stretch gap-5 min-[1200px]:grid-cols-[minmax(18rem,0.72fr)_minmax(20rem,1fr)]">
      <SalesSnapshotCard snapshot={salesSnapshot} />
      <TopPurchasedDonut items={topPurchasedItems} />
    </div>
  )
}

export default SalesReportCharts
