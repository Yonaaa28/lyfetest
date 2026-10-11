import { useMemo, useState } from "react"
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiCreditCard,
  FiEye,
  FiHash,
  FiRefreshCcw,
  FiSlash,
  FiUser,
  FiX,
} from "react-icons/fi"

import ProductThumb from "../../../../../shared/inventory/ProductThumb"
import { getProductTableDisplayName } from "../../../../../shared/inventory/inventoryUtils"
import { defaultPharmacySettings } from "../../settings/data/settingsData"
import ReceiptPreviewModal from "../../../../staff/modules/cashier/components/ReceiptPreviewModal"
import ProcessReturnModal from "./ProcessReturnModal"
import {
  formatPeso,
  formatShortDate,
  formatTransactionDate,
  getItemReturnedQuantity,
  getReturnPolicyInfo,
  getTransactionStatusClassName,
  getTransactionReturnSummary,
  getVoidPolicyInfo,
} from "../utils/salesReportUtils"

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100

const receiptPdfLineWidth = 32
const receiptPdfDivider = "--------------------------------"

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")

const formatReceiptPdfAmount = (value) =>
  `P${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const centerReceiptPdfLine = (value) => {
  const text = String(value ?? "").trim()

  if (!text || text.length >= receiptPdfLineWidth) {
    return text
  }

  const leftPadding = Math.floor((receiptPdfLineWidth - text.length) / 2)

  return `${" ".repeat(leftPadding)}${text}`
}

const getReceiptPdfPairLine = (label, value) => {
  const textLabel = String(label ?? "")
  const textValue = String(value ?? "")
  const availableLabelWidth = receiptPdfLineWidth - textValue.length - 1
  const fittedLabel =
    availableLabelWidth > 0
      ? textLabel.slice(0, availableLabelWidth)
      : textLabel

  if (fittedLabel.length + textValue.length >= receiptPdfLineWidth) {
    return `${fittedLabel} ${textValue}`.trim()
  }

  return `${fittedLabel}${" ".repeat(
    receiptPdfLineWidth - fittedLabel.length - textValue.length
  )}${textValue}`
}

const wrapReceiptPdfLine = (value, width = receiptPdfLineWidth) => {
  const text = String(value ?? "")

  if (text.length <= width) {
    return [text]
  }

  const words = text.split(" ")
  const lines = []
  let currentLine = ""

  words.forEach((word) => {
    if (word.length > width) {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = ""
      }

      for (let index = 0; index < word.length; index += width) {
        lines.push(word.slice(index, index + width))
      }
      return
    }

    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length > width) {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
      return
    }

    currentLine = nextLine
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

const formatReceiptPdfDateTime = (receipt) => {
  const dateTime = receipt.dateTime ? new Date(receipt.dateTime) : null

  if (!dateTime || Number.isNaN(dateTime.getTime())) {
    return `${receipt.date ?? ""} ${receipt.time ?? ""}`.trim()
  }

  const date = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(dateTime)
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateTime)

  return `${date} ${time}`
}

const getReceiptPdfLines = (receipt) => {
  const hasProductDiscount = Number(receipt.productDiscountTotal || 0) > 0
  const hasPwdSeniorDiscount = Number(receipt.pwdSeniorDiscountTotal || 0) > 0
  const vatExemptionTotal = Number(receipt.vatExemptionTotal || 0)
  const totalAmountWithoutVat = Number(receipt.subtotal || 0) - vatExemptionTotal
  const verification = receipt.discountVerification
  const discountIdLabel =
    verification?.customerType === "Senior" ? "OSCA ID No." : "PWD ID No."
  const lines = [
    centerReceiptPdfLine("LYFE PHARMACY"),
    centerReceiptPdfLine("Kaagapay mo sa Buhay"),
    "",
    ...wrapReceiptPdfLine(receipt.settings.branch).map(centerReceiptPdfLine),
    ...wrapReceiptPdfLine(receipt.settings.address).map(centerReceiptPdfLine),
    centerReceiptPdfLine(`Tel No.: ${receipt.settings.phone}`),
    "",
    receiptPdfDivider,
    centerReceiptPdfLine("SALES INVOICE"),
    "",
    `OR No.: ${receipt.orNumber}`,
    `Invoice No.: ${receipt.invoiceNumber}`,
    `Cashier: ${receipt.cashierName}`,
    "Payment Method: Cash",
    `Date: ${formatReceiptPdfDateTime(receipt)}`,
    "",
    receiptPdfDivider,
    getReceiptPdfPairLine("ITEMS", "QTY PRICE TOTAL"),
    receiptPdfDivider,
  ]

  receipt.items.forEach((item) => {
    const itemName = getProductTableDisplayName(item.product)
    const price = formatReceiptPdfAmount(item.price)
    const total = formatReceiptPdfAmount(Number(item.quantity) * Number(item.price))
    const quantity = String(item.quantity)

    lines.push(...wrapReceiptPdfLine(itemName))
    lines.push(String(item.product.barcode ?? "N/A"))

    if (item.discountInfo?.source === "PRODUCT") {
      lines.push(...wrapReceiptPdfLine(item.discountInfo.label))
    }

    lines.push(getReceiptPdfPairLine(quantity, `${price} ${total}`))
    lines.push("")
  })

  lines.push(
    receiptPdfDivider,
    getReceiptPdfPairLine("Amt of VAT EXEMPT ITEMs", formatReceiptPdfAmount(0)),
    getReceiptPdfPairLine(
      "Amt of Sale With VAT",
      formatReceiptPdfAmount(receipt.subtotal)
    )
  )

  if (hasPwdSeniorDiscount) {
    lines.push(
      getReceiptPdfPairLine("Less 12% VAT", formatReceiptPdfAmount(vatExemptionTotal))
    )
  }

  lines.push(
    getReceiptPdfPairLine(
      "TOTAL AMOUNT w/o VAT",
      formatReceiptPdfAmount(totalAmountWithoutVat)
    )
  )

  if (hasPwdSeniorDiscount) {
    lines.push(
      getReceiptPdfPairLine(
        "LESS: 20% Sales Discount",
        formatReceiptPdfAmount(receipt.pwdSeniorDiscountTotal)
      )
    )
  }

  if (hasProductDiscount) {
    lines.push(
      getReceiptPdfPairLine(
        "PRODUCT DISCOUNTS",
        formatReceiptPdfAmount(receipt.productDiscountTotal)
      )
    )
  }

  lines.push(
    getReceiptPdfPairLine("TOTAL AMOUNT", formatReceiptPdfAmount(receipt.total)),
    "",
    receiptPdfDivider,
    getReceiptPdfPairLine("TOTAL", formatReceiptPdfAmount(receipt.total)),
    "AMOUNT TENDERED",
    getReceiptPdfPairLine("CASH", formatReceiptPdfAmount(receipt.amountReceived)),
    "",
    getReceiptPdfPairLine(
      "TOTAL PAYMENT",
      formatReceiptPdfAmount(receipt.amountReceived)
    ),
    getReceiptPdfPairLine("CHANGE", formatReceiptPdfAmount(receipt.change))
  )

  if (verification) {
    lines.push(
      "",
      receiptPdfDivider,
      `ORDER #${receipt.orNumber}`,
      `${discountIdLabel}: ${verification.customerIdNumber}`,
      ...wrapReceiptPdfLine(`SOLD TO: ${verification.fullName ?? ""}`),
      "SIGNATURE : ____________________",
      ...wrapReceiptPdfLine(
        `ADDRESS : ${verification.address ?? "____________________"}`
      ),
      "TIN NO : ____________________"
    )
  }

  lines.push(
    "",
    receiptPdfDivider,
    getReceiptPdfPairLine("VATable", formatReceiptPdfAmount(receipt.vatableSales ?? 0)),
    getReceiptPdfPairLine(
      "VAT-Exempt Sale",
      formatReceiptPdfAmount(receipt.vatExemptSales ?? 0)
    ),
    getReceiptPdfPairLine(
      "VAT-Zero-Rated Sale",
      formatReceiptPdfAmount(receipt.zeroRatedSales ?? 0)
    ),
    getReceiptPdfPairLine(
      `VAT - ${Number(receipt.vatRate || 0) * 100}%`,
      formatReceiptPdfAmount(receipt.vatAmount ?? 0)
    ),
    getReceiptPdfPairLine("Amount Due", formatReceiptPdfAmount(receipt.total)),
    "",
    receiptPdfDivider,
    centerReceiptPdfLine("RETURN VALID WITHIN 3 DAYS"),
    centerReceiptPdfLine("ORIGINAL RECEIPT REQUIRED"),
    receiptPdfDivider,
    centerReceiptPdfLine("Thank you for choosing"),
    centerReceiptPdfLine("Lyfe Pharmacy!"),
    centerReceiptPdfLine("Stay healthy, always."),
    receiptPdfDivider,
    centerReceiptPdfLine("This is a system"),
    centerReceiptPdfLine("generated receipt."),
    centerReceiptPdfLine("No signature required.")
  )

  return lines
}

const buildReceiptPdfBlob = (lines) => {
  const pageWidth = 164.4
  const marginX = 9
  const marginY = 12
  const fontSize = 6.4
  const lineHeight = 8
  const pageHeight = Math.max(260, marginY * 2 + lines.length * lineHeight)
  const contentLines = lines
    .map((line) => `(${escapePdfText(line)}) Tj T*`)
    .join("\n")
  const content = `BT /F1 ${fontSize} Tf ${marginX} ${
    pageHeight - marginY
  } Td ${lineHeight} TL\n${contentLines}\nET`
  const objects = [
    "",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
  ]
  const offsets = [0]
  let pdf = "%PDF-1.4\n"

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = pdf.length
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`
  }

  pdf +=
    `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: "application/pdf" })
}

const downloadReceiptPdf = (receipt) => {
  const blob = buildReceiptPdfBlob(getReceiptPdfLines(receipt))
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `receipt-${receipt.orNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const getTransactionReceiptData = (transaction) => {
  const totalDiscount = Number(transaction.totalDiscount || 0)
  const vatExemptionTotal = Number(transaction.vatExemptionTotal || 0)
  const isPwdSeniorSale =
    Boolean(transaction.discountVerification) ||
    /pwd|senior/i.test(transaction.customerType)
  const productDiscountTotal = isPwdSeniorSale ? 0 : totalDiscount
  const pwdSeniorDiscountTotal = isPwdSeniorSale ? totalDiscount : 0
  const subtotal = roundCurrency(
    Number(transaction.grandTotal || 0) + totalDiscount + vatExemptionTotal
  )
  const vatRate = 0.12
  const vatAmount =
    vatExemptionTotal > 0
      ? 0
      : roundCurrency(Number(transaction.grandTotal || 0) * (vatRate / (1 + vatRate)))
  const vatableSales =
    vatExemptionTotal > 0
      ? 0
      : roundCurrency(Number(transaction.grandTotal || 0) - vatAmount)

  return {
    settings: defaultPharmacySettings,
    transactionId: transaction.id,
    dateTime: transaction.dateTime,
    orNumber: transaction.orNumber,
    invoiceNumber: transaction.invoiceId,
    cashierName: transaction.cashier,
    customerType: transaction.customerType,
    discountVerification: transaction.discountVerification,
    items: transaction.items.map((item) => ({
      cartId: item.id,
      productId: item.id,
      product: {
        id: item.id,
        productName: item.productName,
        dosageForm: item.dosageForm,
        strength: item.strength,
        barcode: item.barcode ?? "N/A",
      },
      itemUnit: item.itemUnit ?? "Piece",
      quantity: item.quantity,
      price: item.unitPrice,
      discountInfo:
        !isPwdSeniorSale && Number(item.discount || 0) > 0
          ? {
              source: "PRODUCT",
              label: item.discountLabel,
            }
          : null,
    })),
    subtotal,
    productDiscountTotal,
    pwdSeniorDiscountTotal,
    vatExemptionTotal,
    total: transaction.grandTotal,
    amountReceived: transaction.payment.amountTendered,
    change: transaction.payment.change,
    vatableSales,
    vatExemptSales: vatExemptionTotal > 0 ? transaction.grandTotal : 0,
    zeroRatedSales: 0,
    vatAmount,
    vatRate,
  }
}

function DetailSummaryItem({ icon: Icon, label, children }) {
  return (
    <div className="border-slate-100 px-4 py-4 md:border-r last:border-r-0">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <div className="mt-2 text-sm font-extrabold text-slate-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const adminVoidReasons = [
  "Forgot discount",
  "Wrong item",
  "Wrong quantity",
  "Wrong payment amount",
  "Customer cancelled",
  "Other admin correction",
]

function AdminVoidTransactionModal({ transaction, onClose, onConfirm }) {
  const [reason, setReason] = useState(adminVoidReasons[0])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]">
      <section className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
              <FiSlash className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Void Transaction
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                OR No. {transaction.orNumber} / Invoice {transaction.invoiceId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close void transaction"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/45 p-4">
          <p className="flex gap-2 text-sm font-bold text-red-700">
            <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This will mark the transaction as voided and keep the record for
              audit. Voided transactions cannot be returned.
            </span>
          </p>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-extrabold text-slate-700">
            Void reason
          </span>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          >
            {adminVoidReasons.map((voidReason) => (
              <option key={voidReason} value={voidReason}>
                {voidReason}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-8 text-sm font-extrabold text-white transition hover:bg-red-700"
          >
            Void Transaction
          </button>
        </div>
      </section>
    </div>
  )
}

function TransactionDetailsView({
  transaction,
  onBack,
  onProcessReturn,
  onVoidTransaction,
}) {
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false)
  const receiptPreviewData = useMemo(
    () => getTransactionReceiptData(transaction),
    [transaction]
  )
  const formattedDate = formatTransactionDate(transaction.dateTime)
  const isVoidedTransaction = transaction.status === "Voided"
  const voidPolicyInfo = useMemo(
    () => getVoidPolicyInfo(transaction),
    [transaction]
  )
  const returnPolicyInfo = useMemo(
    () => getReturnPolicyInfo(transaction.dateTime),
    [transaction.dateTime]
  )
  const returnSummary = useMemo(
    () => getTransactionReturnSummary(transaction),
    [transaction]
  )
  const canProcessReturn =
    !isVoidedTransaction &&
    returnPolicyInfo.isEligible &&
    transaction.status !== "Returned" &&
    returnSummary.remainingQuantity > 0
  const voidActionLabel = isVoidedTransaction
    ? "Voided"
    : !voidPolicyInfo.isCompleted
      ? "Void Unavailable"
      : !voidPolicyInfo.isWithinValidity
        ? "Void Period Expired"
        : "Void Transaction"
  const returnActionLabel =
    transaction.status === "Returned"
      ? "Fully Returned"
      : isVoidedTransaction
        ? "Voided Transaction"
        : returnPolicyInfo.isEligible
          ? "Process Return"
          : "Return Period Expired"
  const returnValidityLabel = returnPolicyInfo.isEligible
    ? `Valid until ${formatShortDate(returnPolicyInfo.validUntil)}`
    : `Expired ${formatShortDate(returnPolicyInfo.validUntil)}`
  const voidValidUntilDate = voidPolicyInfo.isValidDate
    ? formatTransactionDate(voidPolicyInfo.validUntil)
    : null
  const voidValidityLabel = isVoidedTransaction
    ? transaction.voidedAt
      ? `Voided ${
          formatTransactionDate(transaction.voidedAt).date
        } ${formatTransactionDate(transaction.voidedAt).time}`
      : "Already voided"
    : voidValidUntilDate
      ? `${voidPolicyInfo.isWithinValidity ? "Valid" : "Expired"} until ${
          voidValidUntilDate.date
        } ${voidValidUntilDate.time}`
      : "Invalid transaction date"
  const vatExemptionTotal = Number(transaction.vatExemptionTotal || 0)
  const subtotal =
    transaction.grandTotal + transaction.totalDiscount + vatExemptionTotal
  const discountLabel =
    transaction.customerType === "Regular"
      ? "Regular 0%"
      : `${transaction.customerType} ${
          transaction.totalDiscount ? "20%" : "0%"
        }`
  const discountVerification = transaction.discountVerification
  const verificationMethodLabel =
    discountVerification?.verificationMethod === "manual"
      ? "Manual Entry"
      : "Scanned ID"
  const verificationFields = [
    ["Verification Method", verificationMethodLabel],
    ["ID Number", discountVerification?.customerIdNumber],
    ["Customer Name", discountVerification?.fullName],
    ["Birthdate", discountVerification?.birthDate],
    ["Age at Transaction", discountVerification?.age],
    ["Sex", discountVerification?.sex],
    ["Disability / Category", discountVerification?.disabilityCategory],
    ["Address", discountVerification?.address],
    ["Date Issued", discountVerification?.dateIssued],
    ["Issued By", discountVerification?.issuedBy],
    [
      "Verified At",
      discountVerification?.verifiedAt
        ? `${formatTransactionDate(discountVerification.verifiedAt).date} ${
            formatTransactionDate(discountVerification.verifiedAt).time
          }`
        : "",
    ],
  ].filter(([, value]) => value)
  const returnedItems = useMemo(
    () =>
      (transaction.returns ?? []).map((returnItem) => {
        const item = transaction.items.find(
          (transactionItem) => transactionItem.id === returnItem.itemId
        )
        const returnedAt = formatTransactionDate(returnItem.returnedAt)

        return {
          ...returnItem,
          item,
          returnedAtLabel: `${returnedAt.date} ${returnedAt.time}`,
        }
      }),
    [transaction]
  )

  const getTransactionItemName = (item) => getProductTableDisplayName(item)

  return (
    <div className="space-y-5 pt-4 sm:pt-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
            aria-label="Back to sales report"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Transaction Details
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              View detailed information about this transaction.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setIsPdfPreviewOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/35 bg-white px-4 text-sm font-extrabold text-[#0b6b51] transition hover:bg-emerald-50"
            >
              <FiEye className="h-4 w-4" />
              Preview PDF
            </button>
          </div>

          <div className="flex min-w-[11rem] flex-col gap-1">
            <button
              type="button"
              disabled={!voidPolicyInfo.isEligible}
              onClick={() => setIsVoidModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiSlash className="h-4 w-4" />
              {voidActionLabel}
            </button>
            <p
              className={`text-center text-xs font-extrabold ${
                voidPolicyInfo.isEligible ? "text-red-600" : "text-slate-500"
              }`}
            >
              {voidValidityLabel}
            </p>
          </div>

          <div className="flex min-w-[11rem] flex-col gap-1">
            <button
              type="button"
              disabled={!canProcessReturn}
              onClick={() => setIsReturnModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b6b51] px-5 text-sm font-extrabold text-white transition hover:bg-[#08533f] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiRefreshCcw className="h-4 w-4" />
              {returnActionLabel}
            </button>
            <p
              className={`text-center text-xs font-extrabold ${
                canProcessReturn ? "text-[#0b6b51]" : "text-slate-500"
              }`}
            >
              {returnValidityLabel}
            </p>
          </div>
        </div>
      </div>

      <section className="grid overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:grid-cols-6">
        <div className="border-slate-100 px-4 py-4 md:border-r">
          <p className="text-xs font-bold text-slate-500">Status</p>
          <span
            className={`mt-3 inline-flex rounded-lg px-3 py-1 text-xs font-extrabold ${getTransactionStatusClassName(
              transaction.status
            )}`}
          >
            {transaction.status}
          </span>
        </div>

        <DetailSummaryItem icon={FiCalendar} label="Transaction Date & Time">
          <p>{formattedDate.date}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {formattedDate.time}
          </p>
        </DetailSummaryItem>

        <DetailSummaryItem icon={FiHash} label="OR No.">
          <p>{transaction.orNumber}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Invoice: {transaction.invoiceId}
          </p>
        </DetailSummaryItem>

        <DetailSummaryItem icon={FiUser} label="Cashier">
          {transaction.cashier}
        </DetailSummaryItem>

        <DetailSummaryItem icon={FiCreditCard} label="Customer Type">
          {transaction.customerType}
        </DetailSummaryItem>

        <div className="px-4 py-4">
          <p className="text-xs font-bold text-slate-500">Total Amount</p>
          <p className="mt-3 text-lg font-extrabold text-emerald-600">
            {formatPeso(transaction.totalAmount)}
          </p>
        </div>
      </section>

      {isVoidedTransaction && (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
              <FiSlash className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Void Details
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                This transaction was voided and kept for audit.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Reason", transaction.voidReason],
              ["Approved By", transaction.voidApprovedBy],
              ["Voided By", transaction.voidedBy],
              [
                "Voided At",
                transaction.voidedAt
                  ? `${formatTransactionDate(transaction.voidedAt).date} ${
                      formatTransactionDate(transaction.voidedAt).time
                    }`
                  : "",
              ],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.03em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 break-words text-sm font-extrabold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {discountVerification && (
        <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Customer Details
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {transaction.customerType} details recorded at checkout
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {verificationFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <p className="text-xs font-bold uppercase tracking-[0.03em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 break-words text-sm font-extrabold text-slate-800">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {returnedItems.length > 0 && (
        <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Return Details
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Returned item details and reason
              </p>
            </div>
            <span className="w-fit rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-600">
              {returnSummary.totalReturnedQuantity} item
              {returnSummary.totalReturnedQuantity === 1 ? "" : "s"} returned
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {returnedItems.map((returnItem) => (
              <article
                key={returnItem.id}
                className="rounded-2xl border border-rose-100 bg-rose-50/35 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-start">
                  <div className="flex items-center gap-4">
                    <ProductThumb
                      item={{
                        productName: returnItem.item
                          ? getTransactionItemName(returnItem.item)
                          : "Returned item",
                        image: returnItem.item?.image,
                        imageTone: returnItem.item?.imageTone,
                      }}
                    />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-extrabold text-slate-900">
                        {returnItem.item
                          ? getTransactionItemName(returnItem.item)
                          : "Returned item"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Qty returned: {returnItem.quantityReturned}
                      </p>
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        Reason:{" "}
                        <span className="font-extrabold text-slate-950">
                          {returnItem.reason}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/80 bg-white px-4 py-3 text-xs font-bold text-slate-500">
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Refund Amount
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-rose-600">
                        {formatPeso(returnItem.refundAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Processed By
                      </p>
                      <p className="mt-1 text-slate-800">
                        {returnItem.processedBy}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.03em] text-slate-400">
                        Returned At
                      </p>
                      <p className="mt-1 text-slate-800">
                        {returnItem.returnedAtLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">
            Transaction Items
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Items included in this transaction
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:hidden">
          {transaction.items.map((item) => {
            const returnedQuantity = getItemReturnedQuantity(
              transaction,
              item.id
            )

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb
                    item={{
                      productName: getTransactionItemName(item),
                      image: item.image,
                      imageTone: item.imageTone,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                      {getTransactionItemName(item)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.barcode ?? "N/A"}
                    </p>
                    {returnedQuantity > 0 && (
                      <p className="mt-1 text-xs font-extrabold text-rose-500">
                        Returned: {returnedQuantity}/{item.quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Qty
                    </p>
                    <p className="mt-1 text-slate-800">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Unit Price
                    </p>
                    <p className="mt-1 text-slate-800">
                      {formatPeso(item.unitPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Discount
                    </p>
                    <p className="mt-1 text-slate-800">
                      {formatPeso(item.discount)} ({item.discountLabel})
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 font-extrabold text-emerald-600">
                      {formatPeso(item.total)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-5 hidden overflow-auto rounded-2xl border border-slate-100 md:block">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
                <th className="rounded-l-2xl px-4 py-4">Product</th>
                <th className="px-4 py-4 text-center">Qty</th>
                <th className="px-4 py-4 text-right">Unit Price</th>
                <th className="px-4 py-4 text-right">Discount</th>
                <th className="rounded-r-2xl px-4 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item) => {
                const returnedQuantity = getItemReturnedQuantity(
                  transaction,
                  item.id
                )

                return (
                  <tr
                    key={item.id}
                    className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-4">
                        <ProductThumb
                          item={{
                            productName: getTransactionItemName(item),
                            image: item.image,
                            imageTone: item.imageTone,
                          }}
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {getTransactionItemName(item)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {item.barcode ?? "N/A"}
                          </p>
                          {returnedQuantity > 0 && (
                            <p className="mt-1 text-xs font-extrabold text-rose-500">
                              Returned: {returnedQuantity}/{item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-center">
                      {item.quantity}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">
                      {formatPeso(item.unitPrice)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">
                      {formatPeso(item.discount)} ({item.discountLabel})
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-emerald-600">
                      {formatPeso(item.total)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="lg:col-start-2">
            <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4">
              <div className="space-y-2 text-sm font-bold text-slate-700">
                <div className="flex justify-between gap-6">
                  <span>Subtotal</span>
                  <span>{formatPeso(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span>Discount ({discountLabel})</span>
                  <span>{formatPeso(transaction.totalDiscount)}</span>
                </div>
                {vatExemptionTotal > 0 && (
                  <div className="flex justify-between gap-6">
                    <span>VAT Exemption</span>
                    <span>{formatPeso(vatExemptionTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-6">
                  <span>Total Discount</span>
                  <span>{formatPeso(transaction.totalDiscount)}</span>
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-slate-300" />

              <div className="space-y-2 text-slate-800">
                <div className="flex justify-between gap-6 text-xl font-extrabold">
                  <span>Total</span>
                  <span>{formatPeso(transaction.grandTotal)}</span>
                </div>
                <div className="flex justify-between gap-6 text-sm font-bold">
                  <span>{transaction.payment.method}</span>
                  <span>{formatPeso(transaction.payment.amountTendered)}</span>
                </div>
                <div className="flex justify-between gap-6 text-sm font-bold">
                  <span>Change</span>
                  <span>{formatPeso(transaction.payment.change)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isReturnModalOpen && (
        <ProcessReturnModal
          transaction={transaction}
          onClose={() => setIsReturnModalOpen(false)}
          onConfirm={(updatedTransaction) => {
            onProcessReturn(updatedTransaction)
            setIsReturnModalOpen(false)
          }}
        />
      )}

      {isVoidModalOpen && (
        <AdminVoidTransactionModal
          transaction={transaction}
          onClose={() => setIsVoidModalOpen(false)}
          onConfirm={(reason) => {
            onVoidTransaction(reason)
            setIsVoidModalOpen(false)
          }}
        />
      )}

      {isPdfPreviewOpen && (
        <ReceiptPreviewModal
          receipt={receiptPreviewData}
          autoPrint={false}
          onClose={() => setIsPdfPreviewOpen(false)}
          onDownload={() => downloadReceiptPdf(receiptPreviewData)}
        />
      )}
    </div>
  )
}

export default TransactionDetailsView
