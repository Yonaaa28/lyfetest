const mockNearExpiryCutoffDays = 90

export const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`))

export const formatPeso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("PHP", "P")

export const getDaysUntilExpiry = (dateValue) => {
  const today = new Date()
  const expiryDate = new Date(`${dateValue}T00:00:00`)
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  return Math.ceil((expiryDate - todayStart) / 86400000)
}

export const getActiveBatches = (item) => {
  const batches =
    item.activeBatches ??
    item.batches ??
    (item.batchNumber
      ? [
          {
            id: `${item.id}-batch`,
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            expiryDate: item.expiryDate,
            status: "Active",
          },
        ]
      : [])

  return batches
    .filter((batch) => {
      const quantity = Number(batch.quantity) || 0
      const status = String(batch.status ?? "Active").toLowerCase()
      const isUsableStatus = !["archived", "expired", "removed"].includes(status)
      const isNotExpired =
        !batch.expiryDate || getDaysUntilExpiry(batch.expiryDate) >= 0

      return quantity > 0 && isUsableStatus && isNotExpired
    })
    .sort((firstBatch, secondBatch) =>
      String(firstBatch.expiryDate ?? "").localeCompare(
        String(secondBatch.expiryDate ?? "")
      )
    )
}

export const getProductQuantity = (item) => {
  if (item.activeBatches?.length || item.batches?.length) {
    return getActiveBatches(item).reduce(
      (totalQuantity, batch) => totalQuantity + (Number(batch.quantity) || 0),
      0
    )
  }

  return Number(item.quantity) || 0
}

export const getPrimaryBatch = (item) => getActiveBatches(item)[0] ?? null

export const isOutOfStock = (item) => getProductQuantity(item) <= 0

export const isNearExpiry = (item) =>
  typeof item.isNearExpiry === "boolean"
    ? item.isNearExpiry
    : getActiveBatches(item).some(
        (batch) => getDaysUntilExpiry(batch.expiryDate) <= mockNearExpiryCutoffDays
      ) || getDaysUntilExpiry(item.expiryDate) <= mockNearExpiryCutoffDays

export const isLowStock = (item) =>
  typeof item.isLowStock === "boolean"
    ? item.isLowStock
    : !isOutOfStock(item) && getProductQuantity(item) <= item.reorderPoint

const isNotApplicableValue = (value) =>
  String(value ?? "").trim().toLowerCase() === "n/a"

export const getProductDisplayName = (item) =>
  [
    item.productName,
    isNotApplicableValue(item.strength) ? "" : item.strength,
  ]
    .filter(Boolean)
    .join(" ")

export const getProductTableDisplayName = (item) => {
  const dosageFormShortName = isNotApplicableValue(item.dosageForm)
    ? ""
    : String(item.dosageForm ?? "")
        .trim()
        .slice(0, 3)

  const dosageLabel = dosageFormShortName
    ? `${dosageFormShortName[0].toUpperCase()}${dosageFormShortName
        .slice(1)
        .toLowerCase()}`
    : ""

  return [
    item.productName,
    dosageLabel,
    isNotApplicableValue(item.strength) ? "" : item.strength,
  ]
    .filter(Boolean)
    .join(" ")
}

export const getItemUnits = (item) => {
  const itemUnits = item.baseUnits?.filter((unit) => unit.itemUnit) ?? []

  if (itemUnits.length) {
    return itemUnits
  }

  return item.itemUnit
    ? [
        {
          itemUnit: item.itemUnit,
          conversionFactor: item.conversionFactor ?? "",
          sellingPrice: item.sellingPrice ?? "",
        },
      ]
    : []
}

export const getItemUnitDisplay = (item) => {
  const itemUnits = getItemUnits(item)
  const baseUnit = itemUnits[0]?.itemUnit ?? "N/A"
  const additionalUnitCount = Math.max(itemUnits.length - 1, 0)

  return additionalUnitCount
    ? `${baseUnit} (+${additionalUnitCount})`
    : baseUnit
}

export const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
    (page) => page > 1 && page < totalPages
  )

  return [
    1,
    ...(middlePages[0] > 2 ? ["start-ellipsis"] : []),
    ...middlePages,
    ...(middlePages[middlePages.length - 1] < totalPages - 1
      ? ["end-ellipsis"]
      : []),
    totalPages,
  ]
}
