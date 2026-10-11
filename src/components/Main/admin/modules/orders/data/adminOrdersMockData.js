import { mockAdminPurchaseRequests } from "../../purchase_requisition/data/purchaseRequisitionMockData"

export const ORDER_STATUS = {
  READY: "Ready to Process",
  COMPLETED: "Completed",
}

export const getApprovedOrders = () =>
  mockAdminPurchaseRequests
    .filter((request) => request.status === "Approved")
    .map((request, index) => ({
      ...request,
      orderNo: `ORD-${String(index + 1).padStart(4, "0")}`,
      status: ORDER_STATUS.READY,
      approvedDate: request.dateRequested,
      approvedTime: request.timeRequested,
    }))
