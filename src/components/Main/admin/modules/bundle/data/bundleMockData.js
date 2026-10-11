import { FiAlertTriangle, FiPackage, FiTag } from "react-icons/fi"
import { HiOutlineShoppingBag } from "react-icons/hi2"

import { mockInventoryItems } from "../../inventory/data/inventoryMockData"
import {
  formatPeso,
  getProductQuantity,
  getPrimaryBatch,
  getProductTableDisplayName,
} from "../../../../../shared/inventory/inventoryUtils"

const defaultMockBranchId = "branch-camalig-albay"
export const ADMIN_BUNDLES_UPDATED_EVENT = "lyfe-admin-bundles-updated"
const lowBundleStockThreshold = 5

const findInventoryItem = (productId) =>
  mockInventoryItems.find((item) => item.id === productId)

const getBundleIncludedItems = (items) =>
  items
    .map((bundleItem) => {
      const product = findInventoryItem(bundleItem.productId)

      if (!product) {
        return null
      }

      return {
        ...bundleItem,
        product,
        productName: getProductTableDisplayName(product),
        expiryDate: getPrimaryBatch(product)?.expiryDate ?? product.expiryDate,
        availableQuantity: getProductQuantity(product),
      }
    })
    .filter(Boolean)
export const mockBundles = [
  {
    id: "bundle-001",
    branchId: defaultMockBranchId,
    bundleCode: "BND-001",
    name: "Pain Relief Pack",
    price: 80,
    stock: 2,
    status: "Active",
    createdAt: "2026-05-31",
    includedItems: getBundleIncludedItems([
      { productId: "med-001", quantity: 1 },
      { productId: "med-006", quantity: 1 },
    ]),
  },
]

export const bundleSummaryCardConfig = [
  {
    id: "total",
    label: "Active Bundles",
    detail: "Active bundle records",
    icon: HiOutlineShoppingBag,
    accent: "text-[#0b6b51]",
    iconBg: "bg-emerald-100",
  },
  {
    id: "lowStock",
    label: "Low Stock",
    detail: `${lowBundleStockThreshold} packs or below`,
    icon: FiAlertTriangle,
    accent: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    id: "totalStock",
    label: "Total Packs",
    detail: "Available bundle stock",
    icon: FiPackage,
    accent: "text-sky-600",
    iconBg: "bg-sky-100",
  },
  {
    id: "stockValue",
    label: "Stock Value",
    detail: "Estimated bundle value",
    icon: FiTag,
    accent: "text-rose-600",
    iconBg: "bg-rose-100",
  },
]

export const getBundleSummaryValues = (activeBranchId, bundles = mockBundles) => {
  const branchBundles = activeBranchId
    ? bundles.filter((bundle) => bundle.branchId === activeBranchId)
    : bundles
  const activeBundles = branchBundles.filter(
    (bundle) => bundle.status !== "Archived"
  )
  const totalStock = activeBundles.reduce(
    (total, bundle) => total + Number(bundle.stock || 0),
    0
  )
  const stockValue = activeBundles.reduce(
    (total, bundle) =>
      total + Number(bundle.price || 0) * Number(bundle.stock || 0),
    0
  )

  return {
    total: activeBundles.length.toLocaleString(),
    lowStock: activeBundles
      .filter((bundle) => Number(bundle.stock || 0) <= lowBundleStockThreshold)
      .length.toLocaleString(),
    totalStock: totalStock.toLocaleString(),
    stockValue: formatPeso(stockValue),
  }
}
