import { useEffect, useMemo, useState } from "react"
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiMoreVertical,
  FiRefreshCw,
  FiSearch,
  FiTag,
  FiTrash2,
} from "react-icons/fi"
import { HiOutlineArchiveBox } from "react-icons/hi2"

import ProductThumb from "../../../../../shared/inventory/ProductThumb"
import {
  formatDate,
  formatPeso,
  getPaginationItems,
  getProductTableDisplayName,
} from "../../../../../shared/inventory/inventoryUtils"
import BundleImage from "../../bundle/components/BundleImage"
import { mockInventoryItems } from "../../inventory/data/inventoryMockData"
import {
  getStoredProductDiscounts,
  saveStoredProductDiscounts,
} from "../../discounts/data/productDiscountMockData"
import {
  archiveSummaryCards as archiveSummaryCardConfigs,
  archiveTabs,
  archivedBundles as mockArchivedBundles,
  archivedProducts as mockArchivedProducts,
} from "../data/archiveMockData"

const PRODUCT_DISCOUNTS_UPDATED_EVENT = "lyfe-product-discounts-updated"

const formatArchivedDate = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue ?? Date.now()))

const getDiscountProductName = (productId) => {
  const product = mockInventoryItems.find((item) => item.id === productId)

  return product ? getProductTableDisplayName(product) : "Product not found"
}

function ArchiveSummaryCard({ card }) {
  const Icon = card.icon

  return (
    <article
      className={`min-w-0 rounded-2xl border border-white/70 p-3 ${card.cardClassName}`}
    >
      <div className="flex items-start gap-2 sm:gap-4">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl sm:h-9 sm:w-9 ${card.iconClassName}`}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-700 sm:text-sm">
            {card.label}
          </p>
          <p className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl">
            {String(card.value).padStart(2, "0")}
          </p>
        </div>
      </div>
    </article>
  )
}

function ArchiveActionMenu({ record, isOpen, onToggle, onRestore, onDelete }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle(record.id)
        }}
        className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
        aria-label={`Archive actions for ${
          record.displayName ?? record.name ?? record.strength ?? "record"
        }`}
        aria-expanded={isOpen}
      >
        <FiMoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 z-10 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onRestore(record)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
          >
            <FiRefreshCw className="h-4 w-4" />
            Restore
          </button>
          <button
            type="button"
            onClick={() => onDelete(record)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function ArchivedDiscountValue({ discount }) {
  return discount.discountType === "percentage"
    ? `${discount.discountValue}%`
    : formatPeso(discount.discountValue)
}

function ArchivedDiscountStatus({ status }) {
  return (
    <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {status}
    </span>
  )
}

function ArchiveMobileCards({
  archiveType,
  records,
  openActionId,
  onToggleAction,
  onRestore,
  onDelete,
}) {
  if (!records.length) {
    return (
      <div className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-slate-100 text-center xl:hidden">
        <p className="text-sm font-semibold text-slate-500">
          No archived records found.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-3 xl:hidden">
      {records.map((record) => {
        if (archiveType === "products") {
          return (
            <article
              key={record.id}
              className="rounded-2xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <ProductThumb item={record} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">
                        {record.displayName}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {record.productId}
                      </p>
                    </div>
                    <ArchiveActionMenu
                      record={record}
                      isOpen={openActionId === record.id}
                      onToggle={onToggleAction}
                      onRestore={onRestore}
                      onDelete={onDelete}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Brand
                      </p>
                      <p className="mt-1 text-slate-700">{record.brand}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Category
                      </p>
                      <p className="mt-1 text-slate-700">{record.category}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Dosage Form
                      </p>
                      <p className="mt-1 text-slate-700">
                        {record.dosageForm}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Archived On
                      </p>
                      <p className="mt-1 text-slate-700">
                        {formatArchivedDate(record.archivedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        }

        if (archiveType === "bundles") {
          return (
            <article
              key={record.id}
              className="rounded-2xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <BundleImage bundle={record} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">
                        {record.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {record.bundleCode}
                      </p>
                    </div>
                    <ArchiveActionMenu
                      record={record}
                      isOpen={openActionId === record.id}
                      onToggle={onToggleAction}
                      onRestore={onRestore}
                      onDelete={onDelete}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 text-xs font-bold text-slate-500">
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Included Items
                      </p>
                      <p className="mt-1 whitespace-pre-line text-slate-700">
                        {record.includedItems
                          .map(
                            (item) => `${item.productName} x${item.quantity}`
                          )
                          .join("\n")}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Archived On
                      </p>
                      <p className="mt-1 text-slate-700">
                        {formatArchivedDate(record.archivedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        }

        if (archiveType === "discounts") {
          return (
            <article
              key={record.id}
              className="rounded-2xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
                  <FiTag className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">
                        {record.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {record.code}
                      </p>
                    </div>
                    <ArchiveActionMenu
                      record={record}
                      isOpen={openActionId === record.id}
                      onToggle={onToggleAction}
                      onRestore={onRestore}
                      onDelete={onDelete}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Product
                      </p>
                      <p className="mt-1 text-slate-700">
                        {record.productName}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Value
                      </p>
                      <p className="mt-1 text-slate-700">
                        <ArchivedDiscountValue discount={record} />
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Period
                      </p>
                      <p className="mt-1 text-slate-700">
                        {formatDate(record.startDate)} -{" "}
                        {formatDate(record.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Archived On
                      </p>
                      <p className="mt-1 text-slate-700">
                        {formatArchivedDate(record.archivedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        }
        return null
      })}
    </div>
  )
}

function ProductsArchiveTable({
  products,
  openActionId,
  onToggleAction,
  onRestore,
  onDelete,
}) {
  const hasProducts = products.length > 0

  return (
    <div
      className={`mt-5 hidden min-h-0 flex-1 rounded-2xl border border-slate-100 xl:block ${
        hasProducts ? "overflow-auto" : "overflow-hidden"
      }`}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
            <th className="rounded-l-2xl px-4 py-4">Image</th>
            <th className="px-4 py-4">Product</th>
            <th className="px-4 py-4">Brand</th>
            <th className="px-4 py-4">Category</th>
            <th className="px-4 py-4">Dosage Form</th>
            <th className="px-4 py-4">Archived On</th>
            <th className="rounded-r-2xl px-4 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {hasProducts &&
            products.map((product) => (
            <tr
              key={product.id}
              className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <td className="border-b border-slate-100 px-4 py-4">
                <ProductThumb item={product} />
              </td>
              <td className="border-b border-slate-100 px-4 py-4">
                <div>
                  <p className="font-extrabold text-slate-900">
                    {product.displayName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {product.productId}
                  </p>
                </div>
              </td>
              <td className="border-b border-slate-100 px-4 py-4">
                {product.brand}
              </td>
              <td className="border-b border-slate-100 px-4 py-4">
                {product.category}
              </td>
              <td className="border-b border-slate-100 px-4 py-4">
                {product.dosageForm}
              </td>
              <td className="border-b border-slate-100 px-4 py-4">
                <span className="whitespace-pre-line">
                  {formatArchivedDate(product.archivedAt).replace(", ", "\n")}
                </span>
              </td>
              <td className="border-b border-slate-100 px-4 py-4 text-center">
                <ArchiveActionMenu
                  record={product}
                  isOpen={openActionId === product.id}
                  onToggle={onToggleAction}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              </td>
            </tr>
            ))}
        </tbody>
      </table>

      {!hasProducts && (
        <div className="grid min-h-full place-items-center text-center">
          <p className="text-sm font-semibold text-slate-500">
            No archived products found.
          </p>
        </div>
      )}
    </div>
  )
}

function BundlesArchiveTable({
  bundles,
  openActionId,
  onToggleAction,
  onRestore,
  onDelete,
}) {
  const hasBundles = bundles.length > 0

  return (
    <div
      className={`mt-5 hidden min-h-0 flex-1 rounded-2xl border border-slate-100 xl:block ${
        hasBundles ? "overflow-auto" : "overflow-hidden"
      }`}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
            <th className="rounded-l-2xl px-4 py-4">Bundle Image</th>
            <th className="px-4 py-4">Name</th>
            <th className="px-4 py-4">Included Items</th>
            <th className="px-4 py-4">Archived On</th>
            <th className="rounded-r-2xl px-4 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {hasBundles &&
            bundles.map((bundle) => (
              <tr
                key={bundle.id}
                className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <td className="border-b border-slate-100 px-4 py-4">
                  <BundleImage bundle={bundle} />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <p className="font-extrabold text-slate-900">
                    {bundle.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {bundle.bundleCode}
                  </p>
                </td>
                <td className="whitespace-pre-line border-b border-slate-100 px-4 py-4">
                  {bundle.includedItems
                    .map((item) => `${item.productName} x${item.quantity}`)
                    .join("\n")}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <span className="whitespace-pre-line">
                    {formatArchivedDate(bundle.archivedAt).replace(", ", "\n")}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-center">
                  <ArchiveActionMenu
                    record={bundle}
                    isOpen={openActionId === bundle.id}
                    onToggle={onToggleAction}
                    onRestore={onRestore}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {!hasBundles && (
        <div className="grid min-h-full place-items-center text-center">
          <p className="text-sm font-semibold text-slate-500">
            No archived bundles found.
          </p>
        </div>
      )}
    </div>
  )
}

function DiscountsArchiveTable({
  discounts,
  openActionId,
  onToggleAction,
  onRestore,
  onDelete,
}) {
  const hasDiscounts = discounts.length > 0

  return (
    <div
      className={`mt-5 hidden min-h-0 flex-1 rounded-2xl border border-slate-100 xl:block ${
        hasDiscounts ? "overflow-auto" : "overflow-hidden"
      }`}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
            <th className="rounded-l-2xl px-4 py-4">Discount</th>
            <th className="px-4 py-4">Product</th>
            <th className="px-4 py-4">Type</th>
            <th className="px-4 py-4 text-right">Value</th>
            <th className="px-4 py-4">Period</th>
            <th className="px-4 py-4">Previous Status</th>
            <th className="px-4 py-4">Archived On</th>
            <th className="rounded-r-2xl px-4 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {hasDiscounts &&
            discounts.map((discount) => (
              <tr
                key={discount.id}
                className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <td className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
                      <FiTag className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-900">
                        {discount.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {discount.code}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {discount.productName}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {discount.discountType === "fixed"
                    ? "Fixed Amount"
                    : "Percentage"}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                  <ArchivedDiscountValue discount={discount} />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <span className="whitespace-nowrap">
                    {formatDate(discount.startDate)} -{" "}
                    {formatDate(discount.endDate)}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <ArchivedDiscountStatus
                    status={discount.previousStatus ?? "Inactive"}
                  />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <span className="whitespace-pre-line">
                    {formatArchivedDate(discount.archivedAt).replace(", ", "\n")}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-center">
                  <ArchiveActionMenu
                    record={discount}
                    isOpen={openActionId === discount.id}
                    onToggle={onToggleAction}
                    onRestore={onRestore}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {!hasDiscounts && (
        <div className="grid min-h-full place-items-center text-center">
          <p className="text-sm font-semibold text-slate-500">
            No archived discounts found.
          </p>
        </div>
      )}
    </div>
  )
}

function ArchivesSettingsPanel({ branch }) {
  const activeBranchId = branch?.id

  const [activeArchiveTab, setActiveArchiveTab] = useState("products")
  const [archivedProducts, setArchivedProducts] = useState(mockArchivedProducts)
  const [archivedBundles, setArchivedBundles] = useState(mockArchivedBundles)
  const [discounts, setDiscounts] = useState(() => getStoredProductDiscounts())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionId, setOpenActionId] = useState(null)

  useEffect(() => {
    if (!openActionId) {
      return undefined
    }

    const closeActionMenu = () => {
      setOpenActionId(null)
    }

    document.addEventListener("click", closeActionMenu)

    return () => {
      document.removeEventListener("click", closeActionMenu)
    }
  }, [openActionId])

  useEffect(() => {
    const refreshDiscounts = () => {
      setDiscounts(getStoredProductDiscounts())
    }

    window.addEventListener(PRODUCT_DISCOUNTS_UPDATED_EVENT, refreshDiscounts)
    window.addEventListener("storage", refreshDiscounts)

    return () => {
      window.removeEventListener(
        PRODUCT_DISCOUNTS_UPDATED_EVENT,
        refreshDiscounts
      )
      window.removeEventListener("storage", refreshDiscounts)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const searchedProducts = normalizedSearch
      ? archivedProducts.filter((product) =>
          [
            product.displayName,
            product.productId,
            product.brand,
            product.category,
            product.dosageForm,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : archivedProducts

    return [...searchedProducts].sort((firstProduct, secondProduct) => {
      const firstDate = new Date(firstProduct.archivedAt).getTime()
      const secondDate = new Date(secondProduct.archivedAt).getTime()

      return sortOrder === "oldest"
        ? firstDate - secondDate
        : secondDate - firstDate
    })
  }, [archivedProducts, searchTerm, sortOrder])

  const filteredBundles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const searchedBundles = normalizedSearch
      ? archivedBundles.filter((bundle) =>
          [
            bundle.name,
            bundle.bundleCode,
            ...bundle.includedItems.map((item) => item.productName),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : archivedBundles

    return [...searchedBundles].sort((firstBundle, secondBundle) => {
      const firstDate = new Date(firstBundle.archivedAt).getTime()
      const secondDate = new Date(secondBundle.archivedAt).getTime()

      return sortOrder === "oldest"
        ? firstDate - secondDate
      : secondDate - firstDate
    })
  }, [archivedBundles, searchTerm, sortOrder])

  const filteredDiscounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const archivedDiscounts = discounts
      .filter((discount) =>
        activeBranchId ? discount.branchId === activeBranchId : true
      )
      .filter((discount) => discount.status === "Archived")
      .map((discount) => ({
        ...discount,
        archivedAt:
          discount.archivedAt ?? discount.updatedAt ?? `${discount.endDate}T00:00:00`,
        productName: getDiscountProductName(discount.productId),
      }))
    const searchedDiscounts = normalizedSearch
      ? archivedDiscounts.filter((discount) =>
          [
            discount.name,
            discount.code,
            discount.productName,
            discount.discountType,
            discount.discountValue,
            discount.previousStatus,
            discount.startDate,
            discount.endDate,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      : archivedDiscounts

    return [...searchedDiscounts].sort((firstDiscount, secondDiscount) => {
      const firstDate = new Date(firstDiscount.archivedAt).getTime()
      const secondDate = new Date(secondDiscount.archivedAt).getTime()

      return sortOrder === "oldest"
        ? firstDate - secondDate
        : secondDate - firstDate
    })
  }, [activeBranchId, discounts, searchTerm, sortOrder])

  const settingsArchiveSummaryCards = useMemo(
    () =>
      archiveSummaryCardConfigs.map((card) => {
        if (card.id === "products") {
          return { ...card, value: archivedProducts.length }
        }

        if (card.id === "bundles") {
          return { ...card, value: archivedBundles.length }
        }

        if (card.id === "discounts") {
          return { ...card, value: filteredDiscounts.length }
        }

        if (card.id === "all") {
          return {
            ...card,
            value:
              archivedProducts.length +
              archivedBundles.length +
              filteredDiscounts.length,
          }
        }

        return card
      }),
    [archivedBundles.length, archivedProducts.length, filteredDiscounts.length]
  )

  const activeRecords =
    activeArchiveTab === "bundles"
      ? filteredBundles
      : activeArchiveTab === "discounts"
        ? filteredDiscounts
        : filteredProducts

  const totalEntries = activeRecords.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / Number(entriesToShow)))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * Number(entriesToShow)
    : 0
  const endIndex = Math.min(startIndex + Number(entriesToShow), totalEntries)
  const visibleProducts = filteredProducts.slice(startIndex, endIndex)
  const visibleBundles = filteredBundles.slice(startIndex, endIndex)
  const visibleDiscounts = filteredDiscounts.slice(startIndex, endIndex)
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)
  const activeArchiveLabel =
    archiveTabs.find((tab) => tab.id === activeArchiveTab)?.label ?? "records"
  const searchPlaceholder = `Search archived ${activeArchiveLabel.toLowerCase()}...`

  const handleRestoreProduct = (productToRestore) => {
    setArchivedProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productToRestore.id)
    )
    setOpenActionId(null)
  }

  const handleDeleteProduct = (productToDelete) => {
    setArchivedProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productToDelete.id)
    )
    setOpenActionId(null)
  }

  const handleRestoreBundle = (bundleToRestore) => {
    setArchivedBundles((currentBundles) =>
      currentBundles.filter((bundle) => bundle.id !== bundleToRestore.id)
    )
    setOpenActionId(null)
  }

  const handleDeleteBundle = (bundleToDelete) => {
    setArchivedBundles((currentBundles) =>
      currentBundles.filter((bundle) => bundle.id !== bundleToDelete.id)
    )
    setOpenActionId(null)
  }

  const updateStoredDiscounts = (updater) => {
    setDiscounts((currentDiscounts) => {
      const nextDiscounts = updater(currentDiscounts)

      saveStoredProductDiscounts(nextDiscounts)
      window.dispatchEvent(new Event(PRODUCT_DISCOUNTS_UPDATED_EVENT))

      return nextDiscounts
    })
  }

  const handleRestoreDiscount = (discountToRestore) => {
    updateStoredDiscounts((currentDiscounts) =>
      currentDiscounts.map((discount) => {
        if (discount.id !== discountToRestore.id) {
          return discount
        }

        const restoredStatus =
          discount.previousStatus && discount.previousStatus !== "Archived"
            ? discount.previousStatus
            : "Inactive"
        const { archivedAt, previousStatus, ...restoredDiscount } = discount
        void archivedAt
        void previousStatus

        return {
          ...restoredDiscount,
          status: restoredStatus,
        }
      })
    )
    setOpenActionId(null)
  }

  const handleDeleteDiscount = (discountToDelete) => {
    updateStoredDiscounts((currentDiscounts) =>
      currentDiscounts.filter((discount) => discount.id !== discountToDelete.id)
    )
    setOpenActionId(null)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51] sm:h-14 sm:w-14">
          <HiOutlineArchiveBox className="h-6 w-6 sm:h-8 sm:w-8" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
            System Archives
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Review archived records from every admin module.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:mt-7">
        {settingsArchiveSummaryCards.map((card) => (
          <ArchiveSummaryCard key={card.id} card={card} />
        ))}
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1 xl:mt-6 xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0">
        {archiveTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeArchiveTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveArchiveTab(tab.id)
                setCurrentPage(1)
                setOpenActionId(null)
              }}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition xl:w-full ${
                isActive
                  ? "border-[#00675b] bg-[#00675b] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,18rem)_minmax(0,16rem)]">
          <label className="relative block w-full">
            <span className="sr-only">Search archived records</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </label>

          <label className="relative block w-full">
            <span className="sr-only">Sort archived records</span>
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value)
                setCurrentPage(1)
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              <option value="newest">Sort by: Date (Newest)</option>
              <option value="oldest">Sort by: Date (Oldest)</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </div>

      {activeArchiveTab === "products" ? (
        <>
          <ArchiveMobileCards
            archiveType="products"
            records={visibleProducts}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreProduct}
            onDelete={handleDeleteProduct}
          />
          <ProductsArchiveTable
            products={visibleProducts}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreProduct}
            onDelete={handleDeleteProduct}
          />
        </>
      ) : activeArchiveTab === "bundles" ? (
        <>
          <ArchiveMobileCards
            archiveType="bundles"
            records={visibleBundles}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreBundle}
            onDelete={handleDeleteBundle}
          />
          <BundlesArchiveTable
            bundles={visibleBundles}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreBundle}
            onDelete={handleDeleteBundle}
          />
        </>
      ) : activeArchiveTab === "discounts" ? (
        <>
          <ArchiveMobileCards
            archiveType="discounts"
            records={visibleDiscounts}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreDiscount}
            onDelete={handleDeleteDiscount}
          />
          <DiscountsArchiveTable
            discounts={visibleDiscounts}
            openActionId={openActionId}
            onToggleAction={(recordId) =>
              setOpenActionId((currentRecordId) =>
                currentRecordId === recordId ? null : recordId
              )
            }
            onRestore={handleRestoreDiscount}
            onDelete={handleDeleteDiscount}
          />
        </>
      ) : (
        <div className="mt-5 grid min-h-0 flex-1 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <p className="text-sm font-semibold text-slate-500">
            {archiveTabs.find((tab) => tab.id === activeArchiveTab)?.label}{" "}
            archive design will be added next.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
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
  )
}

export default ArchivesSettingsPanel
