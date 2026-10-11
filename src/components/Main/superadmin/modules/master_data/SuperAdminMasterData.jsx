import { useEffect, useRef, useState } from "react"
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineArchiveBox,
  HiOutlineCircleStack,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTag,
  HiOutlineXMark,
} from "react-icons/hi2"
import { FiChevronUp, FiMoreVertical } from "react-icons/fi"

const tabDefinitions = [
  { id: "categories", label: "Categories", singular: "Category", icon: HiOutlineCircleStack },
  { id: "brands", label: "Brands", singular: "Brand", icon: HiOutlineTag },
  { id: "product-types", label: "Product Types", singular: "Product Type", icon: HiOutlineCube },
  { id: "units", label: "Units", singular: "Unit", icon: HiOutlineCube },
  { id: "dosage-forms", label: "Dosage Forms", singular: "Dosage Form", icon: HiOutlineArchiveBox },
  { id: "dosages", label: "Dosages", singular: "Dosage", icon: HiOutlinePencilSquare },
]

const tabDescriptions = {
  categories: "Organize products into groups for inventory management.",
  brands: "Manage brands used across pharmacy and retail products.",
  "product-types": "Manage distinct product classifications used across inventory.",
  units: "Manage measurement and packaging units.",
  "dosage-forms": "Manage pharmaceutical forms for medicine products.",
  dosages: "Manage standard strengths used for medicine products.",
}

const starterCategory = {
  id: "category-medicines",
  name: "Medicines",
  description: "Prescription and over-the-counter pharmaceutical products.",
  status: "Active",
  isMedicine: true,
  productsUsing: 0,
  bundlesUsing: 0,
  purchaseRequests: 0,
  branchesUsing: 5,
  createdDate: "May 15, 2026",
  createdBy: "Super Admin",
  lastUpdated: "May 15, 2026",
  lastUpdatedBy: "Super Admin",
}

const createStarterRecord = (id, name, description) => ({
  id,
  name,
  description,
  status: "Active",
  productsUsing: 0,
  bundlesUsing: 0,
  purchaseRequests: 0,
  branchesUsing: 5,
  createdDate: "May 15, 2026",
  createdBy: "Super Admin",
  lastUpdated: "May 15, 2026",
  lastUpdatedBy: "Super Admin",
})

const starterRecords = {
  categories: [starterCategory],
  brands: [createStarterRecord("brand-unilab", "Unilab", "Philippine pharmaceutical brand used by commonly stocked products.")],
  "product-types": [createStarterRecord("product-type-otc", "Over-the-Counter", "Products that may be sold without a prescription.")],
  units: [createStarterRecord("unit-piece", "Piece", "Individual product unit used for inventory and dispensing.")],
  "dosage-forms": [createStarterRecord("dosage-form-tablet", "Tablet", "Solid oral dosage form supplied as an individual tablet.")],
  dosages: [createStarterRecord("dosage-500mg", "500 mg", "Standard strength containing 500 milligrams per dose.")],
}

const initialRecords = {
  ...Object.fromEntries(tabDefinitions.map((tab) => [tab.id, []])),
  ...starterRecords,
}

function SuperAdminMasterData({ onArchiveRecord }) {
  const [activeTabId, setActiveTabId] = useState("categories")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [actionMenu, setActionMenu] = useState(null)
  const [recordsByTab, setRecordsByTab] = useState(initialRecords)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [dialog, setDialog] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [bulkAction, setBulkAction] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const modalIsOpen = Boolean(dialog || archiveTarget || restoreTarget || bulkAction || detailTarget)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecordsByTab((current) => Object.fromEntries(
        tabDefinitions.map((tab) => [
          tab.id,
          current[tab.id]?.length ? current[tab.id] : starterRecords[tab.id],
        ])
      ))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!modalIsOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previousOverflow }
  }, [modalIsOpen])

  useEffect(() => {
    if (!actionMenu) return undefined
    const close = () => setActionMenu(null)
    window.addEventListener("mousedown", close)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => { window.removeEventListener("mousedown", close); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close) }
  }, [actionMenu])

  const activeTab = tabDefinitions.find((tab) => tab.id === activeTabId)
  const records = recordsByTab[activeTabId]
  const filteredRecords = records.filter((record) => [record.name, record.description].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())) && (statusFilter === "All Status" || record.status === statusFilter))
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleRecords = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? records[0]
  const selectedRecords = records.filter((record) => selectedIds.includes(record.id))
  const activeSelectedCount = selectedRecords.filter((record) => record.status === "Active").length
  const archivedSelectedCount = selectedRecords.filter((record) => record.status === "Archived").length
  const visibleSelectedCount = visibleRecords.filter((record) => selectedIds.includes(record.id)).length
  const allVisibleSelected = visibleRecords.length > 0 && visibleSelectedCount === visibleRecords.length
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected

  const handleTabSelect = (tabId) => {
    setActiveTabId(tabId)
    setSelectedRecordId(recordsByTab[tabId][0]?.id)
    setQuery("")
    setStatusFilter("All Status")
    setPage(1)
    setSelectedIds([])
  }

  const toggleRecordSelection = (recordId) => {
    setSelectedIds((current) => current.includes(recordId) ? current.filter((id) => id !== recordId) : [...current, recordId])
  }

  const toggleVisibleSelection = () => {
    const visibleIds = visibleRecords.map((record) => record.id)
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  const cancelDialog = () => {
    if (dialog?.mode === "edit" && dialog.returnTo) {
      setDetailTarget(dialog.returnTo)
    }
    setDialog(null)
  }

  const saveRecord = (form) => {
    const duplicate = records.some((record) => record.id !== form.id && record.name.trim().toLowerCase() === form.name.trim().toLowerCase())
    if (duplicate) { setToast(`${activeTab.singular} already exists.`); return }
    setRecordsByTab((current) => {
      if (dialog.mode === "add") {
        const record = {
          ...form,
          id: `${activeTabId}-${Date.now()}`,
          productsUsing: 0,
          bundlesUsing: 0,
          purchaseRequests: 0,
          branchesUsing: 0,
          createdDate: "June 18, 2026",
          createdBy: "Super Admin",
          lastUpdated: "June 18, 2026",
          lastUpdatedBy: "Super Admin",
        }
        setSelectedRecordId(record.id)
        return { ...current, [activeTabId]: [...current[activeTabId], record] }
      }

      return {
        ...current,
        [activeTabId]: current[activeTabId].map((record) =>
          record.id === form.id ? { ...record, ...form, lastUpdated: "June 18, 2026", lastUpdatedBy: "Super Admin" } : record
        ),
      }
    })
    setDialog(null)
    setToast(`${form.name} was saved successfully.`)
  }

  const archiveRecord = (record) => {
    setRecordsByTab((current) => ({
      ...current,
      [activeTabId]: current[activeTabId].map((item) =>
        item.id === record.id ? { ...item, status: "Archived", archivedOn: "August 31, 2026", archivedBy: "Super Admin", lastUpdated: "August 31, 2026", lastUpdatedBy: "Super Admin" } : item
      ),
    }))
    onArchiveRecord?.({ ...record, status: "Archived", module: activeTab.label, archivedOn: "August 31, 2026", archivedBy: "Super Admin" })
    setArchiveTarget(null)
    setSelectedIds((current) => current.filter((id) => id !== record.id))
    setToast(`${record.name} was archived.`)
  }

  const restoreRecord = (record) => {
    setRecordsByTab((current) => ({
      ...current,
      [activeTabId]: current[activeTabId].map((item) =>
        item.id === record.id ? { ...item, status: "Active", archivedOn: undefined, archivedBy: undefined, lastUpdated: "August 31, 2026", lastUpdatedBy: "Super Admin" } : item
      ),
    }))
    setRestoreTarget(null)
    setSelectedIds((current) => current.filter((id) => id !== record.id))
    setToast(`${record.name} was restored.`)
  }

  const confirmBulkAction = () => {
    const nextStatus = bulkAction === "archive" ? "Archived" : "Active"
    const eligibleIds = selectedRecords.filter((record) => bulkAction === "archive" ? record.status === "Active" : record.status === "Archived").map((record) => record.id)
    setRecordsByTab((current) => ({
      ...current,
      [activeTabId]: current[activeTabId].map((record) => eligibleIds.includes(record.id) ? {
        ...record,
        status: nextStatus,
        archivedOn: nextStatus === "Archived" ? "August 31, 2026" : undefined,
        archivedBy: nextStatus === "Archived" ? "Super Admin" : undefined,
        lastUpdated: "August 31, 2026",
        lastUpdatedBy: "Super Admin",
      } : record),
    }))
    setToast(`${eligibleIds.length} ${activeTab.label.toLowerCase()} ${bulkAction === "archive" ? "archived" : "restored"}.`)
    setSelectedIds([])
    setBulkAction(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 sm:px-6 lg:px-8">
      <section>
        <Card className="overflow-hidden !rounded-[24px] !border-white/70 !shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:!rounded-xl lg:!border-slate-200 lg:!shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200">
            <div className="flex gap-x-1 overflow-x-auto md:gap-x-4 md:px-4">
              {tabDefinitions.map((tab) => {
                const Icon = tab.icon
                const isActive = tab.id === activeTabId
                const label = tab.label
                return (
                  <button key={tab.id} type="button" onClick={() => handleTabSelect(tab.id)} className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-bold transition md:h-14 md:px-2 ${tab.id === "dosage-forms" ? "md:ml-3 md:border-l md:border-l-slate-200 md:pl-6" : ""} ${isActive ? "border-b-[#0b6b51] text-[#0b6b51]" : "border-b-transparent text-slate-500 hover:text-[#0b6b51]"}`}>
                    <Icon className="hidden h-5 w-5 md:block" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="py-4 md:p-5 md:pb-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">{activeTab.label}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{tabDescriptions[activeTabId]}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pb-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center">
              <label className="relative block w-full max-w-[420px]"><HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); setSelectedIds([]) }} placeholder={`Search ${activeTab.label.toLowerCase()}...`} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15" /></label>
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); setSelectedIds([]) }} className="h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#0b6b51]"><option>All Status</option><option>Active</option><option>Archived</option></select>
            </div>
            <button type="button" onClick={() => setDialog({ mode: "add", form: { name: "", description: "", status: "Active" } })} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-4 text-sm font-bold text-white hover:bg-[#005348] lg:h-11 lg:px-5">
              <HiOutlinePlus className="h-5 w-5" />
              <span>Add {activeTab.singular}</span>
            </button>
          </div>

          {selectedRecords.length ? (
            <div className="mx-0 mb-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:mx-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-bold text-[#0b6b51]">{selectedRecords.length} {selectedRecords.length === 1 ? "record" : "records"} selected</span>
                {activeSelectedCount && archivedSelectedCount ? <span className="font-semibold text-slate-500">{activeSelectedCount} Active <span className="px-1 text-slate-300">•</span> {archivedSelectedCount} Archived</span> : null}
                <button type="button" onClick={() => setSelectedIds([])} className="font-bold text-slate-500 hover:text-slate-800">Clear Selection</button>
              </div>
              {selectedRecords.length >= 2 && activeSelectedCount === selectedRecords.length ? <button type="button" onClick={() => setBulkAction("archive")} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Archive Selected</button> : null}
              {selectedRecords.length >= 2 && archivedSelectedCount === selectedRecords.length ? <button type="button" onClick={() => setBulkAction("restore")} className="h-10 rounded-lg bg-[#00675b] px-4 text-sm font-bold text-white hover:bg-[#005348]">Restore Selected</button> : null}
            </div>
          ) : null}

          <div className="space-y-2.5 pb-4 lg:hidden">
            {visibleRecords.length ? visibleRecords.map((record) => (
              <MobileMasterDataRecord key={record.id} record={record} selected={selectedIds.includes(record.id)} onSelect={() => toggleRecordSelection(record.id)} onView={() => { setSelectedRecordId(record.id); setDetailTarget(record) }} onAction={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setActionMenu({ record, right: Math.max(12, window.innerWidth - rect.right), top: rect.bottom + 6 }) }} />
            )) : <div className="rounded-xl border border-slate-200 px-4 py-10 text-center text-sm font-semibold text-slate-500">{query ? `No ${activeTab.label.toLowerCase()} match your search.` : `No ${activeTab.label.toLowerCase()} added yet.`}</div>}
          </div>
          <div className="pb-4 lg:hidden"><MasterDataPagination count={filteredRecords.length} currentPage={currentPage} pageCount={pageCount} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} label={activeTab.label.toLowerCase()} /></div>

          <div className="hidden max-w-full overflow-x-auto px-4 pb-4 lg:block">
            <table className="w-full min-w-[920px] overflow-hidden rounded-lg border border-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="w-12 px-4 py-4"><SelectionCheckbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={toggleVisibleSelection} label={`Select all visible ${activeTab.label.toLowerCase()}`} /></th>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4">Products</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Last Updated</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.length ? visibleRecords.map((record) => (
                  <tr key={record.id} className={`border-t border-slate-100 transition hover:bg-slate-50/70 ${selectedRecord?.id === record.id ? "bg-emerald-50/30" : ""}`}>
                    <td className="w-12 px-4 py-3"><SelectionCheckbox checked={selectedIds.includes(record.id)} onChange={() => toggleRecordSelection(record.id)} label={`Select ${record.name}`} /></td>
                    <td className="px-4 py-3 font-bold text-slate-900">{record.name}</td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      <p className="line-clamp-2">{record.description}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{record.productsUsing} products</td>
                    <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{record.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={(event) => { event.stopPropagation(); const rect = event.currentTarget.getBoundingClientRect(); setActionMenu({ record, right: Math.max(12, window.innerWidth - rect.right), top: rect.bottom + 6 }) }} className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label={`Actions for ${record.name}`}><FiMoreVertical className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )) : (
                  <tr className="border-t border-slate-100">
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      <span className="block">{query ? `No ${activeTab.label.toLowerCase()} match your search.` : `No ${activeTab.label.toLowerCase()} added yet.`}</span>
                      {!query ? <span className="mt-1 block text-xs font-medium text-slate-400">{activeTab.label} will appear here once they are created.</span> : null}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <MasterDataPagination count={filteredRecords.length} currentPage={currentPage} pageCount={pageCount} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} label={activeTab.label.toLowerCase()} />
          </div>
        </Card>

      </section>

      {dialog ? <MasterDataDialog dialog={dialog} recordType={activeTab.singular} onCancel={cancelDialog} onChange={(form) => setDialog((current) => ({ ...current, form }))} onSave={saveRecord} /> : null}
      {detailTarget ? <MasterDataDetailsModal record={detailTarget} icon={activeTab.icon} title={`${activeTab.singular} Details`} recordType={activeTab.singular} onArchive={() => { setArchiveTarget(detailTarget); setDetailTarget(null) }} onEdit={() => { setDialog({ mode: "edit", form: { ...detailTarget }, returnTo: detailTarget }); setDetailTarget(null) }} onRestore={() => { restoreRecord(detailTarget); setDetailTarget(null) }} onClose={() => setDetailTarget(null)} /> : null}
      {archiveTarget ? <ArchiveConfirm record={archiveTarget} recordType={activeTab.singular} onCancel={() => setArchiveTarget(null)} onConfirm={() => archiveRecord(archiveTarget)} /> : null}
      {restoreTarget ? <RestoreConfirm record={restoreTarget} recordType={activeTab.singular} onCancel={() => setRestoreTarget(null)} onConfirm={() => restoreRecord(restoreTarget)} /> : null}
      {bulkAction ? <BulkStatusConfirm action={bulkAction} count={selectedRecords.length} label={activeTab.label} onCancel={() => setBulkAction(null)} onConfirm={confirmBulkAction} /> : null}
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
      {actionMenu ? <MasterDataActionMenu menu={actionMenu} onClose={() => setActionMenu(null)} onOverview={(record) => { setSelectedRecordId(record.id); setDetailTarget(record) }} onEdit={(record) => setDialog({ mode: "edit", form: { ...record } })} onToggle={(record) => record.status === "Active" ? setArchiveTarget(record) : setRestoreTarget(record)} /> : null}
    </div>
  )
}

function MobileMasterDataRecord({ onAction, onSelect, onView, record, selected }) {
  return (
    <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <SelectionCheckbox checked={selected} onChange={onSelect} label={`Select ${record.name}`} />
      <button type="button" onClick={onView} className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block whitespace-normal break-words text-sm font-bold text-slate-900">{record.name}</span>
        <span className="mt-1 block whitespace-normal break-words text-xs leading-5 text-slate-500">{record.description}</span>
        <span className="mt-2 block text-[11px] font-semibold text-slate-500"><span className={record.status === "Active" ? "text-emerald-700" : "text-slate-500"}>{record.status}</span> <span className="px-1 text-slate-300">·</span> {record.productsUsing} products</span>
      </span>
      <HiChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
      </button>
      <button type="button" onClick={onAction} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label={`Actions for ${record.name}`}><FiMoreVertical className="h-5 w-5" /></button>
    </div>
  )
}

function SelectionCheckbox({ checked, indeterminate = false, label, onChange }) {
  const inputRef = useRef(null)
  useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = indeterminate }, [indeterminate])
  return <input ref={inputRef} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="h-5 w-5 cursor-pointer rounded border-slate-300 accent-[#007866] focus:ring-[#007866]" />
}

function MasterDataActionMenu({ menu, onClose, onEdit, onOverview, onToggle }) { const act = (callback) => { onClose(); callback(menu.record) }; const active = menu.record.status === "Active"; return <div role="menu" onMouseDown={(event) => event.stopPropagation()} className="fixed z-[110] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]" style={{ right: menu.right, top: menu.top }}><MenuAction icon={HiOutlineEye} label="Overview" onClick={() => act(onOverview)} />{active ? <MenuAction icon={HiOutlinePencilSquare} label="Edit" onClick={() => act(onEdit)} /> : null}<div className="mt-1 border-t border-slate-100 pt-1"><MenuAction danger={active} icon={active ? HiOutlineArchiveBox : HiOutlineCheckCircle} label={active ? "Archive" : "Restore"} onClick={() => act(onToggle)} /></div></div> }
function MenuAction({ danger = false, icon: Icon, label, onClick }) { return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#0b6b51]"}`}><Icon className="h-4 w-4" />{label}</button> }
function MasterDataPagination({ count, currentPage, label, pageCount, rowsPerPage, setPage, setRowsPerPage }) { const start = count ? (currentPage - 1) * rowsPerPage + 1 : 0; const end = Math.min(currentPage * rowsPerPage, count); return <div className="mt-0 flex min-h-14 items-center justify-between border-t border-slate-100 px-1 pt-3 text-sm font-semibold text-slate-500"><p>Showing {start}–{end} of {count} {label}</p><div className="flex items-center gap-3"><label className="relative min-w-[10.5rem]"><select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1) }} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-base font-semibold outline-none focus:border-[#0b6b51]"><option value="10">10 entries</option><option value="25">25 entries</option><option value="50">50 entries</option></select><FiChevronUp className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" /></label><button type="button" disabled={currentPage === 1 || !count} onClick={() => setPage(currentPage - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 disabled:text-slate-300"><HiChevronLeft className="h-5 w-5" /></button><span className="grid h-10 min-w-10 place-items-center rounded-lg bg-[#00675b] px-3 font-bold text-white">{currentPage}</span><button type="button" disabled={currentPage === pageCount || !count} onClick={() => setPage(currentPage + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 disabled:text-slate-300"><HiChevronRight className="h-5 w-5" /></button></div></div> }

function MasterDataDetails({ record, title }) {
  if (!record) return null

  return (
    <aside className="flex h-full min-h-0 flex-col bg-white md:h-auto md:rounded-xl md:border md:border-slate-100 md:shadow-2xl">
      <header className="shrink-0 border-b border-slate-100 px-4 py-4 md:border-0 md:px-6 md:pb-0 md:pt-6"><h3 className="pr-10 text-lg font-bold text-slate-950 md:text-xl">{title}</h3></header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:overflow-visible md:px-6">
      <div className="flex items-center justify-between gap-4 pr-8">
        <h4 className="text-xl font-bold text-slate-950">{record.name}</h4>
        <StatusBadge status={record.status} />
      </div>

      <div className="mt-4">
        <p className="hidden text-xs font-bold text-slate-500 md:block">Description</p>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-700">{record.description}</p>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <CompactDetailRow label="Products Using" value={record.productsUsing} />
        {record.status === "Archived" ? <><CompactDetailRow label="Archived On" value={record.archivedOn || record.lastUpdated} /><CompactDetailRow label="Archived By" value={record.archivedBy || "Super Admin"} /></> : <><CompactDetailRow label="Created On" value={record.createdDate} /><CompactDetailRow label="Last Updated" value={record.lastUpdated} /></>}
      </div>
      </div>

    </aside>
  )
}

function MasterDataDetailsModal({ onClose, ...props }) {
  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[80] grid place-items-center overflow-hidden bg-slate-950/45 md:p-4 lg:left-[210px] xl:left-[250px]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close details" />
      <section className="relative h-dvh max-h-dvh w-full max-w-2xl md:h-auto md:max-h-[calc(100dvh-2rem)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
          <HiOutlineXMark className="h-5 w-5" />
        </button>
        <MasterDataDetails {...props} />
      </section>
    </div>
  )
}

function ArchiveConfirm({ onCancel, onConfirm, record, recordType }) {
  const heavilyUsed = record.productsUsing > 0 || record.bundlesUsing > 0
  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[90] grid place-items-center bg-slate-950/45 p-4 lg:left-[210px] xl:left-[250px]">
      <section className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-500"><HiOutlineExclamationTriangle className="h-8 w-8" /></span>
        <h2 className="mt-4 text-xl font-bold text-slate-950">Archive {recordType}?</h2>
        <p className="mt-2 font-bold text-slate-900">{record.name}</p>
        {heavilyUsed ? <p className="mt-3 text-sm leading-6 text-slate-600">This {recordType.toLowerCase()} is currently used by {record.productsUsing} products. Archiving it will prevent it from being selected for new products. Existing products and historical records will remain unchanged.</p> : <p className="mt-3 text-sm leading-6 text-slate-600">This {recordType.toLowerCase()} will be moved to Archived and will no longer be available for new product selections. You can restore it later.</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={onConfirm} className="h-11 rounded-lg bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700">Archive {recordType}</button>
        </div>
      </section>
    </div>
  )
}

function MasterDataDialog({ dialog, recordType, onCancel, onChange, onSave }) {
  const form = dialog.form
  const update = (name, value) => onChange({ ...form, [name]: value })

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 lg:left-[210px] xl:left-[250px]">
      <button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close dialog" />
      <form onSubmit={(event) => { event.preventDefault(); onSave(form) }} className="relative w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        {dialog.mode === "add" ? <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close"><HiOutlineXMark className="h-5 w-5" /></button> : null}
        <h2 className="text-xl font-bold text-slate-900">{dialog.mode === "add" ? `Add ${recordType}` : `Edit ${recordType}`}</h2>
        <div className="mt-5 space-y-4">
          <Field label={`${recordType} Name`} value={form.name} onChange={(value) => update("name", value)} />
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Description</span><textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder={`Briefly describe this ${recordType.toLowerCase()}...`} className={`${dialogInputClass} min-h-24 py-3`} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3">{dialog.mode === "edit" ? <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button> : null}<button type="submit" className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]">{dialog.mode === "add" ? `Add ${recordType}` : "Save Changes"}</button></div>
      </form>
    </div>
  )
}

function Field({ label, onChange, value }) {
  return <label><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><input required value={value} onChange={(event) => onChange(event.target.value)} className={dialogInputClass} /></label>
}

const dialogInputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function CompactDetailRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4"><span className="font-semibold text-slate-500">{label}</span><span className="font-bold text-slate-900">{value}</span></div>
}

function RestoreConfirm({ onCancel, onConfirm, record, recordType }) {
  return <ConfirmShell iconClass="bg-emerald-50 text-emerald-600" icon={HiOutlineCheckCircle} title={`Restore ${recordType}?`} onCancel={onCancel} onConfirm={onConfirm} confirmLabel={`Restore ${recordType}`}><p className="font-bold text-slate-900">{record.name}</p><p className="mt-3 text-sm leading-6 text-slate-600">This {recordType.toLowerCase()} will become active again and will be available for product selection.</p></ConfirmShell>
}

function BulkStatusConfirm({ action, count, label, onCancel, onConfirm }) {
  const archive = action === "archive"
  const title = `${archive ? "Archive" : "Restore"} ${count} ${label}?`
  return <ConfirmShell danger={archive} iconClass={archive ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-600"} icon={archive ? HiOutlineExclamationTriangle : HiOutlineCheckCircle} title={title} onCancel={onCancel} onConfirm={onConfirm} confirmLabel={title.replace("?", "")}><p className="text-sm leading-6 text-slate-600">{archive ? `The selected ${label.toLowerCase()} will be moved to Archived. Existing products and historical records will remain unchanged, but these values will no longer be available for new product selections.` : `The selected ${label.toLowerCase()} will become Active and available for product selection again.`}</p></ConfirmShell>
}

function ConfirmShell({ children, confirmLabel, danger = false, icon: Icon, iconClass, onCancel, onConfirm, title }) {
  return <div className="fixed inset-y-0 left-0 right-0 z-[90] grid place-items-center bg-slate-950/45 p-4 lg:left-[210px] xl:left-[250px]"><section className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl"><span className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${iconClass}`}><Icon className="h-8 w-8" /></span><h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2><div className="mt-3">{children}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={onConfirm} className={`h-11 rounded-lg px-5 text-sm font-bold text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[#00675b] hover:bg-[#005348]"}`}>{confirmLabel}</button></div></section></div>
}

function StatusBadge({ status }) {
  return <span className={`inline-flex h-7 min-w-20 items-center justify-center rounded-md px-2.5 text-xs font-bold ${status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{status}</span>
}

function Card({ children, className = "" }) {
  return <section className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${className}`}>{children}</section>
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <button type="button" onClick={onClose} className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm font-semibold text-slate-700 shadow-xl"><span className="block font-bold text-[#0b6b51]">Master Data Updated</span>{message}</button>
}

export default SuperAdminMasterData











