import {
  getItemUnits,
  getProductTableDisplayName,
} from "../../../../../shared/inventory/inventoryUtils"

export const getCashierProductName = (product) =>
  getProductTableDisplayName(product)

export const getCashierProductPrice = (product, selectedUnit) => {
  const units = getItemUnits(product)
  const unit = units.find((itemUnit) => itemUnit.itemUnit === selectedUnit)

  return Number(unit?.sellingPrice ?? product.sellingPrice ?? product.price ?? 0)
}

export const getDefaultCashierUnit = (product) =>
  getItemUnits(product)[0]?.itemUnit ?? product.itemUnit ?? "Piece"

export const getCashierCartId = (productId, itemUnit, batchNumber = "") =>
  `${productId}-${batchNumber}-${itemUnit}`

export const getCashierUnitConversionFactor = (product, selectedUnit) => {
  const units = getItemUnits(product)
  const unit = units.find((itemUnit) => itemUnit.itemUnit === selectedUnit)

  return Math.max(Number(unit?.conversionFactor || 1), 1)
}

export const getCashierProductStockKey = (product) =>
  `${product.id}-${product.batchNumber ?? ""}`

export const getCashierUnitMaxQuantity = ({
  cartItems = [],
  product,
  selectedUnit,
  excludeCartId = "",
}) => {
  const conversionFactor = getCashierUnitConversionFactor(product, selectedUnit)
  const availablePieces = Number(product.stock || product.quantity || 0)
  const productStockKey = getCashierProductStockKey(product)
  const reservedPieces = cartItems
    .filter(
      (item) =>
        item.cartId !== excludeCartId &&
        getCashierProductStockKey(item.product) === productStockKey
    )
    .reduce(
      (totalPieces, item) =>
        totalPieces +
        Number(item.quantity || 0) *
          getCashierUnitConversionFactor(item.product, item.itemUnit),
      0
    )
  const remainingPieces = Math.max(availablePieces - reservedPieces, 0)

  return Math.floor(remainingPieces / conversionFactor)
}

export const filterCashierProducts = ({ products, searchTerm }) => {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return []
  }

  return products.filter((product) =>
    [
      product.barcode,
      product.batchNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  )
}

export const buildCartItem = (product) => {
  const itemUnit = getDefaultCashierUnit(product)

  return {
    cartId: getCashierCartId(product.id, itemUnit, product.batchNumber),
    productId: product.id,
    product,
    itemUnit,
    quantity: 1,
    price: getCashierProductPrice(product, itemUnit),
  }
}

export const getCartItemSubtotal = (item) =>
  Number(item.quantity) * Number(item.price)

export const isMedicineProduct = (product) =>
  Boolean(
    product?.categoryIsMedicine ??
      product?.isMedicine ??
      product?.category?.isMedicine ??
      false
  )

export const isPwdSeniorDiscountable = (product) =>
  isMedicineProduct(product) && Boolean(product?.isPwdSeniorDiscountable ?? true)

const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100

const isDiscountActiveToday = (discount) => {
  const todayDate = getTodayDateInputValue()

  return (
    discount.status === "Active" &&
    (!discount.startDate || discount.startDate <= todayDate) &&
    (!discount.endDate || discount.endDate >= todayDate)
  )
}

export const getActiveProductDiscountForProduct = ({
  product,
  productDiscounts = [],
}) =>
  productDiscounts.find(
    (discount) =>
      discount.productId === product?.id && isDiscountActiveToday(discount)
  ) ?? null

export const getDiscountValueLabel = (discount) =>
  discount.discountType === "percentage"
    ? `${discount.discountValue}% off`
    : `P${Number(discount.discountValue || 0).toFixed(2)} off`

export const getDiscountReceiptLabel = (discount) =>
  `${discount.code ?? "DISC"} ${
    discount.discountType === "percentage"
      ? `${discount.discountValue}%`
      : `P${Number(discount.discountValue || 0).toFixed(2)}`
  }`

export const getProductDiscountAmount = (item, productDiscount) => {
  if (!productDiscount) {
    return 0
  }

  const subtotal = getCartItemSubtotal(item)
  const discountValue = Number(productDiscount.discountValue || 0)
  const discountAmount =
    productDiscount.discountType === "percentage"
      ? subtotal * (discountValue / 100)
      : discountValue * Number(item.quantity || 0)

  return Math.min(Math.max(discountAmount, 0), subtotal)
}

export const getCartItemPricingBreakdown = ({
  item,
  discountRate,
  productDiscounts = [],
  vatRate = 0.12,
}) => {
  const subtotal = getCartItemSubtotal(item)
  const productDiscount = getActiveProductDiscountForProduct({
    product: item.product,
    productDiscounts,
  })
  const productDiscountAmount = roundCurrency(
    getProductDiscountAmount(item, productDiscount)
  )
  const hasPwdSeniorDiscount =
    Number(discountRate || 0) > 0 &&
    isPwdSeniorDiscountable(item.product) &&
    productDiscountAmount <= 0

  if (hasPwdSeniorDiscount) {
    const vatExemptBase = roundCurrency(subtotal / (1 + Number(vatRate || 0)))
    const vatExemptionAmount = roundCurrency(subtotal - vatExemptBase)
    const pwdSeniorDiscountAmount = roundCurrency(
      vatExemptBase * Number(discountRate || 0)
    )
    const total = roundCurrency(vatExemptBase - pwdSeniorDiscountAmount)

    return {
      subtotal,
      total,
      productDiscount,
      productDiscountAmount: 0,
      pwdSeniorDiscountAmount,
      vatExemptionAmount,
      vatExemptBase,
      vatableSales: 0,
      vatExemptSales: vatExemptBase,
      vatAmount: 0,
    }
  }

  const total = roundCurrency(subtotal - productDiscountAmount)
  const vatAmount = roundCurrency(total - total / (1 + Number(vatRate || 0)))

  return {
    subtotal,
    total,
    productDiscount,
    productDiscountAmount,
    pwdSeniorDiscountAmount: 0,
    vatExemptionAmount: 0,
    vatExemptBase: 0,
    vatableSales: roundCurrency(total - vatAmount),
    vatExemptSales: 0,
    vatAmount,
  }
}

export const getCartItemDiscountInfo = ({
  item,
  discountRate,
  productDiscounts = [],
}) => {
  const pricingBreakdown = getCartItemPricingBreakdown({
    item,
    discountRate,
    productDiscounts,
  })

  if (pricingBreakdown.productDiscountAmount > 0) {
    return {
      source: "PRODUCT",
      label: getDiscountReceiptLabel(pricingBreakdown.productDiscount),
      amount: pricingBreakdown.productDiscountAmount,
      vatExemptionAmount: 0,
      productDiscount: pricingBreakdown.productDiscount,
    }
  }

  if (pricingBreakdown.pwdSeniorDiscountAmount > 0) {
    return {
      source: "PWD_SENIOR",
      label: "PWD/Senior Discount",
      amount: pricingBreakdown.pwdSeniorDiscountAmount,
      vatExemptionAmount: pricingBreakdown.vatExemptionAmount,
      vatExemptBase: pricingBreakdown.vatExemptBase,
      productDiscount: null,
    }
  }

  return {
    source: "NONE",
    label: "",
    amount: 0,
    vatExemptionAmount: 0,
    productDiscount: null,
  }
}

export const getCartTotals = ({
  cartItems,
  discountRate,
  isVatExempt = false,
  productDiscounts = [],
  vatRate = 0.12,
}) => {
  const subtotal = cartItems.reduce(
    (total, item) => total + getCartItemSubtotal(item),
    0
  )
  const pricingBreakdowns = cartItems.map((item) =>
    getCartItemPricingBreakdown({
      item,
      discountRate,
      productDiscounts,
      vatRate,
    })
  )
  const discountableSubtotal = pricingBreakdowns.reduce(
    (total, breakdown) => total + breakdown.vatExemptBase,
    0
  )
  const productDiscountTotal = pricingBreakdowns.reduce(
    (total, breakdown) => total + breakdown.productDiscountAmount,
    0
  )
  const pwdSeniorDiscountTotal = pricingBreakdowns.reduce(
    (total, breakdown) => total + breakdown.pwdSeniorDiscountAmount,
    0
  )
  const vatExemptionTotal = pricingBreakdowns.reduce(
    (total, breakdown) => total + breakdown.vatExemptionAmount,
    0
  )
  const discount = productDiscountTotal + pwdSeniorDiscountTotal
  const total = pricingBreakdowns.reduce(
    (totalAmount, breakdown) => totalAmount + breakdown.total,
    0
  )
  const vatAmount = pricingBreakdowns.reduce(
    (totalAmount, breakdown) => totalAmount + breakdown.vatAmount,
    0
  )
  const vatableSales = pricingBreakdowns.reduce(
    (totalAmount, breakdown) => totalAmount + breakdown.vatableSales,
    0
  )
  const vatExemptSales = isVatExempt
    ? pricingBreakdowns.reduce(
        (totalAmount, breakdown) => totalAmount + breakdown.vatExemptSales,
        0
      )
    : 0

  return {
    itemCount: cartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),
    subtotal: roundCurrency(subtotal),
    discountableSubtotal: roundCurrency(discountableSubtotal),
    productDiscountTotal: roundCurrency(productDiscountTotal),
    pwdSeniorDiscountTotal: roundCurrency(pwdSeniorDiscountTotal),
    vatExemptionTotal: roundCurrency(vatExemptionTotal),
    discount: roundCurrency(discount),
    vatableSales: roundCurrency(vatableSales),
    vatExemptSales: roundCurrency(vatExemptSales),
    zeroRatedSales: 0,
    vatAmount: roundCurrency(vatAmount),
    vatRate,
    total: roundCurrency(total),
  }
}
