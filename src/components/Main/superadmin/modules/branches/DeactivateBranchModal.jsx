import { useEffect, useState } from "react"
import { HiOutlineExclamationTriangle } from "react-icons/hi2"

function DeactivateBranchModal({ branch, onCancel, onConfirm }) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onCancel])

  if (!branch) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-branch-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close deactivate branch dialog"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
            <HiOutlineExclamationTriangle className="h-9 w-9" />
          </span>
          <h2
            id="deactivate-branch-title"
            className="mt-6 text-xl font-bold text-slate-950"
          >
            Deactivate Branch
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            Are you sure you want to deactivate{" "}
            <strong className="text-slate-900">{branch.name}</strong>?
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-700">
            This branch will become inactive.
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-5 text-red-700">
            <li>Branch Admin and Staff will no longer be able to log in.</li>
            <li>New transactions cannot be processed.</li>
            <li>
              All branch data and history will be preserved in Backup &amp;
              Restore.
            </li>
          </ul>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Reason <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Enter a reason for deactivation"
            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            className="h-11 rounded-lg bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Yes, Deactivate &amp; Move to Backup
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeactivateBranchModal
