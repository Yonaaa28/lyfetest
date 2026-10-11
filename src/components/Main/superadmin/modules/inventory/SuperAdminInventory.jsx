import { useEffect, useMemo, useState } from "react"
import {
  HiChevronLeft, HiChevronRight, HiOutlineArchiveBox, HiOutlineCube,
  HiOutlineEye, HiOutlineFunnel, HiOutlineMagnifyingGlass, HiOutlinePencilSquare,
  HiOutlinePlus, HiOutlineShoppingBag, HiXMark,
} from "react-icons/hi2"
import { FiChevronUp, FiMoreVertical } from "react-icons/fi"
import { AddItemModal } from "../../../admin/modules/inventory/components/AddItemModal"
import { mockInventoryItems } from "../../../admin/modules/inventory/data/inventoryMockData"
import SuperAdminBundleManagement from "../bundle_management/SuperAdminBundleManagement"

const branches = ["All Branches", "Camalig", "Guinobatan", "Polangui", "Daraga", "Manito"]
const branchNames = branches.slice(1)
const defaultSuppliers = ["Mercury Drug Supplier", "Unilab Distributor", "RiteMed Supplier", "Southstar Drug Supplier", "MedChoice Pharma", "Zuellig Pharma"]
const adjustmentReasons = ["Stock Count Correction", "Damaged Item", "Expired Item", "Returned Item", "Transfer Correction", "Other"]
const inventoryTableGrid = "grid grid-cols-[48px_minmax(280px,2.4fr)_0.75fr_0.8fr_0.9fr_1fr_1.35fr_0.65fr]"

const money = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value) || 0)
const normalizeSearch = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
const formatDate = (dateText) => {
  if (!dateText || dateText === "2099-12-31" || dateText === "-") return "-"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${dateText}T00:00:00`))
}
const totalStock = (item) => Object.values(item.branchStocks).reduce((sum, branch) => sum + Number(branch.stock), 0)
const stockForBranch = (item, branchFilter) => branchFilter === "All Branches" ? totalStock(item) : Number(item.branchStocks[branchFilter]?.stock ?? 0)
const statusForStock = (quantity, reorderLevel, statusOverride) => {
  if (statusOverride === "Archived") return "Archived"
  if (quantity === 0) return "Out of Stock"
  if (quantity <= Number(reorderLevel || 0) * 2) return "Low Stock"
  return "Healthy"
}
const branchesWithStock = (item) => Object.values(item.branchStocks).filter((branch) => Number(branch.stock) > 0).length
const newestTimestamp = () => "Aug 27, 2026 | 03:20 PM"
const sortBatchesByFefo = (batches) => [...(batches ?? [])].sort((a, b) => {
  const aTime = !a[3] || a[3] === "-" ? Number.MAX_SAFE_INTEGER : new Date(a[3]).getTime()
  const bTime = !b[3] || b[3] === "-" ? Number.MAX_SAFE_INTEGER : new Date(b[3]).getTime()
  return aTime - bTime
})

const adminInventoryToSuperAdminItem = (adminItem, index) => {
  const code = `INV-${String(index + 1).padStart(4, "0")}`
  const quantity = Number(adminItem.quantity) || 0
  const expiryDate = adminItem.noExpiration ? "-" : formatDate(adminItem.expiryDate)
  const dateReceived = formatDate(adminItem.dateReceived)
  const productName = [adminItem.productName, adminItem.strength, adminItem.itemUnit].filter(Boolean).join(" ")

  return {
    code,
    barcode: adminItem.barcode || "Pending",
    name: productName || adminItem.productName,
    brand: adminItem.brand || "Unassigned",
    genericName: adminItem.genericName || adminItem.productName,
    category: adminItem.category || "Uncategorized",
    dosageForm: adminItem.dosageForm || "N/A",
    dosage: adminItem.strength || "N/A",
    unit: adminItem.itemUnit || "Piece",
    supplier: adminItem.supplier || "Unassigned",
    reorderLevel: Number(adminItem.reorderPoint) || 0,
    unitCost: Number(adminItem.costPrice) || 0,
    sellingPrice: Number(adminItem.sellingPrice) || 0,
    isPwdSeniorDiscountable: Boolean(adminItem.isPwdSeniorDiscountable),
    branchStocks: Object.fromEntries(branchNames.map((branch) => [
      branch,
      {
        stock: branch === "Camalig" ? quantity : 0,
        nearestExpiry: branch === "Camalig" && quantity ? expiryDate : "-",
        updated: dateReceived === "-" ? "May 15, 2026" : dateReceived,
      },
    ])),
    lastUpdated: "May 15, 2026 | 10:30 AM",
    batches: (adminItem.batches ?? []).map((batch) => [
      batch.batchNumber,
      "Camalig",
      batch.quantity,
      adminItem.noExpiration ? "-" : formatDate(batch.expiryDate),
      formatDate(batch.dateReceived),
      adminItem.supplier || "Unassigned",
    ]),
    baseUnits: adminItem.baseUnits ?? [],
    description: adminItem.description ?? "",
    image: adminItem.image ?? "",
    stockHistory: [],
  }
}

const initialAdminInventoryItems = mockInventoryItems.map(adminInventoryToSuperAdminItem)

function SuperAdminInventory({ initialView = "products", onArchiveBundle, onArchiveItem }) {
  const [inventoryView, setInventoryView] = useState(initialView)
  const [items, setItems] = useState(initialAdminInventoryItems)
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [actionMenu, setActionMenu] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false)

  useEffect(() => {
    if (!actionMenu) return undefined
    const closeMenu = () => setActionMenu(null)
    window.addEventListener("mousedown", closeMenu)
    window.addEventListener("resize", closeMenu)
    window.addEventListener("scroll", closeMenu, true)
    return () => {
      window.removeEventListener("mousedown", closeMenu)
      window.removeEventListener("resize", closeMenu)
      window.removeEventListener("scroll", closeMenu, true)
    }
  }, [actionMenu])

  const toggleActionMenu = (event, item) => {
    event.stopPropagation()
    if (actionMenu?.item.code === item.code) return setActionMenu(null)
    const rect = event.currentTarget.getBoundingClientRect()
    const opensUp = rect.bottom + 132 > window.innerHeight - 12
    setActionMenu({ item, right: Math.max(12, window.innerWidth - rect.right), top: opensUp ? undefined : rect.bottom + 6, bottom: opensUp ? window.innerHeight - rect.top + 6 : undefined })
  }

  const records = useMemo(() => items.filter((item) => item.statusOverride !== "Archived").map((item) => {
    const visibleStock = stockForBranch(item, branchFilter)
    return { ...item, totalStock: totalStock(item), visibleStock, status: statusForStock(visibleStock, item.reorderLevel, item.statusOverride) }
  }), [branchFilter, items])
  const categoryOptions = useMemo(() => ["All Categories", ...new Set(items.map((item) => item.category).filter(Boolean))], [items])
  const supplierOptions = useMemo(() => ["All Suppliers", ...new Set([...defaultSuppliers, ...items.map((item) => item.supplier).filter(Boolean)])], [items])
  const advancedFilterCount = [statusFilter !== "All Statuses", categoryFilter !== "All Categories", supplierFilter !== "All Suppliers"].filter(Boolean).length

  const filtered = useMemo(() => {
    const searchTokens = normalizeSearch(query).split(" ").filter(Boolean)
    return records.filter((item) => {
      const inBranch = branchFilter === "All Branches" || item.branchStocks[branchFilter]
      const inStatus = statusFilter === "All Statuses" || item.status === statusFilter
      const inCategory = categoryFilter === "All Categories" || item.category === categoryFilter
      const inSupplier = supplierFilter === "All Suppliers" || item.supplier === supplierFilter
      const searchableText = normalizeSearch([item.name, item.genericName, item.barcode, item.code, item.brand, item.category, item.dosage, item.unit, item.supplier, item.status].join(" "))
      const inSearch = !searchTokens.length || searchTokens.every((token) => searchableText.includes(token))
      return inBranch && inStatus && inCategory && inSupplier && inSearch
    })
  }, [branchFilter, categoryFilter, query, records, statusFilter, supplierFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const paginationItems = getPaginationItems(currentPage, pageCount)
  const selectedItems = items.filter((item) => selectedIds.includes(item.code) && item.statusOverride !== "Archived")
  const visibleIds = visible.map((item) => item.code)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const counts = {
    Healthy: records.filter((item) => item.status === "Healthy").length,
    "Low Stock": records.filter((item) => item.status === "Low Stock").length,
    "Out of Stock": records.filter((item) => item.status === "Out of Stock").length,
  }
  const inventoryValue = records.reduce((sum, item) => sum + item.visibleStock * Number(item.unitCost ?? 0), 0)
  const showingText = filtered.length
    ? `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filtered.length)} of ${filtered.length} products`
    : "Showing 0 of 0 products"

  const toggleItemSelection = (code) => setSelectedIds((current) => current.includes(code) ? current.filter((id) => id !== code) : [...current, code])
  const toggleVisibleSelection = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])

  const archiveItem = (itemToArchive) => {
    const archivedItem = { ...itemToArchive, statusOverride: "Archived" }
    setItems((current) => current.map((item) => item.code === itemToArchive.code ? archivedItem : item))
    setDialog(null)
    onArchiveItem?.({ ...archivedItem, totalStock: totalStock(archivedItem) })
  }

  const archiveSelectedItems = () => {
    const selectedCodes = new Set(selectedItems.map((item) => item.code))
    setItems((current) => current.map((item) => selectedCodes.has(item.code) ? { ...item, statusOverride: "Archived" } : item))
    selectedItems.forEach((item) => onArchiveItem?.({ ...item, statusOverride: "Archived", totalStock: totalStock(item) }))
    setSelectedIds([])
    setIsBulkArchiveOpen(false)
    setPage(1)
  }

  const saveItem = (form) => {
    const saved = { ...form, reorderLevel: Number(form.reorderLevel), unitCost: Number(form.unitCost) }
    setItems((current) => current.map((item) => item.code === saved.code ? saved : item))
    setDialog((current) => current?.returnTo ? { ...current.returnTo, form: saved } : null)
  }

  const saveStockAdjustment = (itemToUpdate, adjustment) => {
    const quantity = Number(adjustment.quantity) || 0
    if (!quantity) return

    const stockLog = { id: `stock-${Date.now()}`, dateTime: "Aug 27, 2026 3:20 PM", branch: adjustment.branch, change: `${adjustment.type === "add" ? "+" : "-"}${quantity}`, reason: adjustment.reason, by: "Super Admin", notes: adjustment.notes }
    const applyAdjustment = (item) => {
      const currentStock = Number(item.branchStocks[adjustment.branch]?.stock ?? 0)
      const nextStock = adjustment.type === "add" ? currentStock + quantity : Math.max(0, currentStock - quantity)
      return {
        ...item,
        branchStocks: {
          ...item.branchStocks,
          [adjustment.branch]: { ...(item.branchStocks[adjustment.branch] ?? {}), stock: nextStock, updated: "Aug 27, 2026" },
        },
        lastUpdated: newestTimestamp(),
        stockHistory: [
          stockLog,
          ...(item.stockHistory ?? []),
        ],
      }
    }

    const updatedItem = applyAdjustment(itemToUpdate)
    setItems((current) => current.map((item) => item.code === itemToUpdate.code ? applyAdjustment(item) : item))
    setDialog((current) => current?.returnTo ? { ...current.returnTo, form: updatedItem } : null)
  }

  const saveBatch = (itemToUpdate, batchForm) => {
    const quantity = Number(batchForm.quantity) || 0
    const batchNumber = batchForm.batchNumber || `BCH-${Date.now()}`
    const expiryDate = batchForm.noExpiration ? "-" : formatDate(batchForm.expiryDate)
    const receivedDate = formatDate(batchForm.dateReceived)
    const batchRow = [batchNumber, batchForm.branch, quantity, expiryDate, receivedDate, batchForm.supplier]

    const applyBatch = (item) => {
      const currentStock = Number(item.branchStocks[batchForm.branch]?.stock ?? 0)
      return {
        ...item,
        unitCost: Number(batchForm.cost) || item.unitCost,
        branchStocks: {
          ...item.branchStocks,
          [batchForm.branch]: { ...(item.branchStocks[batchForm.branch] ?? {}), stock: currentStock + quantity, nearestExpiry: expiryDate, updated: receivedDate },
        },
        lastUpdated: newestTimestamp(),
        batches: [...(item.batches ?? []), batchRow],
      }
    }

    const updatedItem = applyBatch(itemToUpdate)
    setItems((current) => current.map((item) => item.code === itemToUpdate.code ? applyBatch(item) : item))
    setDialog((current) => current?.returnTo ? { ...current.returnTo, form: updatedItem } : null)
  }

  const addAdminInventoryItem = (adminItem) => {
    setItems((current) => [...current, adminInventoryToSuperAdminItem(adminItem, current.length)])
    setPage(1)
  }

  const resetAdvancedFilters = () => {
    setStatusFilter("All Statuses")
    setCategoryFilter("All Categories")
    setSupplierFilter("All Suppliers")
    setPage(1)
    setSelectedIds([])
  }
  const emptyMessage = query || advancedFilterCount ? ["No products found", "Try changing your search or filters."] : ["No inventory products yet", "Add your first item to start managing inventory."]

  const inventoryViewSwitch = <nav className="mt-4 flex gap-1 border-b border-slate-200" aria-label="Inventory views">{[["products", "Products"], ["bundles", "Bundles"]].map(([view, label]) => <button key={view} type="button" onClick={() => setInventoryView(view)} className={`border-b-2 px-4 py-3 text-sm font-bold transition ${inventoryView === view ? "border-[#00675b] text-[#00675b]" : "border-transparent text-slate-500 hover:text-slate-900"}`} aria-current={inventoryView === view ? "page" : undefined}>{label}</button>)}</nav>

  if (inventoryView === "bundles") return <SuperAdminBundleManagement embedded inventoryViewSwitch={inventoryViewSwitch} onArchiveBundle={onArchiveBundle} />

  return (
    <>
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 sm:px-6 lg:px-8">
      <section className="rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          <Kpi active={statusFilter === "All Statuses"} icon={HiOutlineCube} label="Total Products" value={records.length} detail={branchFilter === "All Branches" ? "All registered inventory products" : `${branchFilter} inventory products`} tone="bg-emerald-50 text-emerald-600" onClick={() => { setStatusFilter("All Statuses"); setPage(1) }} />
          <Kpi active={statusFilter === "Low Stock"} icon={HiOutlineArchiveBox} label="Low Stock Products" mobileLabel="Low Stock" value={counts["Low Stock"]} detail="Needs replenishment" tone="bg-amber-50 text-amber-600" onClick={() => { setStatusFilter("Low Stock"); setPage(1) }} />
          <Kpi active={statusFilter === "Out of Stock"} icon={HiOutlineCube} label="Out of Stock Products" mobileLabel="Out of Stock" value={counts["Out of Stock"]} detail="Requires immediate attention" tone="bg-red-50 text-red-600" onClick={() => { setStatusFilter("Out of Stock"); setPage(1) }} />
          <Kpi icon={HiOutlineShoppingBag} label="Total Inventory Value" mobileLabel="Inv. Value" value={money(inventoryValue)} detail={branchFilter === "All Branches" ? "Across all branches" : branchFilter} tone="bg-emerald-50 text-[#0b6b51]" />
        </div>
        {inventoryViewSwitch}

        <div className="mt-4 flex flex-col gap-3 lg:mt-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <label className="relative min-w-0 flex-1 lg:min-w-[300px] lg:max-w-[520px]">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); setSelectedIds([]) }} placeholder="Search products, barcode or item code..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15" />
            </label>
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(105px,1fr)] gap-2.5 lg:contents">
            <div className="min-w-0 lg:w-[190px]"><Select value={branchFilter} setValue={(value) => { setBranchFilter(value); setPage(1); setSelectedIds([]) }} options={branches} /></div>
            <div className="relative min-w-0 shrink-0">
              <button type="button" onClick={() => setIsFilterOpen((open) => !open)} className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-white px-3 text-sm font-bold transition lg:w-auto lg:px-4 ${isFilterOpen || advancedFilterCount ? "border-[#0b6b51]/50 text-[#0b6b51]" : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"}`} aria-label={advancedFilterCount ? `Filter inventory, ${advancedFilterCount} active` : "Filter inventory"} aria-expanded={isFilterOpen}>
                <HiOutlineFunnel className="h-5 w-5" />
                Filters{advancedFilterCount ? ` (${advancedFilterCount})` : ""}
              </button>
              {isFilterOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                  <div className="space-y-3">
                    <FilterField label="Status" value={statusFilter} setValue={(value) => { setStatusFilter(value); setPage(1); setSelectedIds([]) }} options={["All Statuses", "Healthy", "Low Stock", "Out of Stock"]} />
                    <FilterField label="Category" value={categoryFilter} setValue={(value) => { setCategoryFilter(value); setPage(1); setSelectedIds([]) }} options={categoryOptions} />
                    <FilterField label="Supplier" value={supplierFilter} setValue={(value) => { setSupplierFilter(value); setPage(1); setSelectedIds([]) }} options={supplierOptions} />
                  </div>
                  <div className="mt-4 flex justify-between gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={resetAdvancedFilters} className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Reset</button>
                    <button type="button" onClick={() => setIsFilterOpen(false)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-4 text-xs font-bold text-white hover:bg-[#005348]"><HiOutlineFunnel className="h-4 w-4" />Apply Filters</button>
                  </div>
                </div>
              ) : null}
            </div>
            </div>
          </div>
          <button type="button" onClick={() => setIsAddItemOpen(true)} className="hidden h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348] lg:ml-auto lg:inline-flex"><HiOutlinePlus className="h-5 w-5" />Add Item</button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
          <h2 className="text-lg font-bold text-slate-950">Products <span className="text-slate-500">({filtered.length})</span></h2>
          <button type="button" onClick={() => setIsAddItemOpen(true)} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#00675b] px-3 text-xs font-bold text-white hover:bg-[#005348]"><HiOutlinePlus className="h-4 w-4" />Add Item</button>
        </div>

        {selectedItems.length ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-[#0b6b51]">{selectedItems.length} product{selectedItems.length === 1 ? "" : "s"} selected</p>
              <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Clear Selection</button>
            </div>
            {selectedItems.length >= 2 ? <button type="button" onClick={() => setIsBulkArchiveOpen(true)} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700">Archive Selected</button> : null}
          </div>
        ) : null}

        <div className="mt-3 space-y-2.5 lg:hidden" aria-label="Inventory products">
          {visible.length ? visible.map((item) => (
            <article key={item.code} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex min-w-0 items-start gap-3">
                <label className="grid h-9 w-7 shrink-0 cursor-pointer place-items-center" aria-label={`Select ${item.name}`}><input type="checkbox" checked={selectedIds.includes(item.code)} onChange={() => toggleItemSelection(item.code)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" /></label>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">{item.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-slate-500">{item.category} · {item.unit}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">{item.code}</p>
                </div>
                <button type="button" onClick={(event) => toggleActionMenu(event, item)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100" aria-label={`Actions for ${item.name}`} aria-expanded={actionMenu?.item.code === item.code} title="Item actions">
                  <FiMoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock</p><p className="mt-0.5 text-sm font-bold text-slate-900">{item.visibleStock}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Branches</p><p className="mt-0.5 text-sm font-bold text-slate-900">{branchFilter === "All Branches" ? branchesWithStock(item) : Number(item.branchStocks[branchFilter]?.stock ?? 0) > 0 ? 1 : 0}</p></div>
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center">
              <p className="font-bold text-slate-700">{emptyMessage[0]}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{emptyMessage[1]}</p>
            </div>
          )}
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
          <div className="overflow-x-auto lg:overflow-visible">
            <div className="min-w-[780px] text-left text-sm lg:min-w-0" role="table" aria-label="Inventory products">
              <div className={`${inventoryTableGrid} bg-slate-50 text-xs font-bold text-slate-700`} role="row">
                <div className="grid place-items-center px-4 py-3" role="columnheader"><input ref={(checkbox) => { if (checkbox) checkbox.indeterminate = someVisibleSelected }} type="checkbox" checked={allVisibleSelected} disabled={!visible.length} onChange={toggleVisibleSelection} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed" aria-label="Select all products on this page" /></div>
                <div className="px-4 py-3" role="columnheader">Product</div>
                <div className="px-4 py-3 text-center" role="columnheader">Stock</div>
                <div className="px-4 py-3 text-center" role="columnheader">Branches</div>
                <div className="px-4 py-3 text-center" role="columnheader">Reorder Level</div>
                <div className="px-4 py-3 text-center" role="columnheader">Status</div>
                <div className="px-4 py-3" role="columnheader">Last Updated</div>
                <div className="px-4 py-3 text-center" role="columnheader">Action</div>
              </div>
              {visible.length ? visible.map((item) => {
                const [date, time] = item.lastUpdated.split(" | ")
                return (
                  <div key={item.code} className={`${inventoryTableGrid} h-[76px] items-center border-t border-slate-100`} role="row">
                    <div className="grid place-items-center px-4 py-3" role="cell"><input type="checkbox" checked={selectedIds.includes(item.code)} onChange={() => toggleItemSelection(item.code)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" aria-label={`Select ${item.name}`} /></div>
                    <div className="min-w-0 px-4 py-3" role="cell"><p className="truncate text-sm font-bold leading-5 text-slate-900">{item.name}</p><p className="mt-0.5 truncate text-xs font-semibold leading-4 text-slate-500">{item.genericName} - {item.unit}</p><p className="mt-0.5 truncate text-xs font-medium leading-4 text-slate-400">{item.code}</p></div>
                    <div className="px-4 py-3 text-center font-bold text-slate-900" role="cell">{item.visibleStock}</div>
                    <div className="px-4 py-3 text-center font-semibold text-slate-800" role="cell">{branchFilter === "All Branches" ? `${branchesWithStock(item)} / ${branchNames.length}` : `${Number(item.branchStocks[branchFilter]?.stock ?? 0) > 0 ? 1 : 0} / 1`}</div>
                    <div className="px-4 py-3 text-center font-semibold text-slate-700" role="cell">{item.reorderLevel}</div>
                    <div className="flex justify-center px-4 py-3" role="cell"><StatusBadge status={item.status} /></div>
                    <div className="px-4 py-3 text-slate-700" role="cell"><span className="block whitespace-nowrap text-sm font-semibold leading-5">{date}</span><span className="block whitespace-nowrap text-xs font-medium leading-4 text-slate-500">{time}</span></div>
                    <div className="px-4 py-3 text-center" role="cell">
                      <button type="button" onClick={(event) => toggleActionMenu(event, item)} className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100" aria-label={`Actions for ${item.name}`} aria-expanded={actionMenu?.item.code === item.code} title="Item actions">
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              }) : (
                <div className="border-t border-slate-100 px-4 py-10 text-center" role="row">
                  <p className="text-base font-bold text-slate-700">{emptyMessage[0]}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{emptyMessage[1]}</p>
                  {!query && !advancedFilterCount ? <button type="button" onClick={() => setIsAddItemOpen(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#00675b] px-4 text-sm font-bold text-white"><HiOutlinePlus className="h-4 w-4" />Add Item</button> : null}
                </div>
              )}
            </div>
          </div>

          <InventoryPagination currentPage={currentPage} filteredCount={filtered.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} onPageSizeChange={() => setSelectedIds([])} />
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white lg:hidden"><InventoryPagination currentPage={currentPage} filteredCount={filtered.length} pageCount={pageCount} paginationItems={paginationItems} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} showingText={showingText} onPageSizeChange={() => setSelectedIds([])} /></div>
      </section>
      {actionMenu ? <InventoryActionMenu
        menu={actionMenu}
        onArchive={(item) => { setActionMenu(null); setDialog({ mode: "archive-confirm", form: { ...item } }) }}
        onEdit={(item) => { setActionMenu(null); setDialog({ mode: "edit", form: { ...item } }) }}
        onView={(item) => { setActionMenu(null); setDialog({ mode: "view", form: { ...item } }) }}
      /> : null}
      {dialog ? <InventoryDialog dialog={dialog} onArchive={archiveItem} onCancel={() => setDialog(dialog.returnTo ? dialog.returnTo : null)} onChange={(form) => setDialog((current) => ({ ...current, form }))} onOpenMode={(mode, form) => setDialog({ mode, form: { ...form }, returnTo: dialog.mode === "view" ? { mode: "view", form: { ...form } } : dialog.returnTo })} onSave={saveItem} onSaveBatch={saveBatch} onSaveStockAdjustment={saveStockAdjustment} supplierOptions={supplierOptions.filter((option) => option !== "All Suppliers")} /> : null}
      {isBulkArchiveOpen ? <BulkArchiveProductsModal count={selectedItems.length} onCancel={() => setIsBulkArchiveOpen(false)} onConfirm={archiveSelectedItems} /> : null}
      {isAddItemOpen ? <AddItemModal activeBranchId="branch-camalig-albay" centerInMainContent hideManageActions hideQuantityField onClose={() => setIsAddItemOpen(false)} onAddItem={(adminItem) => { addAdminInventoryItem(adminItem); setIsAddItemOpen(false) }} /> : null}
    </div>
    </>
  )
}

function Kpi({ active = false, detail, icon: Icon, label, mobileLabel, onClick, tone, value }) {
  const Component = onClick ? "button" : "article"
  return (
    <Component type={onClick ? "button" : undefined} onClick={onClick} className={`min-h-[92px] rounded-xl border bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4 ${active ? "border-[#0b6b51]/50 ring-1 ring-[#0b6b51]/10" : "border-slate-200"} ${onClick ? "hover:border-[#0b6b51]/40 hover:shadow-md" : ""}`}>
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4"><div className="flex min-w-0 flex-1 flex-col self-stretch"><p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm"><span className="lg:hidden">{mobileLabel ?? label}</span><span className="hidden lg:inline">{label}</span></p><div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block"><p className="truncate text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">{value}</p><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${tone}`}><Icon className="h-4 w-4" /></span></div><p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">{detail}</p></div><span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${tone}`}><Icon className="h-6 w-6" /></span></div>
    </Component>
  )
}

function InventoryPagination({ currentPage, filteredCount, onPageSizeChange, pageCount, paginationItems, rowsPerPage, setPage, setRowsPerPage, showingText }) {
  return (
    <div className="flex min-h-14 flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-5">
      <p>{showingText}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">
        <label className="relative block min-w-[8.5rem] lg:min-w-[10.75rem]"><span className="sr-only">Entries per page</span><select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1); onPageSizeChange() }} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 lg:h-11 lg:rounded-xl lg:px-4 lg:pr-10 lg:text-base lg:text-slate-700">{[10, 25, 50].map((amount) => <option key={amount} value={amount}>{amount} entries</option>)}</select><FiChevronUp className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 lg:right-4" /></label>
        <nav aria-label="Inventory pagination" className="flex items-center gap-2">
          <Page disabled={currentPage === 1 || filteredCount === 0} onClick={() => setPage(Math.max(1, currentPage - 1))}><HiChevronLeft className="h-5 w-5" /></Page>
          {filteredCount > 0 && paginationItems.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} aria-hidden="true" className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400">...</span> : <Page key={item} active={item === currentPage} onClick={() => setPage(item)}>{item}</Page>)}
          <Page disabled={currentPage === pageCount || filteredCount === 0} onClick={() => setPage(Math.min(pageCount, currentPage + 1))}><HiChevronRight className="h-5 w-5" /></Page>
        </nav>
      </div>
    </div>
  )
}

function BulkArchiveProductsModal({ count, onCancel, onConfirm }) {
  return <Modal onCancel={onCancel}><DialogTitle title="Archive Selected Products" /><p className="text-sm leading-6 text-slate-600">You are about to archive {count} products.</p><p className="mt-2 text-sm leading-6 text-slate-600">These products will no longer appear in the active inventory list. Their existing records and historical inventory data will be retained.</p><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><DangerButton onClick={onConfirm}>Archive {count} Products</DangerButton></div></Modal>
}

function InventoryActionMenu({ menu, onArchive, onEdit, onView }) {
  return (
    <div role="menu" onMouseDown={(event) => event.stopPropagation()} className="fixed z-[100] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]" style={{ right: menu.right, top: menu.top, bottom: menu.bottom }}>
      <InventoryMenuAction icon={HiOutlineEye} label="View Details" onClick={() => onView(menu.item)} />
      <InventoryMenuAction icon={HiOutlinePencilSquare} label="Edit Item" onClick={() => onEdit(menu.item)} />
      <InventoryMenuAction danger icon={HiOutlineArchiveBox} label="Archive Item" onClick={() => onArchive(menu.item)} />
    </div>
  )
}
function InventoryMenuAction({ danger = false, icon: Icon, label, onClick }) { return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#0b6b51]"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button> }
function FilterField({ label, options, setValue, value }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span><select value={value} onChange={(event) => setValue(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#0b6b51]">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }
function Select({ options, setValue, value }) { return <label className="relative block min-w-0"><span className="sr-only">Branch</span><select value={value} onChange={(e) => setValue(e.target.value)} className="h-11 w-full min-w-0 appearance-none truncate rounded-lg border border-slate-200 bg-white px-3 py-0 pr-7 text-sm font-bold outline-none focus:border-[#0b6b51] lg:min-w-40 lg:px-4 lg:pr-8">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }

function InventoryDialog({ dialog, onArchive, onCancel, onChange, onOpenMode, onSave, onSaveBatch, onSaveStockAdjustment, supplierOptions }) {
  const form = dialog.form
  const [detailsTab, setDetailsTab] = useState("item details")
  const [adjustment, setAdjustment] = useState({ branch: "Camalig", type: "add", quantity: "", reason: "Stock Count Correction", notes: "" })
  const [batchForm, setBatchForm] = useState({ batchNumber: "", branch: "Camalig", supplier: form.supplier || supplierOptions[0] || "", quantity: "", cost: "", dateReceived: "", expiryDate: "", noExpiration: false })
  const update = (name, value) => onChange({ ...form, [name]: value })

  if (dialog.mode === "view") {
    return (
      <Modal onCancel={onCancel} wide>
        <div className="border-b border-slate-100 pb-4 pr-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-start gap-3">
                <h2 className="truncate text-2xl font-bold leading-8 text-slate-950">{form.name}</h2>
                <StatusBadge status={statusForStock(totalStock(form), form.reorderLevel, form.statusOverride)} />
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-500">{form.genericName} - {form.dosage} - {form.unit}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Item Code: {form.code}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:max-w-xl">
            <SummaryStat label="Total Stock" value={totalStock(form)} />
            <SummaryStat label="Reorder Level" value={form.reorderLevel} />
            <SummaryStat label="Inventory Value" value={money(totalStock(form) * form.unitCost)} />
          </div>
        </div>
        <Tabs active={detailsTab} setActive={setDetailsTab} tabs={["item details", "branch stock", "batches", "stock history"]} />
        {detailsTab === "item details" ? <ItemDetails item={form} /> : null}
        {detailsTab === "branch stock" ? <BranchStockTable item={form} /> : null}
        {detailsTab === "batches" ? <BatchRecordsSection item={form} /> : null}
        {detailsTab === "stock history" ? <StockHistoryTable item={form} /> : null}
        <DetailsFooter
          activeTab={detailsTab}
          onAdjustStock={() => onOpenMode("adjust", form)}
          onAddBatch={() => onOpenMode("add-batch", form)}
        />
      </Modal>
    )
  }

  if (dialog.mode === "archive-confirm") {
    return (
      <Modal onCancel={onCancel}>
        <DialogTitle title="Archive Item?" subtitle={`Are you sure you want to archive "${form.name}"?`} />
        <p className="text-sm leading-6 text-slate-600">
          This item will be removed from the active inventory list, but its existing inventory records, batches, stock history, purchase records, and transaction history will remain available.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <DangerButton onClick={() => onArchive(form)}>Archive Item</DangerButton>
        </div>
      </Modal>
    )
  }

  if (dialog.mode === "history") return <Modal onCancel={onCancel} wide><DialogTitle title="Stock History" subtitle={form.name} /><StockHistoryTable item={form} /><div className="mt-6 flex justify-end"><Button onClick={onCancel}>Close</Button></div></Modal>
  if (dialog.mode === "batch") return <Modal onCancel={onCancel} wide><DialogTitle title={`Batch Management - ${form.name}`} subtitle="FEFO is automatically applied using the nearest expiration date." /><BatchTable item={form} /><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Close</Button><Primary onClick={() => onOpenMode("add-batch", form)}><HiOutlinePlus className="h-4 w-4" />Add Batch</Primary></div></Modal>

  if (dialog.mode === "add-batch") {
    return <Modal onCancel={onCancel}><DialogTitle title="Add Batch" subtitle={form.name} /><form onSubmit={(event) => { event.preventDefault(); onSaveBatch(form, batchForm) }}><div className="grid gap-4 sm:grid-cols-2"><Field label="Batch Number"><input value={batchForm.batchNumber} onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })} className={inputClass} placeholder="20260524-001" /></Field><Field label="Branch"><select value={batchForm.branch} onChange={(e) => setBatchForm({ ...batchForm, branch: e.target.value })} className={inputClass}>{branchNames.map((branch) => <option key={branch}>{branch}</option>)}</select></Field><Field label="Supplier"><select value={batchForm.supplier} onChange={(e) => setBatchForm({ ...batchForm, supplier: e.target.value })} className={inputClass}>{supplierOptions.map((supplier) => <option key={supplier}>{supplier}</option>)}</select></Field><Field label="Quantity"><input required type="number" min="1" value={batchForm.quantity} onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })} className={inputClass} /></Field><Field label="Cost"><input type="number" min="0" step="0.01" value={batchForm.cost} onChange={(e) => setBatchForm({ ...batchForm, cost: e.target.value })} className={inputClass} /></Field><Field label="Date Received"><input required type="date" value={batchForm.dateReceived} onChange={(e) => setBatchForm({ ...batchForm, dateReceived: e.target.value })} className={inputClass} /></Field><Field label="Expiration Date"><input type="date" disabled={batchForm.noExpiration} value={batchForm.expiryDate} onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })} className={inputClass} /></Field><label className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={batchForm.noExpiration} onChange={(e) => setBatchForm({ ...batchForm, noExpiration: e.target.checked, expiryDate: e.target.checked ? "" : batchForm.expiryDate })} />No expiration</label></div><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><Primary type="submit">Save Batch</Primary></div></form></Modal>
  }

  if (dialog.mode === "adjust") {
    const currentStock = Number(form.branchStocks[adjustment.branch]?.stock ?? 0)
    return <Modal onCancel={onCancel} showClose={false}><DialogTitle title="Adjust Stock" subtitle={form.name} /><form onSubmit={(event) => { event.preventDefault(); onSaveStockAdjustment(form, adjustment) }}><div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-[#0b6b51]">Current Stock: {currentStock}</div><div className="grid gap-4"><Field label="Branch"><select value={adjustment.branch} onChange={(e) => setAdjustment({ ...adjustment, branch: e.target.value })} className={inputClass}>{branchNames.map((branch) => <option key={branch}>{branch}</option>)}</select></Field><Field label="Adjustment Type"><div className="grid grid-cols-2 rounded-xl border border-slate-200 p-1"><Segment active={adjustment.type === "add"} onClick={() => setAdjustment({ ...adjustment, type: "add" })}>Add Stock</Segment><Segment active={adjustment.type === "remove"} onClick={() => setAdjustment({ ...adjustment, type: "remove" })}>Remove Stock</Segment></div></Field><Field label="Quantity"><input required type="number" min="1" value={adjustment.quantity} onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })} className={inputClass} /></Field><Field label="Reason"><select value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className={inputClass}>{adjustmentReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></Field><Field label="Notes"><textarea value={adjustment.notes} onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })} className={`${inputClass} min-h-24 py-3`} placeholder="Optional notes..." /></Field></div><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><Primary type="submit">Save Adjustment</Primary></div></form></Modal>
  }

  return <Modal title={dialog.mode === "create" ? "Add Inventory Item" : "Edit Inventory Item"} onCancel={onCancel}><form onSubmit={(e) => { e.preventDefault(); onSave(form) }}><div className="grid gap-4 sm:grid-cols-2">{[["name", "Product Name"], ["brand", "Brand"], ["genericName", "Generic Name"], ["code", "Item Code"], ["barcode", "Barcode"], ["dosage", "Strength"], ["unit", "Unit"], ["reorderLevel", "Reorder Level", "number"], ["unitCost", "Unit Cost", "number"]].map(([name, label, type = "text"]) => <Field key={name} label={label}><input required type={type} disabled={name === "code"} value={form[name]} onChange={(e) => update(name, type === "number" ? Number(e.target.value) : e.target.value)} className={inputClass} /></Field>)}<Field label="Category"><input value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass} /></Field><Field label="Supplier"><select value={form.supplier} onChange={(e) => update("supplier", e.target.value)} className={inputClass}>{supplierOptions.map((supplier) => <option key={supplier}>{supplier}</option>)}</select></Field></div><div className="mt-6 flex justify-end gap-3"><Button onClick={onCancel}>Cancel</Button><Primary type="submit">Save Changes</Primary></div></form></Modal>
}

function Modal({ children, onCancel, showClose = true, title, wide = false }) { return <div className="fixed inset-y-0 right-0 left-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-3 sm:p-4 lg:left-[210px] xl:left-[250px]"><button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close" /><section className={`relative w-full ${wide ? "max-w-5xl" : "max-w-3xl"} max-h-[calc(100dvh-1.5rem)] overflow-x-hidden overflow-y-auto rounded-xl bg-white p-4 shadow-2xl outline-none sm:max-h-[92vh] sm:rounded-2xl sm:p-6`}>{showClose ? <button type="button" onClick={onCancel} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-500 hover:bg-slate-100 sm:right-4 sm:top-4"><HiXMark className="h-5 w-5" /></button> : null}{title ? <h2 className="pr-10 text-xl font-bold text-slate-900">{title}</h2> : null}<div className={title ? "mt-5" : ""}>{children}</div></section></div> }
function DialogTitle({ subtitle, title }) { return <div className="mb-5 border-b border-slate-100 pb-4"><h2 className="pr-10 text-xl font-bold text-slate-950">{title}</h2>{subtitle ? <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p> : null}</div> }
function DetailsFooter({ activeTab, onAddBatch, onAdjustStock }) {
  if (activeTab !== "branch stock" && activeTab !== "batches") return null
  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      {activeTab === "branch stock" ? <Ghost onClick={onAdjustStock}>Adjust Stock</Ghost> : null}
      {activeTab === "batches" ? <Primary onClick={onAddBatch}><HiOutlinePlus className="h-4 w-4" />Add Batch</Primary> : null}
    </div>
  )
}
function SummaryStat({ label, value }) { return <div><p className="text-lg font-bold text-slate-950">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div> }
function Tabs({ active, setActive, tabs }) { return <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto border-b border-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActive(tab)} className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold capitalize ${active === tab ? "border-[#0b6b51] text-[#0b6b51]" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{tab}</button>)}</div> }
function ItemDetails({ item }) { return <div className="mt-5 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-2"><Detail label="Brand" value={item.brand} /><Detail label="Generic" value={item.genericName} /><Detail label="Category" value={item.category} /><Detail label="Type" value={item.dosageForm} /><Detail label="Strength" value={item.dosage} /><Detail label="Unit" value={item.unit} /><Detail label="Barcode" value={item.barcode} /><Detail label="Supplier" value={item.supplier} /><Detail label="PWD/Senior Discount" value={item.isPwdSeniorDiscountable ? "Applicable" : "Not applicable"} /></div> }
function Detail({ label, value }) { return <div className="border-b border-slate-100 pb-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value || "-"}</p></div> }
function BranchStockTable({ item }) { return <SimpleTable headers={["Branch", "Stock", "Nearest Expiry", "Status"]} rows={branchNames.map((branch) => { const stock = Number(item.branchStocks[branch]?.stock ?? 0); return [branch, stock, item.branchStocks[branch]?.nearestExpiry ?? "-", <StatusBadge status={statusForStock(stock, item.reorderLevel, item.statusOverride)} />] })} /> }
function BatchRecordsSection({ item }) {
  const activeBatchCount = (item.batches ?? []).length
  return (
    <section className="mt-5">
      <div>
        <h3 className="text-base font-bold text-slate-950">Batch Records</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {activeBatchCount} active {activeBatchCount === 1 ? "batch" : "batches"}
        </p>
      </div>
      {activeBatchCount ? (
        <BatchTable item={item} />
      ) : (
        <EmptyPanel
          title="No batches yet."
          text="Add the first batch to start tracking quantity and expiration."
        />
      )}
    </section>
  )
}
function BatchTable({ item }) { const batches = sortBatchesByFefo(item.batches); return batches.length ? <SimpleTable headers={["Batch No.", "Branch", "Qty", "Expiry", "Received", "Supplier", "Priority"]} rows={batches.map((batch, index) => [batch[0], batch[1], batch[2], batch[3], batch[4], batch[5], <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0b6b51]">{index === 0 ? "Use First" : "Next"}</span>])} /> : <EmptyPanel title="No batch records yet." text="Add a batch when stock is received for this product." /> }
function StockHistoryTable({ item }) { return item.stockHistory?.length ? <SimpleTable headers={["Date & Time", "Branch", "Change", "Reason", "By"]} rows={item.stockHistory.map((log) => [log.dateTime, log.branch, log.change, log.reason, log.by])} /> : <EmptyPanel title="No stock history yet." text="Stock adjustments will appear here after inventory changes are saved." /> }
function SimpleTable({ headers, rows }) { return <div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-bold text-slate-600"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-100">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 font-semibold text-slate-800">{cell}</td>)}</tr>)}</tbody></table></div> }
function EmptyPanel({ action, text, title }) { return <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center"><p className="font-bold text-slate-700">{title}</p><p className="mt-1 text-sm font-medium text-slate-500">{text}</p>{action ? <div className="mt-4 flex justify-center">{action}</div> : null}</div> }
function Segment({ active, children, onClick }) { return <button type="button" onClick={onClick} className={`h-9 rounded-lg text-sm font-bold ${active ? "bg-[#00675b] text-white" : "text-slate-600 hover:bg-slate-50"}`}>{children}</button> }
const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b6b51] disabled:bg-slate-50 disabled:text-slate-600"
function Field({ children, label }) { return <label><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label> }
function StatusBadge({ status }) { const styles = { Healthy: "bg-emerald-100 text-emerald-700", "Low Stock": "bg-amber-100 text-amber-700", "Out of Stock": "bg-red-100 text-red-600", Archived: "bg-slate-100 text-slate-600" }; return <span className={`inline-flex h-7 min-w-20 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-bold ${styles[status] ?? styles.Healthy}`}>{status}</span> }
function Button({ children, onClick }) { return <button type="button" onClick={onClick} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">{children}</button> }
function Ghost({ children, onClick }) { return <button type="button" onClick={onClick} className="h-11 rounded-lg border border-[#0b6b51]/40 px-5 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50">{children}</button> }
function Primary({ children, onClick, type = "button" }) { return <button type={type} onClick={onClick} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]">{children}</button> }
function DangerButton({ children, onClick }) { return <button type="button" onClick={onClick} className="h-11 rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700">{children}</button> }
function Page({ active, children, disabled, onClick }) { return <button type="button" disabled={disabled} onClick={onClick} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-bold ${active ? "border-[#00675b] bg-[#00675b] text-white" : "border-slate-200 bg-white text-slate-600"} disabled:text-slate-300`}>{children}</button> }

function getPaginationItems(currentPage, pageCount) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1)
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", pageCount]
  if (currentPage >= pageCount - 2) return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount]
  return [1, "ellipsis", currentPage, "ellipsis", pageCount]
}

export default SuperAdminInventory
