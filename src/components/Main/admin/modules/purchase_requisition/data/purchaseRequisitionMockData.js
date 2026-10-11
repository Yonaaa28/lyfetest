import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
} from "react-icons/fi"

import { mockInventoryItems } from "../../inventory/data/inventoryMockData"
import {
  getProductQuantity,
  isLowStock,
} from "../../../../../shared/inventory/inventoryUtils"

export const getPurchaseRequisitionLowStockItems = (activeBranchId) => {
  const branchItems = activeBranchId
    ? mockInventoryItems.filter((item) => item.branchId === activeBranchId)
    : mockInventoryItems

  return branchItems.filter(isLowStock)
}

export const getPurchaseRequisitionItems = (activeBranchId) =>
  activeBranchId
    ? mockInventoryItems.filter((item) => item.branchId === activeBranchId)
    : mockInventoryItems

export const mockAdminPurchaseRequests = [
  {
    id: "PR-2026-08-0003",
    dateRequested: "August 22, 2026",
    timeRequested: "09:35 AM",
    requestedBy: "Branch Admin",
    status: "Pending",
    items: [
      {
        id: "med-006",
        productName: "Omeprazole Cap 20mg",
        batchNumber: "20260522-001",
        brand: "Omez",
        dosageForm: "Capsule Medicine",
        supplier: "Zuellig Pharma",
        quantity: 10,
        costPrice: 7,
      },
    ],
  },
  {
    id: "PR-2026-08-0002",
    dateRequested: "August 20, 2026",
    timeRequested: "02:15 PM",
    requestedBy: "Branch Admin",
    status: "Approved",
    items: [
      {
        id: "med-001",
        productName: "Biogesic Tab 500mg",
        batchNumber: "20260522-001",
        brand: "Biogesic",
        dosageForm: "Tablet Medicine",
        supplier: "Zuellig Pharma",
        quantity: 20,
        costPrice: 6,
      },
    ],
  },
  {
    id: "PR-2026-08-0001",
    dateRequested: "August 18, 2026",
    timeRequested: "11:05 AM",
    requestedBy: "Branch Admin",
    status: "Denied",
    items: [
      {
        id: "med-006",
        productName: "Omeprazole Cap 20mg",
        batchNumber: "20260522-001",
        brand: "Omez",
        dosageForm: "Capsule Medicine",
        supplier: "Zuellig Pharma",
        quantity: 5,
        costPrice: 7,
      },
    ],
  },
]

export const purchaseRequisitionSummaryCardConfig = [
  {
    id: "low-stock",
    label: "Low Stock Items",
    detail: "Suggested for reorder",
    icon: FiAlertTriangle,
    accent: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    id: "total-products",
    label: "Total Products",
    detail: "Available to request",
    icon: FiShoppingBag,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    id: "pending-requests",
    label: "Pending Requests",
    detail: "Awaiting approval",
    icon: FiClock,
    accent: "text-sky-600",
    iconBg: "bg-sky-100",
  },
  {
    id: "approved-requests",
    label: "Approved Requests",
    detail: "Ready for orders",
    icon: FiCheckCircle,
    accent: "text-rose-600",
    iconBg: "bg-rose-100",
  },
]

export const getPurchaseRequisitionSummaryValues = (activeBranchId) => {
  const lowStockItems = getPurchaseRequisitionLowStockItems(activeBranchId)
  const requestItems = getPurchaseRequisitionItems(activeBranchId)

  return {
    "low-stock": String(lowStockItems.length).padStart(2, "0"),
    "total-products": String(requestItems.length).padStart(2, "0"),
    "pending-requests": String(
      mockAdminPurchaseRequests.filter((request) => request.status === "Pending")
        .length
    ).padStart(2, "0"),
    "approved-requests": String(
      mockAdminPurchaseRequests.filter((request) => request.status === "Approved")
        .length
    ).padStart(2, "0"),
  }
}

export const getDefaultOrderQuantity = (item) => {
  const currentQuantity = getProductQuantity(item)
  const reorderPoint = Number(item.reorderPoint) || 0

  return Math.max(reorderPoint - currentQuantity, 1)
}
