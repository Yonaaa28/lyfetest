import {
  HiChevronRight,
  HiMinus,
  HiOutlineArchiveBox,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineBellAlert,
  HiOutlineBuildingStorefront,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineShoppingCart,
  HiOutlineTrophy,
  HiOutlineUsers,
} from "react-icons/hi2"

const peso = "\u20b1"

const dashboardData = {
  branchSales: [],
  branchPerformance: [],
  medicines: [],
  requests: [],
  branchAttention: [],
}

const summaryCards = [
  {
    label: "Today's Total Sales",
    mobileLabel: "Today's Sales",
    value: `${peso}0.00`,
    detail: "All branches combined",
    mobileDetail: "All branches combined",
    icon: HiOutlineArchiveBox,
    tone: "green",
    emphasized: true,
  },
  {
    label: "Total Branches",
    mobileLabel: "Branches",
    value: "0",
    detail: "All branches active",
    mobileDetail: "All active",
    icon: HiOutlineBuildingStorefront,
    tone: "mint",
  },
  {
    label: "Total Users",
    mobileLabel: "Users",
    value: "0",
    detail: "0 Admins - 0 Staff",
    mobileDetail: "0 admins · 0 staff",
    icon: HiOutlineUsers,
    tone: "blue",
  },
  {
    label: "Pending Requests",
    value: "0",
    detail: "Needs your approval",
    mobileDetail: "Needs approval",
    icon: HiOutlineShoppingCart,
    tone: "orange",
  },
  {
    label: "Low Stock Alerts",
    mobileLabel: "Low Stock",
    value: "0",
    detail: "Items need attention",
    mobileDetail: "Needs attention",
    icon: HiOutlineBellAlert,
    tone: "red",
  },
  {
    label: "Expiring Soon",
    value: "0",
    detail: "Within 30 days",
    mobileDetail: "Within 30 days",
    icon: HiOutlineCalendarDays,
    tone: "purple",
  },
]


const mobileSummaryOrder = {
  "Today's Total Sales": "order-1",
  "Pending Requests": "order-2",
  "Low Stock Alerts": "order-3",
  "Expiring Soon": "order-4",
  "Total Branches": "order-5",
  "Total Users": "order-6",
}
const { branchSales, branchPerformance, medicines, requests, branchAttention } = dashboardData

const toneClasses = {
  green: "bg-[#00675b] text-white",
  mint: "bg-emerald-500 text-white",
  blue: "bg-[#4b7bec] text-white",
  orange: "bg-[#fb923c] text-white",
  red: "bg-[#fb7185] text-white",
  purple: "bg-[#8b5cf6] text-white",
}

const kpiIconToneClasses = {
  green: "text-emerald-700",
  mint: "text-emerald-600",
  blue: "text-blue-600",
  orange: "text-orange-500",
  red: "text-red-500",
  purple: "text-purple-600",
}
const subtleToneClasses = {
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
}

const statusClasses = {
  Excellent: "bg-emerald-50 text-emerald-700",
  Good: "bg-emerald-50 text-emerald-700",
  Average: "bg-amber-50 text-amber-700",
  "Needs Attention": "bg-red-50 text-red-600",
  Healthy: "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-600",
}

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

function SuperAdminDashboard({ branchCount = 0, users = [], onNavigate = () => {} }) {
  const adminCount = users.filter((user) => user.role?.toLowerCase().includes("admin")).length
  const staffCount = Math.max(users.length - adminCount, 0)
  const dashboardCards = summaryCards.map((item) => {
    if (item.label === "Total Branches") {
      return { ...item, value: String(branchCount), detail: "Active branches", mobileDetail: "Active branches" }
    }
    if (item.label === "Total Users") {
      return {
        ...item,
        value: String(users.length),
        detail: `${adminCount} Admin${adminCount === 1 ? "" : "s"} - ${staffCount} Staff`,
        mobileDetail: `${adminCount} admin${adminCount === 1 ? "" : "s"} · ${staffCount} staff`,
      }
    }
    return item
  })

  return (
    <div className="w-full space-y-5 px-4 pb-6 sm:space-y-4 sm:px-6 lg:px-8">
      <section className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {dashboardCards.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.label}
              className={`${mobileSummaryOrder[item.label] ?? "order-6"} ${item.emphasized ? "col-span-full" : ""} ${item.label === "Total Users" ? "hidden lg:flex" : "flex"} min-h-[92px] flex-col justify-between rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:order-none lg:col-span-1 lg:min-h-[112px] lg:rounded-2xl lg:p-4 lg:shadow-[0_8px_24px_rgba(15,23,42,0.05)]`}
            >
              <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-snug text-slate-700 sm:text-sm">
                    <span className="sm:hidden">{item.mobileLabel ?? item.label}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </p>
                  <p className="mt-3 text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] sm:text-2xl lg:mt-2">
                    {item.value}
                  </p>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 sm:h-10 sm:w-10 sm:rounded-2xl lg:h-11 lg:w-11">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${kpiIconToneClasses[item.tone]}`} />
                </div>
              </div>
              <div className="mt-1.5 min-w-0 sm:mt-2 sm:flex sm:items-end sm:justify-between sm:gap-2">
                <p
                  className={`text-[11px] font-medium leading-4 sm:truncate sm:text-xs sm:leading-5 ${
                    item.tone === "red"
                      ? "text-red-500"
                      : item.tone === "orange"
                        ? "text-orange-500"
                        : item.tone === "purple"
                          ? "text-purple-600"
                          : item.tone === "blue"
                            ? "text-blue-600"
                            : "text-[#0b6b51]"
                  }`}
                >
                  <span className="sm:hidden">{item.mobileDetail ?? item.detail}</span>
                  <span className="hidden sm:inline">{item.detail}</span>
                </p>
                {item.trend ? (
                  <span className="hidden shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-600 sm:flex">
                    <HiOutlineArrowTrendingUp className="h-4 w-4" />
                    {item.trend}
                  </span>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>
      <div className="grid grid-cols-1 gap-4 min-[1400px]:grid-cols-[0.92fr_1.2fr]">
        <Card className="flex h-full flex-col p-4">
          <div className="mb-4">
            <h2 className="truncate text-lg font-bold">
              Sales Overview by Branch
            </h2>
          </div>
          <BranchBarChart />
          {branchSales.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SalesBadge
                icon={HiOutlineTrophy}
                title="Highest Sales"
                branch={branchSales[0].name}
                value={branchSales[0].label}
                tone="orange"
              />
              <SalesBadge
                icon={HiOutlineExclamationTriangle}
                title="Lowest Sales"
                branch={branchSales[branchSales.length - 1].name}
                value={branchSales[branchSales.length - 1].label}
                tone="red"
              />
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-500">
              No branch sales yet for this period.
            </div>
          )}
        </Card>

        <Card className="flex h-full flex-col p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Branch Performance</h2>
          </div>
          <div className="space-y-2 lg:hidden">
            {branchPerformance.length === 0 ? <EmptyState message="No branch performance data yet." /> : null}
            {branchPerformance.map(([branch, status]) => <div key={branch} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"><span className="flex min-w-0 items-start gap-2 text-sm font-bold text-slate-900"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${status === "Needs Attention" ? "bg-red-500" : status === "Average" ? "bg-amber-400" : "bg-[#00675b]"}`} /><span className="line-clamp-2">{branch}</span></span><StatusPill value={status} /></div>)}
          </div>
          <div className="hidden min-h-0 flex-1 overflow-x-auto lg:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-y border-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-3 font-bold">Branch</th>
                  <th className="px-2 py-3 font-bold">Status</th>
                  <th className="px-2 py-3 font-bold">Sales (This Month)</th>
                  <th className="px-2 py-3 font-bold">Inventory Status</th>
                  <th className="px-2 py-3 text-right font-bold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {branchPerformance.length > 0 ? (
                  branchPerformance.map(([branch, status, sales, inventory, trend]) => (
                    <tr key={branch} className="border-b border-slate-100">
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-2 font-bold text-slate-900">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              status === "Needs Attention"
                                ? "bg-red-500"
                                : status === "Average"
                                  ? "bg-amber-400"
                                  : "bg-[#00675b]"
                            }`}
                          />
                          {branch}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <StatusPill value={status} />
                      </td>
                      <td className="px-2 py-3 font-bold text-slate-900">{sales}</td>
                      <td className="px-2 py-3">
                        <StatusPill value={inventory} />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <TrendIcon trend={trend} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-slate-100">
                    <td colSpan={5} className="px-2 py-8 text-center text-sm font-semibold text-slate-500">
                      No branch performance data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => onNavigate("branches")} className="rounded-lg border border-[#0b6b51] px-5 py-2 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50">View All Branches</button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1400px]:grid-cols-3">
        <TopMedicinesCard onNavigate={onNavigate} />
        <PendingRequestsCard onNavigate={onNavigate} />
        <BranchAttentionCenter onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function BranchBarChart() {
  const max = 100000

  return (
    <div className="min-w-0 overflow-hidden sm:overflow-x-auto">
      <div className="min-w-0 sm:min-w-[430px]">
        <div className="grid grid-cols-[54px_1fr] gap-3">
          <div className="flex h-50 flex-col justify-between pb-8 text-xs font-semibold text-slate-600">
            {[`${peso}100,000`, `${peso}80,000`, `${peso}60,000`, `${peso}40,000`, `${peso}20,000`, `${peso}0`].map(
              (label) => (
                <span key={label}>{label}</span>
              )
            )}
          </div>
          <div className="relative h-44 border-b border-slate-300 sm:h-50">
            <div className="absolute inset-0 flex flex-col justify-between pb-8">
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <span
                  key={line}
                  className="block border-t border-slate-200"
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 top-0 grid grid-cols-5 items-end gap-2 px-1 pb-0 sm:gap-5 sm:px-5">
              {branchSales.length > 0 ? (
                branchSales.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex h-full min-w-0 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-[10px] font-bold text-[#0b6b51] sm:text-xs">
                      {branch.label}
                    </span>
                    <div
                      className="w-full max-w-9 rounded-t-md bg-[#00675b] sm:max-w-12"
                      style={{ height: `${(branch.value / max) * 80}%` }}
                    />
                    <span className="mt-3 line-clamp-2 text-center text-[9px] font-semibold leading-3 sm:text-xs">
                      {branch.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-5 flex h-full items-center justify-center px-4 pb-8 text-center text-sm font-semibold text-slate-500">
                  No sales data to display.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span className="h-3 w-3 bg-[#00675b]" />
          Total Sales ({peso})
        </div>
      </div>
    </div>
  )
}

function SalesBadge({ branch, icon: Icon, title, tone, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
          tone === "red" ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500">{title}</p>
        <p className="line-clamp-2 text-xs font-medium text-slate-600">{branch}</p>
        <p className="mt-1 text-sm font-bold text-[#0b6b51]">{value}</p>
      </div>
    </div>
  )
}

function StatusPill({ value }) {
  return (
    <span className={`rounded-md px-3 py-1 text-xs font-bold ${statusClasses[value]}`}>
      {value}
    </span>
  )
}

function TrendIcon({ trend }) {
  if (trend === "up") {
    return <HiOutlineArrowTrendingUp className="ml-auto h-5 w-5 text-emerald-600" />
  }

  if (trend === "down") {
    return <HiOutlineArrowTrendingDown className="ml-auto h-5 w-5 text-red-500" />
  }

  return <HiMinus className="ml-auto h-5 w-5 text-slate-500" />
}

function BottomViewButton({ label, onClick }) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0b6b51] px-5 py-2 text-sm font-bold text-[#0b6b51] transition hover:bg-emerald-50"
      >
        {label}
        <HiChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function TopMedicinesCard({ onNavigate }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="min-w-0 text-lg font-bold">Top Selling Medicines</h2>
      </div>
      {medicines.length > 0 ? (
        <>
          <div className="space-y-2 lg:hidden">
            {medicines.map(([rank, medicine, branch, sold, revenue, trend]) => (
              <div key={rank} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-[#0b6b51]">{rank}</span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold text-slate-900">{medicine}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-slate-500">{branch} - {sold} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{revenue}</p>
                  <TrendPercent value={trend} />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden min-h-0 flex-1 overflow-x-auto lg:block">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  {["#", "Medicine", "Top Branch", "Total Sold", "Revenue", "Trend"].map((header) => (
                    <th key={header} className="px-2 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medicines.map((row) => (
                <tr key={row.join("-")} className="border-t border-slate-100">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${cell}`} className="whitespace-nowrap px-2 py-3 font-medium">
                      {index === 5 ? <TrendPercent value={cell} /> : cell}
                    </td>
                  ))}
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center">
          <EmptyState message="No top selling medicines yet." />
        </div>
      )}
      <BottomViewButton label="View Report" onClick={() => onNavigate("sales-analytics")} />
    </Card>
  )
}

function TrendPercent({ value }) {
  const isPositive = value.startsWith("+")

  return (
    <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {isPositive ? (
        <HiOutlineArrowTrendingUp className="h-4 w-4" />
      ) : (
        <HiOutlineArrowTrendingDown className="h-4 w-4" />
      )}
      {value}
    </span>
  )
}

function PendingRequestsCard({ onNavigate }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="min-w-0 text-lg font-bold">Pending Purchase Requests</h2>
      </div>
      {requests.length > 0 ? (
        <>
          <div className="space-y-2 lg:hidden">
            {requests.slice(0, 4).map(([requestId, branch, items, cost, days]) => (
              <div key={requestId} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{requestId}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-slate-500">{branch}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Requested by {branch.replace(" (Main Branch)", "")} Admin · {items} items</p>
                  </div>
                  <DaysPending value={days} />
                </div>
                <p className="mt-2 text-sm font-bold text-[#0b6b51]">{cost}</p>
              </div>
            ))}
          </div>
          <div className="hidden min-h-0 flex-1 overflow-x-auto lg:block">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  {["Request ID", "Branch", "Items", "Estimated Cost", "Days Pending"].map((header) => (
                    <th key={header} className="px-2 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((row) => (
                <tr key={row[0]} className="border-t border-slate-100">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${cell}`} className="whitespace-nowrap px-2 py-3 font-medium">
                      {index === 4 ? <DaysPending value={cell} /> : cell}
                    </td>
                  ))}
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center">
          <EmptyState message="No pending purchase requests." />
        </div>
      )}
      <BottomViewButton label="View Requests" onClick={() => onNavigate("purchase-requests")} />
    </Card>
  )
}

function DaysPending({ value }) {
  const dayCount = Number.parseInt(value, 10)
  const className =
    dayCount >= 5
      ? "text-red-500"
      : dayCount >= 3
        ? "text-orange-500"
        : "text-emerald-600"

  return <span className={`font-bold ${className}`}>{value}</span>
}

function BranchAttentionCenter({ onNavigate }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-4"><h2 className="min-w-0 text-lg font-bold">Branch Attention Center</h2></div>
      <div className="min-h-0 flex-1 divide-y divide-slate-200">
        {branchAttention.length > 0 ? (
          branchAttention.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.branch}
                type="button"
                className="flex w-full min-w-0 items-center gap-3 py-3 text-left transition hover:bg-slate-50"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneClasses[item.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-2 text-sm font-bold text-slate-900">
                    {item.branch}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs font-medium text-slate-500">
                    {item.detail}
                  </span>
                </span>
                <span className={`rounded-md px-3 py-1 text-xs font-bold ${subtleToneClasses[item.tone]}`}>
                  {item.status}
                </span>
                <HiChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
              </button>
            )
          })
        ) : (
          <div className="flex h-full items-center">
            <EmptyState message="No branch issues need attention." />
          </div>
        )}
      </div>
      <BottomViewButton label="View Details" onClick={() => onNavigate("inventory-control")} />
    </Card>
  )
}

function EmptyState({ message }) {
  return (
    <div className="grid min-h-[120px] w-full place-items-center rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm font-semibold text-slate-500">
      {message}
    </div>
  )
}

export default SuperAdminDashboard




