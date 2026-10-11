import { useEffect, useMemo, useRef, useState } from "react"
import { AiOutlineShoppingCart } from "react-icons/ai"

import { formatPeso } from "../../../../../shared/inventory/inventoryUtils"

function PaymentProcessModal({
  selectedCustomerType,
  totals,
  onClose,
  onConfirmPayment,
}) {
  const [amountReceived, setAmountReceived] = useState("")
  const amountInputRef = useRef(null)

  const numericAmountReceived = Number(amountReceived || 0)
  const change = numericAmountReceived - Number(totals.total || 0)
  const isPaymentEnough = numericAmountReceived >= Number(totals.total || 0)
  const pwdSeniorDiscountLabel =
    selectedCustomerType === "Senior" ? "Discount (Senior)" : "Discount (PWD)"

  const quickAmounts = useMemo(
    () => [
      { label: "Exact", value: Number(totals.total || 0) },
      { label: "P 500", value: 500 },
      { label: "P 1,000", value: 1000 },
    ],
    [totals.total]
  )

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === "Enter" && isPaymentEnough) {
        event.preventDefault()
        onConfirmPayment(numericAmountReceived)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPaymentEnough, numericAmountReceived, onClose, onConfirmPayment])

  const handleAmountChange = (event) => {
    const nextValue = event.target.value.replace(/[^\d.]/g, "")

    if ((nextValue.match(/\./g) || []).length > 1) {
      return
    }

    setAmountReceived(nextValue)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
          <AiOutlineShoppingCart className="h-10 w-10 text-slate-950" />
          <h2 className="text-2xl font-extrabold text-slate-950">
            Payment Process
          </h2>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-4">
          <div className="mb-4 flex flex-wrap justify-end gap-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount.label}
                type="button"
                onClick={() => setAmountReceived(String(amount.value))}
                className="inline-flex h-9 min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#0b6b51]/35 hover:bg-emerald-50"
              >
                {amount.label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="sr-only">Payment received</span>
            <input
              ref={amountInputRef}
              type="text"
              inputMode="decimal"
              value={amountReceived}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="h-20 w-full rounded-xl border border-transparent bg-white px-2 text-4xl font-semibold text-slate-900 outline-none placeholder:text-slate-300 focus:border-[#0b6b51]/20"
            />
          </label>
        </div>

        <div className="mt-5 space-y-2 text-base font-semibold text-slate-500">
          <div>
            Amount due:{" "}
            <span className="font-bold text-slate-900">
              {formatPeso(totals.total)}
            </span>
          </div>
          {Number(totals.productDiscountTotal || 0) > 0 && (
            <div>
              Discount (Promo):{" "}
              <span className="font-bold text-slate-900">
                {formatPeso(totals.productDiscountTotal)}
              </span>
            </div>
          )}
          {Number(totals.pwdSeniorDiscountTotal || 0) > 0 && (
            <div>
              {pwdSeniorDiscountLabel}:{" "}
              <span className="font-bold text-slate-900">
                {formatPeso(totals.pwdSeniorDiscountTotal)}
              </span>
            </div>
          )}
          {Number(totals.pwdSeniorDiscountTotal || 0) > 0 && (
            <div>
              VAT exemption:{" "}
              <span className="font-bold text-slate-900">
                {formatPeso(totals.vatExemptionTotal)}
              </span>
            </div>
          )}
          <div>
            Payment received:{" "}
            <span className="font-bold text-slate-900">
              {formatPeso(numericAmountReceived)}
            </span>
          </div>
          <div className={isPaymentEnough ? "text-[#0b6b51]" : "text-red-500"}>
            Change:{" "}
            <span className="font-bold">
              {formatPeso(Math.max(change, 0))}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isPaymentEnough}
            onClick={() => onConfirmPayment(numericAmountReceived)}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white transition hover:bg-[#005348] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Payment
          </button>
        </div>
      </section>
    </div>
  )
}

export default PaymentProcessModal
