import { useEffect, useMemo, useRef, useState } from "react"
import { CiBarcode } from "react-icons/ci"

import {
  formatPeso,
  getItemUnits,
} from "../../../../../shared/inventory/inventoryUtils"
import {
  filterCashierProducts,
  getCashierProductName,
  getCashierProductPrice,
  getCashierUnitMaxQuantity,
} from "../utils/cashierUtils"

function PriceCheckModal({ products, onClose }) {
  const [barcodeQuery, setBarcodeQuery] = useState("")
  const [checkedProduct, setCheckedProduct] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")
  const inputRef = useRef(null)

  const matchingProduct = useMemo(
    () =>
      filterCashierProducts({
        products,
        searchTerm: barcodeQuery,
      })[0] ?? null,
    [barcodeQuery, products]
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

  const handleCheckPrice = () => {
    if (!barcodeQuery.trim()) {
      setCheckedProduct(null)
      setStatusMessage("Enter barcode")
      return
    }

    if (!matchingProduct) {
      setCheckedProduct(null)
      setStatusMessage("Product not found")
      return
    }

    setCheckedProduct(matchingProduct)
    setStatusMessage("")
  }

  const itemUnits = checkedProduct ? getItemUnits(checkedProduct) : []
  const primaryUnit = itemUnits[0]?.itemUnit ?? checkedProduct?.itemUnit ?? "Piece"

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Price Inquiry
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Scan or enter the product barcode.
          </p>
        </div>

        <label className="relative mt-8 block">
          <span className="sr-only">Scan or search barcode</span>
          <input
            ref={inputRef}
            type="search"
            value={barcodeQuery}
            onChange={(event) => {
              setBarcodeQuery(event.target.value)
              setStatusMessage("")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleCheckPrice()
              }
            }}
            placeholder="Scan/Search barcode..."
            className="h-16 w-full rounded-2xl border border-slate-200 bg-white px-5 pl-14 text-lg font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
          <CiBarcode className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
        </label>

        {statusMessage && (
          <p className="mt-3 text-center text-sm font-bold text-red-500">
            {statusMessage}
          </p>
        )}

        {checkedProduct && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-950">
                  {getCashierProductName(checkedProduct)}
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Batch: {checkedProduct.batchNumber}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                Available
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-extrabold uppercase text-slate-400">
                  Price
                </p>
                <p className="mt-1 text-xl font-extrabold text-[#0b6b51]">
                  {formatPeso(getCashierProductPrice(checkedProduct, primaryUnit))}
                </p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-extrabold uppercase text-slate-400">
                  Stock
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">
                  {getCashierUnitMaxQuantity({
                    product: checkedProduct,
                    selectedUnit: primaryUnit,
                  })}{" "}
                  {primaryUnit}
                </p>
              </div>
            </div>

            {itemUnits.length > 1 && (
              <div className="mt-4 space-y-2">
                {itemUnits.map((unit) => (
                  <div
                    key={unit.itemUnit}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600"
                  >
                    <span>{unit.itemUnit}</span>
                    <span className="text-slate-950">
                      {formatPeso(
                        getCashierProductPrice(checkedProduct, unit.itemUnit)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            onClick={checkedProduct ? onClose : handleCheckPrice}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white transition hover:bg-[#005348]"
          >
            {checkedProduct ? "Done" : "Inquire Price"}
          </button>
        </div>
      </section>
    </div>
  )
}

export default PriceCheckModal
