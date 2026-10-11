import {
  FiArchive,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiShoppingCart,
} from "react-icons/fi"

import { formatPeso } from "../../../../../shared/inventory/inventoryUtils"
import { getBundleExpiryDisplay } from "../utils/bundleModuleUtils"
import BundleImage from "./BundleImage"

function BundleListPanel({
  searchTerm,
  entriesToShow,
  visibleBundles,
  selectedBundle,
  selectedBundleIds = [],
  selectedBundles = [],
  openActionBundleId,
  allVisibleSelected = false,
  someVisibleSelected = false,
  totalEntries,
  startIndex,
  endIndex,
  safeCurrentPage,
  totalPages,
  paginationItems,
  onSearchChange,
  onEntriesChange,
  onAddBundle,
  onSelectBundle,
  onToggleBundleSelection,
  onToggleVisibleSelection,
  onClearBundleSelection,
  onToggleActionMenu,
  onArchiveBundle,
  onArchiveSelectedBundles,
  onManageBundleStock,
  onPageChange,
}) {
  return (
    <div className="flex min-h-[34rem] flex-col rounded-3xl border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 xl:h-[calc(100dvh-14rem)]">
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-center">
        <div className="min-w-0 md:max-w-[27rem]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search bundle</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search bundle..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <FiSearch className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </label>
        </div>

        <div className="flex min-w-0 2xl:justify-end">
          <button
            type="button"
            onClick={onAddBundle}
            className="inline-flex h-11 w-full min-w-40 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#00675b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005348] sm:w-auto"
          >
            <FiPlus className="h-5 w-5" />
            Add Bundle
          </button>
        </div>
      </div>

      {selectedBundles.length ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-[#0b6b51]">
              {selectedBundles.length} bundle
              {selectedBundles.length === 1 ? "" : "s"} selected
            </p>
            <button
              type="button"
              onClick={onClearBundleSelection}
              className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            type="button"
            onClick={onArchiveSelectedBundles}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <FiArchive className="h-4 w-4" />
            Archive Selected
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto pr-1 xl:hidden">
        {visibleBundles.map((bundle) => (
          <article
            key={bundle.id}
            onClick={() => onSelectBundle(bundle.id)}
            className={`rounded-2xl border p-3 transition ${
              selectedBundle?.id === bundle.id
                ? "border-[#0b6b51]/40 bg-emerald-50/30"
                : "border-slate-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <label
                className="mt-2 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white transition hover:border-[#0b6b51]/40"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="sr-only">Select {bundle.name}</span>
                <input
                  type="checkbox"
                  checked={selectedBundleIds.includes(bundle.id)}
                  onChange={() => onToggleBundleSelection(bundle.id)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]"
                />
              </label>
              <BundleImage bundle={bundle} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-slate-900">
                      {bundle.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {bundle.bundleCode}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
                      aria-label={`More actions for ${bundle.name}`}
                      aria-expanded={openActionBundleId === bundle.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleActionMenu(bundle.id)
                      }}
                    >
                      <FiMoreVertical className="h-5 w-5" />
                    </button>

                    {openActionBundleId === bundle.id && (
                      <div
                        className="absolute right-0 top-10 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onManageBundleStock(bundle)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                        >
                          <FiShoppingCart className="h-4 w-4" />
                          Manage Bundle Stock
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onArchiveBundle(bundle)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
                        >
                          <FiArchive className="h-4 w-4" />
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Items
                    </p>
                    <p className="mt-1 whitespace-pre-line text-slate-700">
                      {bundle.includedItems
                        .map((item) => item.productName)
                        .join("\n")}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Expiry
                    </p>
                    <p className="mt-1 whitespace-pre-line text-slate-700">
                      {getBundleExpiryDisplay(bundle)}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Stock
                    </p>
                    <p className="mt-1 text-slate-900">{bundle.stock} packs</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.03em] text-slate-400">
                      Price
                    </p>
                    <p className="mt-1 text-[#0b6b51]">
                      {formatPeso(bundle.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 hidden flex-1 overflow-auto xl:block">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
              <th className="w-12 rounded-l-xl px-4 py-4 text-center">
                <input
                  ref={(checkbox) => {
                    if (checkbox) {
                      checkbox.indeterminate = someVisibleSelected
                    }
                  }}
                  type="checkbox"
                  checked={allVisibleSelected}
                  disabled={!visibleBundles.length}
                  onChange={onToggleVisibleSelection}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed"
                  aria-label="Select all bundles on this page"
                />
              </th>
              <th className="px-4 py-4">Bundle Image</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Included Items</th>
              <th className="px-4 py-4">Expiry</th>
              <th className="px-4 py-4">Stock</th>
              <th className="px-4 py-4">Price</th>
              <th className="rounded-r-xl px-4 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleBundles.map((bundle) => (
              <tr
                key={bundle.id}
                onClick={() => onSelectBundle(bundle.id)}
                className={`cursor-pointer text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
                  selectedBundle?.id === bundle.id ? "bg-slate-50" : ""
                }`}
              >
                <td
                  className="w-12 border-b border-slate-100 px-4 py-4 text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedBundleIds.includes(bundle.id)}
                    onChange={() => onToggleBundleSelection(bundle.id)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]"
                    aria-label={`Select ${bundle.name}`}
                  />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <BundleImage bundle={bundle} />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <p className="font-extrabold text-slate-900">{bundle.name}</p>
                  <p className="mt-1 text-sm font-bold text-slate-400">
                    {bundle.bundleCode}
                  </p>
                </td>
                <td className="whitespace-pre-line border-b border-slate-100 px-4 py-4">
                  {bundle.includedItems
                    .map((item) => item.productName)
                    .join("\n")}
                </td>
                <td className="whitespace-pre-line border-b border-slate-100 px-4 py-4">
                  {getBundleExpiryDisplay(bundle)}
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <p className="font-extrabold text-slate-900">
                    {bundle.stock}
                  </p>
                  <span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-[#0b6b51]">
                    In Stock
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4 font-extrabold text-[#0b6b51]">
                  {formatPeso(bundle.price)}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-center">
                  <div className="relative">
                    <button
                      type="button"
                      className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
                      aria-label={`More actions for ${bundle.name}`}
                      aria-expanded={openActionBundleId === bundle.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleActionMenu(bundle.id)
                      }}
                    >
                      <FiMoreVertical className="h-5 w-5" />
                    </button>

                    {openActionBundleId === bundle.id && (
                      <div
                        className="absolute right-0 top-10 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onManageBundleStock(bundle)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                        >
                          <FiShoppingCart className="h-4 w-4" />
                          Manage Bundle Stock
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onArchiveBundle(bundle)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
                        >
                          <FiArchive className="h-4 w-4" />
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {!visibleBundles.length && (
        <div className="grid min-h-80 place-items-center text-center">
          <p className="text-sm font-semibold text-slate-500">
            No bundles found.
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {totalEntries ? startIndex + 1 : 0} to {endIndex} of{" "}
          {totalEntries} entries
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-[8.5rem]">
            <span className="sr-only">Entries per page</span>
            <select
              value={entriesToShow}
              onChange={(event) => onEntriesChange(event.target.value)}
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
    </div>
  )
}

export default BundleListPanel
