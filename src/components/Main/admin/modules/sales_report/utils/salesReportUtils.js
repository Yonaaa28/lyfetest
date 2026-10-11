export const formatPeso = (amount) =>
  `₱${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const formatTransactionDate = (dateValue) => {
  const date = new Date(dateValue)

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  }
}

export const RETURN_POLICY_DAYS = 3
export const VOID_TRANSACTION_VALIDITY_HOURS = 24

export const formatShortDate = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue))

export const getReturnPolicyInfo = (dateValue, todayValue = new Date()) => {
  const transactionDate = new Date(dateValue)
  const validUntil = new Date(transactionDate)

  validUntil.setDate(validUntil.getDate() + RETURN_POLICY_DAYS)
  validUntil.setHours(23, 59, 59, 999)

  const today = new Date(todayValue)

  return {
    isEligible: today.getTime() <= validUntil.getTime(),
    validUntil,
  }
}

export const getVoidPolicyInfo = (transaction, todayValue = new Date()) => {
  const transactionDate = new Date(transaction?.dateTime)
  const validUntil = new Date(transactionDate)

  validUntil.setHours(
    validUntil.getHours() + VOID_TRANSACTION_VALIDITY_HOURS
  )

  const isValidDate = !Number.isNaN(transactionDate.getTime())
  const isCompleted = transaction?.status === "Completed"
  const hasReturns = Number(
    (transaction?.returns ?? []).reduce(
      (totalQuantity, returnItem) =>
        totalQuantity + Number(returnItem.quantityReturned ?? 0),
      0
    )
  ) > 0
  const isWithinValidity =
    isValidDate && new Date(todayValue).getTime() <= validUntil.getTime()

  return {
    isEligible: isCompleted && !hasReturns && isWithinValidity,
    isCompleted,
    isValidDate,
    isWithinValidity,
    validUntil,
  }
}

export const getItemReturnedQuantity = (transaction, itemId) =>
  (transaction.returns ?? [])
    .filter((returnItem) => returnItem.itemId === itemId)
    .reduce(
      (totalQuantity, returnItem) =>
        totalQuantity + Number(returnItem.quantityReturned ?? 0),
      0
    )

export const getTransactionReturnSummary = (transaction) => {
  const totalPurchasedQuantity = (transaction.items ?? []).reduce(
    (totalQuantity, item) => totalQuantity + Number(item.quantity ?? 0),
    0
  )
  const totalReturnedQuantity = (transaction.returns ?? []).reduce(
    (totalQuantity, returnItem) =>
      totalQuantity + Number(returnItem.quantityReturned ?? 0),
    0
  )

  return {
    totalPurchasedQuantity,
    totalReturnedQuantity,
    remainingQuantity: Math.max(
      totalPurchasedQuantity - totalReturnedQuantity,
      0
    ),
  }
}

export const getTransactionStatusClassName = (status) => {
  if (status === "Voided") {
    return "bg-slate-200 text-slate-700"
  }

  if (status === "Returned") {
    return "bg-rose-100 text-rose-700"
  }

  if (status === "Partially Returned") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-emerald-100 text-emerald-700"
}
