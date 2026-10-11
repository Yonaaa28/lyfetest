import { useMemo, useState } from "react"
import {
  HiChevronDown,
  HiOutlineArrowDownTray,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineEye,
  HiOutlinePercentBadge,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiXMark,
} from "react-icons/hi2"

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

// TEMPORARY SALES ANALYTICS SAMPLE DATA FOR UI TESTING
// Set this to false when connecting the analytics module to production data.
const USE_SALES_ANALYTICS_SAMPLE_DATA = true

const sampleSalesAnalyticsData = {
  branchSales: [
    { name: "Camalig (Main Branch)", sales: 385420.5, transactions: 1842, profit: 102741.86, trend: 12.8 },
    { name: "Guinobatan", sales: 298750, transactions: 1396, profit: 78621.25, trend: 8.6 },
    { name: "Polangui", sales: 241890.75, transactions: 1128, profit: 62165.92, trend: 5.4 },
    { name: "Daraga", sales: 186340, transactions: 872, profit: 46132.15, trend: -2.3 },
    { name: "Manito", sales: 142600.25, transactions: 641, profit: 34224.06, trend: -6.1 },
  ],
  topProducts: [
    ["Biogesic 500mg Tablet", "Analgesics", 1428, 16422, 14.2],
    ["Neozep Forte Tablet", "Cold & Flu", 1112, 13344, 10.8],
    ["Bioflu Tablet", "Cold & Flu", 976, 12688, 8.7],
    ["Solmux 500mg Capsule", "Cough & Respiratory", 784, 13328, 6.4],
    ["Alaxan FR Capsule", "Pain Relief", 721, 9733.5, 4.1],
  ],
  lowProducts: [
    ["Calcium + Vitamin D3 Tablet", "Vitamins & Supplements", 46, 4140, -3.8],
    ["Cetirizine 10mg Tablet", "Antihistamines", 39, 468, -5.2],
    ["Omeprazole 20mg Capsule", "Gastrointestinal", 31, 620, -7.1],
    ["Amoxicillin 500mg Capsule", "Prescription Antibiotics", 24, 4320, -9.6],
    ["Loratadine 10mg Tablet", "Antihistamines", 0, 0, -12.4],
  ],
  chartData: [
    ["May 1", 72450.25], ["May 2", 88120.5], ["May 3", 79640.75],
    ["May 4", 104380], ["May 5", 96325.5], ["May 6", 112740.25],
    ["May 7", 108920], ["May 8", 121580.75], ["May 9", 116430.5],
    ["May 10", 128450.75], ["May 11", 119860.25], ["May 12", 136520.5],
    ["May 13", 109775.25], ["May 14", 83240.5], ["May 15", 91365.75],
  ],
}

const liveSalesAnalyticsData = {
  branchSales: [],
  topProducts: [],
  lowProducts: [],
  chartData: [
    ["May 14", 0], ["May 15", 0], ["May 16", 0], ["May 17", 0],
    ["May 18", 0], ["May 19", 0], ["May 20", 0], ["May 21", 0],
    ["May 22", 0], ["May 23", 0], ["May 24", 0], ["May 25", 0],
  ],
}

const activeSalesAnalyticsData = USE_SALES_ANALYTICS_SAMPLE_DATA ? sampleSalesAnalyticsData : liveSalesAnalyticsData
const {
  branchSales: baseBranchSales,
  topProducts: baseTopProducts,
  lowProducts: baseLowProducts,
  chartData: baseChartData,
} = activeSalesAnalyticsData

const branchOptions = ["All Branches", "Camalig (Main Branch)", "Guinobatan", "Polangui", "Daraga", "Manito"]

const performanceThresholds = {
  excellent: 10,
  good: 0,
  monitoring: -5,
}

const periodConfig = {
  Today: { label: "Today: May 15, 2026", multiplier: 0.08, trend: [4.2, 3.6, 1.9, 0.8], chartLabels: ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"] },
  "This Week": { label: "This Week: May 10, 2026 - May 15, 2026", multiplier: 0.42, trend: [8.4, 6.2, 2.7, 1.6], chartLabels: ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15"] },
  "This Month": { label: "This Month: May 1, 2026 - May 15, 2026", multiplier: 1, trend: [12.8, 8.6, 3.9, 2.1], chartLabels: null },
  "This Quarter": { label: "This Quarter: Apr 1, 2026 - May 15, 2026", multiplier: 2.35, trend: [15.2, 11.4, 4.8, 3.3], chartLabels: ["Apr W1", "Apr W2", "Apr W3", "Apr W4", "May W1", "May W2"] },
  "Custom Range": { label: "Custom Range: May 1, 2026 - May 15, 2026", multiplier: 1, trend: [12.8, 8.6, 3.9, 2.1], chartLabels: null },
}

function formatDisplayDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

function formatShortDate(value, includeYear = false) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(includeYear ? { year: "numeric" } : {}) })
}

function formatShortDateRange(start, end) {
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  return `${formatShortDate(start, !sameYear)} - ${formatShortDate(end, true)}`
}

function getReportingRangeLabel(period, appliedRange) {
  const ranges = {
    Today: ["2026-05-15", "2026-05-15"],
    "This Week": ["2026-05-10", "2026-05-15"],
    "This Month": ["2026-05-01", "2026-05-15"],
    "This Quarter": ["2026-04-01", "2026-05-15"],
  }

  if (period === "Custom Range") return formatShortDateRange(appliedRange.start, appliedRange.end)
  const [start, end] = ranges[period]
  return start === end ? formatShortDate(end, true) : formatShortDateRange(start, end)
}

function getReportingDates(period, appliedRange) {
  const ranges = {
    Today: ["2026-05-15", "2026-05-15"],
    "This Week": ["2026-05-10", "2026-05-15"],
    "This Month": ["2026-05-01", "2026-05-15"],
    "This Quarter": ["2026-04-01", "2026-05-15"],
  }
  return period === "Custom Range" ? [appliedRange.start, appliedRange.end] : ranges[period]
}

function getComparisonRangeLabel(period, appliedRange) {
  const [startValue, endValue] = getReportingDates(period, appliedRange)
  const start = new Date(`${startValue}T00:00:00`)
  const end = new Date(`${endValue}T00:00:00`)
  const duration = Math.round((end - start) / 86400000) + 1
  const previousEnd = new Date(start)
  previousEnd.setDate(previousEnd.getDate() - 1)
  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousStart.getDate() - duration + 1)
  const toInputDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  return formatShortDateRange(toInputDate(previousStart), toInputDate(previousEnd))
}

function SuperAdminSalesAnalytics() {
  const [period, setPeriod] = useState("This Month")
  const [periodOpen, setPeriodOpen] = useState(false)
  const [customRangeOpen, setCustomRangeOpen] = useState(false)
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-15")
  const [appliedRange, setAppliedRange] = useState({ start: "2026-05-01", end: "2026-05-15" })
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [branchFilterOpen, setBranchFilterOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const activePeriod = useMemo(() => {
    if (period !== "Custom Range") return periodConfig[period]
    const days = daysBetween(appliedRange.start, appliedRange.end)
    const multiplier = Math.max(0.08, Math.min(3, days / 15))
    return {
      ...periodConfig["Custom Range"],
      label: `Custom Range: ${formatDisplayDate(appliedRange.start)} - ${formatDisplayDate(appliedRange.end)}`,
      multiplier,
      trend: [Math.round(multiplier * 12.8 * 10) / 10, Math.round(multiplier * 8.6 * 10) / 10, Math.round(multiplier * 3.9 * 10) / 10, Math.round(multiplier * 2.1 * 10) / 10],
    }
  }, [appliedRange, period])

  const allBranchSales = useMemo(() => scaleBranches(activePeriod.multiplier), [activePeriod.multiplier])
  const branchSales = useMemo(() => branchFilter === "All Branches" ? allBranchSales : allBranchSales.filter((branch) => branch.name === branchFilter), [allBranchSales, branchFilter])

  const totalSales = branchSales.reduce((sum, branch) => sum + branch.sales, 0)
  const totalTransactions = branchSales.reduce((sum, branch) => sum + branch.transactions, 0)
  const averageOrderValue = totalSales / Math.max(1, totalTransactions)
  const grossMargin = Math.round((24.8 + activePeriod.multiplier * 1.9) * 10) / 10
  const reportingRangeLabel = getReportingRangeLabel(period, appliedRange)
  const comparisonRangeLabel = getComparisonRangeLabel(period, appliedRange)
  const allBranchesTotal = allBranchSales.reduce((sum, branch) => sum + branch.sales, 0)
  const branchShare = allBranchesTotal ? totalSales / allBranchesTotal : 0
  const productMultiplier = activePeriod.multiplier * branchShare
  const topProducts = useMemo(() => scaleProducts(baseTopProducts, productMultiplier).sort((a, b) => b[2] - a[2]).slice(0, 5), [productMultiplier])
  const lowProducts = useMemo(() => scaleProducts(baseLowProducts, productMultiplier).sort((a, b) => a[2] - b[2]).slice(0, 5), [productMultiplier])
  const chartView = useMemo(() => buildAdaptiveChartData(period, appliedRange, totalSales), [appliedRange, period, totalSales])
  const weightedTrend = totalSales ? branchSales.reduce((sum, branch) => sum + branch.sales * branch.trend, 0) / totalSales : 0
  const kpiTrends = [weightedTrend, weightedTrend * 0.67, weightedTrend * 0.31, weightedTrend * 0.16].map((value) => Math.round(value * 10) / 10)

  const choosePeriod = (option) => {
    setPeriod(option)
    setPeriodOpen(false)
    setCustomRangeOpen(option === "Custom Range")
  }

  const applyCustomRange = () => {
    setAppliedRange({ start: startDate, end: endDate })
    setPeriod("Custom Range")
    setCustomRangeOpen(false)
  }

  const kpis = [
    ["Total Sales", currency.format(totalSales), formatTrend(kpiTrends[0]), HiOutlineBanknotes],
    ["Total Transactions", totalTransactions.toLocaleString(), formatTrend(kpiTrends[1]), HiOutlineShoppingCart],
    ["Average Order Value", currency.format(averageOrderValue), formatTrend(kpiTrends[2]), HiOutlineShoppingBag],
    ["Gross Profit Margin", totalSales > 0 ? `${grossMargin}%` : "0%", formatTrend(kpiTrends[3]), HiOutlinePercentBadge],
  ]

  const exportReport = (format) => {
    const rows = [
      ["Lyfe Pharmacy Sales Analytics"],
      ["Reporting Period", reportingRangeLabel],
      ["Branch", branchFilter],
      ["Compared With", comparisonRangeLabel],
      [],
      ["KPI", "Value", "Trend"],
      ...kpis.map(([label, value, trend]) => [label, value, trend]),
      [],
      ["Branch Performance"],
      ["Rank", "Branch", "Sales", "Transactions", "Gross Profit", "Trend", "Performance Status"],
      ...branchSales.map((branch, index) => [index + 1, branch.name, currency.format(branch.sales), branch.transactions, currency.format(branch.profit), `${branch.trend >= 0 ? "+" : ""}${branch.trend}%`, branch.status]),
      [],
      ["Top 5 Best Selling Products"],
      ["Product", "Category", "Quantity Sold", "Revenue", "Trend"],
      ...topProducts.map(([name, category, quantity, revenue, trend]) => [name, category, quantity, currency.format(revenue), `${trend >= 0 ? "+" : ""}${trend}%`]),
      [],
      ["Lowest Selling Products"],
      ["Product", "Category", "Quantity Sold", "Revenue", "Trend"],
      ...lowProducts.map(([name, category, quantity, revenue, trend]) => [name, category, quantity, currency.format(revenue), `${trend >= 0 ? "+" : ""}${trend}%`]),
    ]

    if (format === "pdf") {
      printManagementReport({ branchFilter, branchSales, comparisonRangeLabel, kpis, lowProducts, reportingRangeLabel, topProducts })
      setExportOpen(false)
      return
    }

    const blob = new Blob([rows.map((row) => row.map(formatCsvCell).join("\t")).join("\n")], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lyfe-sales-analytics-${reportingRangeLabel.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 pt-1 sm:px-6 sm:pb-8">
      <h1 className="text-xl font-bold text-slate-950 lg:hidden">Sales Analytics</h1>

      <section className="lg:hidden">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Reporting Period</p>
        <div className="relative">
          <button type="button" onClick={() => setPeriodOpen((open) => !open)} className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/20">
            <span className="flex min-w-0 items-center gap-2"><HiOutlineCalendarDays className="h-5 w-5 shrink-0 text-[#0b6b51]" /><span className="truncate">{reportingRangeLabel}</span></span><HiChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
          {periodOpen ? <div className="absolute left-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm font-bold shadow-xl">{Object.keys(periodConfig).map((option) => <button key={option} type="button" onClick={() => choosePeriod(option)} className={`block w-full px-4 py-2.5 text-left ${period === option ? "bg-emerald-50 text-[#0b6b51]" : "text-slate-700 hover:bg-slate-50"}`}>{option}</button>)}</div> : null}
          {customRangeOpen ? <div className="absolute left-0 z-40 mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1.5 h-10 w-full min-w-0 rounded-lg border border-slate-200 px-2 text-xs font-bold outline-none focus:border-[#0b6b51]" /></label><label className="text-xs font-bold text-slate-600">End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1.5 h-10 w-full min-w-0 rounded-lg border border-slate-200 px-2 text-xs font-bold outline-none focus:border-[#0b6b51]" /></label></div><button type="button" onClick={applyCustomRange} className="mt-3 h-10 w-full rounded-lg bg-[#00675b] px-4 text-sm font-bold text-white">Apply</button></div> : null}
        </div>
        <div className="mt-2.5 grid grid-cols-[minmax(0,2fr)_minmax(100px,1fr)] gap-2.5">
          <div className="relative min-w-0">
            <button type="button" onClick={() => setBranchFilterOpen((open) => !open)} className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800"><span className="truncate">{branchFilter}</span><HiChevronDown className="h-4 w-4 shrink-0 text-slate-500" /></button>
            {branchFilterOpen ? <div className="absolute left-0 z-30 mt-2 w-full min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">{branchOptions.map((branch) => <button key={branch} type="button" onClick={() => { setBranchFilter(branch); setBranchFilterOpen(false) }} className={`block w-full px-3 py-2 text-left text-sm font-bold ${branchFilter === branch ? "bg-emerald-50 text-[#0b6b51]" : "text-slate-700"}`}>{branch}</button>)}</div> : null}
          </div>
          <div className="relative min-w-0">
            <button type="button" onClick={() => setExportOpen((open) => !open)} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#00675b] px-3 text-sm font-bold text-white"><HiOutlineArrowDownTray className="h-4 w-4" />Export<HiChevronDown className="h-3.5 w-3.5" /></button>
            {exportOpen ? <div className="absolute right-0 z-30 mt-2 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"><button type="button" onClick={() => exportReport("pdf")} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700">PDF Report</button><button type="button" onClick={() => exportReport("xlsx")} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700">Excel (.xlsx)</button></div> : null}
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">Compared with {comparisonRangeLabel}</p>
      </section>

      <section className="hidden flex-col gap-3 lg:flex lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="shrink-0 text-sm font-bold text-slate-600">Reporting Period</p>
            <div className="relative w-full sm:w-[300px]">
            <button
              type="button"
              onClick={() => setPeriodOpen((open) => !open)}
              className="flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition hover:border-[#0b6b51]/50 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/20"
              title={activePeriod.label}
            >
              <span className="flex min-w-0 items-center gap-2">
                <HiOutlineCalendarDays className="h-5 w-5 shrink-0 text-[#0b6b51]" />
                <span className="truncate">{reportingRangeLabel}</span>
              </span>
              <HiChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </button>
              {periodOpen ? (
                <div className="absolute left-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm font-bold shadow-xl">
                  {Object.keys(periodConfig).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choosePeriod(option)}
                      className={`block w-full px-4 py-2.5 text-left transition ${period === option ? "bg-emerald-50 text-[#0b6b51]" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
              {customRangeOpen ? (
                <div className="absolute left-0 z-40 mt-3 w-[min(430px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-bold text-slate-600">
                      Start date
                      <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#0b6b51]" />
                    </label>
                    <label className="text-sm font-bold text-slate-600">
                      End date
                      <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#0b6b51]" />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-600">{formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}</p>
                    <button type="button" onClick={applyCustomRange} className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]">Apply</button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="relative w-full sm:w-[180px]">
              <button type="button" onClick={() => setBranchFilterOpen((open) => !open)} className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 hover:border-[#0b6b51]/50">
                <span className="truncate">{branchFilter}</span><HiChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {branchFilterOpen ? <div className="absolute left-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">{branchOptions.map((branch) => <button key={branch} type="button" onClick={() => { setBranchFilter(branch); setBranchFilterOpen(false) }} className={`block w-full px-4 py-2 text-left text-sm font-bold ${branchFilter === branch ? "bg-emerald-50 text-[#0b6b51]" : "text-slate-700 hover:bg-slate-50"}`}>{branch}</button>)}</div> : null}
            </div>
            </div>
            <p className="text-xs font-medium text-slate-500 sm:pl-[132px]">Compared with: {comparisonRangeLabel}</p>
          </div>

          <div className="relative">
            <button type="button" onClick={() => setExportOpen((open) => !open)} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#00675b] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348] sm:w-auto sm:px-5">
              <HiOutlineArrowDownTray className="h-5 w-5" />Export Report<HiChevronDown className="h-4 w-4" />
            </button>
            {exportOpen ? <div className="absolute right-0 z-30 mt-2 w-full min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"><button type="button" onClick={() => exportReport("pdf")} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">PDF Report</button><button type="button" onClick={() => exportReport("xlsx")} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">Excel (.xlsx)</button></div> : null}
          </div>
      </section>

      <section className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-3 xl:grid-cols-4">
        {kpis.map(([label, value, trend, Icon]) => (
          <Card key={label} className="flex min-h-[92px] items-start justify-between gap-2 rounded-[22px] !border-white/60 px-4 py-4 !shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:min-h-[118px] lg:items-center lg:justify-start lg:gap-4 lg:rounded-2xl lg:!border-slate-200 lg:p-4">
            <span className="order-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51] sm:h-10 sm:w-10 sm:rounded-2xl lg:order-none lg:h-12 lg:w-12 lg:rounded-full">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-snug text-slate-500 lg:text-[13px]"><span className="lg:hidden">{{ "Total Transactions": "Transactions", "Average Order Value": "Avg. Order Value", "Gross Profit Margin": "Gross Margin" }[label] ?? label}</span><span className="hidden lg:inline">{label}</span></p>
              <p className="mt-3 text-lg font-bold leading-tight text-slate-950 sm:text-xl lg:mt-1.5 lg:whitespace-nowrap lg:text-[22px]">{value}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500 lg:text-xs"><span className={`font-bold ${trend.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}>{trend}</span><span className="hidden lg:inline"> vs previous period</span></p>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <Card className="flex flex-col overflow-hidden rounded-xl p-4 lg:rounded-2xl lg:p-5">
          <div className="flex shrink-0 items-center gap-4">
            <div><h2 className="text-lg font-bold text-slate-950">Sales Over Time</h2><p className="mt-0.5 text-xs font-semibold text-slate-500">{chartView.granularity} view</p></div>
          </div>
          <SalesAreaChart data={chartView.data} reportingRangeLabel={reportingRangeLabel} />
        </Card>
      </section>

      <Card className="hidden overflow-hidden lg:block">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Branch Performance Ranking</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>{["Rank", "Branch", "Sales", "Transactions", "Gross Profit", "Trend", "Performance Status", "Action"].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="text-sm font-medium">
              {branchSales.length > 0 ? (
                branchSales.map((branch, index) => (
                  <tr key={branch.name} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-bold text-slate-900">{index + 1}</td>
                    <td className="px-5 py-3 font-bold text-slate-950">{branch.name}</td>
                    <td className="whitespace-nowrap px-5 py-3">{currency.format(branch.sales)}</td>
                    <td className="px-5 py-3">{branch.transactions.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-5 py-3">{currency.format(branch.profit)}</td>
                    <td className={`px-5 py-3 font-bold ${branch.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>{branch.trend >= 0 ? "+" : ""}{branch.trend}%</td>
                    <td className="px-5 py-3"><PerformanceBadge status={branch.status} /></td>
                    <td className="px-5 py-3"><IconButton label={`View ${branch.name}`} onClick={() => setSelectedBranch(branch)} /></td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={8} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                    No branch performance data for this reporting period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-xl lg:hidden">
        <div className="border-b border-slate-100 px-4 py-3.5"><h2 className="text-base font-bold text-slate-950">Branch Performance Ranking</h2></div>
        {branchSales.length ? <div className="divide-y divide-slate-100">{branchSales.map((branch, index) => (
          <button key={branch.name} type="button" onClick={() => setSelectedBranch(branch)} className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-[#0b6b51]">#{index + 1}</span>
            <span className="min-w-0 flex-1"><span className="block whitespace-normal break-words text-sm font-bold text-slate-950">{branch.name}</span><span className="mt-1 block text-xs font-semibold text-slate-600">{currency.format(branch.sales)}</span><span className="mt-0.5 block text-xs text-slate-500">{branch.transactions.toLocaleString()} transactions</span></span>
            <HiChevronDown className="h-5 w-5 shrink-0 -rotate-90 text-slate-400" />
          </button>
        ))}</div> : <p className="px-4 py-5 text-sm font-medium text-slate-500">No branch performance data available.</p>}
      </Card>

      <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="flex h-full flex-col overflow-hidden rounded-xl p-4 lg:rounded-2xl lg:p-5">
          <h2 className="shrink-0 text-lg font-bold text-slate-950">Sales by Branch</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">Sales contribution for the selected period</p>
          <BranchBars branches={branchSales} onSelect={setSelectedBranch} />
        </Card>
        <ProductTable title="Top 5 Best Selling Products" products={topProducts} onSelect={setSelectedProduct} />
        <ProductTable title="Lowest Selling Products" products={lowProducts} onSelect={setSelectedProduct} />
      </section>

      {selectedBranch ? <BranchBreakdown branch={selectedBranch} products={topProducts} reportingRangeLabel={reportingRangeLabel} onClose={() => setSelectedBranch(null)} /> : null}
      {selectedProduct ? <ProductBreakdown branchSales={branchSales} product={selectedProduct} onClose={() => setSelectedProduct(null)} /> : null}
    </div>
  )
}

function SalesAreaChart({ data, reportingRangeLabel }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const hasSales = data.some(([, value]) => value > 0)
  if (!hasSales) return <div className="grid place-items-center px-4 py-5 text-center lg:min-h-32 lg:py-6"><div><p className="font-bold text-slate-700">No sales data for the selected period.</p><p className="mt-1 text-sm text-slate-500">{reportingRangeLabel}</p></div></div>

  const width = 1000
  const height = 250
  const padding = { left: 62, right: 20, top: 16, bottom: 38 }
  const max = getNiceAxisMaximum(Math.max(...data.map(([, value]) => value)))
  const plotWidth = width - padding.left - padding.right
  const categoryWidth = plotWidth / Math.max(data.length, 1)
  const x = (index) => data.length === 1 ? padding.left + plotWidth / 2 : padding.left + (index / (data.length - 1)) * plotWidth
  const y = (value) => padding.top + (1 - value / max) * (height - padding.top - padding.bottom)
  const labelStep = Math.max(1, Math.ceil(data.length / 8))
  const hoveredItem = hoveredIndex === null ? null : data[hoveredIndex]
  const linePath = data.map(([, value], index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`).join(" ")
  const areaPath = `${linePath} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`

  return (
    <div className="relative mt-4 h-[280px] min-h-0 overflow-hidden">
      {hoveredItem ? <div role="tooltip" className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg" style={{ left: `${Math.min(90, Math.max(10, (x(hoveredIndex) / width) * 100))}%`, top: `${Math.max(22, (y(hoveredItem[1]) / height) * 100)}%` }}><p className="font-bold text-slate-900">{hoveredItem[2] ?? hoveredItem[0]}</p><p className="mt-1 font-medium text-slate-500">Total Sales</p><p className="mt-0.5 font-bold text-[#0b6b51]">{currency.format(hoveredItem[1])}</p></div> : null}
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Sales over time area chart">
        <defs><linearGradient id="sales-area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00675b" stopOpacity="0.16" /><stop offset="70%" stopColor="#00675b" stopOpacity="0.045" /><stop offset="100%" stopColor="#00675b" stopOpacity="0" /></linearGradient></defs>
        {[0, max * 0.2, max * 0.4, max * 0.6, max * 0.8, max].map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padding.left - 12} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#64748b">{formatChartCurrency(tick)}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#sales-area-fill)" />
        <path d={linePath} fill="none" stroke="#00675b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {hoveredItem ? <g pointerEvents="none"><line x1={x(hoveredIndex)} x2={x(hoveredIndex)} y1={y(hoveredItem[1])} y2={y(0)} stroke="#0b6b51" strokeDasharray="3 4" strokeOpacity="0.22" /><circle cx={x(hoveredIndex)} cy={y(hoveredItem[1])} r="5" fill="#00675b" stroke="#ffffff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></g> : null}
        {data.map(([label, value, tooltipLabel], index) => (
          <g key={`${label}-${index}`} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} onFocus={() => setHoveredIndex(index)} onBlur={() => setHoveredIndex(null)} tabIndex="0" role="graphics-symbol" aria-label={`${tooltipLabel ?? label}. Total Sales: ${currency.format(value)}`}>
            <rect x={Math.max(padding.left, x(index) - categoryWidth / 2)} y={padding.top} width={categoryWidth} height={height - padding.top - padding.bottom} fill="transparent" />
            <text x={x(index)} y={height - 12} textAnchor="middle" fontSize="10" fill="#64748b">{index % labelStep === 0 || index === data.length - 1 ? label : ""}</text>
            <title>{`${tooltipLabel ?? label}\nTotal Sales: ${currency.format(value)}`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

function BranchBars({ branches, onSelect }) {
  if (!branches.length) return <div className="grid place-items-center px-4 py-5 text-center text-sm font-semibold text-slate-500 lg:min-h-32 lg:py-6">No branch sales data for the selected period.</div>
  const sorted = [...branches].sort((a, b) => b.sales - a.sales)
  const maximum = Math.max(...sorted.map((branch) => branch.sales), 1)
  const rowGrid = "grid-cols-[18px_minmax(0,1fr)] lg:grid-cols-[18px_minmax(84px,128px)_minmax(56px,1fr)_108px]"
  return <div className="mt-4 min-w-0">
    <div className={`hidden ${rowGrid} items-center gap-2 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:grid`}><span /><span>Branch</span><span /><span className="text-right">Sales</span></div>
    <div className="divide-y divide-slate-100/80">{sorted.map((branch, index) => <button key={branch.name} type="button" title={`${branch.name} — Total Sales: ${currency.format(branch.sales)}`} onClick={() => onSelect(branch)} className={`grid min-h-12 w-full ${rowGrid} items-center gap-2 text-left transition hover:bg-slate-50/70`}>
      <span className="text-xs font-medium text-slate-400">{index + 1}</span>
      <span title={branch.name} className="line-clamp-2 text-sm font-medium text-slate-700 lg:truncate">{branch.name}</span>
      <span className="col-span-2 h-2.5 overflow-hidden rounded-full bg-slate-100/80 lg:col-span-1"><span className="block h-full rounded-full bg-[#00675b]" style={{ width: `${(branch.sales / maximum) * 100}%` }} /></span>
      <span className="col-span-2 whitespace-nowrap text-right text-sm font-bold tabular-nums text-slate-900 lg:col-span-1 lg:text-xs">{currency.format(branch.sales)}</span>
    </button>)}</div>
  </div>
}

function ProductTable({ onSelect, products, title }) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-xl lg:rounded-2xl">
      <div className="border-b border-slate-100 px-4 py-3.5 lg:px-5 lg:py-4">
        <h2 className="text-base font-bold text-slate-950 lg:text-lg">{title}</h2>
      </div>
      <div className="lg:hidden">
        {products.length ? <div className="divide-y divide-slate-100">{products.map(([name, category, quantity, revenue, trend], index) => (
          <button key={name} type="button" onClick={() => onSelect([name, category, quantity, revenue, trend])} className="flex w-full min-w-0 items-start gap-3 px-4 py-3 text-left hover:bg-slate-50">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span>
            <span className="min-w-0 flex-1"><span className="block whitespace-normal break-words text-sm font-bold leading-5 text-slate-950">{name}</span><span className="mt-0.5 block text-xs font-medium text-slate-500">{category}</span><span className="mt-1.5 block text-xs font-semibold text-slate-700">{quantity.toLocaleString()} sold · {currency.format(revenue)}</span></span>
          </button>
        ))}</div> : <p className="px-4 py-5 text-sm font-medium text-slate-500">No product sales recorded.</p>}
      </div>
      <div className="hidden min-h-0 flex-1 overflow-x-auto px-5 pb-4 lg:block">
        <table className="w-full min-w-[480px] table-fixed text-left text-sm">
          <thead className="text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="w-[38%] border-b border-slate-100 py-3 pr-2">Product</th>
              <th className="w-[24%] border-b border-slate-100 px-2 py-3">Category</th>
              <th className="w-[16%] border-b border-slate-100 px-2 py-3 text-right">Qty Sold</th>
              <th className="w-[22%] border-b border-slate-100 py-3 pl-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {products.length > 0 ? (
              products.map(([name, category, quantity, revenue, trend]) => (
                <tr key={name} className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70">
                  <td className="max-w-[240px] py-2.5 pr-3">
                    <button type="button" title={name} onClick={() => onSelect([name, category, quantity, revenue, trend])} className="whitespace-normal text-left font-bold leading-snug text-slate-950 hover:text-[#0b6b51]">
                      {name}
                    </button>
                  </td>
                  <td title={category} className="truncate px-2 py-2.5 text-slate-600">{category}</td>
                  <td className="px-2 py-2.5 text-right">{quantity.toLocaleString()}</td>
                  <td className="whitespace-nowrap py-2.5 pl-2 text-right font-semibold">{currency.format(revenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm font-semibold text-slate-500">
                  No product sales recorded for this reporting period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BranchBreakdown({ branch, onClose, products, reportingRangeLabel }) {
  return (
    <ModalShell title={`${branch.name} Sales Breakdown`} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Reporting Period" value={reportingRangeLabel} />
        <Metric label="Sales" value={currency.format(branch.sales)} />
        <Metric label="Transactions" value={branch.transactions.toLocaleString()} />
        <Metric label="Average Order Value" value={currency.format(branch.sales / Math.max(1, branch.transactions))} />
        <Metric label="Items Sold" value={(branch.transactions * 4).toLocaleString()} />
        <Metric label="Gross Profit" value={currency.format(branch.profit)} />
        <Metric label="Trend" value={`${branch.trend >= 0 ? "+" : ""}${branch.trend}%`} />
      </div>
      <h3 className="mt-5 font-bold text-slate-900">Best-selling products</h3>
      <div className="mt-3 space-y-2">
        {products.slice(0, 3).map(([name, category, qty]) => (
          <div key={name} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span><strong>{name}</strong><span className="ml-2 text-slate-500">{category}</span></span>
            <span>{qty.toLocaleString()} sold</span>
          </div>
        ))}
      </div>
    </ModalShell>
  )
}

function ProductBreakdown({ branchSales, onClose, product }) {
  const [name, category, quantity, revenue] = product
  const totalSales = branchSales.reduce((sum, item) => sum + item.sales, 0)
  return (
    <ModalShell title="Product Sales Details" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Product" value={name} />
        <Metric label="Category" value={category} />
        <Metric label="Quantity Sold" value={quantity.toLocaleString()} />
        <Metric label="Revenue" value={currency.format(revenue)} />
      </div>
      <h3 className="mt-5 font-bold text-slate-900">Branch contribution</h3>
      <div className="mt-3 space-y-2">
        {branchSales.map((branch) => (
          <div key={branch.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="font-semibold">{branch.name}</span>
            <span>{Math.round(quantity * (branch.sales / totalSales)).toLocaleString()} sold</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-[#0b6b51]">Stock impact: Review purchase planning if this trend continues.</p>
    </ModalShell>
  )
}

function ModalShell({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 lg:pl-[226px] xl:pl-[266px]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <section className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
          <HiXMark className="h-5 w-5" />
        </button>
        <h2 className="pr-10 text-xl font-bold text-slate-900">{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 break-words text-lg font-bold text-slate-950">{value}</p></div>
}

function PerformanceBadge({ status }) {
  const styles = {
    Excellent: "bg-emerald-100 text-emerald-700",
    Good: "bg-emerald-50 text-emerald-700",
    "Needs Monitoring": "bg-amber-100 text-amber-700",
    "Needs Attention": "bg-red-100 text-red-600",
  }
  return <span className={`inline-flex h-7 min-w-32 items-center justify-center rounded-md px-3 text-xs font-bold ${styles[status]}`}>{status}</span>
}

function IconButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-[#0b6b51] transition hover:bg-emerald-50" aria-label={label}>
      <HiOutlineEye className="h-5 w-5" />
    </button>
  )
}

function Card({ children, className = "" }) {
  return <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${className}`}>{children}</section>
}

function scaleBranches(multiplier) {
  return baseBranchSales.map((branch) => ({
    ...branch,
    sales: Math.round(branch.sales * multiplier * 100) / 100,
    transactions: Math.max(1, Math.round(branch.transactions * multiplier)),
    profit: Math.round(branch.profit * multiplier * 100) / 100,
    trend: Math.round(branch.trend * Math.max(0.7, Math.min(1.4, multiplier)) * 10) / 10,
    status: getPerformanceStatus(Math.round(branch.trend * Math.max(0.7, Math.min(1.4, multiplier)) * 10) / 10),
  }))
}

function scaleProducts(products, multiplier) {
  return products.map(([name, category, quantity, revenue, trend]) => [
    name,
    category,
    quantity === 0 ? 0 : Math.max(1, Math.round(quantity * multiplier)),
    Math.round(revenue * multiplier * 100) / 100,
    Math.round(trend * Math.max(0.7, Math.min(1.4, multiplier)) * 10) / 10,
  ])
}

function getPerformanceStatus(trend) {
  if (trend >= performanceThresholds.excellent) return "Excellent"
  if (trend >= performanceThresholds.good) return "Good"
  if (trend >= performanceThresholds.monitoring) return "Needs Monitoring"
  return "Needs Attention"
}

function buildAdaptiveChartData(period, appliedRange, totalSales) {
  const [startValue, endValue] = getReportingDates(period, appliedRange)
  const start = new Date(`${startValue}T00:00:00`)
  const end = new Date(`${endValue}T00:00:00`)
  const rangeDays = daysBetween(startValue, endValue)
  const granularity = period === "Today"
    ? "Hourly"
    : period === "This Quarter" || (period === "Custom Range" && rangeDays >= 32 && rangeDays <= 120)
      ? "Weekly"
      : period === "Custom Range" && rangeDays > 120
        ? "Monthly"
        : "Daily"

  let intervals = []
  if (granularity === "Hourly") {
    intervals = Array.from({ length: 12 }, (_, index) => {
      const hour = index + 8
      const timeLabel = new Date(2026, 0, 1, hour).toLocaleTimeString("en-US", { hour: "numeric" })
      return { label: timeLabel, tooltip: `${formatDisplayDate(endValue)} • ${new Date(2026, 0, 1, hour).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`, weight: baseChartData[index % baseChartData.length][1] }
    })
  } else if (granularity === "Daily") {
    const dates = getDatesInRange(start, end)
    intervals = dates.map((date, index) => ({
      label: period === "This Week" ? date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }) : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tooltip: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      weight: baseChartData[index % baseChartData.length][1],
    }))
  } else if (granularity === "Weekly") {
    const dates = getDatesInRange(start, end)
    for (let index = 0; index < dates.length; index += 7) {
      const week = dates.slice(index, index + 7)
      const first = week[0]
      const last = week[week.length - 1]
      intervals.push({
        label: formatCompactRange(first, last),
        tooltip: formatDateInterval(first, last),
        weight: week.reduce((sum, _date, offset) => sum + baseChartData[(index + offset) % baseChartData.length][1], 0),
      })
    }
  } else {
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cursor <= end) {
      const intervalStart = cursor < start ? start : new Date(cursor)
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
      const intervalEnd = monthEnd > end ? end : monthEnd
      const days = getDatesInRange(intervalStart, intervalEnd)
      intervals.push({ label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), tooltip: cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }), weight: days.reduce((sum, _date, index) => sum + baseChartData[index % baseChartData.length][1], 0) })
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }
  }

  const totalWeight = intervals.reduce((sum, interval) => sum + interval.weight, 0)
  return {
    granularity,
    data: intervals.map((interval) => [interval.label, totalWeight && totalSales ? Math.round((interval.weight / totalWeight) * totalSales * 100) / 100 : 0, interval.tooltip]),
  }
}

function getDatesInRange(start, end) {
  const dates = []
  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) dates.push(new Date(date))
  return dates
}

function formatCompactRange(start, end) {
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endLabel = end.toLocaleDateString("en-US", start.getMonth() === end.getMonth() ? { day: "numeric" } : { month: "short", day: "numeric" })
  return start.getTime() === end.getTime() ? startLabel : `${startLabel}–${endLabel}`
}

function formatDateInterval(start, end) {
  if (start.getTime() === end.getTime()) return start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
}

function getNiceAxisMaximum(highestValue) {
  if (highestValue <= 0) return 1
  const roughStep = highestValue / 5
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 1.5 ? 1.5 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  const step = niceNormalized * magnitude
  return Math.ceil(highestValue / step) * step
}

function formatChartCurrency(value) {
  if (value >= 1000000) return `₱${Number((value / 1000000).toFixed(1))}M`
  if (value >= 1000) return `₱${Math.round(value / 1000)}K`
  return `₱${Math.round(value)}`
}

function formatTrend(value) {
  return `${value > 0 ? "+" : ""}${value}%`
}

function formatCsvCell(value) {
  const text = String(value ?? "")
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function printManagementReport({ branchFilter, branchSales, comparisonRangeLabel, kpis, lowProducts, reportingRangeLabel, topProducts }) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer")
  if (!reportWindow) return
  const productRows = (products) => products.length ? products.map(([name, category, quantity, revenue]) => `<tr><td>${name}</td><td>${category}</td><td>${quantity}</td><td>${currency.format(revenue)}</td></tr>`).join("") : '<tr><td colspan="4">No product sales recorded.</td></tr>'
  const branchRows = branchSales.length ? branchSales.map((branch, index) => `<tr><td>${index + 1}</td><td>${branch.name}</td><td>${currency.format(branch.sales)}</td><td>${branch.transactions}</td><td>${currency.format(branch.profit)}</td></tr>`).join("") : '<tr><td colspan="5">No branch performance data recorded.</td></tr>'
  reportWindow.document.write(`<!doctype html><html><head><title>Sales Analytics Report</title><style>@page{margin:16mm}body{font-family:Arial,sans-serif;color:#0f172a;font-size:12px}h1{color:#075b46;margin-bottom:4px}h2{font-size:15px;margin:24px 0 8px;border-bottom:1px solid #dbe4e1;padding-bottom:6px}.meta{line-height:1.7}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.metric{border:1px solid #dbe4e1;border-radius:8px;padding:10px}.metric strong{display:block;font-size:16px;margin-top:5px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e2e8f0;padding:7px;text-align:left}th{background:#f1f5f4;color:#475569}</style></head><body><h1>LYFE PHARMACY</h1><p>Sales Analytics Report</p><div class="meta"><strong>Reporting Period:</strong> ${reportingRangeLabel}<br><strong>Branch:</strong> ${branchFilter}<br><strong>Compared With:</strong> ${comparisonRangeLabel}</div><h2>SUMMARY</h2><div class="summary">${kpis.map(([label, value]) => `<div class="metric">${label}<strong>${value}</strong></div>`).join("")}</div><h2>SALES BY BRANCH / BRANCH PERFORMANCE</h2><table><thead><tr><th>Rank</th><th>Branch</th><th>Sales</th><th>Transactions</th><th>Gross Profit</th></tr></thead><tbody>${branchRows}</tbody></table><h2>TOP 5 BEST SELLING PRODUCTS</h2><table><thead><tr><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>${productRows(topProducts)}</tbody></table><h2>LOWEST SELLING PRODUCTS</h2><table><thead><tr><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>${productRows(lowProducts)}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`)
  reportWindow.document.close()
}

export default SuperAdminSalesAnalytics








