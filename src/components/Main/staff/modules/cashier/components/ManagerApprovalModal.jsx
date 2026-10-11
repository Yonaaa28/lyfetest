import { useEffect, useRef, useState } from "react"
import { CiBarcode } from "react-icons/ci"
import { FiShield } from "react-icons/fi"

const managerApprovalKeys = ["MGR-001", "LYFE-MANAGER", "1234567890"]

function ManagerApprovalModal({
  customerTypeLabel,
  approvalDescription,
  approveButtonLabel = "Approve Discount",
  onApprove,
  onClose,
}) {
  const [managerKey, setManagerKey] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const inputRef = useRef(null)

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

  const handleApprove = () => {
    const normalizedKey = managerKey.trim().toUpperCase()

    if (!normalizedKey) {
      setStatusMessage("Scan manager card or enter manager key")
      return
    }

    if (!managerApprovalKeys.includes(normalizedKey)) {
      setStatusMessage("Manager approval not recognized")
      return
    }

    onApprove(normalizedKey)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-[#00675b]">
            <FiShield className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
            Manager Approval
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {approvalDescription ??
              `Approval is required before applying the ${customerTypeLabel} discount.`}
          </p>
        </div>

        <label className="relative mt-8 block">
          <span className="sr-only">Scan manager card or enter manager key</span>
          <input
            ref={inputRef}
            type="password"
            value={managerKey}
            onChange={(event) => {
              setManagerKey(event.target.value)
              setStatusMessage("")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleApprove()
              }
            }}
            placeholder="Scan manager card or enter manager key..."
            className="h-16 w-full rounded-2xl border border-slate-200 bg-white px-5 pl-14 text-lg font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
          <CiBarcode className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
        </label>

        {statusMessage && (
          <p className="mt-3 text-center text-sm font-bold text-red-500">
            {statusMessage}
          </p>
        )}

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
            onClick={handleApprove}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white transition hover:bg-[#005348]"
          >
            {approveButtonLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ManagerApprovalModal
