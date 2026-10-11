import { CiBarcode } from "react-icons/ci"
import { FiPackage, FiTag } from "react-icons/fi"

function CashierSearchBar({
  searchInputRef,
  searchTerm,
  searchResults,
  onSearchChange,
  onSelectProduct,
  onScanBarcode,
  onOpenPriceCheck,
  onOpenProductList,
}) {
  return (
    <div className="relative">
      <div className="cashier-search-controls flex flex-col gap-3 lg:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Scan or search barcode</span>
          <input
            ref={searchInputRef}
            type="search"
            value={searchTerm}
            onChange={onSearchChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults[0]) {
                onSelectProduct(searchResults[0])
              }
            }}
            placeholder="Scan/Search barcode..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
          <CiBarcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </label>

        <button
          type="button"
          onClick={onScanBarcode}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/45 bg-white px-4 py-3 text-center text-sm font-extrabold leading-tight text-[#0b6b51] transition hover:bg-emerald-50 sm:px-5"
        >
          <CiBarcode className="h-5 w-5" />
          <span>F3 Scan/Search Barcode</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenPriceCheck}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/45 bg-white px-4 text-sm font-extrabold text-[#0b6b51] transition hover:bg-emerald-50 sm:w-auto"
        >
          <FiTag className="h-4 w-4" />
          Price Inquiry
        </button>
        <button
          type="button"
          onClick={onOpenProductList}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/45 bg-white px-4 text-sm font-extrabold text-[#0b6b51] transition hover:bg-emerald-50 sm:w-auto"
        >
          <FiPackage className="h-4 w-4" />
          Products
        </button>
      </div>
    </div>
  )
}

export default CashierSearchBar
