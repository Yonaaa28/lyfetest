import { useEffect, useMemo, useState } from "react"
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineBuildingStorefront,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineArchiveBox,
  HiXMark,
} from "react-icons/hi2"
import { FiMoreVertical } from "react-icons/fi"

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

const initialSuppliers = [
  ["Mercury Drug Corporation", "Primary pharmaceutical distributor", "Pharmaceutical", "Juan Dela Cruz", "Sales Manager", "0917 123 4567", "sales@mercurydrug.com", "Active", "May 12, 2026", 42, "Preferred", "Quezon City, Metro Manila", 145200, 3, 40, 2],
  ["Unilab, Inc.", "Branded medicine supplier", "Pharmaceutical", "Maria Santos", "Account Executive", "0921 987 6543", "sales@unilab.com.ph", "Active", "May 11, 2026", 36, "Preferred", "Mandaluyong City", 132500, 4, 35, 1],
  ["RiteMED Phils., Inc.", "Generic medicine supplier", "Pharmaceutical", "Carlo Reyes", "Sales Representative", "0918 456 7890", "sales@ritemed.com.ph", "Active", "May 10, 2026", 31, "Reliable", "Pasig City", 118750, 4, 30, 1],
  ["Southstar Drug, Inc.", "Wholesale pharmaceutical partner", "Pharmaceutical", "Anna Lim", "Account Manager", "0919 321 0987", "sales@southstardrug.com", "Active", "May 9, 2026", 26, "Reliable", "Laguna", 99200, 5, 25, 1],
  ["PharmaPlus, Inc.", "Branch replenishment partner", "Pharmaceutical", "Liza Garcia", "Sales Manager", "0906 654 3210", "info@pharmaplus.com.ph", "Active", "May 8, 2026", 22, "Reliable", "Makati City", 87800, 5, 21, 1],
  ["MedChoice Pharma", "Archived pharmaceutical account", "Pharmaceutical", "Mark Dizon", "Sales Officer", "0928 765 4321", "sales@medchoice.com.ph", "Archived", "Apr 28, 2026", 12, "Watchlist", "Cebu City", 36500, 7, 10, 2],
  ["Watsons Personal Care Stores", "Personal care product source", "Personal Care", "Joy Tan", "Key Account Manager", "0917 654 0987", "b2b@watsons.com.ph", "Active", "May 7, 2026", 18, "Reliable", "Taguig City", 74500, 4, 18, 0],
  ["Procter & Gamble Philippines", "Personal care and hygiene supplier", "Personal Care", "Derek Cruz", "Sales Manager", "0916 234 5678", "ph_sales@pg.com", "Active", "May 6, 2026", 20, "Preferred", "Bonifacio Global City", 131000, 3, 20, 0],
  ["Zuellig Pharma", "Large pharmaceutical distributor", "Pharmaceutical", "Nina Flores", "Distribution Lead", "0915 876 2211", "sales@zuelligpharma.com", "Active", "May 5, 2026", 29, "Preferred", "Paranaque City", 168900, 3, 28, 1],
  ["Bayer Philippines", "Specialty medicine supplier", "Pharmaceutical", "Ramon Uy", "Account Manager", "0918 222 7788", "orders@bayer.com.ph", "Active", "May 3, 2026", 13, "Reliable", "Alabang", 57800, 5, 13, 0],
  ["Johnson & Johnson Philippines", "Personal care essentials", "Personal Care", "Elena Ramos", "Sales Lead", "0917 778 9090", "sales@jnj.com", "Active", "May 2, 2026", 11, "Reliable", "Makati City", 45600, 5, 10, 1],
  ["Metro Pharma Supply", "Archived medical supply vendor", "Medical Supplies", "Paolo Reyes", "Operations Manager", "0919 345 1111", "orders@metropharma.ph", "Archived", "Apr 25, 2026", 8, "Watchlist", "Legazpi City", 28700, 8, 6, 2],
  ["MediLink Distribution", "Medical supplies distributor", "Medical Supplies", "Grace Ong", "Sales Coordinator", "0916 876 3333", "orders@medilink.ph", "Active", "May 1, 2026", 16, "Reliable", "Naga City", 60300, 4, 16, 0],
  ["CarePlus Essentials", "Personal care essentials", "Personal Care", "Tessa Mariano", "Account Officer", "0917 888 2244", "b2b@careplus.ph", "Active", "Apr 30, 2026", 10, "New", "Quezon City", 39200, 6, 10, 0],
  ["BioHealth Distributor", "Supplement supplier", "Pharmaceutical", "Alan Chua", "Sales Consultant", "0915 321 6655", "sales@biohealth.ph", "Active", "Apr 29, 2026", 14, "Reliable", "Pasay City", 68450, 5, 14, 0],
  ["Albay Medical Trading", "Regional medical supply partner", "Medical Supplies", "Mara Valencia", "Branch Coordinator", "0918 909 6655", "orders@albaymedical.ph", "Active", "Apr 27, 2026", 9, "New", "Legazpi City", 51200, 6, 9, 0],
  ["DermaCare Supply Co.", "Skin care supplier", "Personal Care", "Mika Torres", "Brand Specialist", "0916 700 5544", "sales@dermacare.ph", "Active", "Apr 26, 2026", 7, "New", "Pasig City", 32900, 6, 7, 0],
  ["PrimeRx Wholesale", "Archived wholesale supplier", "Pharmaceutical", "Ben Aquino", "Wholesale Manager", "0917 600 7788", "orders@primerx.ph", "Archived", "Apr 18, 2026", 6, "Watchlist", "Cavite", 21750, 9, 5, 1],
].map(([name, description, category, contactPerson, contactRole, contact, email, status, lastPurchase, purchaseCount, reliability, address, purchaseValue, averageDeliveryDays, completedDeliveries, rejectedDeliveries], index) => ({
  id: `supplier-${index + 1}`,
  name,
  description,
  category,
  contactPerson,
  contactRole,
  contact,
  email,
  status,
  lastPurchase,
  purchaseCount,
  reliability,
  address,
  purchaseValue,
  averageDeliveryDays,
  completedDeliveries,
  rejectedDeliveries,
  notes: reliability === "Watchlist" ? "Review delivery performance before approving large requests." : "Supplier is available for regular procurement.",
}))

const emptySupplier = {
  name: "",
  description: "",
  category: "Pharmaceutical",
  contactPerson: "",
  contactRole: "",
  contact: "",
  email: "",
  address: "",
  status: "Active",
  reliability: "New",
  lastPurchase: "-",
  purchaseCount: 0,
  purchaseValue: 0,
  averageDeliveryDays: 0,
  completedDeliveries: 0,
  rejectedDeliveries: 0,
  notes: "",
}

const categoryOptions = ["All Categories", "Pharmaceutical", "Medical Supplies", "Personal Care"]
const statusOptions = ["Active", "All Statuses", "Inactive"]

function SuperAdminSuppliers() {
  const [suppliers, setSuppliers] = useState(() => initialSuppliers.slice(0, 3))
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Active")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [notice, setNotice] = useState(null)
  const [actionMenu, setActionMenu] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkDeactivateOpen, setIsBulkDeactivateOpen] = useState(false)
  const pageSize = 8

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

  const toggleActionMenu = (event, supplier) => {
    event.stopPropagation()
    if (actionMenu?.supplier.id === supplier.id) return setActionMenu(null)
    const rect = event.currentTarget.getBoundingClientRect()
    const opensUp = rect.bottom + 132 > window.innerHeight - 12
    setActionMenu({ supplier, right: Math.max(12, window.innerWidth - rect.right), top: opensUp ? undefined : rect.bottom + 6, bottom: opensUp ? window.innerHeight - rect.top + 6 : undefined })
  }

  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return suppliers.filter((supplier) => {
      const matchesQuery = !normalizedQuery || [supplier.name, supplier.description, supplier.contactPerson, supplier.contact, supplier.email, supplier.category, supplier.reliability].some((value) => String(value).toLowerCase().includes(normalizedQuery))
      const matchesStatus = statusFilter === "All Statuses" || normalizeSupplierStatus(supplier.status) === statusFilter
      const matchesCategory = categoryFilter === "All Categories" || supplier.category === categoryFilter
      return matchesQuery && matchesStatus && matchesCategory
    })
  }, [categoryFilter, query, statusFilter, suppliers])

  const pageCount = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleSuppliers = filteredSuppliers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedSuppliers = suppliers.filter((supplier) => selectedIds.includes(supplier.id))
  const visibleIds = visibleSuppliers.map((supplier) => supplier.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const allSelectedActive = selectedSuppliers.length > 0 && selectedSuppliers.every((supplier) => normalizeSupplierStatus(supplier.status) === "Active")
  const activeCount = suppliers.filter((supplier) => normalizeSupplierStatus(supplier.status) === "Active").length
  const usedThisMonth = suppliers.filter((supplier) => normalizeSupplierStatus(supplier.status) === "Active" && supplier.lastPurchase.startsWith("May")).length

  const summaryCards = [
    ["Total Suppliers", suppliers.length, "All registered suppliers", HiOutlineBuildingStorefront, "bg-emerald-50 text-emerald-600"],
    ["Active Suppliers", activeCount, "Currently active suppliers", HiOutlineShieldCheck, "bg-green-50 text-green-600"],
    ["Used This Month", usedThisMonth, "Suppliers used in purchasing", HiOutlineTruck, "bg-violet-50 text-violet-600"],
  ]

  const saveSupplier = (form) => {
    const normalized = {
      ...form,
      purchaseCount: Number(form.purchaseCount) || 0,
      purchaseValue: Number(form.purchaseValue) || 0,
      averageDeliveryDays: Number(form.averageDeliveryDays) || 0,
      completedDeliveries: Number(form.completedDeliveries) || 0,
      rejectedDeliveries: Number(form.rejectedDeliveries) || 0,
    }
    if (dialog.mode === "create") {
      setSuppliers((current) => [{ ...normalized, id: `supplier-${Date.now()}` }, ...current])
      setNotice({ title: "Supplier Added", message: `${normalized.name} has been added to supplier records.` })
    } else {
      setSuppliers((current) => current.map((supplier) => (supplier.id === normalized.id ? normalized : supplier)))
      setNotice({ title: "Supplier Updated", message: `${normalized.name} supplier information has been saved.` })
    }
    setDialog(null)
    setPage(1)
  }

  const archiveSupplier = () => {
    if (!archiveTarget) return
    const nextStatus = normalizeSupplierStatus(archiveTarget.status) === "Active" ? "Inactive" : "Active"
    setSuppliers((current) => current.map((supplier) => (supplier.id === archiveTarget.id ? { ...supplier, status: nextStatus } : supplier)))
    setNotice({
      title: nextStatus === "Active" ? "Supplier Activated" : "Supplier Deactivated",
      message: `${archiveTarget.name} is now ${nextStatus.toLowerCase()}. Purchase history remains available.`,
    })
    setArchiveTarget(null)
  }

  const toggleSupplierSelection = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((supplierId) => supplierId !== id) : [...current, id])
  const toggleVisibleSelection = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])
  const deactivateSelectedSuppliers = () => {
    const selectedSet = new Set(selectedIds)
    setSuppliers((current) => current.map((supplier) => selectedSet.has(supplier.id) ? { ...supplier, status: "Inactive" } : supplier))
    setNotice({ title: "Suppliers Deactivated", message: `${selectedSuppliers.length} suppliers are now inactive. Purchase history remains available.` })
    setSelectedIds([])
    setIsBulkDeactivateOpen(false)
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 sm:px-6 lg:px-8">
      <section className="rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:rounded-xl lg:border-slate-200 lg:p-5 lg:shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <h1 className="mb-4 text-xl font-bold text-slate-950 lg:hidden">Suppliers</h1>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
          {summaryCards.map(([label, value, detail, Icon, tone]) => (
            <div key={label} className={`${label === "Used This Month" ? "col-span-2 lg:col-span-1" : ""} min-h-[92px] rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:min-h-[112px] lg:rounded-2xl lg:border-slate-200 lg:p-4 lg:shadow-sm`}>
              <div className="flex items-start justify-between gap-2 lg:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm"><span className="lg:hidden">{{ "Total Suppliers": "Total Suppliers", "Active Suppliers": "Active Suppliers", "Used This Month": "Used This Month" }[label]}</span><span className="hidden lg:inline">{label}</span></p>
                  <p className="mt-3 text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">{value}</p>
                  <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">{detail}</p>
                </div>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10 sm:rounded-2xl lg:h-11 lg:w-11 ${tone}`}><Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 lg:mt-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:flex-row lg:gap-3">
          <label className="relative min-w-0 lg:max-w-[460px] lg:flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search suppliers..." className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15" />
          </label>
            <div className="grid min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:contents">
            <Select value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1) }} options={statusOptions.map((option) => ({ value: option, label: option === "All Statuses" ? "Status: All" : `Status: ${option}` }))} className="lg:w-[170px]" />
            <Select value={categoryFilter} onChange={(value) => { setCategoryFilter(value); setPage(1) }} options={categoryOptions.map((option) => ({ value: option, label: option === "All Categories" ? "Category: All" : option }))} className="lg:w-[190px]" />
            </div>
          </div>
          <div className="hidden flex-col gap-3 sm:flex-row lg:flex">
            <button type="button" onClick={() => setDialog({ mode: "create", form: { ...emptySupplier } })} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348]"><HiOutlinePlus className="h-5 w-5" />Add Supplier</button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
          <h2 className="text-lg font-bold text-slate-950">Suppliers <span className="text-slate-500">({filteredSuppliers.length})</span></h2>
          <button type="button" onClick={() => setDialog({ mode: "create", form: { ...emptySupplier } })} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#00675b] px-3 text-xs font-bold text-white hover:bg-[#005348]"><HiOutlinePlus className="h-4 w-4" /><span className="hidden min-[360px]:inline">Add Supplier</span><span className="min-[360px]:hidden">Add</span></button>
        </div>

        {selectedSuppliers.length ? <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-bold text-[#0b6b51]">{selectedSuppliers.length} supplier{selectedSuppliers.length === 1 ? "" : "s"} selected</p><button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Clear Selection</button></div>{selectedSuppliers.length >= 2 ? <span className="inline-flex" title={allSelectedActive ? "Deactivate selected suppliers" : "Deactivate Selected is available only when all selected suppliers are Active."}><button type="button" disabled={!allSelectedActive} onClick={() => setIsBulkDeactivateOpen(true)} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Deactivate Selected</button></span> : null}</div> : null}

        <div className="mt-3 space-y-2.5 lg:hidden" aria-label="Suppliers">
          {visibleSuppliers.length ? visibleSuppliers.map((supplier) => (
            <article key={supplier.id} className="relative w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/20">
              <label className="absolute left-2 top-2 grid h-9 w-9 cursor-pointer place-items-center" aria-label={`Select ${supplier.name}`}><input type="checkbox" checked={selectedIds.includes(supplier.id)} onChange={() => toggleSupplierSelection(supplier.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" /></label>
              <button type="button" onClick={() => setDialog({ mode: "view", form: { ...supplier }, section: "details" })} className="flex w-full min-w-0 items-start gap-3 px-8 text-left">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-[#0b6b51]">{getInitials(supplier.name)}</span>
                <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-start justify-between gap-2"><span className="whitespace-normal break-words text-sm font-bold leading-5 text-slate-950">{supplier.name}</span><HiChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" /></span>
                  <span className="mt-0.5 block text-xs font-semibold text-slate-500">{supplier.category}</span>
                  <span className="mt-2.5 block whitespace-normal break-words text-xs font-semibold text-slate-700">{supplier.contactPerson}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">{supplier.contact}</span>
                  <span className="mt-0.5 block break-all text-xs text-slate-500">{supplier.email}</span>
                  <span className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <span><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Last Purchase</span><span className="mt-0.5 block text-xs font-bold text-slate-800">{supplier.lastPurchase === "-" ? "None" : supplier.lastPurchase}</span></span>
                    <span><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Purchases</span><span className="mt-0.5 block text-xs font-bold text-slate-800">{supplier.purchaseCount}</span></span>
                  </span>
                </span>
              </button>
              <button type="button" onClick={(event) => toggleActionMenu(event, supplier)} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label={`Actions for ${supplier.name}`} aria-expanded={actionMenu?.supplier.id === supplier.id}><FiMoreVertical className="h-5 w-5" /></button>
            </article>
          )) : <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center"><p className="text-sm font-bold text-slate-700">{suppliers.length ? "No suppliers found" : "No suppliers yet"}</p><p className="mt-1 text-sm font-medium text-slate-500">{suppliers.length ? "Try changing your search or filters." : "Add your first supplier to get started."}</p></div>}
        </div>

        <div className="mt-5 hidden max-w-full overflow-x-auto rounded-xl border border-slate-200 lg:block">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[48px]" />
              <col className="w-[30%]" />
              <col className="w-[30%]" />
              <col className="w-[13%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
              <tr><th className="px-4 py-4 text-center"><input ref={(checkbox) => { if (checkbox) checkbox.indeterminate = someVisibleSelected }} type="checkbox" checked={allVisibleSelected} disabled={!visibleSuppliers.length} onChange={toggleVisibleSelection} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed" aria-label="Select all suppliers on this page" /></th>{["Supplier", "Contact", "Last Purchase", "Purchases", "Status", "Action"].map((head) => <th key={head} className={`px-4 py-4 ${head === "Action" ? "text-center" : ""}`}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {visibleSuppliers.length ? visibleSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(supplier.id)} onChange={() => toggleSupplierSelection(supplier.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" aria-label={`Select ${supplier.name}`} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-[#0b6b51]">{getInitials(supplier.name)}</span>
                      <div className="min-w-0"><p className="truncate font-bold text-slate-950">{supplier.name}</p><p className="mt-1 truncate text-xs text-slate-500">{supplier.category}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-900">{supplier.contactPerson}</p><p className="mt-1 text-xs text-slate-600">{supplier.contact}</p><p className="mt-1 truncate text-xs text-slate-500">{supplier.email}</p></td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{supplier.lastPurchase === "-" ? "No purchases yet" : supplier.lastPurchase}</td>
                  <td className="px-4 py-4"><p className="font-bold text-slate-900">{supplier.purchaseCount}</p><p className="mt-1 text-xs font-medium text-slate-500">purchases</p></td>
                  <td className="px-4 py-4"><StatusBadge status={supplier.status} /></td>
                  <td className="px-4 py-4">
                    <div className="relative flex justify-center">
                      <button type="button" onClick={(event) => toggleActionMenu(event, supplier)} className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100" aria-label={`Actions for ${supplier.name}`} aria-expanded={actionMenu?.supplier.id === supplier.id} title="Supplier actions">
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="text-sm font-bold text-slate-700">{suppliers.length ? "No suppliers found" : "No suppliers yet"}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{suppliers.length ? "Try changing your search or filters." : "Add your first supplier to start managing procurement contacts."}</p>
                    {!suppliers.length ? <button type="button" onClick={() => setDialog({ mode: "create", form: { ...emptySupplier } })} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-4 text-sm font-bold text-white hover:bg-[#005348]"><HiOutlinePlus className="h-5 w-5" />Add Supplier</button> : null}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>Showing {filteredSuppliers.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers</p>
          <div className="flex items-center gap-2">
            <PageButton disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><HiChevronLeft className="h-5 w-5" /></PageButton>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <PageButton key={pageNumber} active={pageNumber === currentPage} onClick={() => setPage(pageNumber)}>{pageNumber}</PageButton>)}
            <PageButton disabled={currentPage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><HiChevronRight className="h-5 w-5" /></PageButton>
          </div>
        </div>
      </section>

      {actionMenu ? <SupplierActionMenu menu={actionMenu} onView={(supplier) => { setActionMenu(null); setDialog({ mode: "view", form: { ...supplier }, section: "details" }) }} onEdit={(supplier) => { setActionMenu(null); setDialog({ mode: "edit", form: { ...supplier } }) }} onToggleStatus={(supplier) => { setActionMenu(null); setArchiveTarget({ ...supplier }) }} /> : null}
      {dialog ? <SupplierDialog dialog={dialog} onCancel={() => setDialog(dialog.returnTo ?? null)} onChange={(form) => setDialog((current) => ({ ...current, form }))} onSave={saveSupplier} /> : null}
      {archiveTarget ? <ArchiveConfirm supplier={archiveTarget} onCancel={() => { setDialog(archiveTarget.returnTo ?? null); setArchiveTarget(null) }} onConfirm={archiveSupplier} /> : null}
      {isBulkDeactivateOpen ? <BulkDeactivateSuppliersModal count={selectedSuppliers.length} onCancel={() => setIsBulkDeactivateOpen(false)} onConfirm={deactivateSelectedSuppliers} /> : null}
      {notice ? <Toast notice={notice} onClose={() => setNotice(null)} /> : null}
    </div>
  )
}

function SupplierActionMenu({ menu, onEdit, onToggleStatus, onView }) {
  const isActive = normalizeSupplierStatus(menu.supplier.status) === "Active"
  return <div role="menu" aria-label={`Actions for ${menu.supplier.name}`} onMouseDown={(event) => event.stopPropagation()} className="fixed z-[100] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]" style={{ right: menu.right, top: menu.top, bottom: menu.bottom }}><SupplierMenuAction icon={HiOutlineEye} label="View Details" onClick={() => onView(menu.supplier)} /><SupplierMenuAction icon={HiOutlinePencilSquare} label="Edit Supplier" onClick={() => onEdit(menu.supplier)} /><SupplierMenuAction danger={isActive} icon={HiOutlineArchiveBox} label={isActive ? "Deactivate Supplier" : "Reactivate Supplier"} onClick={() => onToggleStatus(menu.supplier)} /></div>
}
function SupplierMenuAction({ danger = false, icon: Icon, label, onClick }) { return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#0b6b51]"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button> }

function SupplierDialog({ dialog, onCancel, onChange, onSave }) {
  const form = dialog.form
  const isView = dialog.mode === "view"
  const [activeSection, setActiveSection] = useState(dialog.section || "details")
  const update = (name, value) => onChange({ ...form, [name]: value })

  if (isView) {
    return (
      <Modal title="Supplier Details" onCancel={onCancel} wide>
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-[#0b6b51]">{getInitials(form.name)}</span>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-950">{form.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={form.status} />
              <span className="text-sm font-semibold text-slate-500">{form.category}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-5 border-b border-slate-200">
          <TabButton active={activeSection === "details"} onClick={() => setActiveSection("details")}>Supplier Details</TabButton>
          <TabButton active={activeSection === "history"} onClick={() => setActiveSection("history")}>Purchase History</TabButton>
        </div>

        {activeSection === "details" ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <Card title="Supplier Information"><InfoGrid data={[["Supplier Name", form.name], ["Category", form.category], ["Status", <StatusBadge key="status" status={form.status} />], ["Address", form.address || "Not provided"], ["Notes", form.notes || "No notes recorded."]]} /></Card>
            <Card title="Contact Information"><InfoGrid data={[["Contact Person", form.contactPerson], ["Position", form.contactRole], ["Contact Number", form.contact], ["Email", form.email]]} /></Card>
          </div>
        ) : (
          <Card title="Purchase History" className="mt-5"><MiniTable headers={["Date", "Request ID", "Items", "Amount", "Status"]} rows={requestsFor(form).map((row) => [row[2], row[0], `${Math.max(1, Math.round(row[3] / 1200))}`, currency.format(row[3]), row[4]])} /></Card>
        )}
      </Modal>
    )
  }

  return (
    <Modal title={dialog.mode === "create" ? "Add Supplier" : "Edit Supplier"} onCancel={onCancel} hideClose={dialog.mode === "edit"}>
      <form onSubmit={(event) => { event.preventDefault(); onSave(form) }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Supplier Name"><input required value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></Field>
          <Field label="Category"><select value={form.category} onChange={(event) => update("category", event.target.value)} className={inputClass}><option>Pharmaceutical</option><option>Medical Supplies</option><option>Personal Care</option></select></Field>
          <Field label="Contact Person"><input required value={form.contactPerson} onChange={(event) => update("contactPerson", event.target.value)} className={inputClass} /></Field>
          <Field label="Contact Role / Title"><input required value={form.contactRole} onChange={(event) => update("contactRole", event.target.value)} className={inputClass} /></Field>
          <Field label="Contact Number"><input required pattern="[0-9 +()-]{7,}" value={form.contact} onChange={(event) => update("contact", event.target.value)} className={inputClass} /></Field>
          <Field label="Email"><input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={inputClass} /></Field>
          <Field label="Status"><select value={normalizeSupplierStatus(form.status)} onChange={(event) => update("status", event.target.value)} className={inputClass}><option>Active</option><option>Inactive</option></select></Field>
          <Field label="Reliability"><select value={form.reliability} onChange={(event) => update("reliability", event.target.value)} className={inputClass}><option>Preferred</option><option>Reliable</option><option>New</option><option>Watchlist</option></select></Field>
          <Field label="Address"><input value={form.address} onChange={(event) => update("address", event.target.value)} className={inputClass} /></Field>
          <Field label="Notes"><input value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><button type="submit" className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]">{dialog.mode === "create" ? "Add Supplier" : "Save Changes"}</button></div>
      </form>
    </Modal>
  )
}

function ArchiveConfirm({ onCancel, onConfirm, supplier }) {
  const isActive = normalizeSupplierStatus(supplier.status) === "Active"
  return <Modal title={isActive ? "Deactivate Supplier" : "Reactivate Supplier"} onCancel={onCancel}><p className="text-sm leading-6 text-slate-600">{isActive ? `Are you sure you want to deactivate ${supplier.name}? This supplier will no longer be available for new procurement, but its existing purchase history and records will be retained.` : `Are you sure you want to reactivate ${supplier.name}? This supplier will become available for new procurement again.`}</p><div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="font-bold text-slate-900">{supplier.name}</p><p className="mt-1 text-sm text-slate-500">{supplier.category} supplier information will be preserved.</p></div><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><button type="button" onClick={onConfirm} className={`h-11 rounded-lg px-6 text-sm font-bold text-white ${isActive ? "bg-red-600 hover:bg-red-700" : "bg-[#00675b] hover:bg-[#005348]"}`}>{isActive ? "Deactivate Supplier" : "Reactivate Supplier"}</button></div></Modal>
}
function BulkDeactivateSuppliersModal({ count, onCancel, onConfirm }) { return <Modal title="Deactivate Selected Suppliers" onCancel={onCancel}><p className="text-sm leading-6 text-slate-600">You are about to deactivate {count} suppliers.</p><p className="mt-2 text-sm leading-6 text-slate-600">These suppliers will no longer be available for new procurement, but their existing purchase history and records will be retained.</p><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><button type="button" onClick={onConfirm} className="h-11 rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700">Deactivate {count} Suppliers</button></div></Modal> }

function Modal({ children, hideClose = false, onCancel, title, wide = false }) { return <div className="fixed inset-y-0 left-0 right-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-3 sm:p-4 lg:left-[210px] xl:left-[250px]"><button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close" /><section className={`relative max-h-[calc(100dvh-1.5rem)] w-full ${wide ? "max-w-5xl" : "max-w-2xl"} overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6`}>{hideClose ? null : <button type="button" onClick={onCancel} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 sm:right-4 sm:top-4" aria-label="Close"><HiXMark className="h-5 w-5" /></button>}<h2 className={`${hideClose ? "" : "pr-10"} text-lg font-bold text-slate-900 sm:text-xl`}>{title}</h2><div className="mt-4 sm:mt-5">{children}</div></section></div> }
function Select({ className = "", onChange, options, value }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 min-w-0 w-full truncate rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#0b6b51] lg:px-4 ${className}`}>{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option> })}</select> }
function Field({ children, label }) { return <label><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label> }
function Card({ children, className = "", title }) { return <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>{title ? <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3> : null}{children}</section> }
function InfoGrid({ data }) { return <div className="grid gap-3">{data.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-slate-100 pb-3 last:border-0"><p className="text-xs font-semibold text-slate-500">{label}</p><div className="text-sm font-bold text-slate-900">{value}</div></div>)}</div> }
function MiniTable({ headers, rows }) { return <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-left text-xs"><thead className="bg-slate-50 font-bold text-slate-600"><tr>{headers.map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("-")} className="border-t border-slate-100">{row.map((cell, index) => <td key={`${cell}-${index}`} className="px-3 py-3 text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div> }
function Button({ children, onClick }) { return <button type="button" onClick={onClick} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">{children}</button> }
function StatusBadge({ status }) { const normalized = normalizeSupplierStatus(status); return <span className={`inline-flex h-7 min-w-20 items-center justify-center rounded-md px-3 text-xs font-bold ${normalized === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{normalized}</span> }
function PageButton({ active, children, disabled, onClick }) { return <button type="button" disabled={disabled} onClick={onClick} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-bold ${active ? "border-[#00675b] bg-[#00675b] text-white" : "border-slate-200 bg-white text-slate-600"} disabled:text-slate-300`}>{children}</button> }
function TabButton({ active, children, onClick }) { return <button type="button" onClick={onClick} className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${active ? "border-[#00675b] text-[#00675b]" : "border-transparent text-slate-500 hover:text-[#00675b]"}`}>{children}</button> }
function Toast({ notice, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <button type="button" onClick={onClose} className="fixed bottom-5 right-5 z-[90] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 text-left shadow-2xl"><p className="font-bold text-[#0b6b51]">{notice.title}</p><p className="mt-1 text-sm text-slate-600">{notice.message}</p></button>
}
function getInitials(name) { return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() }
function normalizeSupplierStatus(status) { return status === "Archived" ? "Inactive" : status }
function requestsFor(supplier) { return [["PR-0008", "Camalig", supplier.lastPurchase, Math.min(12500 + supplier.purchaseCount * 120, 24500), supplier.status === "Archived" ? "Closed" : "Approved"], ["PR-0006", "Polangui", "May 10, 2026", 18700, "Approved"], ["PR-0004", "Manito", "May 8, 2026", 14600, "Pending"]] }

const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

export default SuperAdminSuppliers












