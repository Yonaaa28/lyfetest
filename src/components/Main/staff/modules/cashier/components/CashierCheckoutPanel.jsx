import { FiMinus, FiPlus, FiTrash2, FiX } from "react-icons/fi"

import {
  formatPeso,
  getItemUnits,
} from "../../../../../shared/inventory/inventoryUtils"
import {
  getCartItemSubtotal,
  getCartItemDiscountInfo,
  getCashierProductName,
  getCashierProductPrice,
  getCashierUnitMaxQuantity,
  getDiscountValueLabel,
  isPwdSeniorDiscountable,
} from "../utils/cashierUtils"

function CashierCheckoutPanel({
  cartItems,
  productDiscounts,
  selectedCustomerType,
  totals,
  onClearCart,
  onRemoveItem,
  onQuantityChange,
  onUnitChange,
  onProceed,
}) {
  const shouldShowDiscountStatus = selectedCustomerType !== "Regular"
  const pwdSeniorDiscountLabel =
    selectedCustomerType === "Senior" ? "Discount (Senior)" : "Discount (PWD)"

  return (
    <aside className="flex min-h-[34rem] flex-col rounded-[24px] border border-white/60 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5 xl:h-[calc(100dvh-8rem)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-900">Current Sale</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClearCart}
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-red-500 transition hover:text-red-600"
        >
          <FiTrash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 xl:max-h-none">
        {cartItems.map((item) => {
          const discountInfo = getCartItemDiscountInfo({
            item,
            discountRate: selectedCustomerType === "Regular" ? 0 : 0.2,
            productDiscounts,
          })
          const productDiscount = discountInfo.productDiscount

          return (
            <article
              key={item.cartId}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-slate-900">
                    {getCashierProductName(item.product)}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Batch: {item.product.batchNumber}
                  </p>
                  {productDiscount && (
                    <span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-extrabold text-[#0b6b51]">
                      {productDiscount.name} ({getDiscountValueLabel(productDiscount)})
                    </span>
                  )}
                  {shouldShowDiscountStatus &&
                    !productDiscount &&
                    !isPwdSeniorDiscountable(item.product) && (
                      <span className="mt-2 inline-flex rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-extrabold text-amber-700">
                        No PWD/Senior discount
                      </span>
                    )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.cartId)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${getCashierProductName(item.product)}`}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-3 flex flex-col gap-2 text-xs font-bold text-slate-500 sm:flex-row sm:items-center">
                <span className="shrink-0">Item Unit:</span>
                <select
                  value={item.itemUnit}
                  onChange={(event) =>
                    onUnitChange(item.cartId, event.target.value)
                  }
                  className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0b6b51]"
                >
                  {getItemUnits(item.product).map((unit) => (
                    <option key={unit.itemUnit} value={unit.itemUnit}>
                      {`${unit.itemUnit} (${getCashierUnitMaxQuantity(
                        {
                          cartItems,
                          product: item.product,
                          selectedUnit: unit.itemUnit,
                          excludeCartId: item.cartId,
                        }
                      )} available)`}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onQuantityChange(item.cartId, Number(item.quantity) - 1)
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-[#0b6b51]/30 hover:text-[#0b6b51]"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-extrabold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onQuantityChange(item.cartId, Number(item.quantity) + 1)
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-50 text-[#0b6b51] transition hover:border-[#0b6b51]/30"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="truncate text-sm font-bold text-slate-500">
                    @ {formatPeso(getCashierProductPrice(item.product, item.itemUnit))}
                  </span>
                </div>
                <p className="text-right text-sm font-extrabold text-slate-900 sm:text-left">
                  {formatPeso(getCartItemSubtotal(item))}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100" />
            </article>
          )
        })}

        {!cartItems.length && (
          <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="max-w-48 text-sm font-semibold text-slate-500">
              Cart is empty. Search or scan a product first.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="space-y-3 text-sm font-bold text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal ({totals.itemCount} items)</span>
            <span className="text-slate-900">{formatPeso(totals.subtotal)}</span>
          </div>
          {totals.productDiscountTotal > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>Discount (Promo)</span>
              <span>{formatPeso(totals.productDiscountTotal)}</span>
            </div>
          )}
          {totals.pwdSeniorDiscountTotal > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>{pwdSeniorDiscountLabel}</span>
              <span>{formatPeso(totals.pwdSeniorDiscountTotal)}</span>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-slate-200" />

        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-slate-600">Current Total</span>
          <span className="font-extrabold text-[#0b6b51]">
            {formatPeso(totals.total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!cartItems.length}
        onClick={onProceed}
        className="mt-3 inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#00675b] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Proceed
        <span className="ml-auto rounded-lg border border-white/40 px-2 py-0.5 text-xs">
          F8
        </span>
      </button>
    </aside>
  )
}

export default CashierCheckoutPanel
