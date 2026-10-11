import { FaBox, FaRegCalendarTimes } from "react-icons/fa"
import { GoAlert } from "react-icons/go"
import { HiArchiveBoxXMark } from "react-icons/hi2"

import biogesicImage from "../../../../../../assets/products/biogesic.jpg"
import omeprazoleImage from "../../../../../../assets/products/omeprazole.jpg"
import { isLowStock, isNearExpiry, isOutOfStock } from "../../../../../shared/inventory/inventoryUtils"
export const mockInventoryItems = [
  {
    id: "med-001",
    branchId: "branch-camalig-albay",
    productName: "Biogesic",
    genericName: "Paracetamol",
    batchNumber: "20260522-001",
    dosageForm: "Tablet Medicine",
    strength: "500mg",
    brand: "Biogesic",
    category: "Over The Counter (OTC) Medications",
    categoryIsMedicine: true,
    itemUnit: "Piece",
    quantity: 120,
    reorderPoint: 25,
    dateReceived: "2026-05-24",
    expiryDate: "2027-05-20",
    noExpiration: false,
    batches: [
      {
        id: "biogesic-batch-1",
        batchNumber: "20260522-001",
        quantity: 90,
        expiryDate: "2027-05-20",
        dateReceived: "2026-05-24",
        status: "Active",
      },
      {
        id: "biogesic-batch-2",
        batchNumber: "20260524-002",
        quantity: 30,
        expiryDate: "2027-09-15",
        dateReceived: "2026-07-24",
        status: "Active",
      },
    ],
    supplier: "Zuellig Pharma",
    barcode: "4806512345678",
    costPrice: 6,
    sellingPrice: 7.5,
    isPwdSeniorDiscountable: true,
    baseUnits: [
      {
        id: "biogesic-unit-1",
        itemUnit: "Piece",
        conversionFactor: "1",
        sellingPrice: "7.50",
      },
      {
        id: "biogesic-unit-2",
        itemUnit: "Box",
        conversionFactor: "10",
        sellingPrice: "75.00",
      },
    ],
    image: biogesicImage,
    imageTone: "blue",
  },
  {
    id: "med-006",
    branchId: "branch-camalig-albay",
    productName: "Omeprazole",
    genericName: "Omeprazole",
    batchNumber: "20260522-001",
    dosageForm: "Capsule Medicine",
    strength: "20mg",
    brand: "Omez",
    category: "Prescription Medications",
    categoryIsMedicine: true,
    itemUnit: "Piece",
    quantity: 10,
    reorderPoint: 20,
    dateReceived: "2026-05-24",
    expiryDate: "2027-05-30",
    noExpiration: false,
    batches: [
      {
        id: "omeprazole-batch-1",
        batchNumber: "20260522-001",
        quantity: 10,
        expiryDate: "2027-05-30",
        dateReceived: "2026-05-24",
        status: "Active",
      },
    ],
    supplier: "Zuellig Pharma",
    barcode: "4806512345722",
    costPrice: 7,
    sellingPrice: 12.5,
    isPwdSeniorDiscountable: false,
    baseUnits: [
      {
        id: "omeprazole-unit-1",
        itemUnit: "Piece",
        conversionFactor: "1",
        sellingPrice: "12.50",
      },
      {
        id: "omeprazole-unit-2",
        itemUnit: "Box",
        conversionFactor: "10",
        sellingPrice: "125.00",
      },
    ],
    image: omeprazoleImage,
    imageTone: "pink",
  },
]

export const summaryCardConfig = [
  {
    id: "total",
    label: "Total Items",
    shortLabel: "Total",
    detail: "Active product records",
    icon: FaBox,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    id: "low-stock",
    label: "Low Stock Items",
    shortLabel: "Low Stock",
    detail: "Needs replenishment",
    icon: GoAlert,
    accent: "text-amber-500",
    iconBg: "bg-amber-100",
  },
  {
    id: "expiring",
    label: "Expiring Soon",
    detail: "Review expiry dates",
    icon: FaRegCalendarTimes,
    accent: "text-red-500",
    iconBg: "bg-red-100",
  },
  {
    id: "out-of-stock",
    label: "Out of Stock",
    detail: "Requires immediate action",
    icon: HiArchiveBoxXMark,
    accent: "text-red-600",
    iconBg: "bg-red-100",
  },
]

export const getInventorySummaryValues = (activeBranchId) => {
  const branchItems = activeBranchId
    ? mockInventoryItems.filter((item) => item.branchId === activeBranchId)
    : mockInventoryItems

  return {
    total: branchItems.length.toLocaleString(),
    "low-stock": branchItems.filter(isLowStock).length
      .toString()
      .padStart(2, "0"),
    expiring: branchItems.filter(isNearExpiry).length.toString().padStart(2, "0"),
    "out-of-stock": branchItems
      .filter(isOutOfStock)
      .length.toString()
      .padStart(2, "0"),
  }
}
