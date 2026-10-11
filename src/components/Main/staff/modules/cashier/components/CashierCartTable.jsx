import ProductThumb from "../../../../../shared/inventory/ProductThumb"
import { formatDate, formatPeso } from "../../../../../shared/inventory/inventoryUtils"
import {
  getCartItemSubtotal,
  getCartItemDiscountInfo,
  getCashierProductName,
  getCashierUnitMaxQuantity,
  getDiscountValueLabel,
  isPwdSeniorDiscountable,
} from "../utils/cashierUtils"

function CashierCartTable({
  cartItems,
  productDiscounts,
  selectedCustomerType,
}) {
  const shouldShowDiscountStatus = selectedCustomerType !== "Regular"

  return (
    <div className="cashier-cart-table mt-6 hidden min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100 bg-white lg:block">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
            <th className="rounded-l-2xl px-4 py-4">Image</th>
            <th className="px-4 py-4">Product Name</th>
            <th className="px-4 py-4">Brand</th>
            <th className="px-4 py-4">Item Unit</th>
            <th className="px-4 py-4 text-center">QTY</th>
            <th className="px-4 py-4">Exp. Date</th>
            <th className="px-4 py-4 text-center">Stock</th>
            <th className="px-4 py-4 text-right">Unit Price</th>
            <th className="rounded-r-2xl px-4 py-4 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            const discountInfo = getCartItemDiscountInfo({
              item,
              discountRate: selectedCustomerType === "Regular" ? 0 : 0.2,
              productDiscounts,
            })
            const productDiscount = discountInfo.productDiscount

            return (
              <tr
                key={item.cartId}
                className="text-sm font-semibold text-slate-700"
              >
                <td className="border-b border-slate-100 px-4 py-4">
                  <ProductThumb item={item.product} />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <p className="font-extrabold text-slate-900">
                    {getCashierProductName(item.product)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
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
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {item.product.brand}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {item.itemUnit}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-center font-extrabold text-slate-900">
                  {item.quantity}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  {formatDate(item.product.expiryDate)}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-center">
                  <p className="font-extrabold text-slate-900">
                    {getCashierUnitMaxQuantity({
                      cartItems,
                      product: item.product,
                      selectedUnit: item.itemUnit,
                      excludeCartId: item.cartId,
                    })}{" "}
                    {item.itemUnit}
                  </p>
                  <span className="mt-1 inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    Available
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-slate-900">
                  {formatPeso(item.price)}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-[#0b6b51]">
                  {formatPeso(getCartItemSubtotal(item))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {!cartItems.length && (
        <div className="grid min-h-[24rem] place-items-center text-center">
          <p className="max-w-sm text-sm font-semibold text-slate-500">
            Search or scan a product to add it to the cashier table.
          </p>
        </div>
      )}
    </div>
  )
}

export default CashierCartTable
