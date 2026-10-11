import { useEffect, useMemo, useState } from "react"
import {
  FiArchive,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEdit3,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiStar,
  FiTag,
  FiX,
} from "react-icons/fi"

import {
  formatDate,
  formatPeso,
  getPaginationItems,
  getProductTableDisplayName,
} from "../../../../shared/inventory/inventoryUtils"
import useNotification from "../../../../../hooks/useNotification"
import { mockInventoryItems } from "../inventory/data/inventoryMockData"
import {
  getStoredProductDiscounts,
  getNextProductDiscountCode,
  saveStoredProductDiscounts,
} from "./data/productDiscountMockData"

const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

const defaultDiscountForm = {
  name: "",
  productId: "",
  discountType: "percentage",
  discountValue: "",
  startDate: getTodayDateInputValue(),
  endDate: "",
  status: "Active",
}

const PRODUCT_DISCOUNTS_UPDATED_EVENT = "lyfe-product-discounts-updated"

function DiscountSummaryCard({ card }) {
  const Icon = card.icon

  return (
    <article className="min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4">
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm">
            {card.label}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block">
            <p className="truncate text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">
              {card.value}
            </p>
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${card.iconClassName}`}
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
          className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${card.iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </article>
  )
}

export function DiscountsTopbarCards({ activeBranchId }) {
  const [discounts, setDiscounts] = useState(() => getStoredProductDiscounts())

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

  const branchDiscounts = discounts.filter((discount) =>
    activeBranchId ? discount.branchId === activeBranchId : true
  )
  const visibleDiscounts = branchDiscounts.filter(
    (discount) => discount.status !== "Archived"
  )
  const activeDiscounts = visibleDiscounts.filter(
    (discount) => discount.status === "Active"
  )
  const scheduledDiscounts = visibleDiscounts.filter(
    (discount) => discount.status === "Inactive"
  )
  const discountedProducts = new Set(
    visibleDiscounts.map((discount) => discount.productId)
  ).size
  const highestDiscount = visibleDiscounts.reduce(
    (highestValue, discount) =>
      discount.discountType === "percentage"
        ? Math.max(highestValue, Number(discount.discountValue ?? 0))
        : highestValue,
    0
  )
  const summaryCards = [
    {
      id: "active-discounts",
      label: "Active Discounts",
      value: String(activeDiscounts.length).padStart(2, "0"),
      detail: "Currently applied promos",
      icon: FiTag,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "scheduled-discounts",
      label: "Scheduled Discounts",
      value: String(scheduledDiscounts.length).padStart(2, "0"),
      detail: "Scheduled or inactive promos",
      icon: FiCalendar,
      iconClassName: "bg-sky-100 text-sky-600",
    },
    {
      id: "discounted-products",
      label: "Discounted Products",
      value: String(discountedProducts).padStart(2, "0"),
      detail: "Products with discounts",
      icon: FiArchive,
      iconClassName: "bg-amber-100 text-amber-600",
    },
    {
      id: "highest-discount",
      label: "Highest Discount",
      value: highestDiscount ? `${highestDiscount}%` : "0%",
      detail: "Highest percentage discount",
      icon: FiStar,
      iconClassName: "bg-rose-100 text-rose-600",
    },
  ]

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {summaryCards.map((card) => (
        <DiscountSummaryCard key={card.id} card={card} />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const isActive = status === "Active"

  return (
    <span
      className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${
        isActive
          ? "bg-emerald-100 text-[#0b6b51]"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  )
}

function DiscountValue({ discount }) {
  return discount.discountType === "percentage"
    ? `${discount.discountValue}%`
    : formatPeso(discount.discountValue)
}

function DiscountReceiptLabel({ discount }) {
  return `${discount.code} ${discount.discountType === "percentage"
    ? `${discount.discountValue}%`
    : formatPeso(discount.discountValue)}`
}

function ProductDiscountModal({
  activeBranchId,
  discountCode,
  discountToEdit,
  products,
  onClose,
  onCreateDiscount,
  onUpdateDiscount,
}) {
  const isEditMode = Boolean(discountToEdit)
  const [formData, setFormData] = useState(() =>
    discountToEdit
      ? {
          name: discountToEdit.name ?? "",
          code: discountToEdit.code ?? discountCode,
          productId: discountToEdit.productId ?? "",
          discountType: discountToEdit.discountType ?? "percentage",
          discountValue: String(discountToEdit.discountValue ?? ""),
          startDate: discountToEdit.startDate ?? getTodayDateInputValue(),
          endDate: discountToEdit.endDate ?? "",
          status: discountToEdit.status ?? "Active",
        }
      : { ...defaultDiscountForm, code: discountCode }
  )
  const [statusMessage, setStatusMessage] = useState("")

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }))
    setStatusMessage("")
  }

  const handleDiscountValueChange = (event) => {
    const nextValue = event.target.value.replace(/[^\d.]/g, "")

    if ((nextValue.match(/\./g) || []).length > 1) {
      return
    }

    updateField("discountValue", nextValue)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const discountValue = Number(formData.discountValue)

    if (
      !formData.name.trim() ||
      !formData.productId ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setStatusMessage("Missing discount details")
      return
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setStatusMessage("Enter a valid discount value")
      return
    }

    if (formData.discountType === "percentage" && discountValue > 100) {
      setStatusMessage("Percentage discount cannot exceed 100")
      return
    }

    if (formData.endDate < formData.startDate) {
      setStatusMessage("End date cannot be before start date")
      return
    }

    const productDiscount = {
      ...(discountToEdit ?? {}),
      id: discountToEdit?.id ?? `discount-${Date.now()}`,
      branchId:
        activeBranchId ?? discountToEdit?.branchId ?? "branch-camalig-albay",
      code: formData.code,
      name: formData.name.trim(),
      productId: formData.productId,
      discountType: formData.discountType,
      discountValue,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    }

    if (isEditMode) {
      onUpdateDiscount(productDiscount)
    } else {
      onCreateDiscount(productDiscount)
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Update Discount" : "Create Discount"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
            aria-label={`Close ${
              isEditMode ? "update" : "create"
            } discount modal`}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Discount Code
            </span>
            <input
              type="text"
              value={formData.code}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-[#0b6b51] outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Discount Name
            </span>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. Weekend Promo"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Product
            </span>
            <select
              value={formData.productId}
              onChange={(event) => updateField("productId", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {getProductTableDisplayName(product)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Discount Type
            </span>
            <select
              value={formData.discountType}
              onChange={(event) =>
                updateField("discountType", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Discount Value
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formData.discountValue}
              onChange={handleDiscountValueChange}
              placeholder={
                formData.discountType === "percentage" ? "0" : "0.00"
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Start Date
            </span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              End Date
            </span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Status
            </span>
            <select
              value={formData.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        {statusMessage && (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {statusMessage}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-7 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#00675b] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            {isEditMode ? "Update Discount" : "Create Discount"}
          </button>
        </div>
      </form>
    </div>
  )
}

function BulkArchiveDiscountsModal({
  discounts,
  getProductName,
  onCancel,
  onConfirm,
}) {
  const count = discounts.length
  const discountNames = discounts
    .slice(0, 3)
    .map((discount) => `${discount.name} (${getProductName(discount.productId)})`)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Cancel archive selected discounts"
      />

      <section className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Archive {count} Discount{count === 1 ? "" : "s"}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Selected discounts will be moved out of the active discounts list and
          can be restored from Archives later.
        </p>

        {discountNames.length ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
            {discountNames.join(", ")}
            {count > discountNames.length ? ` and ${count - discountNames.length} more` : ""}
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
            Archive {count} Discount{count === 1 ? "" : "s"}
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminDiscounts({ activeBranchId }) {
  const { showSuccess } = useNotification()
  const [discounts, setDiscounts] = useState(() => getStoredProductDiscounts())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionDiscountId, setOpenActionDiscountId] = useState(null)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [discountToEdit, setDiscountToEdit] = useState(null)
  const [selectedArchiveDiscountIds, setSelectedArchiveDiscountIds] = useState([])
  const [bulkArchiveDiscounts, setBulkArchiveDiscounts] = useState([])
  const nextDiscountCode = useMemo(
    () => getNextProductDiscountCode(discounts),
    [discounts]
  )

  useEffect(() => {
    if (!openActionDiscountId) {
      return undefined
    }

    const closeActionMenu = () => {
      setOpenActionDiscountId(null)
    }

    document.addEventListener("click", closeActionMenu)

    return () => {
      document.removeEventListener("click", closeActionMenu)
    }
  }, [openActionDiscountId])

  useEffect(() => {
    saveStoredProductDiscounts(discounts)

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PRODUCT_DISCOUNTS_UPDATED_EVENT))
    }
  }, [discounts])
  const products = useMemo(
    () =>
      activeBranchId
        ? mockInventoryItems.filter((item) => item.branchId === activeBranchId)
        : mockInventoryItems,
    [activeBranchId]
  )

  const visibleDiscounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return discounts
      .filter((discount) =>
        activeBranchId ? discount.branchId === activeBranchId : true
      )
      .filter((discount) => discount.status !== "Archived")
      .filter((discount) =>
        statusFilter === "all" ? true : discount.status === statusFilter
      )
      .filter((discount) => {
        const product = products.find(
          (productItem) => productItem.id === discount.productId
        )
        const searchableText = [
          discount.name,
          discount.status,
          discount.discountType,
          discount.code,
          product ? getProductTableDisplayName(product) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return !normalizedSearch || searchableText.includes(normalizedSearch)
      })
  }, [activeBranchId, discounts, products, searchTerm, statusFilter])

  const entriesPerPage = Number(entriesToShow)
  const totalEntries = visibleDiscounts.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * entriesPerPage
    : 0
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries)
  const paginatedDiscounts = visibleDiscounts.slice(startIndex, endIndex)
  const visibleDiscountIds = paginatedDiscounts.map((discount) => discount.id)
  const selectedVisibleCount = visibleDiscountIds.filter((discountId) =>
    selectedArchiveDiscountIds.includes(discountId)
  ).length
  const allVisibleSelected =
    visibleDiscountIds.length > 0 &&
    selectedVisibleCount === visibleDiscountIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const selectedArchiveDiscounts = visibleDiscounts.filter((discount) =>
    selectedArchiveDiscountIds.includes(discount.id)
  )
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)

  const getProductName = (productId) => {
    const product = products.find((productItem) => productItem.id === productId)

    return product ? getProductTableDisplayName(product) : "Product not found"
  }

  const openCreateDiscountModal = () => {
    setDiscountToEdit(null)
    setIsDiscountModalOpen(true)
  }

  const openEditDiscountModal = (discount) => {
    setDiscountToEdit(discount)
    setOpenActionDiscountId(null)
    setIsDiscountModalOpen(true)
  }

  const handleCreateDiscount = (newDiscount) => {
    setDiscounts((currentDiscounts) => [newDiscount, ...currentDiscounts])
  }

  const handleUpdateDiscount = (updatedDiscount) => {
    setDiscounts((currentDiscounts) =>
      currentDiscounts.map((discount) =>
        discount.id === updatedDiscount.id ? updatedDiscount : discount
      )
    )
  }

  const toggleDiscountSelection = (discountId) => {
    setSelectedArchiveDiscountIds((currentIds) =>
      currentIds.includes(discountId)
        ? currentIds.filter((currentId) => currentId !== discountId)
        : [...currentIds, discountId]
    )
  }

  const toggleVisibleSelection = () => {
    setSelectedArchiveDiscountIds((currentIds) =>
      allVisibleSelected
        ? currentIds.filter(
            (currentId) => !visibleDiscountIds.includes(currentId)
          )
        : [...new Set([...currentIds, ...visibleDiscountIds])]
    )
  }

  const handleArchiveDiscounts = (discountsToArchive) => {
    const archiveIds = discountsToArchive.map((discount) => discount.id)
    const archiveCount = archiveIds.length

    if (!archiveCount) {
      return
    }

    setDiscounts((currentDiscounts) =>
      currentDiscounts.map((discount) =>
        archiveIds.includes(discount.id)
          ? {
              ...discount,
              status: "Archived",
              previousStatus: discount.status,
              archivedAt: new Date().toISOString(),
            }
          : discount
      )
    )
    setSelectedArchiveDiscountIds((currentIds) =>
      currentIds.filter((currentId) => !archiveIds.includes(currentId))
    )
    setBulkArchiveDiscounts([])
    setOpenActionDiscountId(null)
    showSuccess(
      `${archiveCount} discount${archiveCount === 1 ? "" : "s"} archived.`
    )
  }

  return (
    <>
      <section>
        <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
          Product Discounts
        </h1>

        <div className="mt-4 flex min-h-[34rem] min-w-0 flex-col rounded-3xl border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 xl:h-[calc(100dvh-14rem)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block w-full sm:w-80">
                <span className="sr-only">Search discounts</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                    setSelectedArchiveDiscountIds([])
                  }}
                  placeholder="Search discounts..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                />
                <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </label>

              <label className="relative block w-full sm:w-44">
                <span className="sr-only">Filter discount status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value)
                    setCurrentPage(1)
                    setSelectedArchiveDiscountIds([])
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
            </div>

            <button
              type="button"
              onClick={openCreateDiscountModal}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00675b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005348] sm:w-auto"
            >
              <FiPlus className="h-5 w-5" />
              Create Discount
            </button>
          </div>

          {selectedArchiveDiscounts.length ? (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold text-[#0b6b51]">
                  {selectedArchiveDiscounts.length} discount
                  {selectedArchiveDiscounts.length === 1 ? "" : "s"} selected
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedArchiveDiscountIds([])}
                  className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                >
                  Clear Selection
                </button>
              </div>
              <button
                type="button"
                onClick={() => setBulkArchiveDiscounts(selectedArchiveDiscounts)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <FiArchive className="h-4 w-4" />
                Archive Selected
              </button>
            </div>
          ) : null}

          <div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto pr-1 xl:hidden">
            {paginatedDiscounts.map((discount) => (
              <article
                key={discount.id}
                className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <label
                      className="mt-1 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white transition hover:border-[#0b6b51]/40"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="sr-only">Select {discount.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedArchiveDiscountIds.includes(
                          discount.id
                        )}
                        onChange={() => toggleDiscountSelection(discount.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]"
                      />
                    </label>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-extrabold text-slate-900">
                        {discount.name}
                      </h2>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {getProductName(discount.productId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <StatusBadge status={discount.status} />
                    <div className="relative">
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
                        aria-label={`More actions for ${discount.name}`}
                        aria-expanded={openActionDiscountId === discount.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenActionDiscountId((currentDiscountId) =>
                            currentDiscountId === discount.id
                              ? null
                              : discount.id
                          )
                        }}
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>

                      {openActionDiscountId === discount.id && (
                        <div
                          className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEditDiscountModal(discount)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                          >
                            <FiEdit3 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBulkArchiveDiscounts([discount])
                              setOpenActionDiscountId(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
                          >
                            <FiArchive className="h-4 w-4" />
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-xs font-bold text-slate-500 sm:grid-cols-2">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Code
                    </p>
                    <p className="mt-1 text-slate-700">
                      <DiscountReceiptLabel discount={discount} />
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Period
                    </p>
                    <p className="mt-1 text-slate-700">
                      {formatDate(discount.startDate)} -{" "}
                      {formatDate(discount.endDate)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 hidden flex-1 overflow-auto xl:block">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                  <th className="w-12 rounded-l-xl px-4 py-4 text-center">
                    <input
                      ref={(checkbox) => {
                        if (checkbox) {
                          checkbox.indeterminate = someVisibleSelected
                        }
                      }}
                      type="checkbox"
                      checked={allVisibleSelected}
                      disabled={!paginatedDiscounts.length}
                      onChange={toggleVisibleSelection}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed"
                      aria-label="Select all discounts on this page"
                    />
                  </th>
                  <th className="px-4 py-4">Discount</th>
                  <th className="px-4 py-4">Code</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Value</th>
                  <th className="px-4 py-4">Start Date</th>
                  <th className="px-4 py-4">End Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="rounded-r-xl px-4 py-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDiscounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="border-b border-slate-100 text-sm font-semibold text-slate-700"
                  >
                    <td className="w-12 border-b border-slate-100 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedArchiveDiscountIds.includes(
                          discount.id
                        )}
                        onChange={() => toggleDiscountSelection(discount.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]"
                        aria-label={`Select ${discount.name}`}
                      />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-[#0b6b51]">
                          <FiTag className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-slate-900">
                          {discount.name}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-[#0b6b51]">
                      {discount.code}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {getProductName(discount.productId)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 capitalize">
                      {discount.discountType === "fixed"
                        ? "Fixed Amount"
                        : "Percentage"}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                      <DiscountValue discount={discount} />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {formatDate(discount.startDate)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      {formatDate(discount.endDate)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <StatusBadge status={discount.status} />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-center">
                      <div className="relative">
                        <button
                          type="button"
                          className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
                          aria-label={`More actions for ${discount.name}`}
                          aria-expanded={openActionDiscountId === discount.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            setOpenActionDiscountId((currentDiscountId) =>
                              currentDiscountId === discount.id
                                ? null
                                : discount.id
                            )
                          }}
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>

                        {openActionDiscountId === discount.id && (
                          <div
                            className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => openEditDiscountModal(discount)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                            >
                              <FiEdit3 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBulkArchiveDiscounts([discount])
                                setOpenActionDiscountId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
                            >
                              <FiArchive className="h-4 w-4" />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!totalEntries && (
            <div className="grid min-h-80 place-items-center text-center">
              <p className="text-sm font-semibold text-slate-500">
                No discounts found.
              </p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
                    setSelectedArchiveDiscountIds([])
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
      </section>

      {isDiscountModalOpen && (
        <ProductDiscountModal
          key={discountToEdit?.id ?? "create-discount"}
          activeBranchId={activeBranchId}
          discountCode={discountToEdit?.code ?? nextDiscountCode}
          discountToEdit={discountToEdit}
          products={products}
          onClose={() => setIsDiscountModalOpen(false)}
          onCreateDiscount={handleCreateDiscount}
          onUpdateDiscount={handleUpdateDiscount}
        />
      )}

      {bulkArchiveDiscounts.length ? (
        <BulkArchiveDiscountsModal
          discounts={bulkArchiveDiscounts}
          getProductName={getProductName}
          onCancel={() => setBulkArchiveDiscounts([])}
          onConfirm={() => handleArchiveDiscounts(bulkArchiveDiscounts)}
        />
      ) : null}
    </>
  )
}

export default AdminDiscounts
