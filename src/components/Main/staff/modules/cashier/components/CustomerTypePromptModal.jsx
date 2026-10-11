import { useEffect } from "react"
import { FiCreditCard, FiUserCheck, FiUsers, FiX } from "react-icons/fi"

import { formatPeso } from "../../../../../shared/inventory/inventoryUtils"

function CustomerTypePromptModal({ customerTypes, totals, onClose, onSelect }) {
  const customerTypeIcons = {
    Regular: FiCreditCard,
    PWD: FiUserCheck,
    Senior: FiUsers,
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      const shortcutCustomerType = customerTypes.find(
        (customerType) => customerType.shortcut === event.key
      )

      if (shortcutCustomerType) {
        event.preventDefault()
        onSelect(shortcutCustomerType.id)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [customerTypes, onClose, onSelect])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">
              Select Customer Type
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Total:{" "}
              <span className="text-[#00675b]">
                {formatPeso(totals.total)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            aria-label="Close customer type"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {customerTypes.map((customerType) => {
            const Icon = customerTypeIcons[customerType.id] ?? FiCreditCard

            return (
              <button
                key={customerType.id}
                type="button"
                onClick={() => onSelect(customerType.id)}
                className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center transition hover:border-[#0b6b51]/35 hover:bg-emerald-50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-[#00675b]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {customerType.label}
                </span>
                <span className="rounded-md border border-[#0b6b51]/25 px-1.5 py-0.5 text-[10px] font-extrabold text-[#0b6b51]">
                  {customerType.shortcut}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default CustomerTypePromptModal
