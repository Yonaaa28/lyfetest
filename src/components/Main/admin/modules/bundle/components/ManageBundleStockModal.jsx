import { useMemo, useState } from "react"
import {
  FiAlertTriangle,
  FiBox,
  FiCheckCircle,
  FiInfo,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShoppingCart,
  FiX,
} from "react-icons/fi"

import useNotification from "../../../../../../hooks/useNotification"

const getAvailableStock = (item) => Number(item.availableQuantity) || 0
const getRequiredPerBundle = (item) => Math.max(Number(item.quantity) || 1, 1)

function ManageBundleStockModal({
  activeBranchId,
  bundle,
  onClose,
  onUpdateBundleStock,
}) {
  void activeBranchId

  const { showSuccess, showWarning } = useNotification()
  const [assembleQuantity, setAssembleQuantity] = useState(10)

  const stockRows = useMemo(
    () =>
      bundle.includedItems.map((item) => {
        const requiredPerBundle = getRequiredPerBundle(item)
        const totalRequired = requiredPerBundle * assembleQuantity
        const availableStock = getAvailableStock(item)
        const hasEnoughStock = availableStock >= totalRequired

        return {
          ...item,
          requiredPerBundle,
          totalRequired,
          availableStock,
          hasEnoughStock,
        }
      }),
    [assembleQuantity, bundle.includedItems]
  )

  const totalProductsRequired = stockRows.reduce(
    (total, item) => total + item.totalRequired,
    0
  )
  const totalAvailable = stockRows.reduce(
    (total, item) => total + item.availableStock,
    0
  )
  const maxCanAssemble = stockRows.length
    ? Math.min(
        ...stockRows.map((item) =>
          Math.floor(item.availableStock / item.requiredPerBundle)
        )
      )
    : 0
  const allProductsAvailable =
    stockRows.length > 0 && stockRows.every((item) => item.hasEnoughStock)
  const newBundleStockTotal = Number(bundle.stock) + assembleQuantity

  const adjustAssembleQuantity = (amount) => {
    setAssembleQuantity((currentQuantity) =>
      Math.max(currentQuantity + amount, 1)
    )
  }

  const handleAssembleBundle = () => {
    if (!allProductsAvailable) {
      showWarning("Not enough stock.", { title: "Bundle stock" })
      return
    }
    const updatedBundle = {
      ...bundle,
      stock: newBundleStockTotal,
      includedItems: bundle.includedItems.map((item) => {
        const requiredPerBundle = getRequiredPerBundle(item)

        return {
          ...item,
          availableQuantity: Math.max(
            getAvailableStock(item) - requiredPerBundle * assembleQuantity,
            0
          ),
        }
      }),
    }

    onUpdateBundleStock(updatedBundle)
    showSuccess("Bundle stock updated.", { title: "Stock assembled" })
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51]">
              <FiBox className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold leading-tight text-slate-950 sm:text-2xl">
                Manage Bundle Stock
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                View stock overview and manage included product stocks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Close manage bundle stock modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51]">
              <FiShoppingCart className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Restock Bundle
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Assemble bundles using available included product stock.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-extrabold text-slate-700">
                Quantity of bundles to assemble
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-40 grid-cols-[40px_minmax(0,1fr)_40px] overflow-hidden rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => adjustAssembleQuantity(-1)}
                    className="grid place-items-center text-slate-500 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                    aria-label="Decrease bundle assemble quantity"
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={assembleQuantity}
                    onChange={(event) =>
                      setAssembleQuantity(
                        Math.max(Number(event.target.value) || 1, 1)
                      )
                    }
                    className="border-x border-slate-200 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => adjustAssembleQuantity(1)}
                    className="grid place-items-center text-[#0b6b51] transition hover:bg-slate-50"
                    aria-label="Increase bundle assemble quantity"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm font-bold text-slate-600">packs</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Current available:{" "}
                <span className="font-extrabold text-[#0b6b51]">
                  {bundle.stock} packs
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-[#0b6b51]">
                <FiPackage className="h-5 w-5" />
                <p className="text-sm font-extrabold">After Assembling</p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm font-bold">
                  <span className="text-slate-600">Bundle Stock Increase</span>
                  <span className="text-[#0b6b51]">+{assembleQuantity} packs</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm font-bold">
                  <span className="text-slate-600">New Bundle Stock Total</span>
                  <span className="text-[#0b6b51]">
                    {newBundleStockTotal} packs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-extrabold text-slate-800">
              Required Products (Auto-calculated)
            </h4>

            <div className="mt-3 grid gap-3 md:hidden">
              {stockRows.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-slate-100 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.image}
                      alt={item.productName}
                      className="h-12 w-16 rounded-lg border border-slate-100 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        x{item.requiredPerBundle} per bundle
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold">
                    <div>
                      <p className="uppercase text-slate-400">Required</p>
                      <p className="mt-1 text-slate-700">
                        {item.totalRequired} pcs
                      </p>
                    </div>
                    <div>
                      <p className="uppercase text-slate-400">Available</p>
                      <p className="mt-1 text-[#0b6b51]">
                        {item.availableStock} pcs
                      </p>
                    </div>
                    <div>
                      <p className="uppercase text-slate-400">Enough</p>
                      <p className="mt-1 text-slate-700">
                        {item.hasEnoughStock ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase text-slate-400">Status</p>
                      <span
                        className={`mt-1 inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                          item.hasEnoughStock
                            ? "bg-emerald-100 text-[#0b6b51]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.hasEnoughStock ? "Enough Stock" : "Low Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 hidden overflow-x-auto rounded-xl border border-slate-100 md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Required per Bundle</th>
                    <th className="px-4 py-3">
                      Total Required ({assembleQuantity} packs)
                    </th>
                    <th className="px-4 py-3">Available Stock</th>
                    <th className="px-4 py-3">Enough Stock?</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockRows.map((item) => (
                    <tr key={item.productId} className="font-semibold">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.image}
                            alt={item.productName}
                            className="h-12 w-16 rounded-lg border border-slate-100 object-contain"
                          />
                          <span className="font-extrabold text-slate-900">
                            {item.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        x{item.requiredPerBundle}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.totalRequired} pcs
                      </td>
                      <td className="px-4 py-4 text-[#0b6b51]">
                        {item.availableStock} pcs
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          {item.hasEnoughStock ? (
                            <FiCheckCircle className="h-5 w-5 text-[#0b6b51]" />
                          ) : (
                            <FiAlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          {item.hasEnoughStock ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                            item.hasEnoughStock
                              ? "bg-emerald-100 text-[#0b6b51]"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.hasEnoughStock ? "Enough Stock" : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:items-center">
              <div className="flex items-start gap-3">
                <FiCheckCircle
                  className={`mt-0.5 h-8 w-8 shrink-0 ${
                    allProductsAvailable ? "text-[#0b6b51]" : "text-red-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Stock Check Result
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      allProductsAvailable ? "text-[#0b6b51]" : "text-red-600"
                    }`}
                  >
                    {allProductsAvailable
                      ? "All required products are available."
                      : "Not enough product stock for this quantity."}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    You can assemble {maxCanAssemble} packs.
                  </p>
                </div>
              </div>

              <ResultMetric label="Total Products Required" value={`${totalProductsRequired} pcs`} />
              <ResultMetric label="Total Available" value={`${totalAvailable} pcs`} />
              <ResultMetric label="Can Assemble" value={`${maxCanAssemble} packs`} emphasize />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAssembleBundle}
            disabled={!allProductsAvailable}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00843d] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#006f33] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiShoppingCart className="h-5 w-5" />
            Assemble {assembleQuantity} Packs
          </button>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">
            This will deduct included products from inventory and add to bundle
            stock.
          </p>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          <FiInfo className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Bundle stock is automatically computed based on the lowest available
            included product stock.
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultMetric({ label, value, emphasize = false }) {
  return (
    <div className="rounded-xl bg-white/70 px-4 py-3">
      <p className="text-xs font-extrabold text-slate-500">{label}</p>
      <p
        className={`mt-2 font-extrabold ${
          emphasize ? "text-2xl text-[#0b6b51]" : "text-base text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default ManageBundleStockModal
