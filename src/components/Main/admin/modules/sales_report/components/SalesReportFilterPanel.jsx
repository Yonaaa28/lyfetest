import { FiChevronDown } from "react-icons/fi"
import { HiOutlineDocumentArrowDown } from "react-icons/hi2"

function SelectControl({ value, onChange, children, label }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
      >
        {children}
      </select>
      <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </label>
  )
}

function SalesReportFilterPanel({
  fromDate,
  toDate,
  cashier,
  customerType,
  cashierOptions,
  onFromDateChange,
  onToDateChange,
  onCashierChange,
  onCustomerTypeChange,
  onApplyFilters,
  onExport,
}) {
  return (
    <article className="min-w-0 rounded-[28px] border border-white/60 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-950">Filter</h2>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"
        >
          <HiOutlineDocumentArrowDown className="h-5 w-5" />
          Export
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-600">
            From
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={onFromDateChange}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-600">
            Cashier
          </span>
          <SelectControl
            value={cashier}
            onChange={onCashierChange}
            label="Cashier"
          >
            <option value="all">Cashier</option>
            {cashierOptions.map((cashierName) => (
              <option key={cashierName} value={cashierName}>
                {cashierName}
              </option>
            ))}
          </SelectControl>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-600">To</span>
          <input
            type="date"
            value={toDate}
            onChange={onToDateChange}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-600">
            Customer Type
          </span>
          <SelectControl
            value={customerType}
            onChange={onCustomerTypeChange}
            label="Customer type"
          >
            <option value="all">Customer Type</option>
            <option value="Regular">Regular</option>
            <option value="Senior Citizen">Senior Citizen</option>
            <option value="PWD">PWD</option>
          </SelectControl>
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onApplyFilters}
          className="inline-flex h-11 items-center rounded-xl bg-[#00675b] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
        >
          Filter
        </button>
      </div>
    </article>
  )
}

export default SalesReportFilterPanel
