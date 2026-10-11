import { useEffect, useRef } from "react"

import {
  formatPeso,
} from "../../../../../shared/inventory/inventoryUtils"
import {
  getCartItemSubtotal,
  getCashierProductName,
} from "../utils/cashierUtils"

const receiptDivider = "--------------------------------"

function ReceiptLine({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "font-black" : ""}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

const formatReceiptDateTime = (receipt) => {
  const dateTime = receipt.dateTime ? new Date(receipt.dateTime) : null

  if (!dateTime || Number.isNaN(dateTime.getTime())) {
    return `${receipt.date} ${receipt.time}`.trim()
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

function ReceiptPreviewModal({
  receipt,
  autoPrint = true,
  onClose,
  onDownload,
}) {
  const hasAutoPrintedRef = useRef(false)
  const hasProductDiscount = Number(receipt.productDiscountTotal || 0) > 0
  const hasPwdSeniorDiscount = Number(receipt.pwdSeniorDiscountTotal || 0) > 0
  const vatExemptionTotal = Number(receipt.vatExemptionTotal || 0)
  const totalAmountWithoutVat = Number(receipt.subtotal || 0) - vatExemptionTotal
  const verification = receipt.discountVerification
  const discountIdLabel =
    verification?.customerType === "Senior" ? "OSCA ID No." : "PWD ID No."
  const receiptDateTime = formatReceiptDateTime(receipt)

  useEffect(() => {
    if (!autoPrint) {
      return undefined
    }

    if (hasAutoPrintedRef.current) {
      return undefined
    }

    hasAutoPrintedRef.current = true
    const printTimer = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => {
      window.clearTimeout(printTimer)
    }
  }, [autoPrint])

  return (
    <div
      id="receipt-print-modal"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm print:fixed print:inset-0 print:z-[9999] print:block print:overflow-visible print:bg-white print:p-0"
    >
      <style>
        {`
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              height: auto !important;
              overflow: visible !important;
            }

            body * {
              visibility: hidden !important;
            }

            body *:not(:has(#receipt-print-area)):not(#receipt-print-area):not(#receipt-print-area *) {
              display: none !important;
            }

            #receipt-print-modal,
            #receipt-print-shell {
              background: #ffffff !important;
              display: block !important;
              height: auto !important;
              inset: auto !important;
              margin: 0 !important;
              min-height: 0 !important;
              overflow: visible !important;
              padding: 0 !important;
              position: static !important;
              width: 58mm !important;
            }

            #receipt-print-area,
            #receipt-print-area * {
              visibility: visible !important;
            }

            #root,
            #root > * {
              display: block !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }

            #receipt-print-area {
              display: block !important;
              margin: 0 !important;
              padding: 4mm 3mm !important;
              position: static !important;
              left: 0 !important;
              top: 0 !important;
              width: 58mm !important;
            }

            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <section id="receipt-print-shell" className="w-full max-w-sm">
        <div className="mx-auto mb-3 hidden w-fit rounded-lg bg-[#0b6b51] px-3 py-1 text-xs font-extrabold text-white sm:block print:hidden">
          58mm Receipt
        </div>

        <article
          id="receipt-print-area"
          className="mx-auto w-[380px] bg-white px-5 py-7 font-mono text-[12px] leading-relaxed text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.24)] print:w-[58mm] print:px-3 print:py-6 print:text-[9px] print:shadow-none"
        >
          <header className="text-center">
            <h2 className="text-lg font-black tracking-wide">LYFE PHARMACY</h2>
            <p className="mt-1 text-[12px] print:text-[9px]">
              Kaagapay mo sa Buhay
            </p>
            <div className="mt-5 font-bold">
              <p>{receipt.settings.branch}</p>
              <p>{receipt.settings.address}</p>
              <p>Tel No.: {receipt.settings.phone}</p>
            </div>
          </header>

          <div className="my-4 text-center">{receiptDivider}</div>
          <h3 className="text-center font-black tracking-wide">
            SALES INVOICE
          </h3>

          <div className="mt-3 space-y-1 font-bold">
            <p>OR No.: {receipt.orNumber}</p>
            <p>Invoice No.: {receipt.invoiceNumber}</p>
            <p>Cashier: {receipt.cashierName}</p>
            <p>Payment Method: Cash</p>
            <p>Date: {receiptDateTime}</p>
          </div>

          <div className="my-4 text-center">{receiptDivider}</div>

          <div className="grid grid-cols-[1fr_20px_44px_44px] gap-1 font-black">
            <span>ITEMS</span>
            <span className="text-center">QTY</span>
            <span className="text-right">PRICE</span>
            <span className="text-right">TOTAL</span>
          </div>
          <div className="my-2 text-center">{receiptDivider}</div>

          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div
                key={`${item.cartId}-${item.product.barcode}`}
                className="grid grid-cols-[1fr_20px_44px_44px] gap-1"
              >
                <div className="min-w-0">
                  <p className="break-words font-bold">
                    {getCashierProductName(item.product)}
                  </p>
                  <p>{item.product.barcode}</p>
                  {item.discountInfo?.source === "PRODUCT" && (
                    <p>{item.discountInfo.label}</p>
                  )}
                </div>
                <span className="text-center">{item.quantity}</span>
                <span className="text-right">{formatPeso(item.price)}</span>
                <span className="text-right">
                  {formatPeso(getCartItemSubtotal(item))}
                </span>
              </div>
            ))}
          </div>

          <div className="my-3 text-center">{receiptDivider}</div>
          <div className="space-y-1">
            <ReceiptLine
              label="Amt of VAT EXEMPT ITEMs"
              value={formatPeso(0)}
            />
            <ReceiptLine
              label="Amt of Sale With VAT"
              value={formatPeso(receipt.subtotal)}
            />
            {hasPwdSeniorDiscount && (
              <ReceiptLine
                label="Less 12% VAT"
                value={formatPeso(vatExemptionTotal)}
              />
            )}
            <ReceiptLine
              label="TOTAL AMOUNT w/o VAT"
              value={formatPeso(totalAmountWithoutVat)}
            />
            {hasPwdSeniorDiscount && (
              <ReceiptLine
                label="LESS: 20% Sales Discount"
                value={formatPeso(receipt.pwdSeniorDiscountTotal)}
              />
            )}
            {hasProductDiscount && (
              <ReceiptLine
                label="PRODUCT DISCOUNTS"
                value={formatPeso(receipt.productDiscountTotal)}
              />
            )}
            <ReceiptLine
              label="TOTAL AMOUNT"
              value={formatPeso(receipt.total)}
              strong
            />
          </div>

          <div className="my-2 text-center">{receiptDivider}</div>
          <div className="space-y-1">
            <ReceiptLine label="TOTAL" value={formatPeso(receipt.total)} strong />
            <p className="font-black uppercase">AMOUNT TENDERED</p>
            <ReceiptLine label="CASH" value={formatPeso(receipt.amountReceived)} />
            <div className="my-2" />
            <ReceiptLine
              label="TOTAL PAYMENT"
              value={formatPeso(receipt.amountReceived)}
            />
            <ReceiptLine label="CHANGE" value={formatPeso(receipt.change)} />
          </div>

          {verification && (
            <>
              <div className="my-3 text-center">{receiptDivider}</div>
              <div className="space-y-1">
                <p>ORDER #{receipt.orNumber}</p>
                <p>
                  {discountIdLabel}: {verification.customerIdNumber}
                </p>
                <p>SOLD TO: {verification.fullName ?? ""}</p>
                <p>SIGNATURE : ____________________</p>
                <p>ADDRESS : {verification.address ?? "____________________"}</p>
                <p>TIN NO : ____________________</p>
              </div>
            </>
          )}

          <div className="my-3 text-center">{receiptDivider}</div>
          <div className="space-y-1">
            <ReceiptLine
              label="VATable"
              value={formatPeso(receipt.vatableSales ?? 0)}
            />
            <ReceiptLine
              label="VAT-Exempt Sale"
              value={formatPeso(receipt.vatExemptSales ?? 0)}
            />
            <ReceiptLine
              label="VAT-Zero-Rated Sale"
              value={formatPeso(receipt.zeroRatedSales ?? 0)}
            />
            <ReceiptLine
              label={`VAT - ${Number(receipt.vatRate || 0) * 100}%`}
              value={formatPeso(receipt.vatAmount ?? 0)}
            />
            <ReceiptLine
              label="Amount Due"
              value={formatPeso(receipt.total)}
              strong
            />
          </div>
          <div className="my-3 text-center">{receiptDivider}</div>

          <footer className="space-y-2 text-center">
            <p>RETURN VALID WITHIN 3 DAYS</p>
            <p>ORIGINAL RECEIPT REQUIRED</p>
            <div>{receiptDivider}</div>
            <p>Thank you for choosing Lyfe Pharmacy!</p>
            <p>Stay healthy, always.</p>
            <div>{receiptDivider}</div>
            <p>This is a system generated receipt.</p>
            <p>No signature required.</p>
          </footer>
        </article>

        <div className="mt-4 flex justify-center gap-3 print:hidden">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-6 text-sm font-extrabold text-white transition hover:bg-[#005348]"
            >
              Download PDF
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  )
}

export default ReceiptPreviewModal
