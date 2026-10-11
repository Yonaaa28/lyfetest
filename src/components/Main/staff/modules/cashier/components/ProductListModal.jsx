import { useEffect, useMemo, useRef, useState } from "react"
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiFilter,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTag,
  FiX,
} from "react-icons/fi"

import {
  defaultInventoryFilters,
  getInventoryFilterOptions,
  stockStatusFilterOptions,
} from "../../../../admin/modules/inventory/utils/inventoryModuleUtils"
import ProductThumb from "../../../../../shared/inventory/ProductThumb"
import {
  formatPeso,
  getPaginationItems,
  getItemUnits,
  getProductTableDisplayName,
  isLowStock,
  isNearExpiry,
  isOutOfStock,
} from "../../../../../shared/inventory/inventoryUtils"
import {
  getActiveProductDiscountForProduct,
  getCashierProductPrice,
  getCashierUnitMaxQuantity,
  getDefaultCashierUnit,
  getDiscountValueLabel,
} from "../utils/cashierUtils"

const productTabs = [
  { id: "all", label: "All" },
  { id: "products", label: "Products" },
  { id: "bundle", label: "Bundle" },
  { id: "promo", label: "Promo" },
]

function ScrollableFilterSelect({ label, value, onChange, options, placeholder }) {
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
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition placeholder:text-slate-400 hover:border-[#0b6b51]/40 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          role="combobox"
          aria-expanded={isOpen}
        />
        <FiChevronDown
          onClick={() => {
            setIsOpen((currentState) => !currentState)
            inputRef.current?.focus()
          }}
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          } absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer`}
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

function ProductListModal({
  products,
  cartItems,
  productDiscounts,
  onClose,
  onAddProduct,
}) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState(defaultInventoryFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultInventoryFilters)
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

  const productsWithPromo = useMemo(
    () =>
      products.map((product) => ({
        product,
        promo: getActiveProductDiscountForProduct({
          product,
          productDiscounts,
        }),
      })),
    [products, productDiscounts]
  )

  const tabCounts = useMemo(
    () =>
      productTabs.reduce((counts, tab) => {
        if (tab.id === "bundle") {
          return { ...counts, [tab.id]: 0 }
        }

        if (tab.id === "promo") {
          return {
            ...counts,
            [tab.id]: productsWithPromo.filter(({ promo }) => promo).length,
          }
        }

        if (tab.id === "products") {
          return {
            ...counts,
            [tab.id]: productsWithPromo.filter(({ promo }) => !promo).length,
          }
        }

        return { ...counts, [tab.id]: productsWithPromo.length }
      }, {}),
    [productsWithPromo]
  )
  const filterOptions = useMemo(
    () => getInventoryFilterOptions(products),
    [products]
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (activeTab === "bundle") {
      return []
    }

    return productsWithPromo.filter(({ product, promo }) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "promo" && promo) ||
        (activeTab === "products" && !promo)

      if (!matchesTab) {
        return false
      }

      const selectedStatuses = appliedFilters.stockStatuses
      const matchesStockStatus =
        !selectedStatuses.length ||
        selectedStatuses.some((status) => {
          if (status === "lowStock") {
            return isLowStock(product)
          }

          if (status === "expiringSoon") {
            return isNearExpiry(product)
          }

          return isOutOfStock(product)
        })
      const matchesCategory =
        !appliedFilters.category || product.category === appliedFilters.category
      const matchesBrand =
        !appliedFilters.brand || product.brand === appliedFilters.brand
      const matchesSupplier =
        !appliedFilters.supplier || product.supplier === appliedFilters.supplier
      const matchesItemUnit =
        !appliedFilters.itemUnit ||
        getItemUnits(product).some(
          (unit) => unit.itemUnit === appliedFilters.itemUnit
        )

      const searchableText = [
        getProductTableDisplayName(product),
        product.barcode,
        product.brand,
        product.category,
        product.itemUnit,
        product.batchNumber,
        promo?.code,
        promo?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return (
        matchesStockStatus &&
        matchesCategory &&
        matchesBrand &&
        matchesSupplier &&
        matchesItemUnit &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      )
    })
  }, [activeTab, appliedFilters, productsWithPromo, searchTerm])

  const entriesPerPage = Number(entriesToShow)
  const totalEntries = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries ? (safeCurrentPage - 1) * entriesPerPage : 0
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries)
  const visibleProducts = filteredProducts.slice(startIndex, endIndex)
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)
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
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setPendingFilters(defaultInventoryFilters)
    setAppliedFilters(defaultInventoryFilters)
    setCurrentPage(1)
  }

  const handleAddProduct = (product) => {
    onAddProduct(product)
    setSearchTerm("")
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-6 py-6 backdrop-blur-sm">
      <div className="flex h-[min(88vh,48rem)] w-[min(88vw,92rem)] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_26px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">
              Product List
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close product list"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {productTabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                      isActive
                        ? "border-[#00675b] bg-[#00675b] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tabCounts[tab.id] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
              <label className="relative block w-[min(100%,24rem)]">
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search product, barcode, category..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                />
                <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </label>

              <div ref={filterPopoverRef} className="relative">
                <button
                  type="button"
                  onClick={handleOpenFilters}
                  className={`relative grid h-11 w-11 place-items-center rounded-xl border bg-white transition ${
                    activeFilterCount
                      ? "border-[#0b6b51]/50 text-[#0b6b51]"
                      : "border-slate-200 text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
                  }`}
                  aria-label="Filter products"
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
                      <ScrollableFilterSelect
                        label="Category"
                        value={pendingFilters.category}
                        onChange={(value) =>
                          updatePendingFilter("category", value)
                        }
                        options={filterOptions.categories}
                        placeholder="All Categories"
                      />
                      <ScrollableFilterSelect
                        label="Brand"
                        value={pendingFilters.brand}
                        onChange={(value) => updatePendingFilter("brand", value)}
                        options={filterOptions.brands}
                        placeholder="All Brands"
                      />
                      <ScrollableFilterSelect
                        label="Supplier"
                        value={pendingFilters.supplier}
                        onChange={(value) =>
                          updatePendingFilter("supplier", value)
                        }
                        options={filterOptions.suppliers}
                        placeholder="All Suppliers"
                      />
                      <ScrollableFilterSelect
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
        </div>

        <div className="flex min-h-[30rem] flex-1 flex-col overflow-hidden px-6 py-5">
          {activeTab === "bundle" ? (
            <div className="grid min-h-full place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
              <div>
                <FiPackage className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-extrabold text-slate-600">
                  No bundles available.
                </p>
              </div>
            </div>
          ) : filteredProducts.length ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500 shadow-[0_1px_0_rgba(226,232,240,1)]">
                    <th className="rounded-l-xl bg-slate-50 px-4 py-4">Image</th>
                    <th className="bg-slate-50 px-4 py-4">Product Name</th>
                    <th className="bg-slate-50 px-4 py-4">Barcode</th>
                    <th className="bg-slate-50 px-4 py-4">Category</th>
                    <th className="bg-slate-50 px-4 py-4 text-center">Stock</th>
                    <th className="bg-slate-50 px-4 py-4 text-right">
                      Unit Price
                    </th>
                    <th className="bg-slate-50 px-4 py-4">Promo</th>
                    <th className="rounded-r-xl bg-slate-50 px-4 py-4 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map(({ product, promo }) => {
                    const defaultUnit = getDefaultCashierUnit(product)
                    const maxQuantity = getCashierUnitMaxQuantity({
                      cartItems,
                      product,
                      selectedUnit: defaultUnit,
                    })
                    const outOfStock = isOutOfStock(product)
                    const lowStock = isLowStock(product)

                    return (
                      <tr
                        key={`${product.id}-${product.batchNumber ?? ""}`}
                        className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="border-b border-slate-100 px-4 py-4">
                          <ProductThumb
                            item={{
                              productName: getProductTableDisplayName(product),
                              image: product.image,
                              imageTone: product.imageTone,
                            }}
                          />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <p className="font-extrabold text-slate-900">
                            {getProductTableDisplayName(product)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {product.brand} | {defaultUnit}
                          </p>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {product.barcode}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {product.category}
                        </td>
                        <td
                          className={`border-b border-slate-100 px-4 py-4 text-center font-bold [font-variant-numeric:tabular-nums] ${
                            outOfStock
                              ? "text-red-500"
                              : lowStock
                                ? "text-amber-500"
                                : "text-slate-900"
                          }`}
                        >
                          {maxQuantity}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                          {formatPeso(
                            getCashierProductPrice(product, defaultUnit)
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          {promo ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                              <FiTag className="h-3.5 w-3.5" />
                              {promo.code} {getDiscountValueLabel(promo)}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              None
                            </span>
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4 text-center">
                          <button
                            type="button"
                            disabled={maxQuantity <= 0}
                            onClick={() => handleAddProduct(product)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b6b51] px-4 text-sm font-extrabold text-white transition hover:bg-[#08533f] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <FiPlus className="h-4 w-4" />
                            Add
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-full place-items-center text-center">
              <p className="text-sm font-semibold text-slate-500">
                No products found.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
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
                <option value="5">5 entries</option>
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
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
    </div>
  )
}

export default ProductListModal
