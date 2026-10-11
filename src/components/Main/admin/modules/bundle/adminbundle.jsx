import { useEffect, useMemo, useState } from "react"

import useNotification from "../../../../../hooks/useNotification"
import { getPaginationItems } from "../../../../shared/inventory/inventoryUtils"
import AddBundleModal from "./components/AddBundleModal"
import BundleDetailsPanel from "./components/BundleDetailsPanel"
import BundleListPanel from "./components/BundleListPanel"
import ManageBundleStockModal from "./components/ManageBundleStockModal"
import { ADMIN_BUNDLES_UPDATED_EVENT, mockBundles } from "./data/bundleMockData"

export { BundleTopbarCards } from "./components/BundleTopbarCards"

const dispatchBundlesUpdated = (bundles) => {
  window.dispatchEvent(
    new CustomEvent(ADMIN_BUNDLES_UPDATED_EVENT, {
      detail: { bundles },
    })
  )
}

function BulkArchiveBundlesModal({ bundles, onCancel, onConfirm }) {
  const count = bundles.length
  const bundleNames = bundles.slice(0, 3).map((bundle) => bundle.name)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Cancel archive selected bundles"
      />

      <section className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Archive {count} Bundle{count === 1 ? "" : "s"}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Selected bundles will be moved out of the active bundle list and can
          be restored from Archives later.
        </p>

        {bundleNames.length ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
            {bundleNames.join(", ")}
            {count > bundleNames.length ? ` and ${count - bundleNames.length} more` : ""}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Archive {count} Bundle{count === 1 ? "" : "s"}
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminBundle({ activeBranchId }) {
  const { showSuccess } = useNotification()
  const [bundles, setBundles] = useState(mockBundles)
  const [selectedBundleId, setSelectedBundleId] = useState(
    mockBundles[0]?.id ?? null
  )
  const [selectedArchiveBundleIds, setSelectedArchiveBundleIds] = useState([])
  const [bulkArchiveBundles, setBulkArchiveBundles] = useState([])
  const [isAddBundleModalOpen, setIsAddBundleModalOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [isBundleDetailsOpen, setIsBundleDetailsOpen] = useState(false)
  const [bundleStockToManage, setBundleStockToManage] = useState(null)
  const [openActionBundleId, setOpenActionBundleId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!openActionBundleId) {
      return undefined
    }

    const closeActionMenu = () => {
      setOpenActionBundleId(null)
    }

    document.addEventListener("click", closeActionMenu)

    return () => {
      document.removeEventListener("click", closeActionMenu)
    }
  }, [openActionBundleId])
  const visibleBranchBundles = useMemo(() => {
    const branchBundles = activeBranchId
      ? bundles.filter((bundle) => bundle.branchId === activeBranchId)
      : bundles

    return branchBundles.filter((bundle) => bundle.status !== "Archived")
  }, [activeBranchId, bundles])

  const filteredBundles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return visibleBranchBundles
    }

    return visibleBranchBundles.filter((bundle) =>
      [
        bundle.name,
        bundle.bundleCode,
        bundle.status,
        ...bundle.includedItems.map((item) => item.productName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [searchTerm, visibleBranchBundles])

  const totalEntries = filteredBundles.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / Number(entriesToShow)))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * Number(entriesToShow)
    : 0
  const endIndex = Math.min(startIndex + Number(entriesToShow), totalEntries)
  const visibleBundles = filteredBundles.slice(startIndex, endIndex)
  const visibleBundleIds = visibleBundles.map((bundle) => bundle.id)
  const selectedVisibleCount = visibleBundleIds.filter((bundleId) =>
    selectedArchiveBundleIds.includes(bundleId)
  ).length
  const allVisibleSelected =
    visibleBundleIds.length > 0 && selectedVisibleCount === visibleBundleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)
  const selectedBundle =
    visibleBranchBundles.find((bundle) => bundle.id === selectedBundleId) ??
    visibleBranchBundles[0] ??
    null
  const selectedArchiveBundles = visibleBranchBundles.filter((bundle) =>
    selectedArchiveBundleIds.includes(bundle.id)
  )

  const handleSearchChange = (nextSearchTerm) => {
    setSearchTerm(nextSearchTerm)
    setCurrentPage(1)
    setSelectedArchiveBundleIds([])
  }

  const handleEntriesChange = (nextEntriesToShow) => {
    setEntriesToShow(nextEntriesToShow)
    setCurrentPage(1)
    setSelectedArchiveBundleIds([])
  }

  const handleToggleActionMenu = (bundleId) => {
    setOpenActionBundleId((currentBundleId) =>
      currentBundleId === bundleId ? null : bundleId
    )
  }

  const handleSelectBundle = (bundleId) => {
    setSelectedBundleId(bundleId)
    setIsBundleDetailsOpen(true)
  }

  const toggleBundleSelection = (bundleId) => {
    setSelectedArchiveBundleIds((currentIds) =>
      currentIds.includes(bundleId)
        ? currentIds.filter((currentId) => currentId !== bundleId)
        : [...currentIds, bundleId]
    )
  }

  const toggleVisibleSelection = () => {
    setSelectedArchiveBundleIds((currentIds) =>
      allVisibleSelected
        ? currentIds.filter((currentId) => !visibleBundleIds.includes(currentId))
        : [...new Set([...currentIds, ...visibleBundleIds])]
    )
  }

  const archiveBundles = (bundlesToArchive) => {
    const archiveIds = bundlesToArchive.map((bundle) => bundle.id)
    const archiveCount = archiveIds.length

    if (!archiveCount) {
      return
    }

    setBundles((currentBundles) => {
      const nextBundles = currentBundles.map((bundle) =>
        archiveIds.includes(bundle.id)
          ? { ...bundle, status: "Archived" }
          : bundle
      )
      dispatchBundlesUpdated(nextBundles)

      return nextBundles
    })
    setSelectedArchiveBundleIds((currentIds) =>
      currentIds.filter((currentId) => !archiveIds.includes(currentId))
    )
    setSelectedBundleId((currentId) =>
      archiveIds.includes(currentId) ? null : currentId
    )
    setBulkArchiveBundles([])
    setOpenActionBundleId(null)
    showSuccess(
      `${archiveCount} bundle${archiveCount === 1 ? "" : "s"} archived.`
    )
  }

  const handleOpenManageBundleStock = (bundleToManage) => {
    setBundleStockToManage(bundleToManage)
    setSelectedBundleId(bundleToManage.id)
    setOpenActionBundleId(null)
  }

  const handleCreateBundle = (newBundle) => {
    setBundles((currentBundles) => {
      const nextBundles = [newBundle, ...currentBundles]
      dispatchBundlesUpdated(nextBundles)

      return nextBundles
    })
    setSelectedBundleId(newBundle.id)
    setCurrentPage(1)
    setSearchTerm("")
  }

  const handleUpdateBundle = (updatedBundle) => {
    setBundles((currentBundles) => {
      const nextBundles = currentBundles.map((bundle) =>
        bundle.id === updatedBundle.id ? updatedBundle : bundle
      )
      dispatchBundlesUpdated(nextBundles)

      return nextBundles
    })
    setSelectedBundleId(updatedBundle.id)
    setEditingBundle(null)
  }

  const handleUpdateBundleStock = (updatedBundle) => {
    setBundles((currentBundles) => {
      const nextBundles = currentBundles.map((bundle) =>
        bundle.id === updatedBundle.id ? updatedBundle : bundle
      )
      dispatchBundlesUpdated(nextBundles)

      return nextBundles
    })
    setSelectedBundleId(updatedBundle.id)
    setBundleStockToManage(null)
  }

  return (
    <>
      <section className="grid min-h-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <BundleListPanel
          searchTerm={searchTerm}
          entriesToShow={entriesToShow}
          visibleBundles={visibleBundles}
          selectedBundle={selectedBundle}
          selectedBundleIds={selectedArchiveBundleIds}
          selectedBundles={selectedArchiveBundles}
          openActionBundleId={openActionBundleId}
          allVisibleSelected={allVisibleSelected}
          someVisibleSelected={someVisibleSelected}
          totalEntries={totalEntries}
          startIndex={startIndex}
          endIndex={endIndex}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          paginationItems={paginationItems}
          onSearchChange={handleSearchChange}
          onEntriesChange={handleEntriesChange}
          onAddBundle={() => setIsAddBundleModalOpen(true)}
          onSelectBundle={handleSelectBundle}
          onToggleBundleSelection={toggleBundleSelection}
          onToggleVisibleSelection={toggleVisibleSelection}
          onClearBundleSelection={() => setSelectedArchiveBundleIds([])}
          onToggleActionMenu={handleToggleActionMenu}
          onArchiveBundle={(bundle) => setBulkArchiveBundles([bundle])}
          onArchiveSelectedBundles={() =>
            setBulkArchiveBundles(selectedArchiveBundles)
          }
          onManageBundleStock={handleOpenManageBundleStock}
          onPageChange={setCurrentPage}
        />

        <BundleDetailsPanel
          selectedBundle={selectedBundle}
          onEditBundle={setEditingBundle}
          className="hidden xl:flex"
        />
      </section>

      {isBundleDetailsOpen && selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 px-3 pb-3 backdrop-blur-sm xl:hidden">
          <BundleDetailsPanel
            selectedBundle={selectedBundle}
            onEditBundle={setEditingBundle}
            onClose={() => setIsBundleDetailsOpen(false)}
            className="max-h-[88vh] w-full"
          />
        </div>
      )}

      {isAddBundleModalOpen && (
        <AddBundleModal
          activeBranchId={activeBranchId}
          onClose={() => setIsAddBundleModalOpen(false)}
          onCreateBundle={handleCreateBundle}
          onUpdateBundle={handleUpdateBundle}
        />
      )}

      {editingBundle && (
        <AddBundleModal
          activeBranchId={activeBranchId}
          bundleToEdit={editingBundle}
          onClose={() => setEditingBundle(null)}
          onCreateBundle={handleCreateBundle}
          onUpdateBundle={handleUpdateBundle}
        />
      )}

      {bundleStockToManage && (
        <ManageBundleStockModal
          activeBranchId={activeBranchId}
          bundle={bundleStockToManage}
          onClose={() => setBundleStockToManage(null)}
          onUpdateBundleStock={handleUpdateBundleStock}
        />
      )}

      {bulkArchiveBundles.length ? (
        <BulkArchiveBundlesModal
          bundles={bulkArchiveBundles}
          onCancel={() => setBulkArchiveBundles([])}
          onConfirm={() => archiveBundles(bulkArchiveBundles)}
        />
      ) : null}
    </>
  )
}

export default AdminBundle
