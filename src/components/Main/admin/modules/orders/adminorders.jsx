import { useEffect, useMemo, useRef, useState } from "react"
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiMinus,
  FiPackage,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiX,
} from "react-icons/fi"

import useNotification from "../../../../../hooks/useNotification"
import {
  formatPeso,
  getPaginationItems,
} from "../../../../shared/inventory/inventoryUtils"
import {
  getApprovedOrders,
  ORDER_STATUS,
} from "./data/adminOrdersMockData"

const getTodayInputValue = () => new Date().toISOString().slice(0, 10)

const adjustmentReasons = [
  "Stock count correction",
  "Damaged item",
  "Lost item",
  "Supplier over-delivered",
  "Supplier short-delivered",
]

const ADMIN_ORDERS_UPDATED_EVENT = "lyfe-admin-orders-updated"

const getBatchCode = (order, index) =>
  `BCH-${order.id.replace(/\D/g, "").slice(-4)}-${String(index + 1).padStart(
    2,
    "0"
  )}`

const getOrderTotalQuantity = (order) =>
  order.items.reduce((total, item) => total + Number(item.quantity), 0)

const getOrderTotalAmount = (order) =>
  order.items.reduce(
    (total, item) => total + Number(item.costPrice) * Number(item.quantity),
    0
  )

const getStatusClassName = (status) =>
  status === ORDER_STATUS.COMPLETED
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700"

const getOrdersSummaryValues = (orders) => {
  const readyOrders = orders.filter((order) => order.status === ORDER_STATUS.READY)
  const completedOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.COMPLETED
  )
  const totalItems = orders.reduce(
    (total, order) => total + order.items.length,
    0
  )
  const estimatedValue = orders.reduce(
    (total, order) => total + getOrderTotalAmount(order),
    0
  )

  return {
    total: String(orders.length).padStart(2, "0"),
    ready: String(readyOrders.length).padStart(2, "0"),
    completed: String(completedOrders.length).padStart(2, "0"),
    items: String(totalItems).padStart(2, "0"),
    estimatedValue,
  }
}

function OrderSummaryCard({ card }) {
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
          <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">
            {card.detail}
          </p>
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

export function OrdersTopbarCards() {
  const [summaryOrders, setSummaryOrders] = useState(getApprovedOrders)
  const summaryValues = getOrdersSummaryValues(summaryOrders)
  const summaryCards = [
    {
      id: "total",
      label: "Total Orders",
      value: summaryValues.total,
      detail: "Approved order records",
      icon: FiPackage,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "ready",
      label: "Ready to Process",
      value: summaryValues.ready,
      detail: "Waiting for receiving",
      icon: FiClock,
      iconClassName: "bg-amber-100 text-amber-600",
    },
    {
      id: "completed",
      label: "Completed Orders",
      value: summaryValues.completed,
      detail: "Finished receiving",
      icon: FiCheckCircle,
      iconClassName: "bg-sky-100 text-sky-600",
    },
    {
      id: "items",
      label: "Total Items",
      value: summaryValues.items,
      detail: `${formatPeso(summaryValues.estimatedValue)} estimated value`,
      icon: FiShoppingBag,
      iconClassName: "bg-rose-100 text-rose-600",
    },
  ]

  useEffect(() => {
    const refreshOrders = (event) => {
      setSummaryOrders(event.detail?.orders ?? getApprovedOrders())
    }

    window.addEventListener(ADMIN_ORDERS_UPDATED_EVENT, refreshOrders)

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED_EVENT, refreshOrders)
    }
  }, [])

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {summaryCards.map((card) => (
        <OrderSummaryCard key={card.id} card={card} />
      ))}
    </div>
  )
}

function AdminOrders() {
  const { showSuccess, showWarning } = useNotification()
  const [orders, setOrders] = useState(getApprovedOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter
      const matchesSearch =
        !normalizedSearch ||
        [
          order.id,
          order.orderNo,
          order.dateRequested,
          order.requestedBy,
          ...order.items.map((item) => item.productName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [orders, searchTerm, statusFilter])

  const statusTabs = ["All", ORDER_STATUS.READY, ORDER_STATUS.COMPLETED].map(
    (status) => ({
      id: status,
      label: status === ORDER_STATUS.READY ? "Ready" : status,
      count:
        status === "All"
          ? orders.length
          : orders.filter((order) => order.status === status).length,
    })
  )
  const entriesPerPage = Number(entriesToShow)
  const totalEntries = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * entriesPerPage
    : 0
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries)
  const visibleOrders = filteredOrders.slice(startIndex, endIndex)
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)

  const handleCompleteOrder = ({ order, receivedItems }) => {
    setOrders((currentOrders) => {
      const nextOrders = currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? {
              ...currentOrder,
              status: ORDER_STATUS.COMPLETED,
              completedAt: new Date().toISOString(),
              receivedItems,
            }
          : currentOrder
      )

      window.dispatchEvent(
        new CustomEvent(ADMIN_ORDERS_UPDATED_EVENT, {
          detail: { orders: nextOrders },
        })
      )

      return nextOrders
    })
    setSelectedOrder(null)
    showSuccess("Order completed and ready for inventory update.", {
      title: "Order completed",
    })
  }

  return (
    <>
      <section className="flex min-h-[34rem] w-full min-w-0 flex-col rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 lg:rounded-3xl xl:h-[calc(100dvh-14rem)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full md:max-w-96">
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search orders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </label>

        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id)
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

        <OrderCards
          orders={visibleOrders}
          totalEntries={totalEntries}
          onProcessOrder={setSelectedOrder}
        />

        <div className="mt-4 hidden min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100 lg:block">
          <table className="w-full min-w-[880px] table-fixed border-separate border-spacing-0 text-left">
            <colgroup>
              <col className="w-[165px]" />
              <col className="w-[155px]" />
              <col className="w-[170px]" />
              <col className="w-[100px]" />
              <col className="w-[110px]" />
              <col className="w-[140px]" />
              <col className="w-[150px]" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                <th className="px-4 py-4">Approved Date</th>
                <th className="px-4 py-4">Order No.</th>
                <th className="px-4 py-4">Requisition No.</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4">Qty</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id} className="text-sm font-semibold text-slate-700">
                  <td className="border-b border-slate-100 px-4 py-4">
                    <span className="block font-extrabold text-slate-900">
                      {order.approvedDate}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-slate-400">
                      {order.approvedTime}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-slate-900">
                    {order.orderNo}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-slate-900">
                    {order.id}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {order.items.length}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {getOrderTotalQuantity(order)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-center">
                    {order.status === ORDER_STATUS.COMPLETED ? (
                      <span className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-xs font-extrabold text-slate-500">
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00675b] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#005348]"
                      >
                        <FiPackage className="h-4 w-4" />
                        Process Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {!totalEntries && (
                <tr>
                  <td colSpan={7} className="px-4 py-24 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      No orders found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 lg:flex-row lg:items-center lg:justify-between">
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
      </section>

      {selectedOrder && (
        <ProcessOrderModal
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onComplete={handleCompleteOrder}
          showWarning={showWarning}
        />
      )}
    </>
  )
}

function StatusBadge({ status, compact = false }) {
  return (
    <span
      className={`inline-flex h-7 items-center justify-center rounded-md px-3 text-xs font-extrabold ${
        compact ? "min-w-0" : "min-w-28"
      } ${getStatusClassName(
        status
      )}`}
    >
      {status}
    </span>
  )
}

function OrderCards({ orders, totalEntries, onProcessOrder }) {
  return (
    <div className="mt-4 grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-1 md:grid-cols-2 lg:hidden">
      {orders.map((order) => (
        <article
          key={order.id}
          className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-400">
                Order No.
              </p>
              <h3 className="mt-1 truncate text-base font-extrabold text-slate-950">
                {order.orderNo}
              </h3>
              <p className="mt-1 truncate text-xs font-bold text-slate-500">
                Requisition: {order.id}
              </p>
            </div>
            <StatusBadge status={order.status} compact />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
            <div>
              <p className="uppercase tracking-[0.03em] text-slate-400">
                Approved Date
              </p>
              <p className="mt-1 text-slate-800">{order.approvedDate}</p>
              <p className="mt-1 text-slate-500">{order.approvedTime}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.03em] text-slate-400">
                Requested By
              </p>
              <p className="mt-1 text-slate-800">{order.requestedBy}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.03em] text-slate-400">
                Items
              </p>
              <p className="mt-1 text-slate-800">{order.items.length}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.03em] text-slate-400">
                Quantity
              </p>
              <p className="mt-1 text-slate-800">
                {getOrderTotalQuantity(order)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
            <p className="truncate text-xs font-bold text-slate-500">
              {order.items.map((item) => item.productName).join(", ")}
            </p>
          </div>

          <div className="mt-4">
            {order.status === ORDER_STATUS.COMPLETED ? (
              <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 px-4 text-xs font-extrabold text-slate-500">
                Completed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onProcessOrder(order)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#00675b] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#005348]"
              >
                <FiPackage className="h-4 w-4" />
                Process Order
              </button>
            )}
          </div>
        </article>
      ))}

      {!totalEntries && (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-sm font-semibold text-slate-500">
            No orders found.
          </p>
        </div>
      )}
    </div>
  )
}

function ProductReceiveStatus({ complete }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-extrabold ${
        complete
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {complete ? "Complete" : "Incomplete"}
    </span>
  )
}

function ProcessOrderModal({ onBack, onComplete, order, showWarning }) {
  const [itemForms, setItemForms] = useState(() =>
    order.items.reduce((forms, item, index) => {
      forms[item.id] = {
        batchCode: getBatchCode(order, index),
        dateReceived: getTodayInputValue(),
        expirationDate: "",
        receivedQuantity: String(item.quantity),
        adjustmentType: "add",
        adjustmentQuantity: "",
        adjustmentReason: "",
      }
      return forms
    }, {})
  )
  const [openProductId, setOpenProductId] = useState(order.items[0]?.id ?? "")
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false)

  const getItemCompletion = (item) => {
    const form = itemForms[item.id]
    const adjustmentQuantity = Number(form.adjustmentQuantity) || 0
    const hasAdjustmentQuantity = adjustmentQuantity > 0
    const hasValidDeduction =
      form.adjustmentType !== "deduct" ||
      adjustmentQuantity <= Number(form.receivedQuantity)

    return Boolean(
      form.dateReceived &&
        form.expirationDate &&
        form.receivedQuantity &&
        Number(form.receivedQuantity) > 0 &&
        hasValidDeduction &&
        (!hasAdjustmentQuantity || form.adjustmentReason)
    )
  }

  const updateItemForm = (itemId, field, value) => {
    const shouldClearAdjustmentReason =
      field === "adjustmentQuantity" && Number(value) <= 0

    setItemForms((currentForms) => ({
      ...currentForms,
      [itemId]: {
        ...currentForms[itemId],
        [field]: value,
        ...(shouldClearAdjustmentReason
          ? { adjustmentReason: "" }
          : {}),
      },
    }))
  }

  const validateOrder = () => {
    const missingItem = order.items.find((item) => {
      const form = itemForms[item.id]
      return (
        !form.dateReceived ||
        !form.expirationDate ||
        !form.receivedQuantity ||
        Number(form.receivedQuantity) <= 0
      )
    })

    if (missingItem) {
      setOpenProductId(missingItem.id)
      showWarning("Complete the receiving details for every product.", {
        title: "Missing receiving details",
      })
      return false
    }

    const invalidAdjustment = order.items.find((item) => {
      const form = itemForms[item.id]
      return (
        form.adjustmentQuantity &&
        form.adjustmentType === "deduct" &&
        Number(form.adjustmentQuantity) > Number(form.receivedQuantity)
      )
    })

    if (invalidAdjustment) {
      setOpenProductId(invalidAdjustment.id)
      showWarning("Deduction cannot exceed the approved quantity.", {
        title: "Invalid adjustment",
      })
      return false
    }

    const missingAdjustmentReason = order.items.find((item) => {
      const form = itemForms[item.id]
      return Number(form.adjustmentQuantity) > 0 && !form.adjustmentReason
    })

    if (missingAdjustmentReason) {
      setOpenProductId(missingAdjustmentReason.id)
      showWarning("Choose a reason for every quantity adjustment.", {
        title: "Missing adjustment reason",
      })
      return false
    }

    return true
  }

  const handleComplete = (event) => {
    event.preventDefault()

    if (!validateOrder()) {
      return
    }

    setIsCompleteConfirmOpen(true)
  }

  const handleConfirmComplete = () => {
    onComplete({
      order,
      receivedItems: order.items.map((item) => ({
        productId: item.id,
        batchCode: itemForms[item.id].batchCode,
        dateReceived: itemForms[item.id].dateReceived,
        expirationDate: itemForms[item.id].expirationDate,
        receivedQuantity: Number(itemForms[item.id].receivedQuantity),
        adjustmentType: itemForms[item.id].adjustmentType,
        adjustmentQuantity: Number(itemForms[item.id].adjustmentQuantity) || 0,
        adjustmentReason: itemForms[item.id].adjustmentReason,
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onBack}
        aria-label="Close process order"
      />
      <form
        onSubmit={handleComplete}
        className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:h-[min(820px,92vh)] sm:p-6"
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          aria-label="Close process order"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="min-w-0 shrink-0 pr-10">
          <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
            Process Order
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Receive approved products and prepare batch inventory details.
          </p>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 sm:mt-5">
          <div className="grid gap-3 rounded-2xl border border-slate-100 p-3 min-[420px]:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <DetailItem label="Order No." value={order.orderNo} />
            <DetailItem label="Requisition No." value={order.id} />
            <DetailItem label="Approved Date" value={order.approvedDate} />
            <DetailItem
              label="Estimated Amount"
              value={formatPeso(getOrderTotalAmount(order))}
            />
          </div>

          {order.items.map((item, index) => {
            const form = itemForms[item.id]
            const hasAdjustmentQuantity = Number(form.adjustmentQuantity) > 0
            const isOpen = openProductId === item.id
            const isComplete = getItemCompletion(item)

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-3 sm:p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenProductId((currentId) =>
                      currentId === item.id ? "" : item.id
                    )
                  }
                  className="flex w-full items-start justify-between gap-3 rounded-xl text-left lg:hidden"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 items-center rounded-lg bg-emerald-50 px-2.5 text-xs font-extrabold text-[#0b6b51]">
                        Item {index + 1}
                      </span>
                      <ProductReceiveStatus complete={isComplete} />
                    </div>
                    <h3 className="mt-2 truncate text-base font-extrabold text-slate-950">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      Approved qty: {item.quantity} | Supplier: {item.supplier}
                    </p>
                  </div>
                  <FiChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-slate-500 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="hidden flex-col gap-2 lg:flex lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-slate-950">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      Approved qty: {item.quantity} | Supplier: {item.supplier}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ProductReceiveStatus complete={isComplete} />
                    <span className="inline-flex h-8 w-fit items-center rounded-lg bg-emerald-50 px-3 text-xs font-extrabold text-[#0b6b51]">
                      Item {index + 1}
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-4 gap-4 md:grid-cols-2 xl:grid-cols-3 ${
                    isOpen ? "grid" : "hidden lg:grid"
                  }`}
                >
                  <Field label="Batch Code">
                    <input
                      type="text"
                      value={form.batchCode}
                      readOnly
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600 outline-none"
                    />
                  </Field>
                  <Field label="Date Received">
                    <input
                      type="date"
                      value={form.dateReceived}
                      onChange={(event) =>
                        updateItemForm(
                          item.id,
                          "dateReceived",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                    />
                  </Field>
                  <Field label="Expiration Date">
                    <input
                      type="date"
                      value={form.expirationDate}
                      onChange={(event) =>
                        updateItemForm(
                          item.id,
                          "expirationDate",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                    />
                  </Field>
                  <div className="md:col-span-2 xl:col-span-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-slate-700">
                        Received Quantity
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Adjustments update the final stock received.
                      </span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[160px_190px_160px_minmax(0,1fr)]">
                      <input
                        type="number"
                        value={form.receivedQuantity}
                        readOnly
                        aria-label={`${item.productName} received quantity`}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600 outline-none"
                      />
                      <div className="grid h-11 grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
                        {[
                          ["add", FiPlus, "Add"],
                          ["deduct", FiMinus, "Deduct"],
                        ].map(([type, Icon, label]) => {
                          const isSelected = form.adjustmentType === type

                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                updateItemForm(item.id, "adjustmentType", type)
                              }
                              className={`inline-flex items-center justify-center gap-2 text-sm font-extrabold transition ${
                                isSelected
                                  ? "bg-[#00675b] text-white"
                                  : "bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </button>
                          )
                        })}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={form.adjustmentQuantity}
                        onChange={(event) =>
                          updateItemForm(
                            item.id,
                            "adjustmentQuantity",
                            event.target.value
                          )
                        }
                        placeholder="Qty"
                        aria-label={`${item.productName} adjustment quantity`}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                      />
                      <ReasonDropdown
                        disabled={!hasAdjustmentQuantity}
                        label={`${item.productName} adjustment reason`}
                        options={adjustmentReasons}
                        value={form.adjustmentReason}
                        onChange={(reason) =>
                          updateItemForm(item.id, "adjustmentReason", reason)
                        }
                      />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-5 flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back
          </button>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348]"
          >
            <FiCheckCircle className="h-5 w-5" />
            Complete Order
          </button>
        </div>
      </form>

      {isCompleteConfirmOpen && (
        <CompleteOrderConfirmModal
          onCancel={() => setIsCompleteConfirmOpen(false)}
          onConfirm={handleConfirmComplete}
        />
      )}
    </div>
  )
}

function CompleteOrderConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onCancel}
        aria-label="Close completion confirmation"
      />
      <section className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-[#0b6b51]">
          <FiCheckCircle className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
          Complete order?
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Are you sure you want to complete this order?
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

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  )
}

function ReasonDropdown({ disabled, label, onChange, options, value }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  const displayValue = disabled
    ? "No adjustment reason needed"
    : value || "Select reason"

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((currentState) => !currentState)}
        aria-expanded={isOpen}
        aria-label={label}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm font-bold outline-none transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:border-[#0b6b51]/40 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
        }`}
      >
        <span
          className={`min-w-0 truncate ${
            !disabled && !value ? "text-slate-400" : ""
          }`}
        >
          {displayValue}
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                option === value
                  ? "bg-emerald-50 text-[#0b6b51]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span className="text-xs font-extrabold text-slate-700 sm:text-sm">
        {label}
      </span>
      <div className="mt-1.5 flex h-11 items-center rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 sm:mt-2 sm:h-12 sm:px-4 sm:text-sm">
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}

export default AdminOrders
