import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiMoreVertical,
  FiSearch,
} from "react-icons/fi"

import { getPaginationItems } from "../../../../../shared/inventory/inventoryUtils"
import {
  formatPeso,
  formatTransactionDate,
  getTransactionStatusClassName,
} from "../utils/salesReportUtils"

function TransactionActionMenu({
  transaction,
  isOpen,
  onToggle,
  onViewDetails,
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle(transaction.id)
        }}
        className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
        aria-label={`More actions for ${transaction.orderId}`}
        aria-expanded={isOpen}
      >
        <FiMoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onViewDetails(transaction)}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
          >
            Details
          </button>
        </div>
      )}
    </div>
  )
}

function SalesTransactionsTable({
  transactions,
  statusTabs,
  selectedStatus,
  searchTerm,
  entriesToShow,
  currentPage,
  totalEntries,
  totalPages,
  startIndex,
  endIndex,
  openActionId,
  onSearchChange,
  onStatusChange,
  onEntriesToShowChange,
  onPageChange,
  onToggleAction,
  onViewDetails,
  className = "",
}) {
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages)

  return (
    <article className={`min-w-0 rounded-[28px] border border-white/60 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5 ${className}`}>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => {
          const isSelected = selectedStatus === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                isSelected
                  ? "border-[#00675b] bg-[#00675b] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs ${
                  isSelected
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block md:w-80">
          <span className="sr-only">Search transaction</span>
          <input
            type="search"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search transaction..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
          <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </label>
      </div>

      <div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto pr-1 md:hidden">
        {transactions.map((transaction) => {
          const formattedDate = formatTransactionDate(transaction.dateTime)

          return (
            <article
              key={transaction.id}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex rounded-lg px-3 py-1 text-xs font-extrabold ${getTransactionStatusClassName(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
                <div className="flex shrink-0 items-start gap-2">
                  <p className="pt-1 text-sm font-extrabold text-emerald-600">
                    {formatPeso(transaction.total)}
                  </p>
                  <TransactionActionMenu
                    transaction={transaction}
                    isOpen={openActionId === transaction.id}
                    onToggle={onToggleAction}
                    onViewDetails={onViewDetails}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-xs font-bold text-slate-500">
                <div>
                  <p className="uppercase tracking-[0.03em] text-slate-400">
                    OR & Invoice No.
                  </p>
                  <p className="mt-1 text-slate-800">
                    OR No.: {transaction.orderId}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Invoice: {transaction.invoiceId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 text-slate-800">{formattedDate.date}</p>
                    <p className="mt-1 text-slate-500">{formattedDate.time}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Total Items
                    </p>
                    <p className="mt-1 text-center text-slate-800">
                      {transaction.itemCount}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Cashier
                    </p>
                    <p className="mt-1 text-slate-800">
                      {transaction.cashier}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Customer Type
                    </p>
                    <p className="mt-1 text-slate-800">
                      {transaction.customerType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Discount
                    </p>
                    <p className="mt-1 text-slate-800">
                      {transaction.discount}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Discount Amount
                    </p>
                    <p className="mt-1 text-slate-800">
                      {formatPeso(transaction.discountAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-5 hidden min-h-[28rem] overflow-auto rounded-2xl border border-slate-100 md:block md:flex-1">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
              <th className="rounded-l-2xl px-4 py-4">Status</th>
              <th className="px-4 py-4">Transaction Date & Time</th>
              <th className="px-4 py-4">OR & Invoice No.</th>
              <th className="px-4 py-4">Cashier</th>
              <th className="px-4 py-4 text-center">Total Items</th>
              <th className="px-4 py-4">Customer Type</th>
              <th className="px-4 py-4">Discount</th>
              <th className="px-4 py-4">Discount Amount</th>
              <th className="px-4 py-4 text-right">Total</th>
              <th className="rounded-r-2xl px-4 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const formattedDate = formatTransactionDate(transaction.dateTime)

              return (
                <tr
                  key={transaction.id}
                  className="text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <td className="border-b border-slate-100 px-4 py-4">
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-xs font-extrabold ${getTransactionStatusClassName(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <p className="font-extrabold text-slate-900">
                      {formattedDate.date}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {formattedDate.time}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <p>OR No.: {transaction.orderId}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Invoice: {transaction.invoiceId}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {transaction.cashier}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-center">
                    {transaction.itemCount}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {transaction.customerType}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {transaction.discount}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    {formatPeso(transaction.discountAmount)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-right font-extrabold text-emerald-600">
                    {formatPeso(transaction.total)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-center">
                    <TransactionActionMenu
                      transaction={transaction}
                      isOpen={openActionId === transaction.id}
                      onToggle={onToggleAction}
                      onViewDetails={onViewDetails}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

      </div>

      {!transactions.length && (
        <div className="grid min-h-[20rem] place-items-center text-center">
          <p className="text-sm font-semibold text-slate-500">
            No transactions found.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {totalEntries ? startIndex + 1 : 0} to {endIndex} of{" "}
          {totalEntries} entries
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-[8.5rem]">
            <span className="sr-only">Entries per page</span>
            <select
              value={entriesToShow}
              onChange={onEntriesToShowChange}
              className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            >
              <option value="10">10 entries</option>
              <option value="20">20 entries</option>
              <option value="50">50 entries</option>
              <option value="100">100 entries</option>
            </select>
            <FiChevronUp className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage === 1 || !totalEntries}
              onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              aria-label="Previous page"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            {paginationItems.map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold transition ${
                    safeCurrentPage === item
                      ? "bg-[#00675b] text-white"
                      : "border border-slate-200 text-slate-600 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
                  }`}
                  aria-current={safeCurrentPage === item ? "page" : undefined}
                >
                  {item}
                </button>
              ) : (
                <span
                  key={item}
                  className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400"
                >
                  ...
                </span>
              )
            )}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages || !totalEntries}
              onClick={() =>
                onPageChange(Math.min(safeCurrentPage + 1, totalPages))
              }
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              aria-label="Next page"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default SalesTransactionsTable
