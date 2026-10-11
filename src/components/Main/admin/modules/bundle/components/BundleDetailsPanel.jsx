import { FiBox, FiCalendar, FiEdit3, FiX } from "react-icons/fi"

import { formatDate, formatPeso } from "../../../../../shared/inventory/inventoryUtils"
import BundleImage from "./BundleImage"
import StatusBadge from "./StatusBadge"

function BundleDetailsPanel({
  selectedBundle,
  onEditBundle,
  onClose,
  className = "",
}) {
  return (
    <aside
      className={`flex min-h-[34rem] flex-col rounded-3xl border border-white/70 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5 xl:h-[calc(100dvh-14rem)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
          Bundle Description
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Close bundle details"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {selectedBundle ? (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <BundleImage bundle={selectedBundle} large />
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                {selectedBundle.name}
              </h3>
              <StatusBadge status={selectedBundle.status} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-500">Bundle Price</p>
              <p className="mt-2 text-2xl font-extrabold text-[#0b6b51]">
                {formatPeso(selectedBundle.price)}
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-500">Included Items</p>
              <div className="mt-3 space-y-2">
                {selectedBundle.includedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0b6b51]" />
                      {item.productName}
                    </span>
                    <span>x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-500">
                Available Stock
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-[#0b6b51]">
                <FiBox className="h-5 w-5 text-slate-500" />
                {selectedBundle.stock} packs
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-500">Created</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiCalendar className="h-5 w-5 text-slate-500" />
                {formatDate(selectedBundle.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEditBundle(selectedBundle)}
            className="mt-5 inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/60 bg-white text-sm font-extrabold text-[#0b6b51] transition hover:bg-emerald-50"
          >
            <FiEdit3 className="h-4 w-4" />
            Edit Bundle
          </button>
        </div>
      ) : (
        <div className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-sm font-semibold text-slate-400">
            choose a bundle to see description
          </p>
        </div>
      )}
    </aside>
  )
}

export default BundleDetailsPanel
