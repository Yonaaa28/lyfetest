import { BiCategory } from "react-icons/bi"
import { CiBarcode } from "react-icons/ci"
import { FaRegCalendarTimes } from "react-icons/fa"
import { FaBoxesStacked, FaBoxOpen } from "react-icons/fa6"
import { FiEdit3, FiTarget, FiTruck, FiX } from "react-icons/fi"
import { IoMdPricetags } from "react-icons/io"
import { TbBrandAbstract, TbReportMoney } from "react-icons/tb"

import ProductThumb from "./ProductThumb"
import {
  formatDate,
  formatPeso,
  getActiveBatches,
  getItemUnits,
  getPrimaryBatch,
  getProductDisplayName,
  getProductQuantity,
  isLowStock,
  isOutOfStock,
} from "./inventoryUtils"

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-3 pt-0.5 font-semibold text-slate-600">
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
        <span>{label}</span>
      </div>
      <span className="text-right font-medium text-slate-800 [font-variant-numeric:tabular-nums]">
        {value}
      </span>
    </div>
  )
}

function ItemUnitBreakdown({ item }) {
  const itemUnits = getItemUnits(item)
  if (!itemUnits.length) {
    return "N/A"
  }

  return (
    <span className="space-y-1 text-right">
      {itemUnits.map((unit, index) => (
        <span key={`${unit.itemUnit}-${index}`} className="block">
          {unit.itemUnit}
          {unit.conversionFactor ? ` x ${unit.conversionFactor}` : ""}
          {unit.sellingPrice !== "" && unit.sellingPrice !== undefined
            ? ` - ${formatPeso(Number(unit.sellingPrice) || 0)}`
            : ""}
        </span>
      ))}
    </span>
  )
}

function BatchQuantityBreakdown({ item }) {
  const activeBatches = getActiveBatches(item)
  const primaryBatchId = activeBatches[0]?.id

  if (!activeBatches.length) {
    return "0 total"
  }

  return (
    <span className="space-y-1 text-right">
      <span className="block font-bold">{getProductQuantity(item)} total</span>
      {activeBatches.map((batch) => {
        const isPrimaryBatch = batch.id === primaryBatchId

        return (
          <span
            key={batch.id ?? batch.batchNumber}
            className={`relative block ${isPrimaryBatch ? "" : "group cursor-help"}`}
          >
            {batch.batchNumber} - {batch.quantity}
            {!isPrimaryBatch && (
              <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                Exp: {formatDate(batch.expiryDate)}
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function ProductDetailsPanel({
  item,
  showEditButton = false,
  onEditClick,
  onClose,
  emptyMessage = "choose a product to see description",
  className = "",
}) {
  const isItemOutOfStock = item ? isOutOfStock(item) : false
  const isItemLowStock = item ? isLowStock(item) : false
  const stockLabel = isItemOutOfStock
    ? "No Stock"
    : isItemLowStock
      ? "Low Stock"
      : "In Stock"
  const stockClassName = isItemOutOfStock
    ? "bg-red-100 text-red-700"
    : isItemLowStock
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700"
  const primaryBatch = item ? getPrimaryBatch(item) : null

  return (
    <aside
      className={`flex flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Close product details"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {item ? (
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <ProductThumb item={item} large />

          <div className="mt-3 flex shrink-0 items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {getProductDisplayName(item)}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {item.dosageForm}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${stockClassName}`}
            >
              {stockLabel}
            </span>
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto border-t border-slate-100 pr-1 pt-1">
            <DetailRow icon={TbBrandAbstract} label="Brand" value={item.brand} />
            <DetailRow icon={BiCategory} label="Category" value={item.category} />
            <DetailRow icon={IoMdPricetags} label="Type" value={item.dosageForm} />
            <DetailRow
              icon={FaBoxOpen}
              label="Item Unit"
              value={<ItemUnitBreakdown item={item} />}
            />
            <DetailRow
              icon={FaBoxesStacked}
              label="Quantity"
              value={<BatchQuantityBreakdown item={item} />}
            />
            <DetailRow
              icon={FiTarget}
              label="Reorder Point"
              value={item.reorderPoint ?? 0}
            />
            <DetailRow
              icon={FaRegCalendarTimes}
              label="Expiry Date"
              value={
                primaryBatch?.expiryDate
                  ? formatDate(primaryBatch.expiryDate)
                  : formatDate(item.expiryDate)
              }
            />
            <DetailRow icon={FiTruck} label="Supplier" value={item.supplier} />
            <DetailRow icon={CiBarcode} label="Barcode" value={item.barcode} />
            <DetailRow
              icon={TbReportMoney}
              label="Cost Price"
              value={formatPeso(item.costPrice)}
            />
            <DetailRow
              icon={IoMdPricetags}
              label="Selling Price"
              value={formatPeso(item.sellingPrice)}
            />
            <DetailRow
              icon={TbReportMoney}
              label="PWD/Senior Discount"
              value={
                item.isPwdSeniorDiscountable ?? true
                  ? "Applicable"
                  : "Not applicable"
              }
            />
          </div>

          {showEditButton && (
            <button
              type="button"
              onClick={onEditClick}
              className="mt-3 inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
            >
              <FiEdit3 className="h-4 w-4" />
              Edit Item
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-200 px-6 text-center">
          <p className="text-base font-semibold text-slate-400">
            {emptyMessage}
          </p>
        </div>
      )}
    </aside>
  )
}

export default ProductDetailsPanel
