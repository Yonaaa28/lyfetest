import { useMemo, useState } from "react"
import { FaRegCalendarTimes } from "react-icons/fa"
import { FaMoneyBillTrendUp } from "react-icons/fa6"
import { GoAlert } from "react-icons/go"
import { GrTransaction } from "react-icons/gr"
import {
  HiOutlineArchiveBoxXMark,
  HiOutlineCalendarDays,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2"

import BranchStatisticsCard from "../../shared/widgets/BranchStatisticsCard"
import DashboardPanel from "../../shared/widgets/DashboardPanel"
import DonutChart from "../../shared/widgets/DonutChart"
import { mockSalesTransactions } from "../sales_report/data/salesReportMockData"
import {
  formatPeso,
  formatTransactionDate,
} from "../sales_report/utils/salesReportUtils"
const summaryCards = [
  {
    id: "profit",
    label: "Total Profit",
    value: "P 0.00",
    accent: "text-emerald-600",
    icon: FaMoneyBillTrendUp,
  },
  {
    id: "transactions",
    label: "Transactions (today)",
    value: "0",
    accent: "text-sky-600",
    icon: GrTransaction,
  },
  {
    id: "expiring",
    label: "Expiring soon",
    value: "00",
    accent: "text-orange-500",
    icon: FaRegCalendarTimes,
  },
  {
    id: "low-stock",
    label: "Low Stock Items",
    value: "00",
    accent: "text-amber-500",
    icon: GoAlert,
  },
]
const inventorySummary = [
  {
    label: "Healthy Products",
    detail: "Well stocked",
    count: 235,
    percent: "85%",
    Icon: HiOutlineCube,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    percentClass: "text-emerald-700",
  },
  {
    label: "Low Stock",
    detail: "Needs restocking",
    count: 12,
    percent: "10%",
    Icon: HiOutlineExclamationTriangle,
    iconClass: "bg-amber-50 text-amber-600 ring-amber-100",
    percentClass: "text-orange-600",
  },
  {
    label: "Expiring Soon",
    detail: "Within 30 days",
    count: 5,
    percent: "3%",
    Icon: HiOutlineCalendarDays,
    iconClass: "bg-rose-50 text-rose-600 ring-rose-100",
    percentClass: "text-red-600",
  },
  {
    label: "Out of Stock",
    detail: "Not available",
    count: 2,
    percent: "2%",
    Icon: HiOutlineArchiveBoxXMark,
    iconClass: "bg-slate-100 text-slate-500 ring-slate-200",
    percentClass: "text-slate-500",
  },
]
const purchasedItems = [
  { label: "Ibuprofen", value: "42.3%", color: "bg-emerald-500" },
  { label: "Dolfenac", value: "19.2%", color: "bg-blue-500" },
  { label: "Cetirizine", value: "17.7%", color: "bg-amber-400" },
  { label: "Biogesic", value: "15.4%", color: "bg-violet-400" },
  { label: "Mefenamic", value: "15.4%", color: "bg-rose-400" },
]

const formatCompactRevenue = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)

const monthItems = [
  { key: "Jan", label: "January" },
  { key: "Feb", label: "February" },
  { key: "Mar", label: "March" },
  { key: "Apr", label: "April" },
  { key: "May", label: "May" },
  { key: "Jun", label: "June" },
  { key: "Jul", label: "July" },
  { key: "Aug", label: "August" },
  { key: "Sep", label: "September" },
  { key: "Oct", label: "October" },
  { key: "Nov", label: "November" },
  { key: "Dec", label: "December" },
]

const branchStatisticsData = [
  { year: 2025, month: "Jan", value: 10800 },
  { year: 2025, month: "Feb", value: 21600 },
  { year: 2025, month: "Mar", value: 32900 },
  { year: 2025, month: "Apr", value: 14100 },
  { year: 2025, month: "May", value: 23600 },
  { year: 2025, month: "Jun", value: 15400 },
  { year: 2025, month: "Jul", value: 26700 },
  { year: 2025, month: "Aug", value: 27500 },
  { year: 2025, month: "Sep", value: 26200 },
  { year: 2025, month: "Oct", value: 28900 },
  { year: 2025, month: "Nov", value: 30100 },
  { year: 2025, month: "Dec", value: 12400 },
  { year: 2026, month: "Jan", value: 22600 },
  { year: 2026, month: "Feb", value: 23800 },
  { year: 2026, month: "Mar", value: 24700 },
  { year: 2026, month: "Apr", value: 26100 },
  { year: 2026, month: "May", value: 27300 },
  { year: 2026, month: "Jun", value: 28900 },
  { year: 2026, month: "Jul", value: 29800 },
  { year: 2026, month: "Aug", value: 11200 },
  { year: 2026, month: "Sep", value: 30400 },
  { year: 2026, month: "Oct", value: 32700 },
  { year: 2026, month: "Nov", value: 34100 },
  { year: 2026, month: "Dec", value: 45900 },
]

function AdminDashboard({
  activeBranchId,
  onInventoryClick,
}) {
  void activeBranchId

  const [selectedMonthlyRevenueYear, setSelectedMonthlyRevenueYear] =
    useState("2026")
  const [selectedBranchStatisticsYear, setSelectedBranchStatisticsYear] =
    useState("2026")
  const recentTransactionHistoryItems = mockSalesTransactions.slice(0, 5)

  const branchStatisticsYears = useMemo(() => {
    const years = [...new Set(branchStatisticsData.map((item) => item.year))]
    return years.sort((leftYear, rightYear) => rightYear - leftYear)
  }, [])

  const filteredMonthlyRevenuePoints = useMemo(() => {
    if (selectedMonthlyRevenueYear === "all-time") {
      return monthItems.reduce((monthlyPoints, month) => {
        const monthRecords = branchStatisticsData.filter(
          (item) => item.month === month.key
        )

        if (!monthRecords.length) {
          return monthlyPoints
        }

        const totalValue = branchStatisticsData
          .filter((item) => item.month === month.key)
          .reduce((sum, item) => sum + item.value, 0)

        return [
          ...monthlyPoints,
          {
            key: month.key,
            label: month.label,
            value: totalValue,
          },
        ]
      }, [])
    }

    return monthItems.reduce((monthlyPoints, month) => {
      const matchingPoint = branchStatisticsData.find(
        (item) =>
          item.year === Number(selectedMonthlyRevenueYear) &&
          item.month === month.key
      )

      if (!matchingPoint) {
        return monthlyPoints
      }

      return [
        ...monthlyPoints,
        {
          key: month.key,
          label: month.label,
          value: matchingPoint.value,
        },
      ]
    }, [])
  }, [selectedMonthlyRevenueYear])

  const totalMonthlyRevenue = useMemo(
    () =>
      filteredMonthlyRevenuePoints.reduce((sum, point) => sum + point.value, 0),
    [filteredMonthlyRevenuePoints]
  )
  const monthlyRevenueMax = useMemo(
    () =>
      Math.max(
        0,
        ...filteredMonthlyRevenuePoints.map((point) => Number(point.value) || 0)
      ),
    [filteredMonthlyRevenuePoints]
  )
  const revenueSnapshot = useMemo(() => {
    if (!filteredMonthlyRevenuePoints.length) {
      return null
    }

    const bestMonth = filteredMonthlyRevenuePoints.reduce((best, point) =>
      point.value > best.value ? point : best
    )
    const lowestMonth = filteredMonthlyRevenuePoints.reduce((lowest, point) =>
      point.value < lowest.value ? point : lowest
    )
    const averageRevenue = Math.round(
      totalMonthlyRevenue / filteredMonthlyRevenuePoints.length
    )
    const latestMonth =
      filteredMonthlyRevenuePoints[filteredMonthlyRevenuePoints.length - 1]
    const previousMonth =
      filteredMonthlyRevenuePoints[filteredMonthlyRevenuePoints.length - 2]
    const latestChange =
      previousMonth?.value > 0
        ? ((latestMonth.value - previousMonth.value) / previousMonth.value) *
          100
        : 0

    return {
      bestMonth,
      lowestMonth,
      averageRevenue,
      latestMonth,
      latestChange,
    }
  }, [filteredMonthlyRevenuePoints, totalMonthlyRevenue])

  const filteredBranchStatisticsPoints = useMemo(() => {
    if (selectedBranchStatisticsYear === "all-time") {
      return monthItems.map((month) => {
        const totalValue = branchStatisticsData
          .filter((item) => item.month === month.key)
          .reduce((sum, item) => sum + item.value, 0)

        return {
          label: month.label,
          value: totalValue,
        }
      })
    }

    return monthItems.map((month) => {
      const matchingPoint = branchStatisticsData.find(
        (item) =>
          item.year === Number(selectedBranchStatisticsYear) &&
          item.month === month.key
      )

      return {
        label: month.label,
        value: matchingPoint?.value ?? 0,
      }
    })
  }, [selectedBranchStatisticsYear])
  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.id}
              className="rounded-[22px] border border-white/60 bg-white px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:rounded-[26px] sm:px-6 sm:py-8 sm:pt-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 sm:text-base">
                    {card.label}
                  </p>
                  <p className="mt-3 text-xl font-medium text-slate-900 [font-variant-numeric:tabular-nums] sm:mt-5 sm:text-2xl">
                    {card.value}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-2 sm:p-3">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.accent}`} />
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <DashboardPanel
          title="Inventory Summary"
          action={
            <button
              type="button"
              onClick={onInventoryClick}
              className="text-sm font-semibold text-[#0b6b51]"
            >
              View full inventory
            </button>
          }
        >
          <div className="grid items-center gap-5 lg:grid-cols-[170px_minmax(0,1fr)]">
            <div className="mx-auto grid h-40 w-40 place-items-center rounded-full bg-[conic-gradient(#059669_0_85%,#f59e0b_85%_95%,#fb7185_95%_98%,#94a3b8_98%_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
              <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <div>
                  <p className="text-2xl font-extrabold leading-none text-slate-950">
                    85%
                  </p>
                  <p className="mt-1 text-xs font-bold leading-tight text-slate-600">
                    Inventory
                    <br />
                    Health
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100">
              {inventorySummary.map(
                ({ label, detail, count, percent, Icon, iconClass, percentClass }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${iconClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-950">
                          {label}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                          {detail}
                        </p>
                      </div>
                    </div>
                    <p className="text-base font-extrabold text-slate-950">
                      {count}
                    </p>
                    <p className={`text-sm font-extrabold ${percentClass}`}>
                      {percent}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </DashboardPanel>

        <DonutChart items={purchasedItems} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
        <DashboardPanel
          title="Monthly Revenue"
          className="h-full"
          action={
            <select
              id="monthly-revenue-year"
              value={selectedMonthlyRevenueYear}
              onChange={(event) =>
                setSelectedMonthlyRevenueYear(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-slate-600 [font-variant-numeric:tabular-nums] outline-none transition focus:border-[#003e30] focus:ring-2 focus:ring-[#0b6b51]/20 sm:w-auto"
              aria-label="Select monthly revenue year"
            >
              <option value="all-time">All Time</option>
              {branchStatisticsYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          }
        >
          <p className="mb-5 text-sm font-semibold text-slate-500">
            Total Revenue:{" "}
            <span className="font-extrabold text-slate-900 [font-variant-numeric:tabular-nums]">
              P {totalMonthlyRevenue.toLocaleString()}
            </span>
          </p>

          {filteredMonthlyRevenuePoints.length ? (
            <div className="min-w-0 overflow-x-auto pb-2">
              <div className="min-w-[620px]">
                <div className="relative h-64 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 pb-3 pt-8">
                  <div className="pointer-events-none absolute inset-x-4 top-8 bottom-9 grid grid-rows-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="border-t border-dashed border-slate-200 first:border-slate-300"
                      />
                    ))}
                  </div>

                  <div className="relative z-10 grid h-full grid-cols-12 gap-2">
                    {filteredMonthlyRevenuePoints.map((point) => {
                      const isTopMonth = point.value === monthlyRevenueMax
                      const barHeight = monthlyRevenueMax
                        ? Math.max((point.value / monthlyRevenueMax) * 100, 4)
                        : 0

                      return (
                        <div
                          key={point.key}
                          className="flex h-full min-w-0 flex-col"
                        >
                          <div className="flex min-h-0 flex-1 flex-col justify-end">
                            <div className="mb-2 text-center text-[11px] font-extrabold text-slate-600 [font-variant-numeric:tabular-nums]">
                              {formatCompactRevenue(point.value)}
                            </div>
                            <div
                              className={`mx-auto w-full max-w-12 rounded-t-md transition ${
                                isTopMonth
                                  ? "bg-[#00675b]"
                                  : "bg-[#1f8a78]/75"
                              }`}
                              style={{ height: `${barHeight}%` }}
                              aria-label={`${point.label} revenue ${formatCompactRevenue(
                                point.value
                              )}`}
                            />
                          </div>
                          <span className="mt-3 truncate text-center text-[11px] font-bold text-slate-500">
                            {point.key}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-[22px] border border-dashed border-slate-200 text-center">
              <div>
                <p className="text-base font-medium text-slate-500">
                  No monthly revenue data yet.
                </p>
              </div>
            </div>
          )}
        </DashboardPanel>

        <article className="min-w-0 rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:px-6 sm:py-6">
          <div>
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">
              Revenue Snapshot
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {selectedMonthlyRevenueYear === "all-time"
                ? "All-time monthly view"
                : `${selectedMonthlyRevenueYear} monthly view`}
            </p>
          </div>

          {revenueSnapshot ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-extrabold uppercase text-emerald-700">
                  Best Month
                </p>
                <p className="mt-2 text-xl font-extrabold text-slate-950">
                  {revenueSnapshot.bestMonth.label}
                </p>
                <p className="mt-1 text-sm font-bold text-[#00675b] [font-variant-numeric:tabular-nums]">
                  {formatPeso(revenueSnapshot.bestMonth.value)}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-500">
                    Average
                  </span>
                  <span className="text-sm font-extrabold text-slate-950 [font-variant-numeric:tabular-nums]">
                    {formatPeso(revenueSnapshot.averageRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-500">
                    Lowest
                  </span>
                  <span className="text-sm font-extrabold text-slate-950">
                    {revenueSnapshot.lowestMonth.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-500">
                    Latest Change
                  </span>
                  <span
                    className={`text-sm font-extrabold [font-variant-numeric:tabular-nums] ${
                      revenueSnapshot.latestChange >= 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {revenueSnapshot.latestChange >= 0 ? "+" : ""}
                    {revenueSnapshot.latestChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500">
                No revenue snapshot yet.
              </p>
            </div>
          )}
        </article>
      </section>

      <section>
        <BranchStatisticsCard
          points={filteredBranchStatisticsPoints}
          title="Branch Performance"
          action={
            <select
              id="branch-statistics-year"
              value={selectedBranchStatisticsYear}
              onChange={(event) =>
                setSelectedBranchStatisticsYear(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-slate-600 [font-variant-numeric:tabular-nums] outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/20 sm:w-auto"
              aria-label="Select branch statistics year"
            >
              <option value="all-time">All Time</option>
              {branchStatisticsYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          }
          metricLabel="Monthly performance"
          lineColor="#00675b"
          className="sm:px-5 sm:py-5"
          chartClassName="h-auto w-full"
          chartWidth={1180}
          chartHeight={220}
          chartPadding={{
            top: 18,
            right: 34,
            bottom: 42,
            left: 70,
          }}
        />
      </section>

      <section>
        <article className="min-w-0 rounded-[18px] border border-slate-100 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-slate-950">
              Recent Transactions
            </h2>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  {[
                    "Status",
                    "Transaction Date & Time",
                    "OR & Invoice No.",
                    "Cashier",
                    "Total Items",
                    "Customer Type",
                    "Discount",
                    "Discount Amount",
                    "Total",
                  ].map((column) => (
                    <th
                      key={column}
                      className={`px-3 py-2 font-extrabold ${
                        column === "Total Items" ? "text-center" : ""
                      } ${column === "Total" ? "text-right" : ""}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactionHistoryItems.map((transaction) => {
                  const formattedDate = formatTransactionDate(transaction.dateTime)

                  return (
                    <tr
                      key={transaction.id}
                      className="font-bold text-slate-800"
                    >
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-slate-950">{formattedDate.date}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formattedDate.time}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p>OR No.: {transaction.orderId}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Invoice: {transaction.invoiceId}
                        </p>
                      </td>
                      <td className="px-3 py-3">{transaction.cashier}</td>
                      <td className="px-3 py-3 text-center">
                        {transaction.itemCount}
                      </td>
                      <td className="px-3 py-3">{transaction.customerType}</td>
                      <td className="px-3 py-3">{transaction.discount}</td>
                      <td className="px-3 py-3">
                        {formatPeso(transaction.discountAmount)}
                      </td>
                      <td className="px-3 py-3 text-right text-emerald-700">
                        {formatPeso(transaction.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}

export default AdminDashboard

