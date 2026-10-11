import { useEffect, useRef } from "react"

import ProductThumb from "./ProductThumb"
import {
  formatDate,
  getItemUnitDisplay,
  getProductTableDisplayName,
  getProductQuantity,
  isLowStock,
  isNearExpiry,
  isOutOfStock,
} from "./inventoryUtils"

function InventoryProductTable({
  items,
  selectedItemId,
  selectedItemIds = [],
  onSelectItem,
  onToggleItemSelection,
  onToggleAllItems,
  renderActions,
}) {
  const hasActions = Boolean(renderActions)
  const isSelectable = Boolean(onToggleItemSelection)
  const selectedItemIdSet = new Set(selectedItemIds)
  const visibleSelectedCount = items.filter((item) =>
    selectedItemIdSet.has(item.id)
  ).length
  const allItemsSelected = items.length > 0 && visibleSelectedCount === items.length
  const someItemsSelected = visibleSelectedCount > 0 && !allItemsSelected
  const selectAllCheckboxRef = useRef(null)

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someItemsSelected
    }
  }, [someItemsSelected])

  return (
    <>
      <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1 xl:hidden">
        {items.map((item) => {
          const selected = selectedItemId === item.id
          const selectedForBulkAction = selectedItemIdSet.has(item.id)
          const outOfStock = isOutOfStock(item)
          const lowStock = isLowStock(item)
          const nearExpiry = isNearExpiry(item)

          return (
            <article
              key={item.id}
              onClick={() => onSelectItem?.(item.id)}
              className={`cursor-pointer rounded-[18px] border p-3 text-sm transition ${
                selected
                  ? "border-[#0b6b51]/35 bg-emerald-50/70"
                  : "border-slate-100 bg-white hover:bg-emerald-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                {isSelectable && (
                  <label
                    className="mt-2 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white transition hover:border-[#0b6b51]/40"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span className="sr-only">
                      Select {getProductTableDisplayName(item)}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedForBulkAction}
                      onChange={() => onToggleItemSelection(item.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#0b6b51]"
                    />
                  </label>
                )}
                <ProductThumb item={item} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">
                    {getProductTableDisplayName(item)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.batchNumber ?? "Batch number pending"}
                  </p>
                </div>
                <div
                  className={`text-right font-bold [font-variant-numeric:tabular-nums] ${
                    outOfStock
                      ? "text-red-500"
                      : lowStock
                        ? "text-amber-500"
                        : "text-slate-900"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase text-slate-400">
                    Qty
                  </p>
                  {getProductQuantity(item)}
                </div>
                {hasActions && (
                  <div onClick={(event) => event.stopPropagation()}>
                    {renderActions(item)}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-400">Brand</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {item.brand}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400">Category</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {item.category}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400">Item Unit</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {getItemUnitDisplay(item)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400">Exp. Date</p>
                  <p
                    className={`mt-1 font-medium [font-variant-numeric:tabular-nums] ${
                      nearExpiry ? "text-red-500" : "text-slate-800"
                    }`}
                  >
                    {formatDate(item.expiryDate)}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <table
        className={`hidden w-full ${
          hasActions || isSelectable ? "min-w-220" : "min-w-190"
        } border-collapse text-left xl:table`}
      >
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-sm font-semibold text-slate-600">
            {isSelectable && (
              <th className="rounded-l-xl px-4 py-3">
                <label className="grid h-5 w-5 cursor-pointer place-items-center">
                  <span className="sr-only">Select all visible products</span>
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={allItemsSelected}
                    onChange={onToggleAllItems}
                    className="h-4 w-4 rounded border-slate-300 accent-[#0b6b51]"
                  />
                </label>
              </th>
            )}
            <th className={`${isSelectable ? "" : "rounded-l-xl"} px-4 py-3`}>
              Image
            </th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Brand</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Item Unit</th>
            <th className="px-4 py-3">Exp. Date</th>
            <th className="px-4 py-3">QTY</th>
            {hasActions && (
              <th className="rounded-r-xl px-4 py-3 text-center">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const selected = selectedItemId === item.id
            const selectedForBulkAction = selectedItemIdSet.has(item.id)
            const outOfStock = isOutOfStock(item)
            const lowStock = isLowStock(item)
            const nearExpiry = isNearExpiry(item)

            return (
              <tr
                key={item.id}
                onClick={() => onSelectItem?.(item.id)}
                className={`cursor-pointer border-b border-slate-100 text-sm transition hover:bg-emerald-50/40 ${
                  selected ? "bg-emerald-50/70" : "bg-white"
                }`}
              >
                {isSelectable && (
                  <td
                    className="px-4 py-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <label className="grid h-5 w-5 cursor-pointer place-items-center">
                      <span className="sr-only">
                        Select {getProductTableDisplayName(item)}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedForBulkAction}
                        onChange={() => onToggleItemSelection(item.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#0b6b51]"
                      />
                    </label>
                  </td>
                )}
                <td className="px-4 py-3">
                  <ProductThumb item={item} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800">
                    {getProductTableDisplayName(item)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.batchNumber ?? "Batch number pending"}
                  </p>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {item.brand}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {item.category}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {getItemUnitDisplay(item)}
                </td>
                <td
                  className={`px-4 py-3 font-medium [font-variant-numeric:tabular-nums] ${
                    nearExpiry ? "text-red-500" : "text-slate-900"
                  }`}
                >
                  {formatDate(item.expiryDate)}
                </td>
                <td
                  className={`px-4 py-3 font-bold [font-variant-numeric:tabular-nums] ${
                    outOfStock
                      ? "text-red-500"
                      : lowStock
                        ? "text-amber-500"
                        : "text-slate-900"
                  }`}
                >
                  {getProductQuantity(item)}
                </td>
                {hasActions && (
                  <td className="px-4 py-3">{renderActions(item)}</td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default InventoryProductTable
