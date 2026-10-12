import { useEffect, useMemo, useState } from "react"
import {
  FiAlertTriangle,
  FiCalendar,
  FiPackage,
  FiPercent,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi"

import DashboardPanel from "../../shared/widgets/DashboardPanel"
import { getProductTableDisplayName } from "../../../../shared/inventory/inventoryUtils"
import {
  ADMIN_BUNDLES_UPDATED_EVENT,
  getBundleSummaryValues,
  mockBundles,
} from "../bundle/data/bundleMockData"
import { mockInventoryItems } from "../inventory/data/inventoryMockData"
import { getStoredProductDiscounts } from "../discounts/data/productDiscountMockData"

const productDiscountsUpdatedEvent = "lyfe-product-discounts-updated"
const lowBundleStockThreshold = 5

const getDiscountValueLabel = (discount) =>
  discount.discountType === "percentage"
    ? `${Number(discount.discountValue || 0)}%`
    : `P ${Number(discount.discountValue || 0).toLocaleString()}`

const getProductName = (productId) => {
  const product = mockInventoryItems.find((item) => item.id === productId)

  return product ? getProductTableDisplayName(product) : "Unassigned product"
}

function MiniMetric({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-2 truncate text-xl font-extrabold text-slate-950 [font-variant-numeric:tabular-nums]">
            {value}
          </p>
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

function SummaryList({ emptyLabel, items }) {
  if (!items.length) {
    return (
      <div className="grid min-h-[9.5rem] place-items-center rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-sm font-semibold text-slate-500">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-950">
              {item.title}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
              {item.detail}
            </p>
          </div>
          <span
            className={`self-center rounded-full px-3 py-1 text-xs font-extrabold [font-variant-numeric:tabular-nums] ${item.badgeClass}`}
          >
            {item.badge}
          </span>
        </div>
      ))}
    </div>
  )
}

function PromotionsSummary({ activeBranchId }) {
  const [discounts, setDiscounts] = useState(() => getStoredProductDiscounts())
  const [bundles, setBundles] = useState(mockBundles)

  useEffect(() => {
    const refreshDiscounts = () => {
      setDiscounts(getStoredProductDiscounts())
    }

    window.addEventListener(productDiscountsUpdatedEvent, refreshDiscounts)
    window.addEventListener("storage", refreshDiscounts)

    return () => {
      window.removeEventListener(productDiscountsUpdatedEvent, refreshDiscounts)
      window.removeEventListener("storage", refreshDiscounts)
    }
  }, [])

  useEffect(() => {
    const refreshBundles = (event) => {
      setBundles(event.detail?.bundles ?? mockBundles)
    }

    window.addEventListener(ADMIN_BUNDLES_UPDATED_EVENT, refreshBundles)

    return () => {
      window.removeEventListener(ADMIN_BUNDLES_UPDATED_EVENT, refreshBundles)
    }
  }, [])

  const discountSummary = useMemo(() => {
    const branchDiscounts = activeBranchId
      ? discounts.filter((discount) => discount.branchId === activeBranchId)
      : discounts
    const visibleDiscounts = branchDiscounts.filter(
      (discount) => discount.status !== "Archived"
    )
    const activeDiscounts = visibleDiscounts.filter(
      (discount) => discount.status === "Active"
    )
    const scheduledDiscounts = visibleDiscounts.filter(
      (discount) => discount.status === "Inactive"
    )
    const discountedProducts = new Set(
      visibleDiscounts.map((discount) => discount.productId)
    ).size
    const highestDiscount = visibleDiscounts.reduce(
      (highestValue, discount) =>
        discount.discountType === "percentage"
          ? Math.max(highestValue, Number(discount.discountValue || 0))
          : highestValue,
      0
    )
    const topDiscounts = [...visibleDiscounts]
      .sort((leftDiscount, rightDiscount) => {
        const leftValue =
          leftDiscount.discountType === "percentage"
            ? Number(leftDiscount.discountValue || 0)
            : 0
        const rightValue =
          rightDiscount.discountType === "percentage"
            ? Number(rightDiscount.discountValue || 0)
            : 0

        return rightValue - leftValue
      })
      .slice(0, 3)
      .map((discount) => ({
        id: discount.id,
        title: discount.name,
        detail: `${getProductName(discount.productId)} - ${discount.status}`,
        badge: getDiscountValueLabel(discount),
        badgeClass:
          discount.status === "Active"
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
            : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      }))

    return {
      active: String(activeDiscounts.length).padStart(2, "0"),
      scheduled: String(scheduledDiscounts.length).padStart(2, "0"),
      products: String(discountedProducts).padStart(2, "0"),
      highest: highestDiscount ? `${highestDiscount}%` : "0%",
      topDiscounts,
    }
  }, [activeBranchId, discounts])

  const bundleSummary = useMemo(() => {
    const branchBundles = activeBranchId
      ? bundles.filter((bundle) => bundle.branchId === activeBranchId)
      : bundles
    const visibleBundles = branchBundles.filter(
      (bundle) => bundle.status !== "Archived"
    )
    const summaryValues = getBundleSummaryValues(activeBranchId, bundles)
    const bundledProducts = new Set(
      visibleBundles.flatMap((bundle) =>
        bundle.includedItems.map((item) => item.product?.id ?? item.productId)
      )
    ).size
    const lowStockBundles = visibleBundles
      .filter((bundle) => Number(bundle.stock || 0) <= lowBundleStockThreshold)
      .sort((leftBundle, rightBundle) => Number(leftBundle.stock || 0) - Number(rightBundle.stock || 0))
      .slice(0, 3)
      .map((bundle) => ({
        id: bundle.id,
        title: bundle.name,
        detail: `${bundle.includedItems.length} included item${
          bundle.includedItems.length === 1 ? "" : "s"
        }`,
        badge: `${Number(bundle.stock || 0).toLocaleString()} left`,
        badgeClass:
          Number(bundle.stock || 0) <= lowBundleStockThreshold
            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      }))

    return {
      active: summaryValues.total,
      lowStock: summaryValues.lowStock,
      totalPacks: summaryValues.totalStock,
      stockValue: summaryValues.stockValue,
      bundledProducts: String(bundledProducts).padStart(2, "0"),
      lowStockBundles,
    }
  }, [activeBranchId, bundles])

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <DashboardPanel title="Discount Summary" className="h-full">
        <div className="grid gap-3 min-[520px]:grid-cols-2">
          <MiniMetric
            icon={FiTag}
            label="Active Discounts"
            value={discountSummary.active}
            tone="bg-emerald-100 text-emerald-700"
          />
          <MiniMetric
            icon={FiCalendar}
            label="Scheduled"
            value={discountSummary.scheduled}
            tone="bg-sky-100 text-sky-700"
          />
          <MiniMetric
            icon={FiPackage}
            label="Discounted Products"
            value={discountSummary.products}
            tone="bg-amber-100 text-amber-700"
          />
          <MiniMetric
            icon={FiPercent}
            label="Highest Discount"
            value={discountSummary.highest}
            tone="bg-rose-100 text-rose-700"
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-extrabold text-slate-900">
            Top Discount Offers
          </p>
          <SummaryList
            emptyLabel="No discounts available for this branch."
            items={discountSummary.topDiscounts}
          />
        </div>
      </DashboardPanel>

      <DashboardPanel title="Bundle Summary" className="h-full">
        <div className="grid gap-3 min-[520px]:grid-cols-2">
          <MiniMetric
            icon={FiShoppingBag}
            label="Active Bundles"
            value={bundleSummary.active}
            tone="bg-emerald-100 text-emerald-700"
          />
          <MiniMetric
            icon={FiAlertTriangle}
            label="Low Stock"
            value={bundleSummary.lowStock}
            tone="bg-amber-100 text-amber-700"
          />
          <MiniMetric
            icon={FiPackage}
            label="Total Packs"
            value={bundleSummary.totalPacks}
            tone="bg-sky-100 text-sky-700"
          />
          <MiniMetric
            icon={FiTag}
            label="Stock Value"
            value={bundleSummary.stockValue}
            tone="bg-rose-100 text-rose-700"
          />
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-slate-900">
              Bundle Stock Watchlist
            </p>
            <span className="shrink-0 text-xs font-extrabold text-[#0b6b51]">
              {bundleSummary.bundledProducts} bundled products
            </span>
          </div>
          <SummaryList
            emptyLabel="No low-stock bundles to review."
            items={bundleSummary.lowStockBundles}
          />
        </div>
      </DashboardPanel>
    </section>
  )
}

export default PromotionsSummary
