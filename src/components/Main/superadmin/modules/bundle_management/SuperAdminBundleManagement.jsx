import { useEffect, useMemo, useState } from "react"
import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
  HiOutlineArchiveBox,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineShoppingBag,
  HiOutlineXMark,
} from "react-icons/hi2"
import { FiChevronUp, FiMoreVertical } from "react-icons/fi"

import amoxicillinImage from "../../../../../assets/products/amoxicilin.jpg"
import biogesicImage from "../../../../../assets/products/biogesic.jpg"
import cetirizineImage from "../../../../../assets/products/cetirizine.jpg"
import loratadineImage from "../../../../../assets/products/loratadine.jpg"
import omeprazoleImage from "../../../../../assets/products/omeprazole.jpg"
import paracetamolImage from "../../../../../assets/products/paracetamol.jpg"

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

const initialBundles = [
  {
    id: "bundle-1",
    name: "Pain Relief Pack",
    code: "BND-001",
    branch: "Camalig",
    items: ["Biogesic Tab 500mg", "Omeprazole Cap 20mg", "Paracetamol Tab 500mg"],
    earliestExpiry: "Jul 25, 2026",
    daysLeft: 37,
    stock: 12,
    possibleStock: 16,
    price: 80,
    status: "Active",
    sold: 45,
    sales: 3600,
    trend: 12,
    images: [biogesicImage, omeprazoleImage],
  },
  {
    id: "bundle-2",
    name: "Cold & Flu Bundle",
    code: "BND-002",
    branch: "Guinobatan",
    items: ["Bioflu Cap", "Ascorbic Acid 500mg", "Paracetamol Tab 500mg"],
    earliestExpiry: "Aug 10, 2026",
    daysLeft: 53,
    stock: 8,
    possibleStock: 11,
    price: 120,
    status: "Active",
    sold: 34,
    sales: 4080,
    trend: 8,
    images: [paracetamolImage, biogesicImage],
  },
  {
    id: "bundle-3",
    name: "Vitamin Boost Pack",
    code: "BND-003",
    branch: "Daraga",
    items: ["Conzace Tab", "Vitamin C 500mg"],
    earliestExpiry: "Sep 6, 2026",
    daysLeft: 80,
    stock: 10,
    possibleStock: 18,
    price: 150,
    status: "Active",
    sold: 28,
    sales: 4200,
    trend: 6,
    images: [paracetamolImage, cetirizineImage],
  },
  {
    id: "bundle-4",
    name: "Stomach Relief Bundle",
    code: "BND-004",
    branch: "Polangui",
    items: ["Maalox Tab", "Loperamide Cap", "Omeprazole Cap 20mg"],
    earliestExpiry: "Jul 30, 2026",
    daysLeft: 42,
    stock: 1,
    possibleStock: 4,
    price: 90,
    status: "Active",
    sold: 19,
    sales: 1710,
    trend: -3,
    images: [omeprazoleImage, biogesicImage],
  },
  {
    id: "bundle-5",
    name: "Antibiotic Care Pack",
    code: "BND-005",
    branch: "Camalig",
    items: ["Amoxicillin Cap 500mg", "Paracetamol Tab 500mg"],
    earliestExpiry: "Jul 10, 2026",
    daysLeft: 22,
    stock: 0,
    possibleStock: 0,
    price: 130,
    status: "Out of Stock",
    sold: 16,
    sales: 2080,
    trend: -10,
    images: [amoxicillinImage, paracetamolImage],
  },
  {
    id: "bundle-6",
    name: "Allergy Relief Bundle",
    code: "BND-006",
    branch: "Manito",
    items: ["Loratadine Tab", "Cetirizine Tab"],
    earliestExpiry: "Aug 6, 2026",
    daysLeft: 49,
    stock: 5,
    possibleStock: 7,
    price: 110,
    status: "Active",
    sold: 22,
    sales: 2420,
    trend: 5,
    images: [loratadineImage, cetirizineImage],
  },
  {
    id: "bundle-7",
    name: "Digestive Care Pack",
    code: "BND-007",
    branch: "Daraga",
    items: ["Diatabs", "Simethicone Cap", "Omeprazole Cap 20mg"],
    earliestExpiry: "Sep 14, 2026",
    daysLeft: 88,
    stock: 12,
    possibleStock: 20,
    price: 100,
    status: "Active",
    sold: 31,
    sales: 3100,
    trend: 9,
    images: [omeprazoleImage, paracetamolImage],
  },
  {
    id: "bundle-8",
    name: "Fever Relief Set",
    code: "BND-008",
    branch: "Guinobatan",
    items: ["Paracetamol Tab 500mg", "Vitamin C 500mg"],
    earliestExpiry: "Jul 15, 2026",
    daysLeft: 27,
    stock: 4,
    possibleStock: 5,
    price: 95,
    status: "Active",
    sold: 20,
    sales: 1900,
    trend: -2,
    images: [paracetamolImage, biogesicImage],
  },
]

const branches = ["All Branches", "Camalig", "Guinobatan", "Polangui", "Daraga", "Manito"]
const productCatalog = Array.from(new Set(initialBundles.flatMap((bundle) => bundle.items))).sort()
const statusOptions = ["All Statuses", "Active", "Out of Stock", "Archived"]
const expiryOptions = ["All Expiry Status", "Healthy", "Near Expiry", "Urgent", "Low Availability", "Unavailable", "Archived"]

function SuperAdminBundleManagement({ embedded = false, inventoryViewSwitch = null, onArchiveBundle }) {
  const [bundles, setBundles] = useState(() => initialBundles.slice(0, 1))
  const [query, setQuery] = useState("")
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [expiryFilter, setExpiryFilter] = useState("All Expiry Status")
  const [quickFilter, setQuickFilter] = useState("All")
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [salesTarget, setSalesTarget] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [actionMenu, setActionMenu] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!actionMenu) return undefined
    const closeMenu = () => setActionMenu(null)
    const closeOnEscape = (event) => { if (event.key === "Escape") closeMenu() }
    window.addEventListener("mousedown", closeMenu)
    window.addEventListener("keydown", closeOnEscape)
    window.addEventListener("resize", closeMenu)
    window.addEventListener("scroll", closeMenu, true)
    return () => {
      window.removeEventListener("mousedown", closeMenu)
      window.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("resize", closeMenu)
      window.removeEventListener("scroll", closeMenu, true)
    }
  }, [actionMenu])

  const toggleActionMenu = (event, bundle) => {
    event.stopPropagation()
    if (actionMenu?.bundle.id === bundle.id) return setActionMenu(null)
    const rect = event.currentTarget.getBoundingClientRect()
    const opensUp = rect.bottom + 132 > window.innerHeight - 12
    setActionMenu({ bundle, right: Math.max(12, window.innerWidth - rect.right), top: opensUp ? undefined : rect.bottom + 6, bottom: opensUp ? window.innerHeight - rect.top + 6 : undefined })
  }

  const enrichedBundles = useMemo(
    () => bundles.map((bundle) => ({ ...bundle, expiryStatus: getExpiryStatus(bundle) })),
    [bundles]
  )

  const filteredBundles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return enrichedBundles.filter((bundle) => {
      const matchesSearch = !normalizedQuery || [bundle.name, bundle.code, bundle.branch, ...bundle.items].some((value) => value.toLowerCase().includes(normalizedQuery))
      const matchesBranch = branchFilter === "All Branches" || bundle.branch === branchFilter
      const matchesStatus = statusFilter === "All Statuses" || bundle.status === statusFilter
      const matchesExpiry = expiryFilter === "All Expiry Status"
        || (expiryFilter === "Urgent" ? ["Low Availability", "Unavailable"].includes(bundle.expiryStatus) : bundle.expiryStatus === expiryFilter)
      return matchesSearch && matchesBranch && matchesStatus && matchesExpiry
    })
  }, [branchFilter, enrichedBundles, expiryFilter, query, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredBundles.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleBundles = filteredBundles.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const paginationItems = getPaginationItems(currentPage, pageCount)
  const showingText = filteredBundles.length ? `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredBundles.length)} of ${filteredBundles.length} bundles` : "Showing 0 of 0 bundles"
  const selectedBundles = enrichedBundles.filter((bundle) => selectedIds.includes(bundle.id))
  const visibleIds = visibleBundles.map((bundle) => bundle.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const bundleStats = useMemo(() => ({
    total: enrichedBundles.length,
    healthy: enrichedBundles.filter((bundle) => bundle.expiryStatus === "Healthy").length,
    nearExpiry: enrichedBundles.filter((bundle) => bundle.expiryStatus === "Near Expiry").length,
    urgent: enrichedBundles.filter((bundle) => ["Low Availability", "Unavailable"].includes(bundle.expiryStatus)).length,
    sales: enrichedBundles.reduce((sum, bundle) => sum + Number(bundle.sales ?? 0), 0),
  }), [enrichedBundles])

  const updateFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const selectQuickFilter = (filter) => {
    setQuickFilter(filter)
    setExpiryFilter(filter === "All" ? "All Expiry Status" : filter)
    setPage(1)
  }

  const updateExpiryFilter = (event) => {
    const value = event.target.value
    setExpiryFilter(value)
    setQuickFilter(value === "All Expiry Status" ? "All" : ["Low Availability", "Unavailable"].includes(value) ? "Urgent" : value)
    setPage(1)
  }

  const activeFilterCount = [branchFilter !== "All Branches", statusFilter !== "All Statuses", expiryFilter !== "All Expiry Status"].filter(Boolean).length


  const archiveBundle = (bundle) => {
    setBundles((current) => current.filter((item) => item.id !== bundle.id))
    setSelectedBundle(null)
    setEditTarget(null)
    setSalesTarget(null)
    onArchiveBundle?.(bundle)
    setToast(`${bundle.name} moved to archived records. Sales and batch history are preserved.`)
  }

  const toggleBundleSelection = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id])
  const toggleVisibleSelection = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])
  const archiveSelectedBundles = () => {
    const selectedSet = new Set(selectedIds)
    setBundles((current) => current.filter((bundle) => !selectedSet.has(bundle.id)))
    selectedBundles.forEach((bundle) => onArchiveBundle?.(bundle))
    setToast(`${selectedBundles.length} bundles moved to archived records. Sales and batch history are preserved.`)
    setSelectedIds([])
    setIsBulkArchiveOpen(false)
    setPage(1)
  }

  const saveBundle = (updatedBundle) => {
    const normalizedBundle = {
      ...updatedBundle,
      price: Number(updatedBundle.price) || 0,
      stock: Number(updatedBundle.stock) || 0,
      daysLeft: Number(updatedBundle.daysLeft) || 0,
      items: updatedBundle.items.map((item) => item.trim()).filter(Boolean),
    }

    setBundles((current) => current.map((bundle) => (bundle.id === normalizedBundle.id ? normalizedBundle : bundle)))
    setSelectedBundle({ ...normalizedBundle, expiryStatus: getExpiryStatus(normalizedBundle) })
    setEditTarget(null)
    setToast(`${normalizedBundle.name} changes saved successfully.`)
  }

  const summaryCards = [
    ["Total Bundles", bundleStats.total, "Across all branches", HiOutlineShoppingBag, "bg-emerald-50 text-[#0b6b51]"],
    ["Healthy Bundles", bundleStats.healthy, "No urgent issues", HiOutlineCheckCircle, "bg-green-50 text-green-600"],
    ["Bundles Near Expiry", bundleStats.nearExpiry, "Expiry within 60 days", HiOutlineExclamationTriangle, "bg-orange-50 text-orange-500"],
    ["Urgent Bundles", bundleStats.urgent, "Requires attention", HiOutlineArchiveBox, "bg-red-50 text-red-500"],
    ["Bundle Sales", currency.format(bundleStats.sales), "This month", HiOutlineChartBarSquare, "bg-sky-50 text-sky-600"],
  ]

  return (
    <div className={`mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 sm:px-6 lg:px-8 ${embedded ? "pt-0" : ""}`}>
      {!embedded ? <h1 className="text-xl font-bold text-slate-950 lg:hidden">Bundle Management</h1> : null}

      <section className="lg:hidden">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Overview</p>
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
          {[["All", "Total", bundleStats.total], ["Healthy", "Healthy", bundleStats.healthy], ["Near Expiry", "Near Expiry", bundleStats.nearExpiry], ["Urgent", "Urgent", bundleStats.urgent]].map(([filter, label, value]) => (
            <button key={filter} type="button" onClick={() => selectQuickFilter(filter)} className={`min-h-[78px] rounded-xl border bg-white p-3 text-left shadow-sm transition ${quickFilter === filter ? "border-[#0b6b51]/50 ring-1 ring-[#0b6b51]/10" : "border-slate-200"}`}>
              <span className="block text-xs font-semibold text-slate-600">{label}</span>
              <span className="mt-2 block text-xl font-bold leading-none text-slate-950">{value}</span>
            </button>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
          <span><span className="block text-xs font-bold text-slate-700">Bundle Sales</span><span className="mt-0.5 block text-[11px] font-medium text-slate-500">This month</span></span>
          <span className="truncate text-base font-bold text-[#0b6b51]">{currency.format(bundleStats.sales)}</span>
        </div>
      </section>

      <section className="hidden grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid xl:grid-cols-5">
        {summaryCards.map(([label, value, detail, Icon, tone]) => (
          <Card key={label} className="min-h-[112px] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-slate-700">{label}</p>
                <p className="mt-2 whitespace-nowrap text-2xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums]">{value}</p>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{detail}</p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-6 w-6" />
              </span>
            </div>
          </Card>
        ))}
      </section>
      {inventoryViewSwitch}

      <section className="space-y-4 border-b border-slate-200 pb-4">
        <div className="flex max-w-[640px] items-center gap-2.5 sm:gap-3">
          <label className="relative min-w-0 flex-1 sm:max-w-[500px]">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search bundle name or code..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-white transition ${filterOpen ? "border-[#0b6b51]/50 text-[#0b6b51]" : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"}`} aria-label={activeFilterCount ? `Filter bundles, ${activeFilterCount} active` : "Filter bundles"} aria-expanded={filterOpen}
            >
              <HiOutlineFunnel className="h-5 w-5" />
            </button>
            {filterOpen ? (
              <BundleFilterMenu
                branchFilter={branchFilter}
                expiryFilter={expiryFilter}
                onBranchChange={updateFilter(setBranchFilter)}
                onClear={() => {
                  setBranchFilter("All Branches")
                  setStatusFilter("All Statuses")
                  setExpiryFilter("All Expiry Status")
                  setQuickFilter("All")
                  setPage(1)
                  setFilterOpen(false)
                }}
                onClose={() => setFilterOpen(false)}
                onExpiryChange={updateExpiryFilter}
                onStatusChange={updateFilter(setStatusFilter)}
                statusFilter={statusFilter}
              />
            ) : null}
          </div>
        </div>
        <div className="hidden max-w-full gap-1 overflow-x-auto lg:flex" aria-label="Quick bundle filters">
          {[["All", bundleStats.total], ["Healthy", bundleStats.healthy], ["Near Expiry", bundleStats.nearExpiry], ["Urgent", bundleStats.urgent]].map(([filter, count]) => {
            const active = quickFilter === filter
            const tone = filter === "Near Expiry" ? "hover:text-amber-700" : filter === "Urgent" ? "hover:text-red-600" : "hover:text-[#0b6b51]"
            return <button key={filter} type="button" onClick={() => selectQuickFilter(filter)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-bold transition ${active ? "border-[#0b6b51] text-[#0b6b51]" : `border-transparent text-slate-500 ${tone}`}`}>{filter} <span className="font-semibold">({count})</span></button>
          })}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <h2 className="text-lg font-bold text-slate-950">Bundles <span className="text-slate-500">({filteredBundles.length})</span></h2>
      </div>

      {selectedBundles.length ? <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-bold text-[#0b6b51]">{selectedBundles.length} bundle{selectedBundles.length === 1 ? "" : "s"} selected</p><button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Clear Selection</button></div>{selectedBundles.length >= 2 ? <button type="button" onClick={() => setIsBulkArchiveOpen(true)} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Archive Selected</button> : null}</div> : null}

      <div className="space-y-2.5 lg:hidden" aria-label="Bundles">
        {visibleBundles.length ? visibleBundles.map((bundle) => {
          const shownItems = bundle.items.slice(0, 2)
          const remainingItems = Math.max(0, bundle.items.length - shownItems.length)
          return (
            <article key={bundle.id} className="relative w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/20">
              <label className="absolute left-2 top-2 grid h-9 w-9 cursor-pointer place-items-center" aria-label={`Select ${bundle.name}`}><input type="checkbox" checked={selectedIds.includes(bundle.id)} onChange={() => toggleBundleSelection(bundle.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" /></label>
              <button type="button" onClick={() => setSelectedBundle(bundle)} className="w-full min-w-0 px-8 text-left">
              <span className="flex min-w-0 items-start gap-3">
                <BundleThumb bundle={bundle} compact />
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-start justify-between gap-2"><span className="whitespace-normal break-words text-sm font-bold leading-5 text-slate-950">{bundle.name}</span><HiChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" /></span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{bundle.code} · {bundle.branch}</span>
                </span>
              </span>
              <span className="mt-3 block truncate text-xs font-medium text-slate-600">{shownItems.join(" · ")}{remainingItems ? ` · +${remainingItems} more` : ""}</span>
              <span className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><span className="text-base font-bold text-[#0b6b51]">{currency.format(bundle.price)}</span><span className="text-xs font-bold text-slate-600">{bundle.possibleStock} available</span></span>
              <span className="mt-2.5 block"><ExpiryBadge status={bundle.expiryStatus} /></span>
              </button>
              <button type="button" onClick={(event) => toggleActionMenu(event, bundle)} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label={`Actions for ${bundle.name}`} aria-expanded={actionMenu?.bundle.id === bundle.id}><FiMoreVertical className="h-5 w-5" /></button>
            </article>
          )
        }) : <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">No bundles yet.</div>}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[820px] table-fixed text-left text-sm lg:min-w-0">
            <colgroup>
              <col className="w-[48px]" /><col className="w-[26%]" /><col className="w-[12%]" /><col className="w-[25%]" />
              <col className="w-[10%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[6%]" />
            </colgroup>
            <thead className="bg-slate-50 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3 text-center"><input ref={(checkbox) => { if (checkbox) checkbox.indeterminate = someVisibleSelected }} type="checkbox" checked={allVisibleSelected} disabled={!visibleBundles.length} onChange={toggleVisibleSelection} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed" aria-label="Select all bundles on this page" /></th>
                <th className="px-4 py-3">Bundle</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Included Items</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBundles.length ? visibleBundles.map((bundle) => (
                <tr key={bundle.id} className="h-[76px] border-t border-slate-100 align-middle transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-center"><input type="checkbox" checked={selectedIds.includes(bundle.id)} onChange={() => toggleBundleSelection(bundle.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" aria-label={`Select ${bundle.name}`} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BundleThumb bundle={bundle} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold leading-5 text-slate-950">{bundle.name}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold leading-4 text-slate-500">{bundle.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="truncate px-4 py-3 font-semibold text-slate-800">{bundle.branch}</td>
                  <td className="px-4 py-3"><ItemChips items={bundle.items} /></td>
                  <td className="px-4 py-3 font-bold text-[#0b6b51]">{currency.format(bundle.price)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{bundle.possibleStock} bundles</td>
                  <td className="px-4 py-3"><ExpiryBadge status={bundle.expiryStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-center gap-2">
                      <button type="button" onClick={(event) => toggleActionMenu(event, bundle)} className="grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label={`Actions for ${bundle.name}`} aria-expanded={actionMenu?.bundle.id === bundle.id}><FiMoreVertical className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    No bundles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <BundlesPagination currentPage={currentPage} filteredCount={filteredBundles.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} />
      </Card>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:hidden"><BundlesPagination currentPage={currentPage} filteredCount={filteredBundles.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} /></div>

      {actionMenu ? <BundleActionMenu menu={actionMenu} onView={(bundle) => { setActionMenu(null); setSelectedBundle(bundle) }} onEdit={(bundle) => { setActionMenu(null); setEditTarget(bundle) }} onArchive={(bundle) => { setActionMenu(null); setArchiveTarget(bundle) }} /> : null}
      {selectedBundle && !editTarget ? <BundleDetailsDrawer bundle={selectedBundle} onClose={() => setSelectedBundle(null)} /> : null}
      {editTarget ? <EditBundleModal bundle={editTarget} onClose={() => setEditTarget(null)} onSave={saveBundle} /> : null}
      {archiveTarget ? <ArchiveBundleModal bundle={archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={() => { archiveBundle(archiveTarget); setArchiveTarget(null) }} /> : null}
      {isBulkArchiveOpen ? <BulkArchiveBundlesModal count={selectedBundles.length} onClose={() => setIsBulkArchiveOpen(false)} onConfirm={archiveSelectedBundles} /> : null}
      {salesTarget ? <BundleSalesModal bundle={salesTarget} onClose={() => setSalesTarget(null)} /> : null}
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  )
}

function BundleFilterMenu({ branchFilter, expiryFilter, onBranchChange, onClear, onClose, onExpiryChange, onStatusChange, statusFilter }) {
  return (
    <div className="absolute right-0 z-30 mt-2 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-950">Filter Bundles</p>
      </div>
      <div className="mt-4 space-y-3">
        <label className="block text-xs font-bold text-slate-500">
          <span className="mb-1.5 block">Branch</span>
          <FilterSelect value={branchFilter} onChange={onBranchChange} options={branches} />
        </label>
        <label className="block text-xs font-bold text-slate-500">
          <span className="mb-1.5 block">Status</span>
          <FilterSelect value={statusFilter} onChange={onStatusChange} options={statusOptions} />
        </label>
        <label className="block text-xs font-bold text-slate-500">
          <span className="mb-1.5 block">Expiry Status</span>
          <FilterSelect value={expiryFilter} onChange={onExpiryChange} options={expiryOptions} />
        </label>
      </div>
      <div className="mt-4 flex justify-between gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClear} className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Reset</button>
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-4 text-xs font-bold text-white hover:bg-[#005348]">
          <HiOutlineFunnel className="h-4 w-4" />
          Apply Filters
        </button>
      </div>
    </div>
  )
}
function FilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  )
}

function BundleDetailsDrawer({ bundle, onClose }) {
  const [activeTab, setActiveTab] = useState("details")
  const [performancePeriod, setPerformancePeriod] = useState("This Month")
  const periodMultiplier = { "This Week": 0.24, "This Month": 1, "Last Month": 0.82, "This Year": 7.6 }[performancePeriod]
  const performance = {
    sold: Math.round(bundle.sold * periodMultiplier),
    sales: bundle.sales * periodMultiplier,
    trend: performancePeriod === "Last Month" ? Math.round(bundle.trend * 0.7) : bundle.trend,
  }

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[80] grid place-items-center overflow-hidden bg-slate-950/45 lg:left-[210px] lg:p-4 xl:left-[250px]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close bundle details" />
      <section className="relative flex h-dvh max-h-dvh w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl lg:mx-auto lg:my-auto lg:h-auto lg:max-h-[90vh] lg:rounded-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
          <HiOutlineXMark className="h-5 w-5" />
        </button>

        <header className="shrink-0 border-b border-slate-100 bg-white px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4 pr-10">
              <BundleThumb bundle={bundle} large />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="truncate text-xl font-bold leading-7 text-slate-950">{bundle.name}</h2>
                  <ExpiryBadge status={bundle.expiryStatus} />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">{bundle.code} <span className="px-1 text-slate-300">•</span> {bundle.branch}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 pr-10 md:w-[390px] md:pr-0">
              <SummaryValue label="Price" value={currency.format(bundle.price)} />
              <SummaryValue label="Available" value={bundle.possibleStock} />
              <SummaryValue label={bundle.earliestExpiry} value={<span className={bundle.expiryStatus === "Near Expiry" ? "text-orange-500" : ""}>{bundle.daysLeft} days</span>} detail="to expiry" />
            </div>
          </div>
        </header>

        <div className="shrink-0 overflow-x-auto border-b border-slate-100 bg-white px-3 sm:px-6">
          <div className="flex min-w-max gap-1 sm:gap-2">
            {[
              ["details", "Bundle Details"],
              ["included", `Products (${bundle.items.length})`],
              ["performance", "Performance"],
            ].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`border-b-2 px-3 py-3 text-sm font-bold ${activeTab === tab ? "border-[#0b6b51] text-[#0b6b51]" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 sm:px-6 lg:min-h-[270px]">
          {activeTab === "details" ? (
            <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-slate-100">
              <section>
                <h3 className="text-sm font-bold text-slate-950">Bundle Details</h3>
                <div className="mt-3 grid gap-2.5 text-sm">
                  <DetailRow label="Branch" value={bundle.branch} />
                  <DetailRow label="Bundle Price" value={currency.format(bundle.price)} />
                  <DetailRow label="Created At" value="May 15, 2026 10:30 AM" />
                  <DetailRow label="Last Updated" value="May 15, 2026 10:30 AM" />
                </div>
              </section>

              <section className="md:pl-6">
                <h3 className="text-sm font-bold text-slate-950">Description</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">A bundle of essential medicines for pain relief and stomach protection.</p>
                {bundle.expiryStatus === "Near Expiry" ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="flex items-center gap-2 font-bold"><HiOutlineExclamationTriangle className="h-4 w-4" />Near expiry</p>
                    <p className="mt-1.5 leading-5">One or more medicines in this bundle will expire in {bundle.daysLeft} days.</p>
                    <p className="mt-1 font-semibold">Nearest expiry: {bundle.earliestExpiry}</p>
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}

          {activeTab === "included" ? (
            <section>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[34%]" /><col className="w-[12%]" /><col className="w-[16%]" />
                    <col className="w-[12%]" /><col className="w-[16%]" /><col className="w-[10%]" />
                  </colgroup>
                  <thead className="bg-slate-50 text-xs font-bold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Qty / Bundle</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-2.5">Stock</th>
                      <th className="px-4 py-3">Expiry</th>
                      <th className="px-4 py-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.items.map((item, index) => (
                      <tr key={item} className="border-t border-slate-100">
                        <td className="px-4 py-2.5 font-bold text-slate-950">{item}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{bundle.products?.find((product) => product.name === item)?.quantity ?? 1}</td>
                        <td className="px-4 py-2.5 text-slate-600">BT-2026-{index + 11}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{bundle.possibleStock + index * 4}</td>
                        <td className="px-4 py-2.5 text-slate-600">{bundle.earliestExpiry}</td>
                        <td className="px-4 py-2.5"><span className="whitespace-nowrap rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0b6b51]">Use First</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeTab === "performance" ? (
            <section>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-950">Bundle Performance</h3>
                <label className="relative">
                  <select value={performancePeriod} onChange={(event) => setPerformancePeriod(event.target.value)} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-[#0b6b51]">
                    {["This Week", "This Month", "Last Month", "This Year"].map((period) => <option key={period}>{period}</option>)}
                  </select>
                  <HiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Bundles Sold" value={performance.sold} />
                <Metric label="Bundle Sales" value={currency.format(performance.sales)} />
                <Metric label="vs previous period" value={<span className={performance.trend >= 0 ? "text-emerald-600" : "text-red-600"}>{performance.trend >= 0 ? "+" : ""}{performance.trend}%</span>} />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">Performance is calculated based on the selected period.</p>
            </section>
          ) : null}
        </div>

      </section>
    </div>
  )
}

function BundleActionMenu({ menu, onArchive, onEdit, onView }) {
  return <div role="menu" aria-label={`Actions for ${menu.bundle.name}`} onMouseDown={(event) => event.stopPropagation()} className="fixed z-[110] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]" style={{ right: menu.right, top: menu.top, bottom: menu.bottom }}><BundleMenuAction icon={HiOutlineEye} label="View Details" onClick={() => onView(menu.bundle)} /><BundleMenuAction icon={HiOutlinePencilSquare} label="Edit Bundle" onClick={() => onEdit(menu.bundle)} /><BundleMenuAction danger icon={HiOutlineArchiveBox} label="Archive Bundle" onClick={() => onArchive(menu.bundle)} /></div>
}
function BundleMenuAction({ danger = false, icon: Icon, label, onClick }) { return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#0b6b51]"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button> }

function ArchiveBundleModal({ bundle, onClose, onConfirm }) { return <Modal title="Archive Bundle" onClose={onClose}><p className="text-sm font-medium leading-6 text-slate-600">Are you sure you want to archive &quot;{bundle.name}&quot;?</p><p className="mt-2 text-sm font-medium leading-6 text-slate-600">The bundle will no longer be available for normal use or sales, but its historical records and performance data will be retained.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={onConfirm} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Archive Bundle</button></div></Modal> }
function BulkArchiveBundlesModal({ count, onClose, onConfirm }) { return <Modal title="Archive Selected Bundles" onClose={onClose}><p className="text-sm font-medium leading-6 text-slate-600">You are about to archive {count} bundles.</p><p className="mt-2 text-sm font-medium leading-6 text-slate-600">These bundles will no longer be available for normal use or sales, but their historical records and performance data will be retained.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={onConfirm} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Archive {count} Bundles</button></div></Modal> }

function EditBundleModal({ bundle, onClose, onSave }) {
  const [form, setForm] = useState({
    ...bundle,
    products: bundle.products ?? bundle.items.map((name) => ({ name, quantity: 1 })),
  })
  const [productToAdd, setProductToAdd] = useState("")
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateProductQuantity = (name, quantity) => setForm((current) => ({
    ...current,
    products: current.products.map((product) => product.name === name ? { ...product, quantity: Math.max(1, Number(quantity) || 1) } : product),
  }))
  const removeProduct = (name) => setForm((current) => ({ ...current, products: current.products.filter((product) => product.name !== name) }))
  const availableProducts = productCatalog.filter((name) => !form.products.some((product) => product.name === name))
  const addProduct = () => {
    if (!productToAdd || form.products.some((product) => product.name === productToAdd)) return
    setForm((current) => ({ ...current, products: [...current.products, { name: productToAdd, quantity: 1 }] }))
    setProductToAdd("")
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.products.length) return
    onSave({
      ...form,
      items: form.products.map((product) => product.name),
      price: Number(form.price),
    })
  }

  return (
    <Modal title="Edit Bundle" onClose={onClose} hideClose>
      <form onSubmit={handleSubmit} className="space-y-4">
        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Bundle Information</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bundle Name *">
            <input required value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Bundle Code">
            <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600">{form.code}</div>
          </Field>
          <Field label="Branch *">
            <select value={form.branch} onChange={(event) => update("branch", event.target.value)} className={inputClass}>
              {branches.filter((branch) => branch !== "All Branches").map((branch) => <option key={branch}>{branch}</option>)}
            </select>
          </Field>
          <Field label="Status *">
            <select value={form.status} onChange={(event) => update("status", event.target.value)} className={inputClass}>
              <option>Active</option>
              <option>Out of Stock</option>
            </select>
          </Field>
        </div>
        </section>

        <section className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Pricing</p>
          <Field label="Price *">
            <div className="relative max-w-xs"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₱</span><input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} className={`${inputClass} pl-8`} /></div>
          </Field>
        </section>

        <section className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Bundle Products</p>
          <div className="space-y-2">
            {form.products.map((product) => <div key={product.name} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center"><span className="min-w-0 flex-1 text-sm font-bold text-slate-800">{product.name}</span><label className="flex items-center gap-2 text-xs font-semibold text-slate-500">Quantity<input type="number" min="1" value={product.quantity} onChange={(event) => updateProductQuantity(product.name, event.target.value)} className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#0b6b51]" /></label><button type="button" onClick={() => removeProduct(product.name)} disabled={form.products.length === 1} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Remove ${product.name}`}><HiOutlineXMark className="h-4 w-4" /></button></div>)}
          </div>
          {availableProducts.length ? <div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={productToAdd} onChange={(event) => setProductToAdd(event.target.value)} className={`${inputClass} flex-1`}><option value="">Select a product</option>{availableProducts.map((product) => <option key={product}>{product}</option>)}</select><button type="button" onClick={addProduct} disabled={!productToAdd} className="h-11 rounded-lg border border-[#0b6b51] px-4 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">+ Add Product</button></div> : null}
        </section>

        <section className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Calculated Information</p>
          <div className="grid gap-3 sm:grid-cols-3"><ReadOnlyMetric label="Available Stock" value={form.possibleStock ?? form.stock} /><ReadOnlyMetric label="Earliest Expiry" value={form.earliestExpiry} /><ReadOnlyMetric label="Days Left" value={`${form.daysLeft} days`} /></div>
        </section>
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]">Save Changes</button>
        </div>
      </form>
    </Modal>
  )
}

function BundleSalesModal({ bundle, onClose }) {
  const branchRows = [
    [bundle.branch, bundle.sold, bundle.sales, bundle.trend],
    ["Camalig", Math.max(8, bundle.sold - 11), Math.max(640, bundle.sales - 920), 6],
    ["Daraga", Math.max(6, bundle.sold - 16), Math.max(520, bundle.sales - 1400), -2],
  ]

  return (
    <Modal title="Bundle Sales Performance" onClose={onClose}>
      <div className="rounded-xl bg-emerald-50 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0b6b51]">{bundle.code}</p>
        <h3 className="mt-1 text-xl font-bold text-slate-950">{bundle.name}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">{bundle.branch} Branch</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Quantity Sold" value={`${bundle.sold} bundles`} />
        <Metric label="Sales This Month" value={currency.format(bundle.sales)} />
        <Metric label="Sales Trend" value={`${bundle.trend >= 0 ? "+" : ""}${bundle.trend}%`} />
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Sold</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Trend</th></tr>
          </thead>
          <tbody>
            {branchRows.map(([branch, sold, sales, trend]) => (
              <tr key={branch} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold text-slate-900">{branch}</td>
                <td className="px-4 py-3">{sold}</td>
                <td className="px-4 py-3 font-semibold text-[#0b6b51]">{currency.format(sales)}</td>
                <td className={`px-4 py-3 font-bold ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>{trend >= 0 ? "+" : ""}{trend}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
      </div>
    </Modal>
  )
}

function Modal({ children, hideClose = false, onClose, title }) {
  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[95] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 lg:left-[210px] xl:left-[250px]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <section className="relative my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {hideClose ? null : <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close"><HiOutlineXMark className="h-5 w-5" /></button>}
        <h2 className={`${hideClose ? "" : "pr-10"} text-xl font-bold text-slate-950`}>{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  )
}

function Field({ children, label }) {
  return <label><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>
}

const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
function ItemChips({ items }) {
  const visibleItems = items.slice(0, 2)
  const hiddenCount = Math.max(0, items.length - visibleItems.length)
  return (
    <div className="flex max-w-md flex-wrap gap-2">
      {visibleItems.map((item) => <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0b6b51]">{item}</span>)}
      {hiddenCount ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">+{hiddenCount} more</span> : null}
    </div>
  )
}

function BundleThumb({ bundle, compact = false, large = false }) {
  return <span className={`flex shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 ${large ? "h-16 w-24" : compact ? "h-12 w-14" : "h-14 w-20"}`}>{bundle.images.slice(0, compact ? 1 : 2).map((image, index) => <img key={image} src={image} alt={`${bundle.name} thumbnail ${index + 1}`} className={`${large ? "h-12 w-10" : compact ? "h-10 w-11" : "h-10 w-9"} rounded object-cover`} />)}</span>
}

function Metric({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-semibold text-slate-500">{label}</p><div className="mt-2 text-sm font-bold text-slate-950">{value}</div></div>
}

function ReadOnlyMetric({ label, value }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900">{value}</p></div>
}

function SummaryValue({ detail, label, value }) {
  return <div><p className="text-lg font-bold leading-6 text-slate-950">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>{detail ? <p className={`mt-0.5 text-xs font-bold ${detail.includes("days") ? "text-orange-500" : "text-slate-500"}`}>{detail}</p> : null}</div>
}

function DetailRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"><span className="text-xs font-bold text-slate-500">{label}</span><span className="text-right font-bold text-slate-900">{value}</span></div>
}

function ExpiryBadge({ status }) {
  const classes = {
    Healthy: "bg-emerald-100 text-emerald-700",
    "Near Expiry": "bg-amber-100 text-amber-700",
    "Low Availability": "bg-orange-100 text-orange-700",
    Unavailable: "bg-red-100 text-red-600",
    Archived: "bg-slate-100 text-slate-600",
  }
  return <span className={`inline-flex h-7 min-w-24 items-center justify-center rounded-md px-2.5 text-xs font-bold ${classes[status] ?? classes.Healthy}`}>{status}</span>
}

function PageButton({ active, children, disabled, onClick }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-bold ${active ? "border-[#00675b] bg-[#00675b] text-white" : "border-slate-200 bg-white text-slate-600"} disabled:text-slate-300`}>{children}</button>
}

function BundlesPagination({ currentPage, filteredCount, pageCount, paginationItems, rowsPerPage, setPage, setRowsPerPage, showingText }) { return <div className="flex min-h-14 flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-5"><p>{showingText}</p><div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end"><label className="relative block min-w-[10.75rem]"><span className="sr-only">Entries per page</span><select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1) }} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-base font-semibold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15">{[10, 25, 50].map((amount) => <option key={amount} value={amount}>{amount} entries</option>)}</select><FiChevronUp className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></label><nav aria-label="Bundles pagination" className="flex items-center gap-2"><PageButton disabled={currentPage === 1 || filteredCount === 0} onClick={() => setPage(Math.max(1, currentPage - 1))}><HiChevronLeft className="h-5 w-5" /></PageButton>{filteredCount > 0 && paginationItems.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} aria-hidden="true" className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400">...</span> : <PageButton key={item} active={item === currentPage} onClick={() => setPage(item)}>{item}</PageButton>)}<PageButton disabled={currentPage === pageCount || filteredCount === 0} onClick={() => setPage(Math.min(pageCount, currentPage + 1))}><HiChevronRight className="h-5 w-5" /></PageButton></nav></div></div> }

function getPaginationItems(currentPage, pageCount) { if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1); if (currentPage <= 3) return [1, 2, 3, "ellipsis", pageCount]; if (currentPage >= pageCount - 2) return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount]; return [1, "ellipsis", currentPage, "ellipsis", pageCount] }

function Card({ children, className = "" }) {
  return <section className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${className}`}>{children}</section>
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <button type="button" onClick={onClose} className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm font-semibold text-slate-700 shadow-xl"><span className="block font-bold text-[#0b6b51]">Bundle Update</span>{message}</button>
}

function getExpiryStatus(bundle) {
  if (bundle.status === "Archived") return "Archived"
  if (bundle.stock === 0 || bundle.status === "Out of Stock") return "Unavailable"
  if (bundle.possibleStock <= 3) return "Low Availability"
  if (bundle.daysLeft <= 60) return "Near Expiry"
  return "Healthy"
}

export default SuperAdminBundleManagement



















