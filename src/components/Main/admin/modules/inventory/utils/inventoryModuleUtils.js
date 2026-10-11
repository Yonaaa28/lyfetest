import { FaRegCalendarTimes } from "react-icons/fa"
import { GoAlert } from "react-icons/go"
import { HiArchiveBoxXMark } from "react-icons/hi2"

import {
  getActiveBatches,
  getItemUnits,
  getPrimaryBatch,
  getProductQuantity,
} from "../../../../../shared/inventory/inventoryUtils"

export const defaultAddItemForm = {
  productName: "",
  brand: "",
  category: "",
  dosageForm: "",
  strength: "",
  itemUnit: "Piece",
  conversionFactor: "",
  sellingPrice: "",
  dateReceived: "",
  expiryDate: "",
  noExpiration: false,
  reorderPoint: "",
  quantity: "",
  costPrice: "",
  supplier: "",
  barcode: "",
  description: "",
  isPwdSeniorDiscountable: true,
  image: "",
  imageTone: "blue",
}

export const defaultBaseUnit = {
  id: "base-unit-1",
  itemUnit: "Piece",
  conversionFactor: "1",
  sellingPrice: "",
}

export const defaultAdditionalBaseUnit = {
  id: "base-unit-2",
  itemUnit: "",
  conversionFactor: "",
  sellingPrice: "",
}

export const defaultInventoryFilters = {
  stockStatuses: [],
  category: "",
  brand: "",
  supplier: "",
  itemUnit: "",
}

export const stockStatusFilterOptions = [
  {
    id: "lowStock",
    label: "Low Stock Items",
    icon: GoAlert,
    iconClassName: "text-amber-500",
  },
  {
    id: "expiringSoon",
    label: "Expiring Soon",
    icon: FaRegCalendarTimes,
    iconClassName: "text-red-500",
  },
  {
    id: "outOfStock",
    label: "Out of Stock",
    icon: HiArchiveBoxXMark,
    iconClassName: "text-red-500",
  },
]

export const getUniqueFilterValues = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))

export const getInventoryFilterOptions = (items) => ({
  categories: getUniqueFilterValues(items.map((item) => item.category)),
  brands: getUniqueFilterValues(items.map((item) => item.brand)),
  suppliers: getUniqueFilterValues(items.map((item) => item.supplier)),
  itemUnits: getUniqueFilterValues(
    items.flatMap((item) => getItemUnits(item).map((unit) => unit.itemUnit))
  ),
})

export const getFormDataFromInventoryItem = (item) => ({
  ...defaultAddItemForm,
  productName: item.productName ?? "",
  brand: item.brand ?? "",
  category: item.category ?? "",
  dosageForm: item.dosageForm ?? "",
  strength: item.strength ?? "",
  itemUnit: item.itemUnit ?? "Piece",
  sellingPrice: String(item.sellingPrice ?? ""),
  dateReceived: item.dateReceived ?? "",
  expiryDate: getPrimaryBatch(item)?.expiryDate ?? item.expiryDate ?? "",
  noExpiration: Boolean(item.noExpiration),
  reorderPoint: String(item.reorderPoint ?? ""),
  quantity: String(getProductQuantity(item) || item.quantity || ""),
  costPrice: String(item.costPrice ?? ""),
  supplier: item.supplier ?? "",
  barcode: item.barcode ?? "",
  description: item.description ?? "",
  isPwdSeniorDiscountable: item.isPwdSeniorDiscountable ?? true,
  image: item.image ?? "",
  imageTone: item.imageTone ?? "blue",
})

export const getBaseUnitsFromInventoryItem = (item) => {
  if (item.baseUnits?.length) {
    return item.baseUnits.map((unit, index) => ({
      id: unit.id ?? `base-unit-${index + 1}`,
      itemUnit: index === 0 ? "Piece" : unit.itemUnit ?? "",
      conversionFactor: index === 0 ? "1" : String(unit.conversionFactor ?? ""),
      sellingPrice: String(unit.sellingPrice ?? ""),
    }))
  }

  return [
    {
      ...defaultBaseUnit,
      sellingPrice: String(item.sellingPrice ?? ""),
    },
  ]
}
const defaultMockBranchId = "branch-camalig-albay"

export const defaultBrandOptions = [
  { id: "brand-1", name: "Biogesic", branchId: defaultMockBranchId, status: "Active" },
  { id: "brand-2", name: "Omez", branchId: defaultMockBranchId, status: "Active" },
]

export const defaultCategoryOptions = [
  { id: "category-1", name: "Over The Counter (OTC) Medications", branchId: defaultMockBranchId, status: "Active", isMedicine: true },
  { id: "category-2", name: "Personal Care Products", branchId: defaultMockBranchId, status: "Active", isMedicine: false },
  { id: "category-3", name: "Prescription Medications", branchId: defaultMockBranchId, status: "Active", isMedicine: true },
]

export const defaultDosageFormOptions = [
  { id: "type-0", name: "N/A", branchId: defaultMockBranchId, status: "Active" },
  { id: "dosage-form-1", name: "Tablet Medicine", branchId: defaultMockBranchId, status: "Active" },
  { id: "dosage-form-2", name: "Capsule Medicine", branchId: defaultMockBranchId, status: "Active" },
]

export const defaultItemUnitOptions = [
  { id: "item-unit-1", name: "Piece", branchId: defaultMockBranchId, status: "Active" },
  { id: "item-unit-2", name: "Box", branchId: defaultMockBranchId, status: "Active" },
]

export const defaultStrengthOptions = [
  { id: "strength-0", count: "N/A", unit: "", name: "N/A", branchId: defaultMockBranchId, status: "Active" },
  { id: "strength-1", count: "500", unit: "mg", name: "500mg", branchId: defaultMockBranchId, status: "Active" },
  { id: "strength-2", count: "20", unit: "mg", name: "20mg", branchId: defaultMockBranchId, status: "Active" },
]

export const defaultStrengthRow = {
  id: "strength-row-1",
  count: "",
  unit: "",
}

export const getStrengthParts = (strength) =>
  strength.parts ?? [{ count: strength.count, unit: strength.unit }]

export const getStrengthName = (parts) =>
  parts.map((part) => `${part.count}${part.unit}`).join("/")

export const getStrengthCountDisplay = (strength) =>
  getStrengthParts(strength)
    .map((part) => part.count)
    .join("/")

export const getStrengthUnitDisplay = (strength) =>
  getStrengthParts(strength)
    .map((part) => part.unit)
    .join("/")

export const computeUnitSellingPrice = (pieceSellingPrice, conversionFactor) => {
  const price = Number(pieceSellingPrice)
  const factor = Number(conversionFactor)

  if (
    !pieceSellingPrice ||
    !conversionFactor ||
    !Number.isFinite(price) ||
    !Number.isFinite(factor) ||
    price <= 0 ||
    factor <= 0
  ) {
    return ""
  }

  return (price * factor).toFixed(2)
}

export const isBlank = (value) => String(value ?? "").trim() === ""

export const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

export const getGeneratedBatchNumber = (product) => {
  const todayNumber = getTodayDateInputValue().replaceAll("-", "")
  const productBatchCount = product.batches?.length ?? 0

  return `${todayNumber}-${String(productBatchCount + 1).padStart(3, "0")}`
}

export const getProductWithSyncedBatches = (product, batches) => {
  const nextProduct = { ...product, batches }
  const activeBatches = getActiveBatches(nextProduct)
  const primaryBatch = activeBatches[0]

  return {
    ...nextProduct,
    quantity: activeBatches.reduce(
      (totalQuantity, batch) => totalQuantity + (Number(batch.quantity) || 0),
      0
    ),
    batchNumber: primaryBatch?.batchNumber ?? product.batchNumber,
    expiryDate: primaryBatch?.expiryDate ?? product.expiryDate,
  }
}

