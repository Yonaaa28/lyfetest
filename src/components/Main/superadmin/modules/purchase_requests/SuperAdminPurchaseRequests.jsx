import { useEffect, useMemo, useRef, useState } from "react"
import {
  HiCheck,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePrinter,
  HiOutlineXMark,
  HiXMark,
} from "react-icons/hi2"
import { FiChevronUp } from "react-icons/fi"

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
const purchaseRequestsReferenceDate = new Date(2026, 4, 15)

const defaultBranches = ["Camalig (Main Branch)", "Guinobatan", "Polangui", "Daraga", "Manito"]

const paperDimensions = {
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 },
  Legal: { width: 816, height: 1344 },
}

const legacyRejectionReasons = {
  "PR-0003": "Duplicate purchase request found.",
  "PR-0012": "Incorrect quantity for current procurement cycle.",
}

const productSamples = [
  ["Biogesic 500mg Tablet", 12, 50, 120, 2.5],
  ["Amoxicillin 500mg Capsule", 0, 30, 80, 8.75],
  ["Cetirizine 10mg Tablet", 8, 30, 90, 4.5],
  ["Omeprazole 20mg Capsule", 10, 20, 60, 7.25],
  ["Salbutamol Syrup", 2, 20, 35, 95],
]

const initialRequests = [
  ["PR-0008", "Camalig (Main Branch)", "Camalig Admin", "Mercury Drug Supplier", 15, 12500, "May 15, 2026", "10:30 AM", "Pending", "High", 1, "Emergency restock for low stock medicine lines."],
  ["PR-0007", "Daraga", "Daraga Admin", "Unilab Distributor", 10, 8300, "May 15, 2026", "09:15 AM", "Approved", "Low", 1, "Routine replenishment."],
  ["PR-0006", "Polangui", "Polangui Admin", "RiteMed Supplier", 20, 18700, "May 15, 2026", "08:45 AM", "Pending", "High", 2, "Several products are below reorder level."],
  ["PR-0005", "Guinobatan", "Guinobatan Admin", "MedChoice Pharma", 12, 9250, "May 14, 2026", "04:20 PM", "Approved", "Medium", 2, "Standard request."],
  ["PR-0004", "Manito", "Manito Admin", "Southstar Drug Supplier", 18, 14600, "May 14, 2026", "02:10 PM", "Pending", "High", 5, "Out of stock items need immediate replenishment."],
  ["PR-0003", "Camalig (Main Branch)", "Camalig Admin", "Watsons Distributor", 8, 6400, "May 14, 2026", "11:30 AM", "Rejected", "Low", 3, "Duplicate request found."],
  ["PR-0002", "Polangui", "Polangui Admin", "PharmaPlus Inc.", 16, 11800, "May 13, 2026", "03:25 PM", "Approved", "Medium", 3, "Approved for regular stock cycle."],
  ["PR-0001", "Daraga", "Daraga Admin", "Mercury Drug Supplier", 14, 10450, "May 13, 2026", "09:50 AM", "Approved", "Medium", 4, "Approved for restocking."],
  ["PR-0009", "Guinobatan", "Guinobatan Admin", "Unilab Distributor", 11, 9800, "May 12, 2026", "01:15 PM", "Pending", "Medium", 4, "Low stock maintenance request."],
  ["PR-0010", "Manito", "Manito Admin", "RiteMed Supplier", 9, 7200, "May 12, 2026", "10:40 AM", "Approved", "Low", 4, "Approved."],
  ["PR-0011", "Camalig (Main Branch)", "Camalig Admin", "MedChoice Pharma", 17, 15300, "May 11, 2026", "03:30 PM", "Pending", "High", 5, "Emergency stock request."],
  ["PR-0012", "Polangui", "Polangui Admin", "Southstar Drug Supplier", 13, 10800, "May 11, 2026", "09:05 AM", "Rejected", "Medium", 5, "Incorrect quantity."],
].map(([id, branch, requestedBy, supplier, items, amount, date, time, status, priority, waitingDays, remarks], index) => ({
  id, branch, requestedBy, supplier, items, amount, date, time, status, priority, waitingDays, remarks,
  approvedBy: status === "Approved" ? "Super Admin" : undefined,
  approvedDate: status === "Approved" ? `${date} - 02:45 PM` : undefined,
  rejectedBy: status === "Rejected" ? "Super Admin" : undefined,
  rejectedDate: status === "Rejected" ? `${date} - 02:50 PM` : undefined,
  printedBy: undefined,
  printedAt: undefined,
  rejectionReason: status === "Rejected" ? legacyRejectionReasons[id] : undefined,
  products: productSamples.slice(0, Math.min(5, Math.max(3, (index % 5) + 1))).map(([name, stock, reorder, qty, cost], productIndex) => ({
    id: `${id}-${productIndex}`,
    name,
    currentStock: stock + productIndex,
    reorderLevel: reorder,
    requestedQty: Math.max(5, Math.round(qty / ((index % 3) + 2))),
    unitCost: cost,
  })),
  history: status === "Pending"
    ? ["Submitted by Branch Admin", "Awaiting Super Admin review"]
    : ["Submitted by Branch Admin", `Reviewed by Super Admin`, `${status} on ${date}`],
}))

function SuperAdminPurchaseRequests({ currentUser }) {
  const reviewerName = currentUser?.fullName || "Super Admin"
  const defaultDateRange = getDatePeriodRange("This Month")
  const [requests, setRequests] = useState(() => [initialRequests[0], initialRequests[1], initialRequests[5]])
  const [activeTab, setActiveTab] = useState("active")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [datePeriod, setDatePeriod] = useState("This Month")
  const [dateFrom, setDateFrom] = useState(defaultDateRange.from)
  const [dateTo, setDateTo] = useState(defaultDateRange.to)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [customRangeOpen, setCustomRangeOpen] = useState(false)
  const [draftDateFrom, setDraftDateFrom] = useState(defaultDateRange.from)
  const [draftDateTo, setDraftDateTo] = useState(defaultDateRange.to)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [printRequests, setPrintRequests] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [bulkDecision, setBulkDecision] = useState(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(""), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return requests.filter((request) => {
      if (request.archived) return false
      const matchesTab = activeTab === "active" ? isForProcessingRequest(request) : isHistoryRequest(request)
      const matchesQuery = !normalizedQuery || [request.id, request.branch, request.requestedBy].some((value) => value.toLowerCase().includes(normalizedQuery))
      const matchesStatus = activeTab === "active" || statusFilter === "All Statuses" || request.status === statusFilter
      const matchesBranch = branchFilter === "All Branches" || request.branch === branchFilter
      const requestDate = parseRequestDate(getRequestFilterDate(request, activeTab))
      const matchesDateFrom = !dateFrom || requestDate >= new Date(`${dateFrom}T00:00:00`)
      const matchesDateTo = !dateTo || requestDate <= new Date(`${dateTo}T23:59:59`)
      return matchesTab && matchesQuery && matchesStatus && matchesBranch && matchesDateFrom && matchesDateTo
    })
  }, [activeTab, branchFilter, dateFrom, dateTo, query, requests, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleRequests = filteredRequests.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const paginationItems = getPaginationItems(currentPage, pageCount)
  const showingText = filteredRequests.length
    ? `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredRequests.length)} of ${filteredRequests.length} requests`
    : "Showing 0 of 0 requests"
  const activeRequests = requests.filter((request) => !request.archived)
  const pendingCount = activeRequests.filter((request) => request.status === "Pending").length
  const approvedCount = activeRequests.filter((request) => request.status === "Approved").length
  const rejectedCount = activeRequests.filter((request) => request.status === "Rejected").length
  const approvedValue = activeRequests.filter((request) => request.status === "Approved").reduce((total, request) => total + request.amount, 0)
  const branches = ["All Branches", ...Array.from(new Set([...defaultBranches, ...requests.map((request) => request.branch)]))]
  const selectedRequests = activeRequests.filter((request) => selectedIds.includes(request.id))
  const selectedApprovedRequests = selectedRequests.filter((request) => request.status === "Approved")
  const visibleIds = visibleRequests.map((request) => request.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const allSelectedPending = selectedRequests.length > 0 && selectedRequests.every((request) => request.status === "Pending")
  const allSelectedApproved = selectedRequests.length > 0 && selectedRequests.every((request) => request.status === "Approved")
  const selectedStatusCounts = countBy(selectedRequests, (request) => request.status)
  const selectedPrintCounts = countBy(selectedApprovedRequests, (request) => request.printedAt ? "Printed" : "Not Printed")
  const hasActiveFilters = Boolean(query || datePeriod !== "This Month" || statusFilter !== "All Statuses" || branchFilter !== "All Branches")
  const statusOptions = [
    { value: "All Statuses", label: "Status: All" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ]
  const branchOptions = branches.map((branch) => ({ value: branch, label: branch }))

  const summaryCards = [
    ["Pending Requests", "Pending", pendingCount, "Awaiting your approval", HiOutlineClock, "bg-amber-50 text-amber-600"],
    ["Approved Requests", "Approved", approvedCount, "Approved successfully", HiOutlineCheckCircle, "bg-emerald-50 text-emerald-600"],
    ["Rejected Requests", "Rejected", rejectedCount, "Requires review", HiOutlineXMark, "bg-red-50 text-red-500"],
    ["Approved Purchase Value", "Approved Value", currency.format(approvedValue), "Approved requests only", HiOutlineCurrencyDollar, "bg-violet-50 text-violet-600"],
  ]

  const updateStatus = async ({ request, status, remarks }) => {
    const reviewedAt = formatReviewDateTime(new Date())
    const updatedRequest = {
      ...request,
      status,
      reviewRemarks: remarks,
      approvedBy: status === "Approved" ? reviewerName : request.approvedBy,
      approvedDate: status === "Approved" ? reviewedAt : request.approvedDate,
      rejectedBy: status === "Rejected" ? reviewerName : request.rejectedBy,
      rejectedDate: status === "Rejected" ? reviewedAt : request.rejectedDate,
      rejectionReason: status === "Rejected" ? remarks : request.rejectionReason,
      history: ["Submitted by Branch Admin", `Reviewed by ${reviewerName}`, `${status} on ${reviewedAt}`],
    }
    setRequests((current) => current.map((item) => item.id === request.id ? updatedRequest : item))
    setConfirmation(null)
    setSelectedRequest((current) => current?.id === request.id ? updatedRequest : current)
    if (status !== "Approved") setSelectedIds((current) => current.filter((id) => id !== request.id))
    setNotice(status === "Approved" ? "Purchase request approved successfully." : "Purchase request rejected successfully.")
  }

  const markRequestsPrinted = (printedRequests) => {
    const newlyPrintedIds = printedRequests.filter(isPrintableRequest).map((request) => request.id)
    const printedAt = formatReviewDateTime(new Date())
    setRequests((current) => current.map((request) => (
      newlyPrintedIds.includes(request.id)
        ? {
          ...request,
          printedAt,
          printedBy: reviewerName,
          history: [...(request.history || []), `Printed by ${reviewerName}`, `Printed on ${printedAt}`],
        }
        : request
    )))
    setSelectedIds((current) => current.filter((id) => !newlyPrintedIds.includes(id)))
    setPrintRequests(null)
    setNotice(newlyPrintedIds.length ? (newlyPrintedIds.length > 1 ? "Supplier lists printed successfully." : "Purchase request marked as printed.") : "Reprint sent to printer.")
  }

  const clearFilters = () => {
    const defaultRange = getDatePeriodRange("This Month")
    setQuery("")
    setStatusFilter("All Statuses")
    setBranchFilter("All Branches")
    setDatePeriod("This Month")
    setDateFrom(defaultRange.from)
    setDateTo(defaultRange.to)
    setDraftDateFrom(defaultRange.from)
    setDraftDateTo(defaultRange.to)
    setDateRangeOpen(false)
    setCustomRangeOpen(false)
    setPage(1)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setStatusFilter("All Statuses")
    setSelectedIds([])
    setPage(1)
  }

  const openDateRange = () => {
    setDraftDateFrom(dateFrom)
    setDraftDateTo(dateTo)
    setCustomRangeOpen(false)
    setDateRangeOpen((open) => !open)
  }

  const applyDateRange = () => {
    if (!draftDateFrom || !draftDateTo || draftDateTo < draftDateFrom) return
    setDateFrom(draftDateFrom)
    setDateTo(draftDateTo)
    setDatePeriod("Custom Range")
    setDateRangeOpen(false)
    setCustomRangeOpen(false)
    setPage(1)
  }

  const applyDatePreset = (period) => {
    if (period === "Custom Range") {
      setCustomRangeOpen(true)
      return
    }

    const range = getDatePeriodRange(period)
    setDatePeriod(period)
    setDateFrom(range.from)
    setDateTo(range.to)
    setDraftDateFrom(range.from)
    setDraftDateTo(range.to)
    setDateRangeOpen(false)
    setPage(1)
  }

  const toggleSelectedRequest = (request) => {
    setSelectedIds((current) => current.includes(request.id) ? current.filter((id) => id !== request.id) : [...current, request.id])
  }

  const toggleVisibleRequests = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id))
      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  const applyBulkDecision = ({ status, remarks }) => {
    const reviewedAt = formatReviewDateTime(new Date())
    const selectedSet = new Set(selectedIds)
    setRequests((current) => current.map((request) => selectedSet.has(request.id) ? {
      ...request,
      status,
      reviewRemarks: remarks,
      approvedBy: status === "Approved" ? reviewerName : request.approvedBy,
      approvedDate: status === "Approved" ? reviewedAt : request.approvedDate,
      rejectedBy: status === "Rejected" ? reviewerName : request.rejectedBy,
      rejectedDate: status === "Rejected" ? reviewedAt : request.rejectedDate,
      rejectionReason: status === "Rejected" ? remarks : request.rejectionReason,
      history: ["Submitted by Branch Admin", `Reviewed by ${reviewerName}`, `${status} on ${reviewedAt}`],
    } : request))
    setNotice(`${selectedRequests.length} purchase requests ${status.toLowerCase()} successfully.`)
    setSelectedIds([])
    setBulkDecision(null)
  }

  if (printRequests) {
    return <PrintPreview requests={printRequests} onBack={() => setPrintRequests(null)} onPrinted={markRequestsPrinted} />
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 sm:px-6 lg:px-8">
      {notice ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-emerald-100 bg-white p-4 text-sm font-bold text-[#0b6b51] shadow-[0_16px_40px_rgba(15,23,42,0.18)] sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <HiCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p>{notice}</p>
              <button type="button" onClick={() => setNotice("")} className="mt-2 text-xs font-bold text-[#00675b] hover:text-[#005348]">Dismiss</button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:rounded-2xl lg:border-slate-200 lg:p-5 lg:shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <h1 className="mb-4 text-xl font-bold text-slate-950 lg:hidden">Purchase Requests</h1>
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          {summaryCards.map(([label, mobileLabel, value, detail, Icon, tone]) => (
            <article key={label} className="min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:min-h-[112px] lg:rounded-2xl lg:p-4">
              <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
                <div className="flex min-w-0 flex-1 flex-col self-stretch">
                  <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm"><span className="lg:hidden">{mobileLabel}</span><span className="hidden lg:inline">{label}</span></p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block">
                    <p className="truncate text-lg font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] sm:text-xl lg:mt-2 lg:text-2xl">{value}</p>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${tone}`}><Icon className="h-4 w-4" /></span>
                  </div>
                  <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">{detail}</p>
                </div>
                <span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${tone}`}><Icon className="h-6 w-6" /></span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 border-b border-slate-200 lg:mt-6">
          <div className="flex gap-5 lg:gap-6">
            <TabButton active={activeTab === "active"} onClick={() => switchTab("active")}>For Processing ({pendingCount})</TabButton>
            <TabButton active={activeTab === "history"} onClick={() => switchTab("history")}>History</TabButton>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 lg:mt-6 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
          <label className="relative min-w-0 lg:flex-[1_1_340px]">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search request ID, branch, or requester..." className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15" />
          </label>
          {activeTab === "history" ? <Select value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1) }} options={statusOptions} className="w-full lg:w-[150px]" /> : null}
          <div className="grid min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:contents">
          <Select value={branchFilter} onChange={(value) => { setBranchFilter(value); setPage(1) }} options={branchOptions} className="min-w-0 w-full lg:w-[170px]" />
          <DateRangeFilter
            datePeriod={datePeriod}
            dateFrom={dateFrom}
            dateTo={dateTo}
            draftDateFrom={draftDateFrom}
            draftDateTo={draftDateTo}
            isOpen={dateRangeOpen}
            customRangeOpen={customRangeOpen}
            onApply={applyDateRange}
            onCancelCustom={() => { setCustomRangeOpen(false); setDateRangeOpen(false) }}
            onOpen={openDateRange}
            onPreset={applyDatePreset}
            setDraftDateFrom={setDraftDateFrom}
            setDraftDateTo={setDraftDateTo}
          />
          </div>
          {hasActiveFilters ? <button type="button" onClick={clearFilters} className="h-11 px-1 text-sm font-bold text-[#00675b] transition hover:text-[#005348]">Clear</button> : null}
        </div>

        {selectedRequests.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div><p className="text-sm font-bold text-[#0b6b51]">{selectionHeading(selectedRequests)}</p>{selectionBreakdown(selectedRequests, selectedStatusCounts, selectedPrintCounts) ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{selectionBreakdown(selectedRequests, selectedStatusCounts, selectedPrintCounts)}</p> : null}</div>
              <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Clear Selection</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <BulkActionButton enabled={allSelectedPending} label="Approve Selected" explanation="Approve Selected is only available when all selected requests are Pending." onClick={() => setBulkDecision("Approved")} tone="positive" />
              <BulkActionButton enabled={allSelectedPending} label="Reject Selected" explanation="Reject Selected is only available when all selected requests are Pending." onClick={() => setBulkDecision("Rejected")} tone="danger" />
              <BulkActionButton enabled={allSelectedApproved} icon={HiOutlinePrinter} label="Print Selected" explanation="Print Selected is only available when all selected requests are Approved." onClick={() => setPrintRequests(selectedApprovedRequests)} tone="positive" />
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2.5 lg:hidden" aria-label="Purchase requests">
          {visibleRequests.length ? visibleRequests.map((request) => (
            <article key={request.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <button type="button" onClick={() => setSelectedRequest(request)} className="min-w-0 flex-1 text-left" aria-label={`Open ${request.id}`}>
                  <span className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-sm font-bold text-slate-950">{request.id}</span>
                    <StatusBadge status={request.status} />
                  </span>
                  <span className="mt-1.5 block whitespace-normal break-words text-sm font-semibold leading-5 text-slate-700">{request.branch}</span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-500">Requested by {request.requestedBy}</span>
                  <span className="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-600">{request.items} {request.items === 1 ? "item" : "items"}</span>
                      <span className="mt-1 block text-xs font-medium text-slate-400">{activeTab === "history" ? getCompletedDate(request) : request.date}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-bold text-slate-950">{currency.format(request.amount)}</span>
                      <HiChevronRight className="h-5 w-5 text-slate-400" />
                    </span>
                  </span>
                </button>
              </div>
              <label className="mt-2.5 flex min-h-8 cursor-pointer items-center gap-2 border-t border-slate-100 pt-2.5 text-xs font-bold text-[#00675b]">
                  <input type="checkbox" checked={selectedIds.includes(request.id)} onChange={() => toggleSelectedRequest(request)} className="h-4 w-4 rounded border-slate-300 text-[#00675b] focus:ring-[#00675b]" />
                  Select request
                </label>
            </article>
          )) : (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
              {activeTab === "active" ? "No requests for processing." : "No request history found."}
            </div>
          )}
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[52px]" /><col className="w-[118px]" /><col className="w-[175px]" />
              <col className="w-[155px]" /><col className="w-[78px]" /><col className="w-[130px]" />
              <col className="w-[112px]" /><col className="w-[120px]" /><col className="w-[140px]" /><col className="w-[100px]" />
            </colgroup>
            <thead className="bg-slate-50 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3 text-center">
                  <input ref={(checkbox) => { if (checkbox) checkbox.indeterminate = someVisibleSelected }} type="checkbox" checked={allVisibleSelected} disabled={!visibleIds.length} onChange={toggleVisibleRequests} className="h-4 w-4 rounded border-slate-300 text-[#00675b] focus:ring-[#00675b]" aria-label="Select all visible requests on this page" />
                </th>
                {["Request ID", "Branch", "Requested By", "Items", "Amount", "Status", activeTab === "history" ? "Completion" : "Print Status", activeTab === "history" ? "Completed Date" : "Requested Date", "Action"].map((head) => <th key={head} className={`px-4 py-3 ${head === "Action" ? "text-center" : ""}`}>{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleRequests.length ? visibleRequests.map((request) => (
                <tr key={request.id} className="h-[76px] border-t border-slate-100 align-middle transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={selectedIds.includes(request.id)} onChange={() => toggleSelectedRequest(request)} className="h-4 w-4 rounded border-slate-300 text-[#00675b] focus:ring-[#00675b]" aria-label={`Select ${request.id}`} />
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{request.id}</td>
                  <td className="truncate px-4 py-3 text-slate-700">{request.branch}</td>
                  <td className="truncate px-4 py-3 text-slate-700">{request.requestedBy}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{request.items}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{currency.format(request.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{activeTab === "history" ? getCompletionLabel(request) : getPrintStatusLabel(request)}</td>
                  <td className="px-4 py-3 text-slate-700">{activeTab === "history" ? getCompletedDate(request) : request.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <ActionButton icon={HiOutlineEye} label={`View ${request.id}`} onClick={() => setSelectedRequest(request)} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={10} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    {activeTab === "active" ? "No requests for processing." : "No request history found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          <PurchaseRequestsPagination currentPage={currentPage} filteredCount={filteredRequests.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} onPageSizeChange={() => setSelectedIds([])} />
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white lg:hidden"><PurchaseRequestsPagination currentPage={currentPage} filteredCount={filteredRequests.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} onPageSizeChange={() => setSelectedIds([])} /></div>
      </section>

      {selectedRequest ? <RequestDetails request={selectedRequest} onClose={() => setSelectedRequest(null)} onDecision={(status) => setConfirmation({ request: selectedRequest, status })} onPrint={() => { setPrintRequests([selectedRequest]); setSelectedRequest(null) }} /> : null}
      {confirmation ? <ConfirmStatusModal confirmation={confirmation} onCancel={() => setConfirmation(null)} onConfirm={updateStatus} /> : null}
      {bulkDecision ? <BulkDecisionModal count={selectedRequests.length} status={bulkDecision} onCancel={() => setBulkDecision(null)} onConfirm={applyBulkDecision} /> : null}
    </div>
  )
}

function RequestDetails({ onClose, onDecision, onPrint, request }) {
  const totalQuantity = request.products.reduce((sum, product) => sum + product.requestedQty, 0)
  const isPending = request.status === "Pending"
  const isApproved = request.status === "Approved"
  const isRejected = request.status === "Rejected"

  return (
    <ReviewModalShell onClose={onClose}>
      <div className="flex max-h-[85vh] min-h-0 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <h2 id="review-purchase-request-title" className="text-xl font-bold text-slate-950">Review Purchase Request</h2>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close review modal">
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-bold leading-tight text-slate-950">{request.id}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{request.branch}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <section className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryItem label="Requested By" value={request.requestedBy} />
            <SummaryItem label="Requested Date" value={`${request.date} - ${request.time}`} />
            <SummaryItem label="Estimated Amount" value={currency.format(request.amount)} />
            <SummaryItem label="Total Products" value={request.items} />
            <SummaryItem label="Total Quantity" value={totalQuantity.toLocaleString()} />
          </section>

          {isApproved ? (
            <section className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-[#0b6b51]">
                <HiOutlineCheckCircle className="h-5 w-5" />
                <h3 className="text-sm font-bold">Approval Details</h3>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SummaryItem label="Approved By" value={request.approvedBy || "Super Admin"} />
                <SummaryItem label="Approved On" value={request.approvedDate || request.date} />
              </div>
            </section>
          ) : null}

          {request.printedAt ? (
            <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <HiOutlinePrinter className="h-5 w-5" />
                <h3 className="text-sm font-bold">Print Details</h3>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <SummaryItem label="Print Status" value="Printed" />
                <SummaryItem label="Printed By" value={request.printedBy || "Super Admin"} />
                <SummaryItem label="Printed On" value={request.printedAt} />
              </div>
            </section>
          ) : null}

          {isRejected ? (
            <section className="mt-5 rounded-xl border border-red-100 bg-red-50/70 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <HiOutlineXMark className="h-5 w-5" />
                <h3 className="text-sm font-bold">Rejection Details</h3>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
                <SummaryItem label="Reason" value={request.rejectionReason || "Reason unavailable for this record."} />
                <SummaryItem label="Rejected By" value={request.rejectedBy || "Super Admin"} />
                <SummaryItem label="Rejected On" value={request.rejectedDate || "-"} />
              </div>
            </section>
          ) : null}

          <section className="mt-5 rounded-xl bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-900">Notes</h3>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{request.remarks || "No notes provided."}</p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-slate-950">Requested Items ({request.items})</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-100 sm:hidden">
                {request.products.map((product) => (
                  <div key={product.id} className="p-3.5">
                    <p className="break-words text-sm font-bold text-slate-950">{product.name}</p>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">{product.supplier || request.supplier || "-"}</p>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-500">Quantity</span>
                      <span className="font-bold text-slate-900">{product.requestedQty.toLocaleString()} {product.unit || "Box"}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden max-h-[300px] overflow-auto sm:block">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.products.map((product) => (
                      <tr key={product.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-950">{product.name}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{product.supplier || request.supplier || "-"}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{product.requestedQty.toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{product.unit || "Box"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-500">{request.items} products - {totalQuantity.toLocaleString()} total units</p>
                <p className="font-bold text-slate-950">Total Amount: {currency.format(request.amount)}</p>
              </div>
            </div>
          </section>
        </div>

        {isPending || isApproved ? <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
          {isPending ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => onDecision("Rejected")} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-bold text-red-600 hover:bg-red-50">
                <HiOutlineXMark className="h-5 w-5" />
                Reject Request
              </button>
              <button type="button" onClick={() => onDecision("Approved")} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]">
                <HiCheck className="h-5 w-5" />
                Approve Request
              </button>
            </div>
          ) : null}
          {isApproved ? (
            <div className="flex justify-end">
              <button type="button" onClick={onPrint} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]">
                <HiOutlinePrinter className="h-5 w-5" />
                {request.printedAt ? "Reprint" : "Print This Request"}
              </button>
            </div>
          ) : null}
        </footer> : null}
      </div>
    </ReviewModalShell>
  )
}

function DateRangeFilter({ customRangeOpen, dateFrom, datePeriod, dateTo, draftDateFrom, draftDateTo, isOpen, onApply, onCancelCustom, onOpen, onPreset, setDraftDateFrom, setDraftDateTo }) {
  const label = datePeriod === "Custom Range" ? getDateRangeLabel(dateFrom, dateTo) : datePeriod
  const customRangeIsValid = Boolean(draftDateFrom && draftDateTo && draftDateTo >= draftDateFrom)
  const periods = ["Today", "Yesterday", "This Week", "This Month", "Last 30 Days"]

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={onOpen}
        className={`inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-sm font-bold outline-none transition sm:w-[200px] ${isOpen ? "border-[#0b6b51]/50 text-[#0b6b51] ring-2 ring-[#0b6b51]/10" : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"}`}
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-2">
          <HiOutlineCalendarDays className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <HiChevronDown className="h-4 w-4 shrink-0" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-2xl">
          {customRangeOpen ? (
            <div className="p-4">
              <p className="text-sm font-bold text-slate-900">Custom Date Range</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="min-w-0 text-xs font-bold text-slate-500">
                  From
                  <input type="date" required value={draftDateFrom} max={draftDateTo || undefined} onChange={(event) => setDraftDateFrom(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0b6b51]" />
                </label>
                <label className="min-w-0 text-xs font-bold text-slate-500">
                  To
                  <input type="date" required value={draftDateTo} min={draftDateFrom || undefined} onChange={(event) => setDraftDateTo(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0b6b51]" />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={onCancelCustom} className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" disabled={!customRangeIsValid} onClick={onApply} className="h-9 rounded-lg bg-[#00675b] px-5 text-xs font-bold text-white hover:bg-[#005348] disabled:cursor-not-allowed disabled:bg-slate-300">Apply</button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {periods.map((period) => (
                <button key={period} type="button" onClick={() => onPreset(period)} className="flex h-10 w-full items-center justify-between px-4 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#0b6b51]">
                  {period}
                  {datePeriod === period ? <HiCheck className="h-4 w-4 text-[#0b6b51]" /> : null}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <button type="button" onClick={() => onPreset("Custom Range")} className="flex h-10 w-full items-center justify-between px-4 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#0b6b51]">
                Custom Range
                {datePeriod === "Custom Range" ? <HiCheck className="h-4 w-4 text-[#0b6b51]" /> : null}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function ReviewModalShell({ children, onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose()
      if (event.key !== "Tab" || !modalRef.current) return

      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/40 p-2 sm:p-4 lg:left-[210px] xl:left-[250px]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close review modal" />
      <section ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="review-purchase-request-title" className="relative w-full max-w-[900px] rounded-xl bg-white shadow-2xl outline-none sm:rounded-2xl">
        {children}
      </section>
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${active ? "border-[#00675b] text-[#00675b]" : "border-transparent text-slate-500 hover:text-[#00675b]"}`}>
      {children}
    </button>
  )
}

function PrintPreview({ onBack, onPrinted, requests }) {
  const [printType, setPrintType] = useState("supplier")
  const [paperSize, setPaperSize] = useState("A4")
  const [orientation, setOrientation] = useState("portrait")
  const [printDialogOpened, setPrintDialogOpened] = useState(false)
  const [settings, setSettings] = useState({
    company: true,
    requestedBy: true,
    notes: true,
    branch: true,
    supplier: true,
    approval: true,
  })
  const supplierGroups = useMemo(() => consolidateBySupplier(requests), [requests])
  const selectedPaper = paperDimensions[paperSize] || paperDimensions.A4
  const previewWidth = orientation === "landscape" ? selectedPaper.height : selectedPaper.width
  const previewMinHeight = orientation === "landscape" ? selectedPaper.width : selectedPaper.height

  const toggleSetting = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }))
  const handlePrint = () => {
    window.print()
    setPrintDialogOpened(true)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 sm:px-6 lg:px-8">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #purchase-print-document, #purchase-print-document * { visibility: visible !important; }
          #purchase-print-document { position: absolute; inset: 0; width: 100%; padding: 0 !important; }
          .print-controls { display: none !important; }
          @page { size: ${paperSize} ${orientation}; margin: 14mm; }
          .supplier-print-section { break-inside: avoid; page-break-inside: avoid; }
          .print-table thead { display: table-header-group; }
          .print-table tr { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="print-controls rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <h2 className="text-xl font-bold text-slate-950">Print Preview</h2>
          <section className="mt-5 space-y-3">
            <p className="text-sm font-bold text-slate-700">Print Type</p>
            <RadioOption checked={printType === "supplier"} title="Supplier List" detail="Grouped by Supplier" onChange={() => setPrintType("supplier")} />
            <RadioOption checked={printType === "summary"} title="Request Summary" detail="Grouped by Branch" onChange={() => setPrintType("summary")} />
          </section>

          <section className="mt-6">
            <p className="text-sm font-bold text-slate-700">Selected Requests</p>
            <div className="mt-3 space-y-2">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-bold text-slate-900">{request.id}</p>
                  <p className="text-xs font-medium text-slate-500">{request.branch}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-3">
            <p className="text-sm font-bold text-slate-700">Print Settings</p>
            <label className="block text-xs font-bold text-slate-500">Paper Size<Select value={paperSize} onChange={setPaperSize} options={["A4", "Letter", "Legal"]} /></label>
            <label className="block text-xs font-bold text-slate-500">Orientation<Select value={orientation} onChange={setOrientation} options={["portrait", "landscape"]} /></label>
            <div className="grid gap-2 pt-1">
              {[
                ["company", "Header / Company Info"],
                ["requestedBy", "Requested By"],
                ["notes", "Notes"],
                ["branch", "Branch"],
                ["supplier", "Supplier"],
                ["approval", "Approval information"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} className="h-4 w-4 rounded border-slate-300 text-[#00675b] focus:ring-[#00675b]" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row xl:flex-col">
            <button type="button" onClick={handlePrint} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]">
              <HiOutlinePrinter className="h-5 w-5" />
              Print
            </button>
            <button type="button" disabled={!printDialogOpened} onClick={() => onPrinted(requests)} className="h-11 rounded-lg border border-[#00675b] px-5 text-sm font-bold text-[#00675b] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white">Mark as Printed</button>
            <button type="button" onClick={onBack} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel / Back</button>
          </div>
        </aside>

        <main className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner">
          <article id="purchase-print-document" className="mx-auto bg-white p-10 text-slate-950 shadow-[0_12px_36px_rgba(15,23,42,0.12)] transition-[width,min-height] duration-200 print:shadow-none" style={{ width: `${previewWidth}px`, minHeight: `${previewMinHeight}px` }}>
            {settings.company ? (
              <header className="border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-2xl font-bold tracking-wide">LYFE PHARMACY</h1>
                <p className="mt-1 text-sm font-bold">{printType === "supplier" ? "PURCHASE ORDER / SUPPLIER LIST" : "PURCHASE REQUEST SUMMARY"}</p>
              </header>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <p><strong>PO No:</strong> PO-2026-0082</p>
              <p className="text-right"><strong>Date:</strong> August 26, 2026</p>
              <p><strong>Requests:</strong> {requests.map((request) => request.id).join(", ")}</p>
              <p className="text-right"><strong>Total Amount:</strong> {currency.format(requests.reduce((sum, request) => sum + request.amount, 0))}</p>
            </div>

            {printType === "supplier" ? (
              <SupplierPrintDocument groups={supplierGroups} settings={settings} />
            ) : (
              <BranchSummaryDocument requests={requests} settings={settings} />
            )}

            <footer className="mt-10 grid grid-cols-1 gap-8 text-sm sm:grid-cols-3">
              <Signature label="Prepared By" />
              <Signature label="Approved By" />
              <Signature label="Supplier Acknowledgement" />
            </footer>
          </article>
        </main>
      </div>
    </div>
  )
}

function SupplierPrintDocument({ groups, settings }) {
  return (
    <div className="mt-7 space-y-7">
      {groups.length ? groups.map((group) => (
        <section key={group.supplier} className="supplier-print-section">
          {settings.supplier ? <h2 className="text-base font-bold">Supplier: {group.supplier}</h2> : null}
          <table className="print-table mt-3 w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100">
                {["Product", "Total Quantity", "Unit", settings.branch ? "Requested By (Branch)" : "Requested By", settings.notes ? "Notes" : null].filter(Boolean).map((head) => (
                  <th key={head} className="border border-slate-300 px-2 py-2 text-left font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={`${group.supplier}-${item.name}`}>
                  <td className="border border-slate-300 px-2 py-2 font-semibold">{item.name}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.totalQuantity}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.unit}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.sources.map((source) => `${source.branch} (${source.quantity})`).join(", ")}</td>
                  {settings.notes ? <td className="border border-slate-300 px-2 py-2">{item.notes.join("; ") || "-"}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )) : <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">No approved request items selected.</p>}
    </div>
  )
}

function BranchSummaryDocument({ requests, settings }) {
  return (
    <div className="mt-7 space-y-7">
      {requests.map((request) => (
        <section key={request.id} className="supplier-print-section">
          <h2 className="text-base font-bold">{settings.branch ? request.branch : request.id}</h2>
          <div className="mt-1 grid gap-1 text-xs text-slate-700 sm:grid-cols-2">
            {settings.requestedBy ? <p><strong>Requested By:</strong> {request.requestedBy}</p> : null}
            {settings.approval ? <p><strong>Approved By:</strong> {request.approvedBy || "Super Admin"} on {request.approvedDate || request.date}</p> : null}
            {settings.notes ? <p className="sm:col-span-2"><strong>Notes:</strong> {request.remarks || "-"}</p> : null}
          </div>
          <table className="print-table mt-3 w-full border-collapse text-xs">
            <thead><tr className="bg-slate-100">{["Product", "Quantity", "Unit", settings.supplier ? "Supplier" : null].filter(Boolean).map((head) => <th key={head} className="border border-slate-300 px-2 py-2 text-left font-bold">{head}</th>)}</tr></thead>
            <tbody>
              {request.products.map((product) => (
                <tr key={product.id}>
                  <td className="border border-slate-300 px-2 py-2 font-semibold">{product.name}</td>
                  <td className="border border-slate-300 px-2 py-2">{product.requestedQty}</td>
                  <td className="border border-slate-300 px-2 py-2">{product.unit || "Box"}</td>
                  {settings.supplier ? <td className="border border-slate-300 px-2 py-2">{product.supplier || request.supplier}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

function RadioOption({ checked, detail, onChange, title }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked ? "border-[#00675b] bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 h-4 w-4 border-slate-300 text-[#00675b] focus:ring-[#00675b]" />
      <span>
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs font-medium text-slate-500">{detail}</span>
      </span>
    </label>
  )
}

function Signature({ label }) {
  return <div className="pt-8 text-center"><div className="border-t border-slate-900 pt-2 font-semibold">{label}</div></div>
}

function consolidateBySupplier(requests) {
  const suppliers = new Map()

  requests.forEach((request) => {
    request.products.forEach((product) => {
      const supplier = product.supplier || request.supplier || "Unassigned Supplier"
      const unit = product.unit || "Box"
      const key = `${product.name}|${unit}`
      if (!suppliers.has(supplier)) suppliers.set(supplier, new Map())
      const supplierItems = suppliers.get(supplier)
      if (!supplierItems.has(key)) {
        supplierItems.set(key, { name: product.name, totalQuantity: 0, unit, sources: [], notes: [] })
      }
      const item = supplierItems.get(key)
      item.totalQuantity += product.requestedQty
      item.sources.push({ branch: request.branch, quantity: product.requestedQty })
      if (request.remarks && !item.notes.includes(request.remarks)) item.notes.push(request.remarks)
    })
  })

  return Array.from(suppliers, ([supplier, items]) => ({ supplier, items: Array.from(items.values()) }))
}

function parseRequestDate(date) {
  const normalized = String(date || "").split(" - ")[0]
  const parsed = new Date(`${normalized} 00:00:00`)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

function isPrintableRequest(request) {
  return request.status === "Approved" && !request.printedAt
}

function isForProcessingRequest(request) {
  return request.status === "Pending" || isPrintableRequest(request)
}

function isHistoryRequest(request) {
  return request.status === "Rejected" || (request.status === "Approved" && Boolean(request.printedAt))
}

function getPrintStatusLabel(request) {
  if (request.status !== "Approved") return "-"
  return request.printedAt ? "Printed" : "Not Printed"
}

function getCompletionLabel(request) {
  if (request.status === "Rejected") return "Rejected"
  if (request.status === "Approved" && request.printedAt) return "Printed"
  return "-"
}

function getCompletedDate(request) {
  if (request.status === "Approved" && request.printedAt) return request.printedAt
  if (request.status === "Rejected") return request.rejectedDate || request.date
  return request.date
}

function getRequestFilterDate(request, tab) {
  return tab === "history" ? getCompletedDate(request) : request.date
}

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDatePeriodRange(period, now = purchaseRequestsReferenceDate) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(end)

  if (period === "Yesterday") {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (period === "This Week") {
    const daysSinceMonday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - daysSinceMonday)
  } else if (period === "This Month") {
    start.setDate(1)
  } else if (period === "Last 30 Days") {
    start.setDate(start.getDate() - 29)
  }

  return { from: toDateInputValue(start), to: toDateInputValue(end) }
}

function formatCompactDate(value, includeYear = false) {
  if (!value) return ""
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(includeYear ? { year: "numeric" } : {}) })
}

function formatReviewDateTime(value) {
  return value.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
}

function getDateRangeLabel(from, to) {
  if (!from && !to) return "Custom Range"
  if (from && to) {
    const sameYear = new Date(`${from}T00:00:00`).getFullYear() === new Date(`${to}T00:00:00`).getFullYear()
    return `${formatCompactDate(from, !sameYear)} – ${formatCompactDate(to, !sameYear)}`
  }
  return from ? `From ${formatCompactDate(from, true)}` : `Until ${formatCompactDate(to, true)}`
}

function ConfirmStatusModal({ confirmation, onCancel, onConfirm }) {
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const isApproval = confirmation.status === "Approved"
  const request = confirmation.request
  const canSubmit = isApproval || remarks.trim().length > 0

  const handleConfirm = async () => {
    if (!canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm({ request, status: confirmation.status, remarks: remarks.trim() })
    } catch {
      setError(isApproval ? "Unable to approve purchase request. Please try again." : "Unable to reject purchase request. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-lg">
      <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${isApproval ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{isApproval ? <HiCheck className="h-9 w-9" /> : <HiOutlineXMark className="h-9 w-9" />}</span>
      <h2 className="mt-5 text-center text-xl font-bold text-slate-900">{isApproval ? "Approve Purchase Request?" : "Reject Purchase Request?"}</h2>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        {isApproval ? <p className="mb-3 font-medium text-slate-600">You are about to approve:</p> : null}
        <p><strong>{request.id}</strong> - {request.branch}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{request.items} items</span>
          <span className="text-slate-400">-</span>
          <span className="font-semibold text-slate-900">{currency.format(request.amount)}</span>
        </p>
        {isApproval ? <p className="mt-3 text-xs font-semibold text-emerald-700">Once approved, this request will become available for printing.</p> : null}
      </div>
      {!isApproval ? (
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Reason for rejection <span className="text-red-500">*</span></span>
          <textarea required maxLength={500} value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400" placeholder="Please provide a reason for rejecting this request..." />
          <span className="mt-1 block text-right text-xs font-medium text-slate-400">{remarks.length}/500</span>
        </label>
      ) : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" disabled={isSubmitting} onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
        <button type="button" disabled={!canSubmit || isSubmitting} onClick={handleConfirm} className={`h-11 rounded-lg px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isApproval ? "bg-[#00675b] hover:bg-[#005348]" : "bg-red-600 hover:bg-red-700"}`}>{isSubmitting ? (isApproval ? "Approving..." : "Rejecting...") : (isApproval ? "Approve Request" : "Reject Request")}</button>
      </div>
    </ModalShell>
  )
}

function BulkDecisionModal({ count, onCancel, onConfirm, status }) {
  const [remarks, setRemarks] = useState("")
  const isApproval = status === "Approved"
  const canConfirm = isApproval || remarks.trim().length > 0
  return <ModalShell onClose={onCancel} maxWidth="max-w-lg"><h2 className="pr-10 text-xl font-bold text-slate-900">{isApproval ? "Approve Selected Requests?" : "Reject Selected Requests?"}</h2><p className="mt-4 text-sm leading-6 text-slate-600">You are about to {status.toLowerCase()} {count} pending purchase request{count === 1 ? "" : "s"}.</p>{!isApproval ? <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Reason for rejection <span className="text-red-500">*</span></span><textarea required maxLength={500} value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400" placeholder="Provide a reason for rejecting the selected requests..." /></label> : null}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700">Cancel</button><button type="button" disabled={!canConfirm} onClick={() => onConfirm({ status, remarks: remarks.trim() })} className={`h-11 rounded-lg px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isApproval ? "bg-[#00675b] hover:bg-[#005348]" : "bg-red-600 hover:bg-red-700"}`}>{isApproval ? `Approve ${count} Requests` : `Reject ${count} Requests`}</button></div></ModalShell>
}

function BulkActionButton({ enabled, explanation, icon: Icon, label, onClick, tone }) {
  const enabledClass = tone === "danger"
    ? "border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
    : "border-[#00675b] bg-[#00675b] text-white hover:border-[#005348] hover:bg-[#005348]"
  return <span className="inline-flex" title={enabled ? label : explanation}><button type="button" disabled={!enabled} onClick={onClick} aria-disabled={!enabled} aria-label={enabled ? label : `${label}. ${explanation}`} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${enabled ? enabledClass : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"}`}>{Icon ? <Icon className="h-5 w-5" /> : null}{label}</button></span>
}

function countBy(items, getKey) { return items.reduce((counts, item) => ({ ...counts, [getKey(item)]: (counts[getKey(item)] || 0) + 1 }), {}) }
function selectionHeading(requests) { const statuses = new Set(requests.map((request) => request.status)); const status = statuses.size === 1 ? requests[0].status.toLowerCase() + " " : ""; return `${requests.length} ${status}request${requests.length === 1 ? "" : "s"} selected` }
function selectionBreakdown(requests, statusCounts, printCounts) { const statuses = Object.entries(statusCounts); if (statuses.length > 1) return statuses.map(([status, count]) => `${count} ${status}`).join(" • "); if (requests[0]?.status === "Approved" && Object.keys(printCounts).length > 1) return Object.entries(printCounts).map(([status, count]) => `${count} ${status}`).join(" • "); return "" }

function Select({ className = "w-full", onChange, options, value }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 ${className}`}>{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option> })}</select> }
function PurchaseRequestsPagination({ currentPage, filteredCount, onPageSizeChange, pageCount, paginationItems, rowsPerPage, setPage, setRowsPerPage, showingText }) { return <div className="flex min-h-14 flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-5"><p>{showingText}</p><div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end"><label className="relative block min-w-[10.75rem]"><span className="sr-only">Entries per page</span><select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1); onPageSizeChange() }} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-base font-semibold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15">{[10, 25, 50].map((amount) => <option key={amount} value={amount}>{amount} entries</option>)}</select><FiChevronUp className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></label><nav aria-label="Purchase requests pagination" className="flex items-center gap-2"><PageButton disabled={currentPage === 1 || filteredCount === 0} onClick={() => setPage(Math.max(1, currentPage - 1))}><HiChevronLeft className="h-5 w-5" /></PageButton>{filteredCount > 0 && paginationItems.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} aria-hidden="true" className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400">...</span> : <PageButton key={item} active={item === currentPage} onClick={() => setPage(item)}>{item}</PageButton>)}<PageButton disabled={currentPage === pageCount || filteredCount === 0} onClick={() => setPage(Math.min(pageCount, currentPage + 1))}><HiChevronRight className="h-5 w-5" /></PageButton></nav></div></div> }
function ModalShell({ children, maxWidth = "max-w-xl", onClose }) { return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-3 sm:p-4"><button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close dialog" /><section className={`relative max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6`}><button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 sm:right-4 sm:top-4" aria-label="Close"><HiXMark className="h-5 w-5" /></button>{children}</section></div> }
function StatusBadge({ status }) { const styles = { Pending: "bg-amber-100 text-amber-700", Approved: "bg-emerald-100 text-emerald-700", Rejected: "bg-red-100 text-red-600" }; return <span className={`inline-flex h-7 min-w-20 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-bold ${styles[status]}`}>{status}</span> }
function ActionButton({ danger = false, icon: Icon, label, onClick }) { return <button type="button" onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg border transition ${danger ? "border-red-200 text-red-500 hover:bg-red-50" : "border-slate-200 text-[#0b6b51] hover:bg-emerald-50"}`} aria-label={label} title={label}><Icon className="h-5 w-5" /></button> }
function PageButton({ active, children, disabled, onClick }) { return <button type="button" disabled={disabled} onClick={onClick} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-bold ${active ? "border-[#00675b] bg-[#00675b] text-white" : "border-slate-200 bg-white text-slate-600"} disabled:text-slate-300`}>{children}</button> }
function getPaginationItems(currentPage, pageCount) { if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1); if (currentPage <= 3) return [1, 2, 3, "ellipsis", pageCount]; if (currentPage >= pageCount - 2) return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount]; return [1, "ellipsis", currentPage, "ellipsis", pageCount] }

export default SuperAdminPurchaseRequests





