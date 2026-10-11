import { useMemo, useState } from "react"
import { FiX } from "react-icons/fi"

import ProductThumb from "../../../../../shared/inventory/ProductThumb"
import { getProductTableDisplayName } from "../../../../../shared/inventory/inventoryUtils"
import {
  formatPeso,
  getItemReturnedQuantity,
  getTransactionReturnSummary,
} from "../utils/salesReportUtils"

const RETURN_REASONS = [
  "Customer request",
  "Wrong item",
  "Damaged item",
  "Expired item",
  "Other",
]

const clampReturnQuantity = (value, maxQuantity) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.min(Math.max(Math.floor(numericValue), 0), maxQuantity)
}

function ProcessReturnModal({ transaction, onClose, onConfirm }) {
  const returnableItems = useMemo(
    () =>
      transaction.items.map((item) => {
        const returnedQuantity = getItemReturnedQuantity(transaction, item.id)
        const remainingQuantity = Math.max(
          Number(item.quantity ?? 0) - returnedQuantity,
          0
        )

        return {
          item,
          returnedQuantity,
          remainingQuantity,
        }
      }),
    [transaction]
  )

  const [returnRows, setReturnRows] = useState(() =>
    Object.fromEntries(
      returnableItems.map(({ item }) => [
        item.id,
        {
          quantityReturned: 0,
          reason: RETURN_REASONS[0],
          otherReason: "",
        },
      ])
    )
  )

  const selectedReturns = returnableItems
    .map(({ item, remainingQuantity }) => {
      const row = returnRows[item.id] ?? {}
      const quantityReturned = clampReturnQuantity(
        row.quantityReturned,
        remainingQuantity
      )
      const lineRefund =
        (Number(item.total ?? 0) / Math.max(Number(item.quantity ?? 1), 1)) *
        quantityReturned

      const reason = row.reason ?? RETURN_REASONS[0]
      const otherReason = String(row.otherReason ?? "").trim()

      return {
        item,
        quantityReturned,
        reason: reason === "Other" ? otherReason : reason,
        needsOtherReason: reason === "Other" && !otherReason,
        refundAmount: lineRefund,
      }
    })
    .filter((returnItem) => returnItem.quantityReturned > 0)
  const hasMissingOtherReason = selectedReturns.some(
    (returnItem) => returnItem.needsOtherReason
  )

  const totalRefund = selectedReturns.reduce(
    (totalAmount, returnItem) => totalAmount + returnItem.refundAmount,
    0
  )
  const totalQuantity = selectedReturns.reduce(
    (totalItems, returnItem) => totalItems + returnItem.quantityReturned,
    0
  )

  const updateReturnRow = (itemId, updates) => {
    setReturnRows((currentRows) => ({
      ...currentRows,
      [itemId]: {
        ...currentRows[itemId],
        ...updates,
      },
    }))
  }

  const handleConfirmReturn = () => {
    if (hasMissingOtherReason) {
      return
    }

    const returnedAt = new Date().toISOString()
    const newReturns = selectedReturns.map((returnItem) => ({
      id: `return-${transaction.id}-${returnItem.item.id}-${Date.now()}`,
      itemId: returnItem.item.id,
      productId: returnItem.item.productId ?? returnItem.item.id,
      quantityReturned: returnItem.quantityReturned,
      reason: returnItem.reason,
      returnedAt,
      processedBy: "Branch Admin",
      refundAmount: Number(returnItem.refundAmount.toFixed(2)),
    }))

    const updatedTransaction = {
      ...transaction,
      returns: [...(transaction.returns ?? []), ...newReturns],
    }
    const returnSummary = getTransactionReturnSummary(updatedTransaction)

    onConfirm({
      ...updatedTransaction,
      status:
        returnSummary.remainingQuantity === 0
          ? "Returned"
          : "Partially Returned",
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Process Return
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              OR No. {transaction.orNumber} / Invoice {transaction.invoiceId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close return modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-3">
            {returnableItems.map(
              ({ item, returnedQuantity, remainingQuantity }) => {
                const isFullyReturned = remainingQuantity === 0
                const returnRow = returnRows[item.id] ?? {}

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_9rem_12rem] lg:items-center">
                      <div className="flex min-w-0 items-center gap-4">
                        <ProductThumb
                          item={{
                            productName: getProductTableDisplayName(item),
                            image: item.image,
                            imageTone: item.imageTone,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {getProductTableDisplayName(item)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            Sold: {item.quantity} | Returned:{" "}
                            {returnedQuantity} | Remaining: {remainingQuantity}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            Refund per item:{" "}
                            {formatPeso(
                              Number(item.total ?? 0) /
                                Math.max(Number(item.quantity ?? 1), 1)
                            )}
                          </p>
                        </div>
                      </div>

                      <label className="block">
                        <span className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                          Qty Return
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={remainingQuantity}
                          value={returnRow.quantityReturned ?? 0}
                          disabled={isFullyReturned}
                          onChange={(event) =>
                            updateReturnRow(item.id, {
                              quantityReturned: clampReturnQuantity(
                                event.target.value,
                                remainingQuantity
                              ),
                            })
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                          Reason
                        </span>
                        <select
                          value={returnRow.reason ?? RETURN_REASONS[0]}
                          disabled={isFullyReturned}
                          onChange={(event) =>
                            updateReturnRow(item.id, {
                              reason: event.target.value,
                              ...(event.target.value !== "Other"
                                ? { otherReason: "" }
                                : {}),
                            })
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {RETURN_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {returnRow.reason === "Other" && !isFullyReturned && (
                      <label className="mt-4 block">
                        <span className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                          Specify Reason
                        </span>
                        <input
                          value={returnRow.otherReason ?? ""}
                          onChange={(event) =>
                            updateReturnRow(item.id, {
                              otherReason: event.target.value,
                            })
                          }
                          placeholder="Enter return reason"
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                        />
                      </label>
                    )}
                  </article>
                )
              }
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-bold text-slate-600">
              <p>
                Selected return:{" "}
                <span className="text-slate-950">{totalQuantity} item(s)</span>
              </p>
              <p className="mt-1">
                Estimated refund:{" "}
                <span className="text-emerald-600">
                  {formatPeso(totalRefund)}
                </span>
              </p>
              {hasMissingOtherReason && (
                <p className="mt-1 text-red-500">
                  Please specify the other return reason.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedReturns.length || hasMissingOtherReason}
                onClick={handleConfirmReturn}
                className="h-11 rounded-xl bg-[#0b6b51] px-5 text-sm font-extrabold text-white transition hover:bg-[#08533f] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessReturnModal
