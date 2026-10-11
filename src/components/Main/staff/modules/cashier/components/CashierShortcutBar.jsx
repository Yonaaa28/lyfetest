import { CiBarcode } from "react-icons/ci"
import {
  FiCreditCard,
  FiLogOut,
  FiPackage,
  FiSlash,
  FiTag,
  FiTrash2,
} from "react-icons/fi"

const shortcuts = [
  { keyLabel: "F2", label: "Logout", icon: FiLogOut },
  { keyLabel: "F3", label: "Scan/Search", icon: CiBarcode },
  { keyLabel: "F4", label: "Products", icon: FiPackage },
  { keyLabel: "F5", label: "Void", icon: FiSlash },
  { keyLabel: "F6", label: "Price Inquiry", icon: FiTag },
  { keyLabel: "F7", label: "Transaction Cancel", icon: FiTrash2 },
  { keyLabel: "F8", label: "Proceed", icon: FiCreditCard },
]

function CashierShortcutBar({
  onLogoutRequest,
  onScanSearchRequest,
  onVoidTransactionRequest,
}) {
  return (
    <div className="cashier-shortcut-bar hidden rounded-2xl border border-white/60 bg-white px-3 py-2 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-2">
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon
        const isLogoutShortcut = shortcut.keyLabel === "F2"
        const isScanSearchShortcut = shortcut.keyLabel === "F3"
        const isVoidShortcut = shortcut.keyLabel === "F5"
        const className =
          "flex h-8 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold text-slate-600"

        const content = (
          <>
            <span className="rounded-lg border border-[#0b6b51]/30 bg-emerald-50 px-2 py-1 text-xs font-extrabold text-[#0b6b51]">
              {shortcut.keyLabel}
            </span>
            <Icon className="h-4 w-4 text-[#0b6b51]" />
            <span>{shortcut.label}</span>
          </>
        )

        if (isLogoutShortcut || isScanSearchShortcut || isVoidShortcut) {
          return (
            <button
              key={shortcut.keyLabel}
              type="button"
              onClick={
                isLogoutShortcut
                  ? onLogoutRequest
                  : isScanSearchShortcut
                    ? onScanSearchRequest
                    : onVoidTransactionRequest
              }
              className={`${className} transition ${
                isLogoutShortcut
                  ? "hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                  : isVoidShortcut
                    ? "hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                  : "hover:border-[#0b6b51]/20 hover:bg-emerald-50 hover:text-[#0b6b51]"
              }`}
            >
              {content}
            </button>
          )
        }

        return (
          <div key={shortcut.keyLabel} className={className}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

export default CashierShortcutBar
