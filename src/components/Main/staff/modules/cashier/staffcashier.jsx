import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  customerTypes,
  getStoredCashierTransactions,
  mockCashierProducts,
  saveCashierTransaction,
  voidCashierTransaction,
} from "./data/cashierMockData"
import useNotification from "../../../../../hooks/useNotification"
import { getStoredProductDiscounts } from "../../../admin/modules/discounts/data/productDiscountMockData"
import { defaultPharmacySettings } from "../../../admin/modules/settings/data/settingsData"
import CashierCartTable from "./components/CashierCartTable"
import CashierCheckoutPanel from "./components/CashierCheckoutPanel"
import CustomerTypePromptModal from "./components/CustomerTypePromptModal"
import CustomerDiscountIdModal from "./components/CustomerDiscountIdModal"
import ManagerApprovalModal from "./components/ManagerApprovalModal"
import CashierSearchBar from "./components/CashierSearchBar"
import CashierShortcutBar from "./components/CashierShortcutBar"
import PaymentProcessModal from "./components/PaymentProcessModal"
import PriceCheckModal from "./components/PriceCheckModal"
import ProductListModal from "./components/ProductListModal"
import ReceiptPreviewModal from "./components/ReceiptPreviewModal"
import VoidTransactionModal from "./components/VoidTransactionModal"
import {
  buildCartItem,
  filterCashierProducts,
  getCartItemDiscountInfo,
  getCashierCartId,
  getCartTotals,
  getCashierProductPrice,
  getCashierUnitMaxQuantity,
} from "./utils/cashierUtils"

function StaffCashier({
  activeBranchId,
  branchName = "Lyfe Pharmacy Branch",
  cashierStationLabel = "Cashier 1",
  staffName = "Branch Staff",
  onLogoutRequest,
}) {
  const { showSuccess } = useNotification()
  const [searchTerm, setSearchTerm] = useState("")
  const [cartItems, setCartItems] = useState([])
  const [selectedCustomerType, setSelectedCustomerType] = useState("Regular")
  const [pendingCustomerType, setPendingCustomerType] = useState(null)
  const [approvedCustomerType, setApprovedCustomerType] = useState(null)
  const [pendingManagerApprovalKey, setPendingManagerApprovalKey] = useState("")
  const [discountVerification, setDiscountVerification] = useState(null)
  const [
    shouldOpenPaymentAfterDiscountVerification,
    setShouldOpenPaymentAfterDiscountVerification,
  ] = useState(false)
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false)
  const [isProductListOpen, setIsProductListOpen] = useState(false)
  const [isVoidTransactionOpen, setIsVoidTransactionOpen] = useState(false)
  const [isCustomerTypePromptOpen, setIsCustomerTypePromptOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [pendingSaleAdjustment, setPendingSaleAdjustment] = useState(null)
  const [pendingVoidTransaction, setPendingVoidTransaction] = useState(null)
  const [cashierTransactions, setCashierTransactions] = useState(() =>
    getStoredCashierTransactions()
  )
  const searchInputRef = useRef(null)

  const searchResults = useMemo(
    () =>
      filterCashierProducts({
        products: mockCashierProducts,
        searchTerm,
      }).slice(0, 6),
    [searchTerm]
  )
  const productDiscounts = useMemo(
    () => {
      const storedProductDiscounts = getStoredProductDiscounts()

      return activeBranchId
        ? storedProductDiscounts.filter(
            (discount) => discount.branchId === activeBranchId
          )
        : storedProductDiscounts
    },
    [activeBranchId]
  )

  const selectedCustomer = customerTypes.find(
    (customerType) => customerType.id === selectedCustomerType
  )
  const pendingCustomer = customerTypes.find(
    (customerType) => customerType.id === pendingCustomerType
  )
  const approvedCustomer = customerTypes.find(
    (customerType) => customerType.id === approvedCustomerType
  )
  const pendingSaleAdjustmentDescription = useMemo(() => {
    if (!pendingSaleAdjustment) {
      return ""
    }

    if (pendingSaleAdjustment.type === "clear") {
      return "Approval is required before clearing the current sale."
    }

    if (pendingSaleAdjustment.type === "remove") {
      return "Approval is required before voiding an item."
    }

    return "Approval is required before voiding an item quantity."
  }, [pendingSaleAdjustment])
  const pendingVoidTransactionDescription = pendingVoidTransaction
    ? `Approval is required to void OR No. ${pendingVoidTransaction.transaction.orNumber}. Reason: ${pendingVoidTransaction.reason}.`
    : ""
  const totals = getCartTotals({
    cartItems,
    discountRate: selectedCustomer?.discountRate ?? 0,
    isVatExempt: selectedCustomerType !== "Regular",
    productDiscounts,
  })

  const handleProceed = useCallback(() => {
    if (!cartItems.length) {
      return
    }

    setIsCustomerTypePromptOpen(true)
  }, [cartItems.length])

  const handleProceedCustomerTypeSelect = (customerTypeId) => {
    setIsCustomerTypePromptOpen(false)

    if (customerTypeId === "Regular") {
      setPendingCustomerType(null)
      setApprovedCustomerType(null)
      setPendingManagerApprovalKey("")
      setDiscountVerification(null)
      setShouldOpenPaymentAfterDiscountVerification(false)
      setSelectedCustomerType(customerTypeId)
      setIsPaymentOpen(true)
      return
    }

    if (customerTypeId === selectedCustomerType && discountVerification) {
      setShouldOpenPaymentAfterDiscountVerification(false)
      setIsPaymentOpen(true)
      return
    }

    setShouldOpenPaymentAfterDiscountVerification(true)
    setPendingCustomerType(customerTypeId)
  }

  const focusScanSearchInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [])

  useEffect(() => {
    const handleCashierShortcut = (event) => {
      if (
        isCustomerTypePromptOpen ||
        isPriceCheckOpen ||
        isProductListOpen ||
        isVoidTransactionOpen ||
        isPaymentOpen ||
        receiptData ||
        pendingCustomerType ||
        approvedCustomerType ||
        pendingSaleAdjustment ||
        pendingVoidTransaction
      ) {
        return
      }

      if (event.key === "F3") {
        event.preventDefault()
        focusScanSearchInput()
        return
      }

      if (event.key === "F4") {
        event.preventDefault()
        setIsProductListOpen((isOpen) => !isOpen)
        return
      }

      if (event.key === "F5") {
        event.preventDefault()
        setIsVoidTransactionOpen(true)
        return
      }

      if (event.key === "F6") {
        event.preventDefault()
        setIsPriceCheckOpen(true)
        return
      }

      if (event.key === "F7") {
        event.preventDefault()
        if (cartItems.length) {
          setPendingSaleAdjustment({
            type: "clear",
          })
        }
        return
      }

      if (event.key === "F8") {
        event.preventDefault()
        handleProceed()
        return
      }

    }

    window.addEventListener("keydown", handleCashierShortcut)

    return () => {
      window.removeEventListener("keydown", handleCashierShortcut)
    }
  }, [
    approvedCustomerType,
    cartItems.length,
    focusScanSearchInput,
    handleProceed,
    isCustomerTypePromptOpen,
    isPaymentOpen,
    isPriceCheckOpen,
    isProductListOpen,
    isVoidTransactionOpen,
    pendingCustomerType,
    pendingVoidTransaction,
    pendingSaleAdjustment,
    receiptData,
  ])

  const handleManagerApproval = (managerApprovalKey) => {
    if (pendingSaleAdjustment) {
      if (pendingSaleAdjustment.type === "clear") {
        clearCart()
      }

      if (pendingSaleAdjustment.type === "remove") {
        removeItem(pendingSaleAdjustment.cartId)
      }

      if (pendingSaleAdjustment.type === "quantity") {
        updateQuantity(
          pendingSaleAdjustment.cartId,
          pendingSaleAdjustment.nextQuantity
        )
      }

      setPendingSaleAdjustment(null)
      return
    }

    if (pendingVoidTransaction) {
      const voidedTransaction = voidCashierTransaction({
        managerApprovalKey,
        orNumber: pendingVoidTransaction.transaction.orNumber,
        reason: pendingVoidTransaction.reason,
        voidedBy: staffName,
      })

      setCashierTransactions(getStoredCashierTransactions())
      setPendingVoidTransaction(null)
      showSuccess(
        `OR No. ${voidedTransaction?.orNumber ?? pendingVoidTransaction.transaction.orNumber} was voided.`,
        {
        title: "Transaction voided",
        }
      )
      return
    }

    setPendingManagerApprovalKey(managerApprovalKey)
    setApprovedCustomerType(pendingCustomer?.id ?? null)
    setPendingCustomerType(null)
  }

  const handleDiscountIdVerification = (verificationPayload) => {
    if (!approvedCustomer) {
      return
    }

    const customerIdNumber =
      typeof verificationPayload === "string"
        ? verificationPayload
        : verificationPayload.customerIdNumber
    const verificationDetails =
      typeof verificationPayload === "string"
        ? {}
        : verificationPayload.details ?? {}
    const verificationMethod =
      typeof verificationPayload === "string"
        ? "scanned"
        : verificationPayload.verificationMethod ?? "scanned"

    setSelectedCustomerType(approvedCustomer.id)
    setDiscountVerification({
      customerType: approvedCustomer.id,
      customerTypeLabel: approvedCustomer.label,
      managerApprovalKey: pendingManagerApprovalKey,
      customerIdNumber,
      verificationMethod,
      ...verificationDetails,
      verifiedAt: new Date().toISOString(),
    })
    setApprovedCustomerType(null)
    setPendingManagerApprovalKey("")

    if (shouldOpenPaymentAfterDiscountVerification) {
      setShouldOpenPaymentAfterDiscountVerification(false)
      setIsPaymentOpen(true)
    }
  }

  const closeDiscountVerification = () => {
    setPendingCustomerType(null)
    setApprovedCustomerType(null)
    setPendingManagerApprovalKey("")
    setShouldOpenPaymentAfterDiscountVerification(false)
  }

  const addProductToCart = (product) => {
    const newCartItem = buildCartItem(product)

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.cartId === newCartItem.cartId
      )

      if (!existingItem) {
        const maxQuantity = getCashierUnitMaxQuantity({
          cartItems: currentItems,
          product: newCartItem.product,
          selectedUnit: newCartItem.itemUnit,
        })

        if (maxQuantity <= 0) {
          return currentItems
        }

        return [...currentItems, newCartItem]
      }

      return currentItems.map((item) =>
        item.cartId === newCartItem.cartId
          ? {
              ...item,
              quantity: Math.min(
                Number(item.quantity) + 1,
                getCashierUnitMaxQuantity({
                  cartItems: currentItems,
                  product: item.product,
                  selectedUnit: item.itemUnit,
                  excludeCartId: item.cartId,
                })
              ),
            }
          : item
      )
    })

    setSearchTerm("")
  }

  const handleScanBarcode = () => {
    const productToAdd = searchResults[0]

    if (productToAdd) {
      addProductToCart(productToAdd)
    }
  }

  const updateQuantity = (cartId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: Math.min(
                Math.max(Number(nextQuantity) || 1, 1),
                getCashierUnitMaxQuantity({
                  cartItems: currentItems,
                  product: item.product,
                  selectedUnit: item.itemUnit,
                  excludeCartId: item.cartId,
                })
              ),
            }
          : item
      )
    )
  }

  const updateUnit = (cartId, itemUnit) => {
    setCartItems((currentItems) => {
      const selectedItem = currentItems.find((item) => item.cartId === cartId)

      if (!selectedItem) {
        return currentItems
      }

      const nextCartId = getCashierCartId(
        selectedItem.productId,
        itemUnit,
        selectedItem.product.batchNumber
      )
      const maxQuantity = getCashierUnitMaxQuantity({
        cartItems: currentItems,
        product: selectedItem.product,
        selectedUnit: itemUnit,
        excludeCartId: selectedItem.cartId,
      })

      if (maxQuantity <= 0) {
        return currentItems
      }

      const nextQuantity = Math.min(Number(selectedItem.quantity) || 1, maxQuantity)
      const existingTargetItem = currentItems.find(
        (item) => item.cartId === nextCartId && item.cartId !== cartId
      )

      if (existingTargetItem) {
        return currentItems
          .filter((item) => item.cartId !== cartId)
          .map((item) =>
            item.cartId === nextCartId
              ? {
                  ...item,
                  quantity: Math.min(
                    Number(item.quantity) + nextQuantity,
                    getCashierUnitMaxQuantity({
                      cartItems: currentItems.filter(
                        (cartItem) => cartItem.cartId !== selectedItem.cartId
                      ),
                      product: item.product,
                      selectedUnit: item.itemUnit,
                      excludeCartId: item.cartId,
                    })
                  ),
                }
              : item
          )
      }

      return currentItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              cartId: nextCartId,
              itemUnit,
              quantity: nextQuantity,
              price: getCashierProductPrice(item.product, itemUnit),
            }
          : item
      )
    })
  }

  const removeItem = (cartId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartId !== cartId)
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const requestQuantityChange = (cartId, nextQuantity) => {
    const currentItem = cartItems.find((item) => item.cartId === cartId)

    if (
      currentItem &&
      Number(nextQuantity) < Number(currentItem.quantity)
    ) {
      setPendingSaleAdjustment({
        type: Number(nextQuantity) <= 0 ? "remove" : "quantity",
        cartId,
        nextQuantity,
      })
      return
    }

    updateQuantity(cartId, nextQuantity)
  }

  const requestRemoveItem = (cartId) => {
    const currentItem = cartItems.find((item) => item.cartId === cartId)

    if (!currentItem) {
      return
    }

    setPendingSaleAdjustment({
      type: "remove",
      cartId,
    })
  }

  const requestClearCart = () => {
    if (!cartItems.length) {
      return
    }

    setPendingSaleAdjustment({
      type: "clear",
    })
  }

  const handleVoidTransactionRequest = (voidRequest) => {
    setPendingVoidTransaction(voidRequest)
    setIsVoidTransactionOpen(false)
  }

  const handleConfirmPayment = (amountReceived) => {
    const now = new Date()
    const receiptDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(now)
    const receiptTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now)

    const transactionSequence = String(now.getTime()).slice(-6)
    const receipt = {
      settings: defaultPharmacySettings,
      transactionId: `sales-transaction-${now.getTime()}`,
      branchId: activeBranchId,
      status: "Completed",
      dateTime: now.toISOString(),
      orNumber: transactionSequence,
      invoiceNumber: `INV-${transactionSequence}`,
      cashierName: staffName,
      customerType: selectedCustomerType,
      discountVerification,
      discountRate: selectedCustomer?.discountRate
        ? selectedCustomer.discountRate * 100
        : 0,
      date: receiptDate,
      time: receiptTime,
      items: cartItems.map((item) => ({
        ...item,
        discountInfo: getCartItemDiscountInfo({
          item,
          discountRate: selectedCustomer?.discountRate ?? 0,
          productDiscounts,
        }),
      })),
      subtotal: totals.subtotal,
      discountableSubtotal: totals.discountableSubtotal,
      productDiscountTotal: totals.productDiscountTotal,
      pwdSeniorDiscountTotal: totals.pwdSeniorDiscountTotal,
      vatExemptionTotal: totals.vatExemptionTotal,
      discount: totals.discount,
      vatableSales: totals.vatableSales,
      vatExemptSales: totals.vatExemptSales,
      zeroRatedSales: totals.zeroRatedSales,
      vatAmount: totals.vatAmount,
      vatRate: totals.vatRate,
      total: totals.total,
      amountReceived,
      change: Math.max(Number(amountReceived) - Number(totals.total), 0),
    }

    saveCashierTransaction(receipt)
    setCashierTransactions(getStoredCashierTransactions())
    setReceiptData(receipt)
    setIsPaymentOpen(false)
  }

  const handleCloseReceipt = () => {
    setReceiptData(null)
    setCartItems([])
    setSelectedCustomerType("Regular")
    setPendingCustomerType(null)
    setApprovedCustomerType(null)
    setPendingManagerApprovalKey("")
    setShouldOpenPaymentAfterDiscountVerification(false)
    setDiscountVerification(null)
  }

  return (
    <>
      <div className="cashier-mobile-lock min-h-[calc(100dvh-7rem)] place-items-center rounded-[24px] border border-white/60 bg-white p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="max-w-sm">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#0b6b51]/70">
            Cashier POS
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-950">
            Not available on mobile
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Continue on tablet landscape or desktop mode to use the cashier.
          </p>
        </div>
      </div>

      <div className="cashier-orientation-lock min-h-[calc(100dvh-7rem)] place-items-center rounded-[24px] border border-white/60 bg-white p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="max-w-sm">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#0b6b51]/70">
            Tablet POS
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-950">
            Continue in landscape mode
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Rotate the tablet to keep the cashier layout ready for scanning,
            cart review, and payment.
          </p>
        </div>
      </div>

      <div className="cashier-workspace flex min-w-0 flex-col gap-4 pt-3">
      <div className="cashier-workspace-grid grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
        <section className="flex min-h-[34rem] flex-col rounded-[24px] border border-white/60 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5 xl:h-[calc(100dvh-8rem)]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
              {cashierStationLabel}
            </h1>
            <p className="text-xl font-extrabold text-[#0b6b51] sm:text-2xl">
              {branchName}
            </p>
          </div>

          <CashierSearchBar
            searchInputRef={searchInputRef}
            searchTerm={searchTerm}
            searchResults={searchResults}
            onSearchChange={(event) => setSearchTerm(event.target.value)}
            onSelectProduct={addProductToCart}
            onScanBarcode={handleScanBarcode}
            onOpenPriceCheck={() => setIsPriceCheckOpen(true)}
            onOpenProductList={() => setIsProductListOpen(true)}
          />

          <CashierCartTable
            cartItems={cartItems}
            productDiscounts={productDiscounts}
            selectedCustomerType={selectedCustomerType}
          />
        </section>

        <CashierCheckoutPanel
          cartItems={cartItems}
          selectedCustomerType={selectedCustomerType}
          productDiscounts={productDiscounts}
          totals={totals}
          onClearCart={requestClearCart}
          onRemoveItem={requestRemoveItem}
          onQuantityChange={requestQuantityChange}
          onUnitChange={updateUnit}
          onProceed={handleProceed}
        />
      </div>

      <CashierShortcutBar
        onLogoutRequest={onLogoutRequest}
        onScanSearchRequest={focusScanSearchInput}
        onVoidTransactionRequest={() => setIsVoidTransactionOpen(true)}
      />

      {isPriceCheckOpen && (
        <PriceCheckModal
          products={mockCashierProducts}
          onClose={() => setIsPriceCheckOpen(false)}
        />
      )}

      {isProductListOpen && (
        <ProductListModal
          products={mockCashierProducts}
          cartItems={cartItems}
          productDiscounts={productDiscounts}
          onClose={() => setIsProductListOpen(false)}
          onAddProduct={addProductToCart}
        />
      )}

      {isVoidTransactionOpen && (
        <VoidTransactionModal
          transactions={cashierTransactions.filter((transaction) =>
            activeBranchId ? transaction.branchId === activeBranchId : true
          )}
          onClose={() => setIsVoidTransactionOpen(false)}
          onRequestApproval={handleVoidTransactionRequest}
        />
      )}

      {isPaymentOpen && (
        <PaymentProcessModal
          selectedCustomerType={selectedCustomerType}
          totals={totals}
          onClose={() => setIsPaymentOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {isCustomerTypePromptOpen && (
        <CustomerTypePromptModal
          customerTypes={customerTypes}
          totals={totals}
          onClose={() => setIsCustomerTypePromptOpen(false)}
          onSelect={handleProceedCustomerTypeSelect}
        />
      )}

      {pendingCustomer && (
        <ManagerApprovalModal
          customerTypeLabel={pendingCustomer.label}
          onClose={closeDiscountVerification}
          onApprove={handleManagerApproval}
        />
      )}

      {pendingSaleAdjustment && (
        <ManagerApprovalModal
          customerTypeLabel="current sale adjustment"
          approvalDescription={pendingSaleAdjustmentDescription}
          approveButtonLabel="Approve Action"
          onClose={() => setPendingSaleAdjustment(null)}
          onApprove={handleManagerApproval}
        />
      )}

      {pendingVoidTransaction && (
        <ManagerApprovalModal
          customerTypeLabel="void transaction"
          approvalDescription={pendingVoidTransactionDescription}
          approveButtonLabel="Approve Void"
          onClose={() => setPendingVoidTransaction(null)}
          onApprove={handleManagerApproval}
        />
      )}

      {approvedCustomer && (
        <CustomerDiscountIdModal
          customerTypeId={approvedCustomer.id}
          customerTypeLabel={approvedCustomer.label}
          onClose={closeDiscountVerification}
          onVerify={handleDiscountIdVerification}
        />
      )}

      {receiptData && (
        <ReceiptPreviewModal receipt={receiptData} onClose={handleCloseReceipt} />
      )}
      </div>
    </>
  )
}

export default StaffCashier
