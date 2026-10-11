import {
  FiCreditCard,
  FiRefreshCcw,
  FiTag,
  FiTrendingUp,
} from "react-icons/fi"

import { mockSalesSummary } from "../data/salesReportMockData"
import { formatPeso } from "../utils/salesReportUtils"

function SalesSummaryCard({ card }) {
  const Icon = card.icon

  return (
    <article className="min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4">
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm">
            {card.label}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block">
            <p className="truncate text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">
              {card.value}
            </p>
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${card.iconClassName}`}
            >
              <Icon className="h-4 w-4" />
            </span>
          </div>
          {card.detail ? (
            <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 lg:block">
              {card.detail}
            </p>
          ) : null}
        </div>
        <span
          className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${card.iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </article>
  )
}

function SalesReportTopbarCards({ activeBranchId }) {
  void activeBranchId
  const summaryCards = [
    {
      id: "net-sales",
      label: "Net Sales",
      value: formatPeso(mockSalesSummary.netSales),
      detail: "Sales after discounts",
      icon: FiTrendingUp,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "total-transactions",
      label: "Total Transactions",
      value: String(mockSalesSummary.totalTransactions).padStart(2, "0"),
      detail: "Completed sales records",
      icon: FiCreditCard,
      iconClassName: "bg-sky-100 text-sky-600",
    },
    {
      id: "total-discounts",
      label: "Total Discounts",
      value: formatPeso(mockSalesSummary.totalDiscounts),
      detail: "Discount value applied",
      icon: FiTag,
      iconClassName: "bg-amber-100 text-amber-600",
    },
    {
      id: "returns-refunds",
      label: "Returns / Refunds",
      value: formatPeso(mockSalesSummary.returnsRefunds),
      detail: "Processed return amount",
      icon: FiRefreshCcw,
      iconClassName: "bg-rose-100 text-rose-600",
    },
  ]

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {summaryCards.map((card) => (
        <SalesSummaryCard key={card.id} card={card} />
      ))}
    </div>
  )
}

export default SalesReportTopbarCards
