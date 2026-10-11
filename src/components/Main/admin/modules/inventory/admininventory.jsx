import { useEffect, useMemo, useRef, useState } from "react"
import { FaBox } from "react-icons/fa"
import { FiArchive, FiChevronLeft, FiChevronRight, FiChevronUp, FiEdit3, FiFilter, FiMoreVertical, FiSearch, FiX } from "react-icons/fi"

import useNotification from "../../../../../hooks/useNotification"
import InventoryProductTable from "../../../../shared/inventory/InventoryProductTable"
import ProductDetailsPanel from "../../../../shared/inventory/ProductDetailsPanel"
import { BatchManagementModal, FilterSelect } from "./components/InventoryModals"
import { getInventorySummaryValues, mockInventoryItems, summaryCardConfig } from "./data/inventoryMockData"
import { defaultInventoryFilters, getInventoryFilterOptions, getProductWithSyncedBatches, stockStatusFilterOptions } from "./utils/inventoryModuleUtils"
import { getItemUnits, getPaginationItems, getProductQuantity, getProductTableDisplayName, isLowStock, isNearExpiry, isOutOfStock } from "../../../../shared/inventory/inventoryUtils"

function InventorySummaryCard({ card, value, compact = false }) {
  const Icon = card.icon
  const label = compact ? card.shortLabel ?? card.label : card.label
  const tone = `${card.iconBg} ${card.accent}`

  return (
    <article
      className={`min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4 ${
        compact
          ? ""
          : "sm:min-h-[120px] sm:p-5"
      }`}
    >
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm">
            {label}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block">
            <p className="truncate text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">
              {value}
            </p>
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${tone}`}
            >
              <Icon className="h-4 w-4" />
            </span>
          </div>
          {card.detail ? (
            <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">
              {card.detail}
            </p>
          ) : null}
        </div>
        <span
          className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${tone}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </article>
  )
}

export function InventoryTopbarCards({ activeBranchId }) {
  const summaryValues = getInventorySummaryValues(activeBranchId)

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {summaryCardConfig.map((card) => (
        <InventorySummaryCard
          key={card.id}
          card={card}
          value={summaryValues[card.id]}
          compact
        />
      ))}
    </div>
  )
}

function ReorderPointModal({ item, onClose, onSave }) {
  const [reorderPoint, setReorderPoint] = useState(() =>
    String(item?.reorderPoint ?? 0)
  )

  if (!item) {
    return null
  }

  const parsedReorderPoint = Number(reorderPoint)
  const isInvalid =
    !Number.isFinite(parsedReorderPoint) || parsedReorderPoint < 0
  const currentQuantity = getProductQuantity(item)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isInvalid) {
      return
    }

    onSave(item.id, Math.floor(parsedReorderPoint))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close reorder point modal"
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Set Reorder Point
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {getProductTableDisplayName(item)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Close reorder point modal"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div>
            <p className="font-semibold text-slate-500">Current Stock</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 [font-variant-numeric:tabular-nums]">
              {currentQuantity}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Current Point</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 [font-variant-numeric:tabular-nums]">
              {item.reorderPoint ?? 0}
            </p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-slate-700">
            New Reorder Point
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={reorderPoint}
            onChange={(event) => setReorderPoint(event.target.value)}
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition [font-variant-numeric:tabular-nums] ${
              isInvalid
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            }`}
          />
          {isInvalid && (
            <span className="mt-2 block text-xs font-semibold text-red-500">
              Enter zero or a higher whole number.
            </span>
          )}
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isInvalid}
            className="h-10 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

function BulkArchiveProductsModal({ onCancel, onConfirm, products }) {
  const count = products.length
  const productNames = products
    .slice(0, 3)
    .map((product) => getProductTableDisplayName(product))

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Cancel archive selected products"
      />

      <section className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Archive {count} Product{count === 1 ? "" : "s"}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Selected products will be removed from the active inventory list
              and can be reviewed from Archives once archive storage is wired.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Close archive selected products modal"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {productNames.length ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
            {productNames.join(", ")}
            {count > productNames.length ? ` and ${count - productNames.length} more` : ""}
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
            Archive {count} Product{count === 1 ? "" : "s"}
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminInventory({ activeBranchId }) {
  const { showSuccess } = useNotification()
  const [inventoryItems, setInventoryItems] = useState(mockInventoryItems)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [selectedArchiveItemIds, setSelectedArchiveItemIds] = useState([])
  const [bulkArchiveProducts, setBulkArchiveProducts] = useState([])
  const [openActionItemId, setOpenActionItemId] = useState(null)
  const [batchManagementItem, setBatchManagementItem] = useState(null)
  const [reorderPointItem, setReorderPointItem] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState(defaultInventoryFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultInventoryFilters)
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const filterPopoverRef = useRef(null)

  useEffect(() => {
    if (!openActionItemId) {
      return undefined
    }

    const closeActionMenu = () => {
      setOpenActionItemId(null)
    }

    document.addEventListener("click", closeActionMenu)

    return () => {
      document.removeEventListener("click", closeActionMenu)
    }
  }, [openActionItemId])

  useEffect(() => {
    if (!isFilterOpen) {
      return undefined
    }

    const closeFilterPopover = (event) => {
      if (!filterPopoverRef.current?.contains(event.target)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", closeFilterPopover, true)

    return () => {
      document.removeEventListener("mousedown", closeFilterPopover, true)
    }
  }, [isFilterOpen])

  const filterOptions = useMemo(
    () => getInventoryFilterOptions(inventoryItems),
    [inventoryItems]
  )

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return inventoryItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.productName,
          getProductTableDisplayName(item),
          item.genericName,
          item.batchNumber,
          item.brand,
          item.category,
          item.supplier,
          item.barcode,
        ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)

      const selectedStatuses = appliedFilters.stockStatuses
      const matchesStockStatus =
        !selectedStatuses.length ||
        selectedStatuses.some((status) => {
            if (status === "lowStock") {
              return isLowStock(item)
            }

          if (status === "expiringSoon") {
            return isNearExpiry(item)
          }

            return isOutOfStock(item)
        })
      const matchesCategory =
        !appliedFilters.category || item.category === appliedFilters.category
      const matchesBrand =
        !appliedFilters.brand || item.brand === appliedFilters.brand
      const matchesSupplier =
        !appliedFilters.supplier || item.supplier === appliedFilters.supplier
      const matchesItemUnit =
        !appliedFilters.itemUnit ||
        getItemUnits(item).some(
          (unit) => unit.itemUnit === appliedFilters.itemUnit
        )

      return (
        matchesSearch &&
        matchesStockStatus &&
        matchesCategory &&
        matchesBrand &&
        matchesSupplier &&
        matchesItemUnit
      )
    })
  }, [appliedFilters, inventoryItems, searchTerm])
  const entriesPerPage = Number(entriesToShow)
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = filteredItems.length
    ? (safeCurrentPage - 1) * entriesPerPage
    : 0
  const endIndex = Math.min(startIndex + entriesPerPage, filteredItems.length)
  const visibleItems = filteredItems.slice(startIndex, endIndex)
  const visibleItemIds = useMemo(
    () => visibleItems.map((item) => item.id),
    [visibleItems]
  )
  const visibleSelectedCount = visibleItemIds.filter((itemId) =>
    selectedArchiveItemIds.includes(itemId)
  ).length
  const allVisibleItemsSelected =
    visibleItemIds.length > 0 && visibleSelectedCount === visibleItemIds.length
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)
  const selectedItem =
    inventoryItems.find((item) => item.id === selectedItemId) ?? null
  const selectedArchiveItems = inventoryItems.filter((item) =>
    selectedArchiveItemIds.includes(item.id)
  )
  const activeFilterCount =
    appliedFilters.stockStatuses.length +
    [
      appliedFilters.category,
      appliedFilters.brand,
      appliedFilters.supplier,
      appliedFilters.itemUnit,
    ].filter(Boolean).length

  const handleOpenFilters = () => {
    setPendingFilters(appliedFilters)
    setIsFilterOpen((currentState) => !currentState)
  }

  const togglePendingStockStatus = (statusId) => {
    setPendingFilters((currentFilters) => {
      const hasStatus = currentFilters.stockStatuses.includes(statusId)

      return {
        ...currentFilters,
        stockStatuses: hasStatus
          ? currentFilters.stockStatuses.filter((status) => status !== statusId)
          : [...currentFilters.stockStatuses, statusId],
      }
    })
  }

  const updatePendingFilter = (field, value) => {
    setPendingFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    setCurrentPage(1)
    setSelectedArchiveItemIds([])
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setPendingFilters(defaultInventoryFilters)
    setAppliedFilters(defaultInventoryFilters)
    setCurrentPage(1)
    setSelectedArchiveItemIds([])
  }

  const handleToggleArchiveSelection = (itemId) => {
    setSelectedArchiveItemIds((currentItemIds) =>
      currentItemIds.includes(itemId)
        ? currentItemIds.filter((currentItemId) => currentItemId !== itemId)
        : [...currentItemIds, itemId]
    )
  }

  const handleToggleAllVisibleItems = () => {
    setSelectedArchiveItemIds((currentItemIds) => {
      if (allVisibleItemsSelected) {
        return currentItemIds.filter(
          (currentItemId) => !visibleItemIds.includes(currentItemId)
        )
      }

      return [...new Set([...currentItemIds, ...visibleItemIds])]
    })
  }

  const handleClearArchiveSelection = () => {
    setSelectedArchiveItemIds([])
  }

  const handleArchiveItems = (itemIdsToArchive) => {
    if (!itemIdsToArchive.length) {
      return
    }
    const archiveCount = itemIdsToArchive.length
    setInventoryItems((currentItems) =>
      currentItems.filter((item) => !itemIdsToArchive.includes(item.id))
    )
    setSelectedArchiveItemIds((currentItemIds) =>
      currentItemIds.filter(
        (currentItemId) => !itemIdsToArchive.includes(currentItemId)
      )
    )
    setSelectedItemId((currentItemId) =>
      itemIdsToArchive.includes(currentItemId) ? null : currentItemId
    )
    setOpenActionItemId(null)
    setBulkArchiveProducts([])
    showSuccess(
      `${archiveCount} product${archiveCount === 1 ? "" : "s"} archived.`
    )
  }

  const handleApplyBatchAdjustment = ({
    branchId,
    productId,
    batchId,
    adjustmentType,
    quantity,
  }) => {
    setInventoryItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.id !== productId ||
          (branchId && item.branchId && item.branchId !== branchId)
        ) {
          return item
        }

        const currentBatches =
          item.batches?.length > 0
            ? item.batches
            : [
                {
                  id: `${item.id}-batch-1`,
                  batchNumber: item.batchNumber,
                  quantity: item.quantity,
                  expiryDate: item.expiryDate,
                  dateReceived: item.dateReceived,
                  status: "Active",
                },
              ]
        const nextBatches = currentBatches.map((batch) => {
          if (batch.id !== batchId) {
            return batch
          }

          const currentQuantity = Number(batch.quantity) || 0
          const nextQuantity =
            adjustmentType === "add"
              ? currentQuantity + quantity
              : Math.max(0, currentQuantity - quantity)

          return {
            ...batch,
            quantity: nextQuantity,
          }
        })

        return getProductWithSyncedBatches(item, nextBatches)
      })
    )
    setSelectedItemId(productId)
  }

  const handleSaveReorderPoint = (productId, nextReorderPoint) => {
    setInventoryItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.id !== productId ||
          (activeBranchId && item.branchId && item.branchId !== activeBranchId)
        ) {
          return item
        }

        const currentQuantity = getProductQuantity(item)

        return {
          ...item,
          reorderPoint: nextReorderPoint,
          isLowStock: currentQuantity > 0 && currentQuantity <= nextReorderPoint,
        }
      })
    )
    setSelectedItemId(productId)
    setReorderPointItem(null)
  }

  return (
    <div>
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-[34rem] flex-col rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 xl:h-[calc(100dvh-14rem)] xl:rounded-3xl">
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
            <div className="min-w-0 md:max-w-[27rem]">
              <label className="relative block min-w-0">
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                    setSelectedArchiveItemIds([])
                  }}
                  placeholder="Search products..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                />
                <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </label>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3">
              <div ref={filterPopoverRef} className="relative">
                <button
                  type="button"
                  onClick={handleOpenFilters}
                  className={`relative grid h-11 w-11 place-items-center rounded-xl border bg-white transition ${
                    activeFilterCount
                      ? "border-[#0b6b51]/50 text-[#0b6b51]"
                      : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
                  }`}
                  aria-label="Filter inventory"
                  aria-expanded={isFilterOpen}
                >
                  <FiFilter className="h-5 w-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0b6b51]" />
                  )}
                </button>

                {isFilterOpen && (
                  <div className="fixed left-6 right-6 top-24 z-30 max-h-[72vh] overflow-y-auto rounded-xl border border-slate-100 bg-white p-4 text-left shadow-[0_20px_55px_rgba(15,23,42,0.14)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:max-h-none sm:w-72 sm:overflow-visible sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Filter by
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] sm:hidden"
                        aria-label="Close filters"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-600">
                        Stock Status
                      </p>
                      <div className="mt-2 space-y-2">
                        {stockStatusFilterOptions.map((option) => {
                          const Icon = option.icon
                          const isChecked =
                            pendingFilters.stockStatuses.includes(option.id)

                          return (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  togglePendingStockStatus(option.id)
                                }
                                className="h-4 w-4 rounded border-slate-300 accent-[#0b6b51]"
                              />
                              <Icon
                                className={`h-4 w-4 ${option.iconClassName}`}
                              />
                              {option.label}
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <FilterSelect
                        label="Category"
                        value={pendingFilters.category}
                        onChange={(value) =>
                          updatePendingFilter("category", value)
                        }
                        options={filterOptions.categories}
                        placeholder="All Categories"
                      />
                      <FilterSelect
                        label="Brand"
                        value={pendingFilters.brand}
                        onChange={(value) => updatePendingFilter("brand", value)}
                        options={filterOptions.brands}
                        placeholder="All Brands"
                      />
                      <FilterSelect
                        label="Supplier"
                        value={pendingFilters.supplier}
                        onChange={(value) =>
                          updatePendingFilter("supplier", value)
                        }
                        options={filterOptions.suppliers}
                        placeholder="All Suppliers"
                      />
                      <FilterSelect
                        label="Item Unit"
                        value={pendingFilters.itemUnit}
                        onChange={(value) =>
                          updatePendingFilter("itemUnit", value)
                        }
                        options={filterOptions.itemUnits}
                        placeholder="All Units"
                      />
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="h-10 flex-1 rounded-lg bg-slate-50 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="inline-flex h-10 flex-[1.4] items-center justify-center gap-2 rounded-lg bg-[#00675b] text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
                      >
                        <FiFilter className="h-4 w-4" />
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-visible xl:overflow-x-auto xl:overflow-y-auto">
            {selectedArchiveItems.length ? (
              <div className="mb-3 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold text-[#0b6b51]">
                    {selectedArchiveItems.length} product
                    {selectedArchiveItems.length === 1 ? "" : "s"} selected
                  </p>
                  <button
                    type="button"
                    onClick={handleClearArchiveSelection}
                    className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkArchiveProducts(selectedArchiveItems)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <FiArchive className="h-4 w-4" />
                  Archive Selected
                </button>
              </div>
            ) : null}

            <InventoryProductTable
              items={visibleItems}
              selectedItemId={selectedItemId}
              selectedItemIds={selectedArchiveItemIds}
              onSelectItem={setSelectedItemId}
              onToggleItemSelection={handleToggleArchiveSelection}
              onToggleAllItems={handleToggleAllVisibleItems}
              renderActions={(item) => (
                <div className="relative">
                  <button
                    type="button"
                    className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
                    aria-label={`More actions for ${item.productName}`}
                    aria-expanded={openActionItemId === item.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      setOpenActionItemId((currentItemId) =>
                        currentItemId === item.id ? null : item.id
                      )
                    }}
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>

                  {openActionItemId === item.id && (
                    <div
                      className="absolute right-0 top-10 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setReorderPointItem(item)
                          setSelectedItemId(item.id)
                          setOpenActionItemId(null)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                      >
                        <FiEdit3 className="h-4 w-4" />
                        Set Reorder Point
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBatchManagementItem(item)
                          setOpenActionItemId(null)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                      >
                        <FaBox className="h-4 w-4" />
                        Batch Management
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkArchiveProducts([item])
                          setOpenActionItemId(null)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <FiArchive className="h-4 w-4" />
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              )}
            />

            {!visibleItems.length && (
              <div className="grid min-h-56 place-items-center border-b border-slate-100 text-center">
                <p className="text-base font-medium text-slate-500">
                  No products found.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Showing {filteredItems.length ? startIndex + 1 : 0} to {endIndex}{" "}
              of {filteredItems.length} entries
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative block min-w-[8.5rem]">
                <span className="sr-only">Entries per page</span>
                <select
                  value={entriesToShow}
                  onChange={(event) => {
                    setEntriesToShow(event.target.value)
                    setCurrentPage(1)
                    setSelectedArchiveItemIds([])
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                >
                  <option value="10">10 entries</option>
                  <option value="20">20 entries</option>
                  <option value="50">50 entries</option>
                  <option value="100">100 entries</option>
                </select>
                <FiChevronUp className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safeCurrentPage === 1 || !filteredItems.length}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  aria-label="Previous page"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>

                {paginationItems.map((page) =>
                  typeof page === "number" ? (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold transition ${
                        safeCurrentPage === page
                          ? "bg-[#00675b] text-white"
                          : "border border-slate-200 text-slate-600 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
                      }`}
                      aria-current={safeCurrentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={page}
                      className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400"
                    >
                      ...
                    </span>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={
                    safeCurrentPage === totalPages || !filteredItems.length
                  }
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  aria-label="Next page"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProductDetailsPanel
          item={selectedItem}
          className="hidden xl:flex xl:h-[calc(100dvh-14rem)] xl:min-h-[34rem]"
        />
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-950/45 p-3 xl:hidden">
          <ProductDetailsPanel
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            className="max-h-[86vh] w-full"
          />
        </div>
      )}

      {batchManagementItem && (
        <BatchManagementModal
          activeBranchId={activeBranchId}
          inventoryItems={inventoryItems}
          selectedItem={
            inventoryItems.find((item) => item.id === batchManagementItem.id) ??
            batchManagementItem
          }
          onClose={() => setBatchManagementItem(null)}
          onApplyAdjustment={handleApplyBatchAdjustment}
        />
      )}

      {reorderPointItem && (
        <ReorderPointModal
          item={
            inventoryItems.find((item) => item.id === reorderPointItem.id) ??
            reorderPointItem
          }
          onClose={() => setReorderPointItem(null)}
          onSave={handleSaveReorderPoint}
        />
      )}

      {bulkArchiveProducts.length ? (
        <BulkArchiveProductsModal
          products={bulkArchiveProducts}
          onCancel={() => setBulkArchiveProducts([])}
          onConfirm={() =>
            handleArchiveItems(bulkArchiveProducts.map((item) => item.id))
          }
        />
      ) : null}
    </div>
  )
}

export default AdminInventory

