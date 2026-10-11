export const mockProductDiscounts = [
  {
    id: "discount-001",
    branchId: "branch-camalig-albay",
    code: "DISC-0001",
    name: "Biogesic Weekend Promo",
    productId: "med-001",
    discountType: "percentage",
    discountValue: 10,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    status: "Inactive",
  },
]

export const productDiscountsStorageKey = "lyfe-product-discounts"

const inactiveMockProductDiscountIds = new Set(["discount-001"])

const withInactiveMockProductDiscounts = (discounts = []) =>
  discounts.map((discount) =>
    inactiveMockProductDiscountIds.has(discount.id)
      ? { ...discount, status: "Inactive" }
      : discount
  )

const getDiscountCodeNumber = (code) => {
  const match = String(code ?? "").match(/^DISC-(\d+)$/)

  return match ? Number(match[1]) : 0
}

export const getNextProductDiscountCode = (discounts = []) => {
  const nextNumber =
    Math.max(
      0,
      ...discounts.map((discount) => getDiscountCodeNumber(discount.code))
    ) + 1

  return `DISC-${String(nextNumber).padStart(4, "0")}`
}

export const withProductDiscountCodes = (discounts = []) => {
  const usedCodes = new Set()
  let nextNumber = 1

  return discounts.map((discount) => {
    let code = discount.code

    if (!code || usedCodes.has(code)) {
      while (usedCodes.has(`DISC-${String(nextNumber).padStart(4, "0")}`)) {
        nextNumber += 1
      }

      code = `DISC-${String(nextNumber).padStart(4, "0")}`
    }

    usedCodes.add(code)

    return {
      ...discount,
      code,
    }
  })
}

export const getStoredProductDiscounts = () => {
  if (typeof window === "undefined") {
    return withInactiveMockProductDiscounts(
      withProductDiscountCodes(mockProductDiscounts)
    )
  }

  const storedDiscounts = window.localStorage.getItem(productDiscountsStorageKey)

  if (!storedDiscounts) {
    return withInactiveMockProductDiscounts(
      withProductDiscountCodes(mockProductDiscounts)
    )
  }

  try {
    return withInactiveMockProductDiscounts(
      withProductDiscountCodes(JSON.parse(storedDiscounts))
    )
  } catch {
    return withInactiveMockProductDiscounts(
      withProductDiscountCodes(mockProductDiscounts)
    )
  }
}

export const saveStoredProductDiscounts = (discounts) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    productDiscountsStorageKey,
    JSON.stringify(discounts)
  )
}
