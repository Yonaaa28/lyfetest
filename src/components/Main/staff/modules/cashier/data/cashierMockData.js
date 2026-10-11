import { mockInventoryItems } from "../../../../admin/modules/inventory/data/inventoryMockData"

export const mockCashierProducts = mockInventoryItems.map((product) => ({
  ...product,
  price: Number(product.sellingPrice ?? 0),
  stock: Number(product.quantity ?? 0),
}))

export const customerTypes = [
  { id: "Regular", label: "Regular", shortcut: "1", discountRate: 0 },
  { id: "PWD", label: "PWD", shortcut: "2", discountRate: 0.2 },
  { id: "Senior", label: "Senior", shortcut: "3", discountRate: 0.2 },
]

export const CASHIER_TRANSACTIONS_STORAGE_KEY = "lyfe-cashier-transactions"
export const CASHIER_TRANSACTIONS_UPDATED_EVENT =
  "lyfe-cashier-transactions-updated"

const notifyCashierTransactionsUpdated = () => {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(CASHIER_TRANSACTIONS_UPDATED_EVENT))
}

export const getStoredCashierTransactions = () => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedTransactions = window.localStorage.getItem(
      CASHIER_TRANSACTIONS_STORAGE_KEY
    )

    return storedTransactions ? JSON.parse(storedTransactions) : []
  } catch {
    return []
  }
}

export const saveStoredCashierTransactions = (transactions) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    CASHIER_TRANSACTIONS_STORAGE_KEY,
    JSON.stringify(transactions)
  )
  notifyCashierTransactionsUpdated()
}

export const saveCashierTransaction = (transaction) => {
  const transactions = getStoredCashierTransactions()
  const nextTransaction = {
    ...transaction,
    status: transaction.status ?? "Completed",
  }

  saveStoredCashierTransactions([
    nextTransaction,
    ...transactions.filter(
      (storedTransaction) =>
        storedTransaction.transactionId !== nextTransaction.transactionId
    ),
  ])
}

export const voidCashierTransaction = ({
  managerApprovalKey,
  orNumber,
  reason,
  voidedBy,
}) => {
  const normalizedOrNumber = String(orNumber ?? "").trim()
  const transactions = getStoredCashierTransactions()
  const voidedAt = new Date().toISOString()

  const nextTransactions = transactions.map((transaction) =>
    String(transaction.orNumber ?? "").trim() === normalizedOrNumber
      ? {
          ...transaction,
          status: "Voided",
          voidReason: reason,
          voidedAt,
          voidedBy,
          voidApprovedBy: managerApprovalKey,
        }
      : transaction
  )

  saveStoredCashierTransactions(nextTransactions)

  return nextTransactions.find(
    (transaction) =>
      String(transaction.orNumber ?? "").trim() === normalizedOrNumber
  )
}
