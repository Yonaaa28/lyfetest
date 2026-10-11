import {
  formatDate,
  getPrimaryBatch,
  getProductTableDisplayName,
  getProductQuantity,
} from "../../../../../shared/inventory/inventoryUtils"
import { mockInventoryItems } from "../../inventory/data/inventoryMockData"

export const getBundleExpiryDisplay = (bundle) =>
  bundle.includedItems.map((item) => formatDate(item.expiryDate)).join("\n")

export const getTodayInputValue = () => new Date().toISOString().slice(0, 10)

export const getInitialBundleProductRow = (id = "bundle-product-1") => ({
  id,
  productId: "",
  quantity: 1,
  discount: 0,
})

export const getBundleProductRows = (bundle) => {
  if (!bundle?.includedItems?.length) {
    return [getInitialBundleProductRow()]
  }

  return bundle.includedItems.map((item, index) => ({
    id: `bundle-product-${bundle.id}-${index}`,
    productId: item.productId,
    quantity: Number(item.quantity) || 1,
    discount: Number(item.discount) || 0,
  }))
}

export const getSelectedProduct = (productId) =>
  mockInventoryItems.find((item) => item.id === productId) ?? null

export const getProductPrice = (product) => Number(product?.sellingPrice) || 0

export const getProductExpiry = (product) =>
  product ? getPrimaryBatch(product)?.expiryDate ?? product.expiryDate ?? "" : ""

export const getRowNetPrice = (row) => {
  const product = getSelectedProduct(row.productId)
  const price = getProductPrice(product)
  const quantity = Number(row.quantity) || 0
  const discount = Math.min(Math.max(Number(row.discount) || 0, 0), 100)

  return price * quantity * (1 - discount / 100)
}

export const getBundleIncludedItemsFromRows = (rows) =>
  rows
    .map((row) => {
      const product = getSelectedProduct(row.productId)

      if (!product) {
        return null
      }

      return {
        productId: product.id,
        quantity: Number(row.quantity) || 1,
        discount: Number(row.discount) || 0,
        product,
        productName: getProductTableDisplayName(product),
        expiryDate: getProductExpiry(product),
        availableQuantity: getProductQuantity(product),
        netPrice: getRowNetPrice(row),
      }
    })
    .filter(Boolean)
