import { useEffect, useMemo, useState } from "react"

import SalesReportCharts from "./components/SalesReportCharts"
import SalesReportFilterPanel from "./components/SalesReportFilterPanel"
import SalesTransactionsTable from "./components/SalesTransactionsTable"
import TransactionDetailsView from "./components/TransactionDetailsView"
import useNotification from "../../../../../hooks/useNotification"
import {
  getSalesReportTransactionDetails,
  getSalesReportTransactions,
  mockSalesChartPoints,
  mockTopPurchasedItems,
} from "./data/salesReportMockData"
import { getTransactionReturnSummary } from "./utils/salesReportUtils"
import {
  CASHIER_TRANSACTIONS_UPDATED_EVENT,
  getStoredCashierTransactions,
  voidCashierTransaction,
} from "../../../staff/modules/cashier/data/cashierMockData"

export { default as SalesReportTopbarCards } from "./components/SalesReportTopbarCards"

const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100

const getCashierReceiptDiscountLabel = (receipt) => {
  if (Number(receipt.pwdSeniorDiscountTotal || 0) > 0) {
    return `${receipt.customerType} ${Number(receipt.discountRate || 20)}%`
  }

  const productDiscountLabel = receipt.items
    ?.map((item) => item.discountInfo)
    .find((discountInfo) => discountInfo?.source === "PRODUCT")?.label

  if (productDiscountLabel) {
    return productDiscountLabel
  }

  return "none"
}

const mapCashierReceiptToSalesTransaction = (receipt) => ({
  id: receipt.transactionId,
  branchId: receipt.branchId,
  status: receipt.status ?? "Completed",
  dateTime: receipt.dateTime,
  orderId: receipt.orNumber,
  invoiceId: receipt.invoiceNumber,
  cashier: receipt.cashierName,
  itemCount:
    receipt.itemCount ??
    (receipt.items ?? []).reduce(
      (totalItems, item) => totalItems + Number(item.quantity || 0),
      0
    ),
  quantity:
    receipt.itemCount ??
    (receipt.items ?? []).reduce(
      (totalItems, item) => totalItems + Number(item.quantity || 0),
      0
    ),
  type: "Product",
  customerType: receipt.customerType,
  discount: getCashierReceiptDiscountLabel(receipt),
  discountAmount: Number(receipt.discount || 0),
  total: Number(receipt.total || 0),
  voidReason: receipt.voidReason,
  voidedAt: receipt.voidedAt,
  voidedBy: receipt.voidedBy,
  voidApprovedBy: receipt.voidApprovedBy,
})

const mapCashierReceiptToTransactionDetails = (receipt) => ({
  id: receipt.transactionId,
  branchId: receipt.branchId,
  status: receipt.status ?? "Completed",
  dateTime: receipt.dateTime,
  orNumber: receipt.orNumber,
  invoiceId: receipt.invoiceNumber,
  cashier: receipt.cashierName,
  customerType: receipt.customerType,
  totalAmount: Number(receipt.total || 0),
  totalDiscount: Number(receipt.discount || 0),
  grandTotal: Number(receipt.total || 0),
  discountVerification: receipt.discountVerification,
  vatExemptionTotal: Number(receipt.vatExemptionTotal || 0),
  voidReason: receipt.voidReason,
  voidedAt: receipt.voidedAt,
  voidedBy: receipt.voidedBy,
  voidApprovedBy: receipt.voidApprovedBy,
  payment: {
    method: "Cash",
    amountTendered: Number(receipt.amountReceived || receipt.total || 0),
    change: Number(receipt.change || 0),
  },
  returns: [],
  items: (receipt.items ?? []).map((item, index) => {
    const lineSubtotal = Number(item.quantity || 0) * Number(item.price || 0)
    const discountAmount = Number(item.discountInfo?.amount || 0)
    const product = item.product ?? {}

    return {
      id: `${receipt.transactionId}-item-${index + 1}`,
      productId: item.productId,
      productName: product.productName,
      genericName: product.genericName,
      dosageForm: product.dosageForm,
      strength: product.strength,
      barcode: product.barcode,
      image: product.image,
      imageTone: product.imageTone,
      itemUnit: item.itemUnit,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.price || 0),
      discount: roundCurrency(discountAmount),
      vatExemption: Number(item.discountInfo?.vatExemptionAmount || 0),
      discountLabel: item.discountInfo?.label || "0%",
      total: roundCurrency(lineSubtotal - discountAmount),
    }
  }),
})

const getCombinedSalesReportData = (activeBranchId) => {
  const cashierReceipts = getStoredCashierTransactions().filter((receipt) =>
    activeBranchId ? receipt.branchId === activeBranchId : true
  )
  const cashierTransactions = cashierReceipts.map(
    mapCashierReceiptToSalesTransaction
  )
  const cashierTransactionDetails = Object.fromEntries(
    cashierReceipts.map((receipt) => [
      receipt.transactionId,
      mapCashierReceiptToTransactionDetails(receipt),
    ])
  )
  const transactions = [
    ...cashierTransactions,
    ...getSalesReportTransactions(),
  ].sort((firstTransaction, secondTransaction) => {
    const firstTime = new Date(firstTransaction.dateTime).getTime()
    const secondTime = new Date(secondTransaction.dateTime).getTime()

    return secondTime - firstTime
  })

  return {
    transactions,
    transactionDetailsById: {
      ...getSalesReportTransactionDetails(),
      ...cashierTransactionDetails,
    },
  }
}

function AdminSalesReport({ activeBranchId, onDetailsModeChange }) {
  const { showSuccess } = useNotification()
  const todayDate = getTodayDateInputValue()
  const [salesReportData, setSalesReportData] = useState(() =>
    getCombinedSalesReportData(activeBranchId)
  )
  const { transactions, transactionDetailsById } = salesReportData
  const [fromDate, setFromDate] = useState("2026-08-18")
  const [toDate, setToDate] = useState(todayDate)
  const [cashier, setCashier] = useState("all")
  const [customerType, setCustomerType] = useState("all")
  const [transactionStatus, setTransactionStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesToShow, setEntriesToShow] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionId, setOpenActionId] = useState(null)
  const [selectedTransactionDetails, setSelectedTransactionDetails] =
    useState(null)
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "2026-08-18",
    toDate: todayDate,
    cashier: "all",
    customerType: "all",
  })

  useEffect(() => {
    if (!openActionId) {
      return undefined
    }

    const closeActionMenu = () => {
      setOpenActionId(null)
    }

    document.addEventListener("click", closeActionMenu)

    return () => {
      document.removeEventListener("click", closeActionMenu)
    }
  }, [openActionId])

  useEffect(() => {
    const refreshCashierTransactions = () => {
      setSalesReportData(getCombinedSalesReportData(activeBranchId))
    }

    refreshCashierTransactions()
    window.addEventListener(
      CASHIER_TRANSACTIONS_UPDATED_EVENT,
      refreshCashierTransactions
    )
    window.addEventListener("storage", refreshCashierTransactions)

    return () => {
      window.removeEventListener(
        CASHIER_TRANSACTIONS_UPDATED_EVENT,
        refreshCashierTransactions
      )
      window.removeEventListener("storage", refreshCashierTransactions)
    }
  }, [activeBranchId])

  useEffect(() => {
    onDetailsModeChange?.(Boolean(selectedTransactionDetails))

    return () => {
      onDetailsModeChange?.(false)
    }
  }, [onDetailsModeChange, selectedTransactionDetails])

  const cashierOptions = useMemo(
    () => [
      ...new Set(
        transactions.map((transaction) => transaction.cashier)
      ),
    ],
    [transactions]
  )

  const baseFilteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const fromTime = appliedFilters.fromDate
      ? new Date(`${appliedFilters.fromDate}T00:00:00`).getTime()
      : null
    const toTime = appliedFilters.toDate
      ? new Date(`${appliedFilters.toDate}T23:59:59`).getTime()
      : null

    return transactions.filter((transaction) => {
      const transactionTime = new Date(transaction.dateTime).getTime()
      const matchesDate =
        (!fromTime || transactionTime >= fromTime) &&
        (!toTime || transactionTime <= toTime)
      const matchesCashier =
        appliedFilters.cashier === "all" ||
        transaction.cashier === appliedFilters.cashier
      const matchesCustomerType =
        appliedFilters.customerType === "all" ||
        transaction.customerType === appliedFilters.customerType
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.orderId,
          transaction.orNumber,
          transaction.invoiceId,
          transaction.cashier,
          transaction.customerType,
          transaction.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)

      return (
        matchesDate &&
        matchesCashier &&
        matchesCustomerType &&
        matchesSearch
      )
    })
  }, [appliedFilters, searchTerm, transactions])

  const transactionStatusTabs = useMemo(
    () =>
      [
        { id: "all", label: "All" },
        { id: "Completed", label: "Completed" },
        { id: "Returned", label: "Returned" },
        { id: "Partially Returned", label: "Partially Returned" },
        { id: "Voided", label: "Voided" },
      ].map((tab) => ({
        ...tab,
        count:
          tab.id === "all"
            ? baseFilteredTransactions.length
            : baseFilteredTransactions.filter(
                (transaction) => transaction.status === tab.id
              ).length,
      })),
    [baseFilteredTransactions]
  )

  const filteredTransactions = useMemo(
    () =>
      transactionStatus === "all"
        ? baseFilteredTransactions
        : baseFilteredTransactions.filter(
            (transaction) => transaction.status === transactionStatus
          ),
    [baseFilteredTransactions, transactionStatus]
  )

  const totalEntries = filteredTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / Number(entriesToShow)))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = totalEntries
    ? (safeCurrentPage - 1) * Number(entriesToShow)
    : 0
  const endIndex = Math.min(startIndex + Number(entriesToShow), totalEntries)
  const visibleTransactions = filteredTransactions.slice(startIndex, endIndex)

  const handleApplyFilters = () => {
    setAppliedFilters({
      fromDate,
      toDate,
      cashier,
      customerType,
    })
    setCurrentPage(1)
  }

  const handleExport = () => {
  }

  const handleViewTransactionDetails = (transaction) => {
    const currentTransaction =
      transactions.find(
        (storedTransaction) => storedTransaction.id === transaction.id
      ) ?? transaction

    setSelectedTransactionDetails(
      transactionDetailsById[transaction.id]
        ? {
            ...transactionDetailsById[transaction.id],
            status: currentTransaction.status,
          }
        : {
            ...currentTransaction,
            orNumber: currentTransaction.orderId,
            totalAmount: currentTransaction.total,
            totalDiscount: currentTransaction.discountAmount,
            grandTotal: currentTransaction.total,
            returns: [],
            payment: {
              method: "Cash",
              amountTendered: currentTransaction.total,
              change: 0,
            },
            items: [],
          }
    )
    setOpenActionId(null)
  }

  const handleProcessReturn = (updatedTransactionDetails) => {
    const returnSummary = getTransactionReturnSummary(updatedTransactionDetails)
    const totalRefundAmount = (updatedTransactionDetails.returns ?? []).reduce(
      (totalAmount, returnItem) =>
        totalAmount + Number(returnItem.refundAmount ?? 0),
      0
    )

    setSalesReportData((currentData) => ({
      ...currentData,
      transactionDetailsById: {
        ...currentData.transactionDetailsById,
        [updatedTransactionDetails.id]: updatedTransactionDetails,
      },
      transactions: currentData.transactions.map((transaction) =>
        transaction.id === updatedTransactionDetails.id
          ? {
              ...transaction,
              status: updatedTransactionDetails.status,
              returnedItemCount: returnSummary.totalReturnedQuantity,
              refundAmount: Number(totalRefundAmount.toFixed(2)),
            }
          : transaction
      ),
    }))
    setSelectedTransactionDetails(updatedTransactionDetails)
  }

  const handleVoidTransaction = (reason) => {
    if (!selectedTransactionDetails) {
      return
    }

    const voidedAt = new Date().toISOString()
    const voidedTransactionDetails = {
      ...selectedTransactionDetails,
      status: "Voided",
      voidReason: reason,
      voidedAt,
      voidedBy: "Branch Admin",
      voidApprovedBy: "Branch Admin",
    }
    const cashierTransactionExists = getStoredCashierTransactions().some(
      (transaction) => transaction.transactionId === selectedTransactionDetails.id
    )

    if (cashierTransactionExists) {
      voidCashierTransaction({
        managerApprovalKey: "Branch Admin",
        orNumber: selectedTransactionDetails.orNumber,
        reason,
        voidedBy: "Branch Admin",
      })
    }

    setSalesReportData((currentData) => ({
      ...currentData,
      transactionDetailsById: {
        ...currentData.transactionDetailsById,
        [voidedTransactionDetails.id]: voidedTransactionDetails,
      },
      transactions: currentData.transactions.map((transaction) =>
        transaction.id === voidedTransactionDetails.id
          ? {
              ...transaction,
              status: "Voided",
              voidReason: reason,
              voidedAt,
              voidedBy: "Branch Admin",
              voidApprovedBy: "Branch Admin",
            }
          : transaction
      ),
    }))
    setSelectedTransactionDetails(voidedTransactionDetails)
    showSuccess(`OR No. ${voidedTransactionDetails.orNumber} was voided.`, {
      title: "Transaction voided",
    })
  }

  if (selectedTransactionDetails) {
    return (
      <TransactionDetailsView
        transaction={selectedTransactionDetails}
        onBack={() => setSelectedTransactionDetails(null)}
        onProcessReturn={handleProcessReturn}
        onVoidTransaction={handleVoidTransaction}
      />
    )
  }

  return (
    <div className="min-w-0 space-y-5">
      <section className="grid min-w-0 gap-5 min-[1800px]:grid-cols-[minmax(28rem,0.46fr)_minmax(0,1fr)]">
        <SalesReportFilterPanel
          fromDate={fromDate}
          toDate={toDate}
          cashier={cashier}
          customerType={customerType}
          cashierOptions={cashierOptions}
          onFromDateChange={(event) => setFromDate(event.target.value)}
          onToDateChange={(event) => setToDate(event.target.value)}
          onCashierChange={(event) => setCashier(event.target.value)}
          onCustomerTypeChange={(event) => setCustomerType(event.target.value)}
          onApplyFilters={handleApplyFilters}
          onExport={handleExport}
        />

        <SalesReportCharts
          chartPoints={mockSalesChartPoints}
          topPurchasedItems={mockTopPurchasedItems}
        />
      </section>

      <SalesTransactionsTable
        transactions={visibleTransactions}
        statusTabs={transactionStatusTabs}
        selectedStatus={transactionStatus}
        searchTerm={searchTerm}
        entriesToShow={entriesToShow}
        currentPage={safeCurrentPage}
        totalEntries={totalEntries}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        openActionId={openActionId}
        onSearchChange={(event) => {
          setSearchTerm(event.target.value)
          setCurrentPage(1)
        }}
        onStatusChange={(status) => {
          setTransactionStatus(status)
          setCurrentPage(1)
        }}
        onEntriesToShowChange={(event) => {
          setEntriesToShow(event.target.value)
          setCurrentPage(1)
        }}
        onPageChange={setCurrentPage}
        onToggleAction={(transactionId) =>
          setOpenActionId((currentTransactionId) =>
            currentTransactionId === transactionId ? null : transactionId
          )
        }
        onViewDetails={handleViewTransactionDetails}
      />
    </div>
  )
}

export default AdminSalesReport
