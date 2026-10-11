import { useEffect, useMemo, useRef, useState } from "react"
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiEye,
  FiFilter,
  FiList,
  FiMinus,
  FiPlus,
  FiSearch,
  FiSend,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi"

import useNotification from "../../../../../hooks/useNotification"
import ProductThumb from "../../../../shared/inventory/ProductThumb"
import {
  formatPeso,
  getPaginationItems,
  getProductDisplayName,
  getProductQuantity,
  getProductTableDisplayName,
  isLowStock,
} from "../../../../shared/inventory/inventoryUtils"
import {
  getDefaultOrderQuantity,
  getPurchaseRequisitionItems,
  getPurchaseRequisitionSummaryValues,
  mockAdminPurchaseRequests,
  purchaseRequisitionSummaryCardConfig,
} from "./data/purchaseRequisitionMockData"

function PurchaseRequisitionSummaryCard({ card, value, compact = false }) {
  const Icon = card.icon
  const tone = `${card.iconBg} ${card.accent}`

  return (
    <article
      className={`min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4 ${
        compact ? "" : "sm:min-h-[120px] sm:p-5"
      }`}
    >
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm">
            {card.label}
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

export function PurchaseRequisitionTopbarCards({ activeBranchId }) {
  const summaryValues = getPurchaseRequisitionSummaryValues(activeBranchId)

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {purchaseRequisitionSummaryCardConfig.map((card) => (
        <PurchaseRequisitionSummaryCard
          key={card.id}
          card={card}
          value={summaryValues[card.id]}
          compact
        />
      ))}
    </div>
  )
}

const getRequisitionDateDisplay = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

const getRequisitionTimeDisplay = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date())

const getPurchaseItemDisplayName = (item) => getProductTableDisplayName(item)

const getRequestTotalAmount = (request) =>
  request.items.reduce(
    (total, item) => total + Number(item.costPrice) * Number(item.quantity),
    0
  )

const getRequestTotalQuantity = (request) =>
  request.items.reduce((total, item) => total + Number(item.quantity), 0)

const getNextRequisitionNumber = (requests) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const requestNumbers = requests
    .map((request) => Number(String(request.id).split("-").at(-1)))
    .filter(Number.isFinite)
  const nextNumber = Math.max(0, ...requestNumbers) + 1

  return `PR-${year}-${month}-${String(nextNumber).padStart(4, "0")}`
}

const getStatusClassName = (status) => {
  const statusClasses = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Denied: "bg-red-100 text-red-600",
  }

  return statusClasses[status] ?? "bg-slate-100 text-slate-600"
}

const defaultProductFilters = {
  stockStatus: "all",
  category: "",
  brand: "",
  supplier: "",
  dosageForm: "",
}

const productStockFilterOptions = [
  { id: "all", label: "All Stock" },
  { id: "low-stock", label: "Low Stock" },
  { id: "sufficient-stock", label: "Sufficient Stock" },
]

const getUniqueFilterOptions = (items, key) =>
  [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )

function ProductFilterSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const selectedLabel = value || placeholder
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeDropdown, true)

    return () => {
      document.removeEventListener("mousedown", closeDropdown, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSelect = (nextValue) => {
    onChange(nextValue)
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onFocus={() => {
            setSearchTerm("")
            setIsOpen(true)
          }}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            setIsOpen(true)
          }}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-600 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          role="combobox"
          aria-expanded={isOpen}
        />
        <FiChevronDown
          onClick={() => {
            setIsOpen((currentState) => !currentState)
            inputRef.current?.focus()
          }}
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
              !value
                ? "bg-emerald-50 text-[#0b6b51]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {placeholder}
          </button>

          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                  option === value
                    ? "bg-emerald-50 text-[#0b6b51]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{option}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
              No options found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AdminPurchaseRequisition({ activeBranchId, requestedBy }) {
  const { showSuccess, showWarning } = useNotification()
  const allItems = useMemo(
    () => getPurchaseRequisitionItems(activeBranchId),
    [activeBranchId]
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pendingProductFilters, setPendingProductFilters] =
    useState(defaultProductFilters)
  const [appliedProductFilters, setAppliedProductFilters] =
    useState(defaultProductFilters)
  const [quickList, setQuickList] = useState({})
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isConfirmRequestModalOpen, setIsConfirmRequestModalOpen] =
    useState(false)
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false)
  const [requestStatusFilter, setRequestStatusFilter] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [purchaseRequests, setPurchaseRequests] = useState(
    mockAdminPurchaseRequests
  )
  const filterPopoverRef = useRef(null)

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

  const productFilterOptions = useMemo(
    () => ({
      categories: getUniqueFilterOptions(allItems, "category"),
      brands: getUniqueFilterOptions(allItems, "brand"),
      suppliers: getUniqueFilterOptions(allItems, "supplier"),
      dosageForms: getUniqueFilterOptions(allItems, "dosageForm"),
    }),
    [allItems]
  )

  const activeProductFilterCount = [
    appliedProductFilters.stockStatus !== defaultProductFilters.stockStatus,
    appliedProductFilters.category,
    appliedProductFilters.brand,
    appliedProductFilters.supplier,
    appliedProductFilters.dosageForm,
  ].filter(Boolean).length

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return allItems.filter((item) =>
      (!normalizedSearch ||
        [
          getProductDisplayName(item),
          getPurchaseItemDisplayName(item),
          item.batchNumber,
          item.brand,
          item.category,
          item.supplier,
          item.dosageForm,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)) &&
      (appliedProductFilters.stockStatus === "all" ||
        (appliedProductFilters.stockStatus === "low-stock"
          ? isLowStock(item)
          : !isLowStock(item))) &&
      (!appliedProductFilters.category ||
        item.category === appliedProductFilters.category) &&
      (!appliedProductFilters.brand ||
        item.brand === appliedProductFilters.brand) &&
      (!appliedProductFilters.supplier ||
        item.supplier === appliedProductFilters.supplier) &&
      (!appliedProductFilters.dosageForm ||
        item.dosageForm === appliedProductFilters.dosageForm)
    )
  }, [allItems, appliedProductFilters, searchTerm])

  const entriesPerPage = Number(entriesToShow)
  const totalEntries = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * entriesPerPage
    : 0
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries)
  const visibleItems = filteredItems.slice(startIndex, endIndex)
  const visibleItemIds = visibleItems.map((item) => item.id)
  const selectedVisibleItemCount = visibleItemIds.filter((itemId) =>
    Boolean(quickList[itemId])
  ).length
  const allVisibleItemsSelected =
    visibleItemIds.length > 0 && selectedVisibleItemCount === visibleItemIds.length
  const someVisibleItemsSelected =
    selectedVisibleItemCount > 0 && !allVisibleItemsSelected
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)

  const selectedItems = allItems.filter((item) => quickList[item.id])
  const selectedItemCount = selectedItems.length
  const totalOrderQuantity = selectedItems.reduce(
    (totalQuantity, item) => totalQuantity + Number(quickList[item.id] ?? 0),
    0
  )
  const totalAmount = selectedItems.reduce(
    (total, item) =>
      total + Number(item.costPrice) * Number(quickList[item.id] ?? 0),
    0
  )
  const requestedByName = requestedBy ?? "Branch Admin"
  const filteredPurchaseRequests =
    requestStatusFilter === "All"
      ? purchaseRequests
      : purchaseRequests.filter(
          (request) => request.status === requestStatusFilter
        )
  const requestStatusTabs = ["All", "Pending", "Approved", "Denied"].map(
    (status) => ({
      id: status,
      label: status,
      count:
        status === "All"
          ? purchaseRequests.length
          : purchaseRequests.filter((request) => request.status === status)
              .length,
    })
  )

  const toggleItem = (item) => {
    setQuickList((currentList) => {
      if (currentList[item.id]) {
        const nextList = { ...currentList }
        delete nextList[item.id]
        return nextList
      }

      return {
        ...currentList,
        [item.id]: getDefaultOrderQuantity(item),
      }
    })
  }

  const toggleVisibleItems = () => {
    setQuickList((currentList) => {
      if (allVisibleItemsSelected) {
        const nextList = { ...currentList }

        visibleItemIds.forEach((itemId) => {
          delete nextList[itemId]
        })

        return nextList
      }

      return visibleItems.reduce(
        (nextList, item) => ({
          ...nextList,
          [item.id]: nextList[item.id] ?? getDefaultOrderQuantity(item),
        }),
        currentList
      )
    })
  }

  const updateOrderQuantity = (itemId, nextQuantity) => {
    const safeQuantity = Math.max(Number(nextQuantity) || 1, 1)

    setQuickList((currentList) => ({
      ...currentList,
      [itemId]: safeQuantity,
    }))
  }

  const handleOpenFilters = () => {
    setPendingProductFilters(appliedProductFilters)
    setIsFilterOpen((isOpen) => !isOpen)
  }

  const updatePendingProductFilter = (filterName, value) => {
    setPendingProductFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }))
  }

  const handleApplyFilters = () => {
    setAppliedProductFilters(pendingProductFilters)
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setPendingProductFilters(defaultProductFilters)
    setAppliedProductFilters(defaultProductFilters)
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleClearAll = () => {
    setQuickList({})
  }

  const handleOpenRequestModal = () => {
    if (!selectedItems.length) {
      showWarning("Choose at least one product.", {
        title: "Empty quick list",
      })
      return
    }

    setIsRequestModalOpen(true)
  }

  const handleSubmitRequest = () => {
    const newRequest = {
      id: getNextRequisitionNumber(purchaseRequests),
      dateRequested: getRequisitionDateDisplay(),
      timeRequested: getRequisitionTimeDisplay(),
      requestedBy: requestedByName,
      status: "Pending",
      items: selectedItems.map((item) => ({
        id: item.id,
        productName: getPurchaseItemDisplayName(item),
        batchNumber: item.batchNumber,
        brand: item.brand,
        dosageForm: item.dosageForm,
        quantity: Number(quickList[item.id]) || 1,
        costPrice: Number(item.costPrice) || 0,
      })),
    }

    setPurchaseRequests((currentRequests) => [newRequest, ...currentRequests])
    setQuickList({})
    setIsRequestModalOpen(false)
    setIsConfirmRequestModalOpen(false)
    showSuccess("Purchase request submitted.", {
      title: "Request sent",
    })
  }

  return (
    <>
      <div className="flex w-full min-h-[56rem] min-w-0 flex-col rounded-3xl border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 xl:h-[calc(100dvh-6rem)] xl:min-h-[54rem] 2xl:h-[calc(100dvh-5rem)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full sm:w-96">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </label>

          <div className="flex min-w-0 items-center gap-3">
            <div ref={filterPopoverRef} className="relative">
              <button
                type="button"
                onClick={handleOpenFilters}
                className={`relative grid h-11 w-11 place-items-center rounded-xl border bg-white transition ${
                  activeProductFilterCount
                    ? "border-[#0b6b51]/50 text-[#0b6b51]"
                    : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
                }`}
                aria-label="Filter products"
                aria-expanded={isFilterOpen}
              >
                <FiFilter className="h-5 w-5" />
                {activeProductFilterCount > 0 && (
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
                      {productStockFilterOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                          <input
                            type="radio"
                            name="purchase-product-stock-status"
                            checked={
                              pendingProductFilters.stockStatus === option.id
                            }
                            onChange={() =>
                              updatePendingProductFilter(
                                "stockStatus",
                                option.id
                              )
                            }
                            className="h-4 w-4 border-slate-300 accent-[#0b6b51]"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <ProductFilterSelect
                      label="Category"
                      value={pendingProductFilters.category}
                      onChange={(value) =>
                        updatePendingProductFilter("category", value)
                      }
                      options={productFilterOptions.categories}
                      placeholder="All Categories"
                    />
                    <ProductFilterSelect
                      label="Brand"
                      value={pendingProductFilters.brand}
                      onChange={(value) =>
                        updatePendingProductFilter("brand", value)
                      }
                      options={productFilterOptions.brands}
                      placeholder="All Brands"
                    />
                    <ProductFilterSelect
                      label="Supplier"
                      value={pendingProductFilters.supplier}
                      onChange={(value) =>
                        updatePendingProductFilter("supplier", value)
                      }
                      options={productFilterOptions.suppliers}
                      placeholder="All Suppliers"
                    />
                    <ProductFilterSelect
                      label="Dosage Form"
                      value={pendingProductFilters.dosageForm}
                      onChange={(value) =>
                        updatePendingProductFilter("dosageForm", value)
                      }
                      options={productFilterOptions.dosageForms}
                      placeholder="All Dosage Forms"
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

            <button
              type="button"
              onClick={() => {
                setIsRequestsModalOpen(true)
                setSelectedRequest(null)
              }}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0b6b51] bg-white px-5 text-sm font-extrabold text-[#0b6b51] transition hover:bg-emerald-50 sm:flex-none"
            >
              <FiList className="h-5 w-5" />
              View Requests
            </button>
          </div>
        </div>

        <section className="mt-5 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 xl:flex xl:min-h-0 xl:flex-col">
            <div className="grid max-h-[58rem] gap-3 overflow-y-auto p-3 xl:hidden">
              {visibleItems.length ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                  <p className="text-xs font-extrabold text-slate-600">
                    {selectedVisibleItemCount} of {visibleItems.length} shown selected
                  </p>
                  <button
                    type="button"
                    onClick={toggleVisibleItems}
                    className="text-xs font-extrabold text-[#0b6b51] transition hover:text-[#005348]"
                  >
                    {allVisibleItemsSelected ? "Clear Shown" : "Select Shown"}
                  </button>
                </div>
              ) : null}

              {visibleItems.map((item) => {
                const isChecked = Boolean(quickList[item.id])
                const itemIsLowStock = isLowStock(item)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      isChecked
                        ? "border-[#0b6b51]/40 bg-emerald-50/30"
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                          isChecked
                            ? "border-[#00675b] bg-[#00675b] text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                      </span>

                      <ProductThumb item={item} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-extrabold text-slate-900">
                            {getPurchaseItemDisplayName(item)}
                          </h3>
                          {itemIsLowStock && <LowStockBadge />}
                        </div>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {item.batchNumber}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                      <ProductInfo label="Brand" value={item.brand} />
                      <ProductInfo label="Category" value={item.category} />
                      <ProductInfo label="Dosage Form" value={item.dosageForm} />
                      <ProductInfo
                        label="Cost Price"
                        value={formatPeso(item.costPrice)}
                      />
                      <ProductInfo
                        label="Current Qty"
                        value={getProductQuantity(item)}
                        strong
                      />
                    </div>
                  </button>
                )
              })}

              {!totalEntries && (
                <div className="grid min-h-96 place-items-center text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    No products found.
                  </p>
                </div>
              )}
            </div>

            <div className="hidden min-h-0 flex-1 overflow-auto pb-2 xl:block">
              <table className="w-full min-w-[1080px] table-fixed border-separate border-spacing-0 text-left">
                <colgroup>
                  <col className="w-[105px]" />
                  <col className="w-[130px]" />
                  <col className="w-[250px]" />
                  <col className="w-[110px]" />
                  <col className="w-[115px]" />
                  <col className="w-[130px]" />
                  <col className="w-[110px]" />
                  <col className="w-[110px]" />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                    <th className="px-4 py-4 text-center">
                      <input
                        ref={(checkbox) => {
                          if (checkbox) {
                            checkbox.indeterminate = someVisibleItemsSelected
                          }
                        }}
                        type="checkbox"
                        checked={allVisibleItemsSelected}
                        disabled={!visibleItems.length}
                        onChange={toggleVisibleItems}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed"
                        aria-label="Select all visible purchase requisition products"
                      />
                    </th>
                    <th className="px-4 py-4">Image</th>
                    <th className="px-4 py-4">Product</th>
                    <th className="px-4 py-4">Brand</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Dosage Form</th>
                    <th className="px-4 py-4">Cost Price</th>
                    <th className="px-4 py-4 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const isChecked = Boolean(quickList[item.id])

                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            toggleItem(item)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="border-b border-slate-100 px-4 py-4">
                          <span
                            className={`mx-auto grid h-5 w-5 place-items-center rounded-md border ${
                              isChecked
                                ? "border-[#00675b] bg-[#00675b] text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <ProductThumb item={item} />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <span className="flex flex-wrap items-center gap-2 font-extrabold text-slate-900">
                            {getPurchaseItemDisplayName(item)}
                            {isLowStock(item) && <LowStockBadge />}
                          </span>
                          <span className="mt-1 block text-sm font-bold text-slate-400">
                            {item.batchNumber}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {item.brand}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {item.category}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {item.dosageForm}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {formatPeso(item.costPrice)}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-slate-900">
                          {getProductQuantity(item)}
                        </td>
                      </tr>
                    )
                  })}

                  {!totalEntries && (
                    <tr>
                      <td colSpan={8} className="px-4 py-24 text-center">
                        <p className="text-sm font-semibold text-slate-500">
                          No products found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 text-sm font-semibold text-slate-500 lg:flex-row lg:items-center lg:justify-between">
              <p>
                Showing {totalEntries ? startIndex + 1 : 0} to {endIndex} of{" "}
                {totalEntries} entries
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="relative block min-w-[8.5rem]">
                  <span className="sr-only">Entries per page</span>
                  <select
                    value={entriesToShow}
                    onChange={(event) => {
                      setEntriesToShow(event.target.value)
                      setCurrentPage(1)
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
                      setCurrentPage(Math.max(safeCurrentPage - 1, 1))
                    }
                    disabled={safeCurrentPage === 1 || !totalEntries}
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
                        aria-current={
                          safeCurrentPage === page ? "page" : undefined
                        }
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
                      setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))
                    }
                    disabled={safeCurrentPage === totalPages || !totalEntries}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col gap-5">
            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Quick List
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-[#0b6b51]">
                    {selectedItemCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-500 transition hover:text-red-600"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Clear All
                </button>
              </div>

              <div className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <span className="mt-4 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#00675b] text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <ProductThumb item={item} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {getPurchaseItemDisplayName(item)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {item.batchNumber}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                          aria-label={`Remove ${getPurchaseItemDisplayName(item)}`}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500">
                          Quantity
                        </p>
                        <div className="mt-2 grid h-10 w-full max-w-52 grid-cols-[42px_minmax(0,1fr)_46px] overflow-hidden rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderQuantity(
                                item.id,
                                Number(quickList[item.id]) - 1
                              )
                            }
                            className="grid place-items-center text-slate-500 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                            aria-label={`Decrease ${getPurchaseItemDisplayName(item)} order quantity`}
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quickList[item.id]}
                            onChange={(event) =>
                              updateOrderQuantity(item.id, event.target.value)
                            }
                            className="border-x border-slate-200 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label={`${getPurchaseItemDisplayName(item)} order quantity`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderQuantity(
                                item.id,
                                Number(quickList[item.id]) + 1
                              )
                            }
                            className="grid place-items-center pr-1 text-[#0b6b51] transition hover:bg-slate-50"
                            aria-label={`Increase ${getPurchaseItemDisplayName(item)} order quantity`}
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!selectedItems.length && (
                  <div className="grid h-full min-h-64 place-items-center text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      Choose products for the quick list.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                <span>Total Items</span>
                <span className="text-slate-900">{selectedItemCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm font-bold text-slate-600">
                <span>Total Qty to Order</span>
                <span className="text-slate-900">{totalOrderQuantity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-600">
                <span>Estimated Amount</span>
                <span className="text-[#0b6b51]">{formatPeso(totalAmount)}</span>
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleOpenRequestModal}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#00675b] px-7 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348] sm:w-auto"
          >
            Request
            <FiArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isRequestModalOpen && (
        <RequestSummaryModal
          quickList={quickList}
          requisitionDate={getRequisitionDateDisplay()}
          requisitionNumber={getNextRequisitionNumber(purchaseRequests)}
          requestedByName={requestedByName}
          selectedItemCount={selectedItemCount}
          selectedItems={selectedItems}
          onCancel={() => setIsRequestModalOpen(false)}
          onRequest={() => setIsConfirmRequestModalOpen(true)}
          totalAmount={totalAmount}
          totalQuantity={totalOrderQuantity}
        />
      )}

      {isConfirmRequestModalOpen && (
        <ConfirmRequestModal
          onCancel={() => setIsConfirmRequestModalOpen(false)}
          onConfirm={handleSubmitRequest}
        />
      )}

      {isRequestsModalOpen && (
        <RequestsHistoryModal
          filteredRequests={filteredPurchaseRequests}
          requestStatusFilter={requestStatusFilter}
          requestStatusTabs={requestStatusTabs}
          selectedRequest={selectedRequest}
          onBackToList={() => setSelectedRequest(null)}
          onClose={() => {
            setIsRequestsModalOpen(false)
            setSelectedRequest(null)
          }}
          onSelectRequest={setSelectedRequest}
          onStatusFilterChange={(status) => {
            setRequestStatusFilter(status)
            setSelectedRequest(null)
          }}
        />
      )}
    </>
  )
}

function ProductInfo({ label, strong = false, value }) {
  return (
    <div>
      <p className="uppercase tracking-[0.03em] text-slate-400">{label}</p>
      <p className={`mt-1 ${strong ? "text-slate-900" : "text-slate-700"}`}>
        {value}
      </p>
    </div>
  )
}

function LowStockBadge() {
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-amber-100 px-2 text-[11px] font-extrabold text-amber-700">
      Low Stock
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex h-7 min-w-20 items-center justify-center rounded-md px-3 text-xs font-extrabold ${getStatusClassName(
        status
      )}`}
    >
      {status}
    </span>
  )
}

function RequestSummaryModal({
  onCancel,
  onRequest,
  quickList,
  requisitionDate,
  requisitionNumber,
  requestedByName,
  selectedItemCount,
  selectedItems,
  totalAmount,
  totalQuantity,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Close request summary"
      />
      <section className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#0b6b51] sm:h-14 sm:w-14">
              <FiSend className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
                Request Summary
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Review the items below before submitting.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 p-4 sm:p-5 lg:grid-cols-3">
          <label>
            <span className="text-sm font-extrabold text-slate-700">
              Requisition No.
            </span>
            <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
              {requisitionNumber}
              <FiCheck className="h-4 w-4 text-[#0b6b51]" />
            </div>
          </label>
          <label>
            <span className="text-sm font-extrabold text-slate-700">Date</span>
            <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
              {requisitionDate}
              <FiCalendar className="h-4 w-4 text-slate-500" />
            </div>
          </label>
          <label>
            <span className="text-sm font-extrabold text-slate-700">
              Requested By
            </span>
            <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
              {requestedByName}
              <FiUser className="h-4 w-4 text-slate-500" />
            </div>
          </label>
        </div>

        <div className="mt-5 grid min-h-0 flex-1 gap-3 overflow-y-auto md:hidden">
          {selectedItems.map((item) => {
            const quantityToOrder = Number(quickList[item.id]) || 0
            const subTotal = Number(item.costPrice) * quantityToOrder

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb item={item} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                      {getPurchaseItemDisplayName(item)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {item.batchNumber}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                  <ProductInfo label="Brand" value={item.brand} />
                  <ProductInfo label="Dosage Form" value={item.dosageForm} />
                  <ProductInfo
                    label="Cost Price"
                    value={formatPeso(item.costPrice)}
                  />
                  <ProductInfo label="Quantity" value={quantityToOrder} />
                  <div className="col-span-2">
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Sub Total
                    </p>
                    <p className="mt-1 font-extrabold text-[#0b6b51]">
                      {formatPeso(subTotal)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-5 hidden min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100 md:block">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-emerald-50/60 text-sm font-extrabold text-[#0b6b51]">
                <th className="px-4 py-4">Product Name</th>
                <th className="px-4 py-4">Brand Name</th>
                <th className="px-4 py-4">Dosage Form</th>
                <th className="px-4 py-4">Cost Price</th>
                <th className="px-4 py-4">Quantity</th>
                <th className="px-4 py-4 text-right">Sub Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => {
                const quantityToOrder = Number(quickList[item.id]) || 0
                const subTotal = Number(item.costPrice) * quantityToOrder

                return (
                  <tr
                    key={item.id}
                    className="text-sm font-semibold text-slate-700"
                  >
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ProductThumb item={item} />
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {getPurchaseItemDisplayName(item)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {item.batchNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {item.brand}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {item.dosageForm}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {formatPeso(item.costPrice)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {quantityToOrder}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                      {formatPeso(subTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-4 sm:items-end">
          <div className="w-full max-w-sm rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="text-slate-950">{selectedItemCount}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
              <span>Total Quantity:</span>
              <span className="text-slate-950">{totalQuantity}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
              <span>Total Amount:</span>
              <span className="text-[#0b6b51]">{formatPeso(totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <FiArrowLeft className="h-5 w-5" />
              Back
            </button>
            <button
              type="button"
              onClick={onRequest}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00675b] px-10 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348]"
            >
              <FiSend className="h-5 w-5" />
              Request
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ConfirmRequestModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Close confirmation"
      />
      <section className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-[#0b6b51]">
          <FiSend className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
          Submit purchase request?
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Are you sure you want to submit this purchase request?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348]"
          >
            Yes
          </button>
        </div>
      </section>
    </div>
  )
}

function RequestsHistoryModal({
  filteredRequests,
  onBackToList,
  onClose,
  onSelectRequest,
  onStatusFilterChange,
  requestStatusFilter,
  requestStatusTabs,
  selectedRequest,
}) {
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = Number(entriesToShow)
  const totalEntries = filteredRequests.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * entriesPerPage
    : 0
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries)
  const visibleRequests = filteredRequests.slice(startIndex, endIndex)
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close requests"
      />
      <section className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:h-[min(760px,92vh)] sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          aria-label="Close requests"
        >
          <FiX className="h-5 w-5" />
        </button>

        {selectedRequest ? (
          <RequestDetails request={selectedRequest} onBack={onBackToList} />
        ) : (
          <>
            <div className="min-w-0 pr-10">
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Purchase Requests
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Track pending, approved, and denied requisitions.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {requestStatusTabs.map((tab) => {
                const isSelected = requestStatusFilter === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                      isSelected
                        ? "border-[#00675b] bg-[#00675b] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-left">
                <colgroup>
                  <col className="w-[190px]" />
                  <col className="w-[180px]" />
                  <col className="w-[120px]" />
                  <col className="w-[110px]" />
                  <col className="w-[140px]" />
                  <col className="w-[90px]" />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                    <th className="px-4 py-4">Date Requested</th>
                    <th className="px-4 py-4">Requisition No.</th>
                    <th className="px-4 py-4">Items</th>
                    <th className="px-4 py-4">Qty</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="text-sm font-semibold text-slate-700"
                    >
                      <td className="border-b border-slate-100 px-4 py-4">
                        <span className="block font-extrabold text-slate-900">
                          {request.dateRequested}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-slate-400">
                          {request.timeRequested}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-slate-900">
                        {request.id}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        {request.items.length}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        {getRequestTotalQuantity(request)}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <button
                          type="button"
                          onClick={() => onSelectRequest(request)}
                          className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-[#0b6b51] transition hover:bg-emerald-50"
                          aria-label={`View details for ${request.id}`}
                          title={`View details for ${request.id}`}
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!totalEntries && (
                    <tr>
                      <td colSpan={6} className="px-4 py-20 text-center">
                        <p className="text-sm font-semibold text-slate-500">
                          No requests found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {totalEntries ? startIndex + 1 : 0} to {endIndex} of{" "}
                {totalEntries} entries
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="relative block min-w-[8.5rem]">
                  <span className="sr-only">Entries per page</span>
                  <select
                    value={entriesToShow}
                    onChange={(event) => {
                      setEntriesToShow(event.target.value)
                      setCurrentPage(1)
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
                      setCurrentPage(Math.max(safeCurrentPage - 1, 1))
                    }
                    disabled={safeCurrentPage === 1 || !totalEntries}
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
                        aria-current={
                          safeCurrentPage === page ? "page" : undefined
                        }
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
                      setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))
                    }
                    disabled={safeCurrentPage === totalPages || !totalEntries}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function RequestDetails({ onBack, request }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 pr-10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#0b6b51]">
            <FiEye className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Request Details
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {request.id}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-100 p-4 sm:p-5 lg:grid-cols-4">
        <DetailItem icon={FiList} label="Requisition No." value={request.id} />
        <DetailItem
          icon={FiCalendar}
          label="Date Requested"
          value={request.dateRequested}
        />
        <DetailItem icon={FiClock} label="Time" value={request.timeRequested} />
        <DetailItem
          icon={FiUser}
          label="Requested By"
          value={request.requestedBy}
        />
        <div>
          <span className="text-sm font-extrabold text-slate-700">Status</span>
          <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 px-4">
            <StatusBadge status={request.status} />
          </div>
        </div>
        <DetailItem label="Total Items" value={request.items.length} />
        <DetailItem label="Total Qty" value={getRequestTotalQuantity(request)} />
        <DetailItem
          label="Estimated Amount"
          value={formatPeso(getRequestTotalAmount(request))}
        />
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100">
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[260px]" />
            <col className="w-[130px]" />
            <col className="w-[145px]" />
            <col className="w-[120px]" />
            <col className="w-[90px]" />
            <col className="w-[130px]" />
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-emerald-50/60 text-sm font-extrabold text-[#0b6b51]">
              <th className="px-4 py-4">Product Name</th>
              <th className="px-4 py-4">Brand</th>
              <th className="px-4 py-4">Dosage Form</th>
              <th className="px-4 py-4">Cost Price</th>
              <th className="px-4 py-4">Qty</th>
              <th className="px-4 py-4 text-right">Sub Total</th>
            </tr>
          </thead>
          <tbody>
            {request.items.map((item) => (
              <tr
                key={`${request.id}-${item.id}`}
                className="text-sm font-semibold text-slate-700"
              >
                <td className="border-b border-slate-100 px-4 py-4">
                  <p className="font-extrabold text-slate-900">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {item.batchNumber}
                  </p>
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {item.brand}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {item.dosageForm}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {formatPeso(item.costPrice)}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-slate-900">
                  {item.quantity}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                  {formatPeso(Number(item.costPrice) * Number(item.quantity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
        >
          <FiArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>
    </>
  )
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
        <span className="truncate">{value}</span>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
      </div>
    </div>
  )
}

export default AdminPurchaseRequisition
