import { useEffect, useMemo, useRef, useState } from "react"
import { FiAlertTriangle, FiHash, FiSlash, FiX } from "react-icons/fi"

import { formatPeso } from "../../../../../shared/inventory/inventoryUtils"

const VOID_VALIDITY_MS = 24 * 60 * 60 * 1000

const voidReasons = [
  "Forgot discount",
  "Wrong item",
  "Wrong quantity",
  "Wrong payment amount",
  "Customer cancelled",
  "Other cashier error",
]

const formatTransactionDateTime = (dateTimeValue) => {
  const dateTime = new Date(dateTimeValue)

  if (Number.isNaN(dateTime.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(dateTime)
}

const getVoidEligibility = (transaction) => {
  if (!transaction) {
    return {
      isVoidable: false,
      message: "",
    }
  }

  if (transaction.status === "Voided") {
    return {
      isVoidable: false,
      message: "This transaction has already been voided.",
    }
  }

  if (transaction.status && transaction.status !== "Completed") {
    return {
      isVoidable: false,
      message: `Only completed transactions can be voided. Current status: ${transaction.status}.`,
    }
  }

  const transactionTime = new Date(transaction.dateTime).getTime()

  if (Number.isNaN(transactionTime)) {
    return {
      isVoidable: false,
      message: "This transaction has an invalid transaction date.",
    }
  }

  if (Date.now() - transactionTime > VOID_VALIDITY_MS) {
    return {
      isVoidable: false,
      message: "Void is only available within 24 hours from transaction time.",
    }
  }

  return {
    isVoidable: true,
    message: "Eligible for void. Manager approval is required.",
  }
}

function VoidTransactionModal({ transactions, onClose, onRequestApproval }) {
  const [orNumber, setOrNumber] = useState("")
  const [reason, setReason] = useState(voidReasons[0])
  const [statusMessage, setStatusMessage] = useState("")
  const inputRef = useRef(null)

  const matchedTransaction = useMemo(() => {
    const normalizedOrNumber = orNumber.trim()

    if (!normalizedOrNumber) {
      return null
    }

    return (
      transactions.find(
        (transaction) =>
          String(transaction.orNumber ?? "").trim() === normalizedOrNumber
      ) ?? null
    )
  }, [orNumber, transactions])

  const eligibility = useMemo(
    () => getVoidEligibility(matchedTransaction),
    [matchedTransaction]
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const handleRequestApproval = () => {
    if (!orNumber.trim()) {
      setStatusMessage("Enter the OR number to void.")
      return
    }

    if (!matchedTransaction) {
      setStatusMessage("No transaction found for that OR number.")
      return
    }

    if (!eligibility.isVoidable) {
      setStatusMessage(eligibility.message)
      return
    }

    if (!reason) {
      setStatusMessage("Select a reason for voiding this transaction.")
      return
    }

    onRequestApproval({
      reason,
      transaction: matchedTransaction,
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
              <FiSlash className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Void Transaction
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Enter OR number. Valid within 24 hours only.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close void transaction"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <label className="relative block">
            <span className="sr-only">OR number</span>
            <input
              ref={inputRef}
              type="text"
              value={orNumber}
              onChange={(event) => {
                setOrNumber(event.target.value.replace(/[^\d-]/g, ""))
                setStatusMessage("")
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleRequestApproval()
                }
              }}
              placeholder="Enter OR number..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <FiHash className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </label>

          <label className="relative block">
            <span className="sr-only">Void reason</span>
            <select
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setStatusMessage("")
              }}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              {voidReasons.map((voidReason) => (
                <option key={voidReason} value={voidReason}>
                  {voidReason}
                </option>
              ))}
            </select>
          </label>
        </div>

        {matchedTransaction ? (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                  Matched Transaction
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                  OR No. {matchedTransaction.orNumber}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatTransactionDateTime(matchedTransaction.dateTime)}
                </p>
              </div>
              <span
                className={`w-fit rounded-lg px-3 py-1 text-xs font-extrabold ${
                  eligibility.isVoidable
                    ? "bg-emerald-100 text-[#0b6b51]"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {matchedTransaction.status ?? "Completed"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-500 sm:grid-cols-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                  Cashier
                </p>
                <p className="mt-1 text-slate-800">
                  {matchedTransaction.cashierName}
                </p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                  Customer
                </p>
                <p className="mt-1 text-slate-800">
                  {matchedTransaction.customerType}
                </p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                  Items
                </p>
                <p className="mt-1 text-slate-800">
                  {matchedTransaction.items?.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.04em] text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-slate-800">
                  {formatPeso(matchedTransaction.total)}
                </p>
              </div>
            </div>

            <p
              className={`mt-4 flex gap-2 text-sm font-bold ${
                eligibility.isVoidable ? "text-[#0b6b51]" : "text-red-600"
              }`}
            >
              <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{eligibility.message}</span>
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Transaction details will appear after entering a matching OR
              number.
            </p>
          </div>
        )}

        {statusMessage && (
          <p className="mt-4 text-center text-sm font-bold text-red-500">
            {statusMessage}
          </p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRequestApproval}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-8 text-sm font-extrabold text-white transition hover:bg-red-700"
          >
            Request Manager Approval
          </button>
        </div>
      </section>
    </div>
  )
}

export default VoidTransactionModal
