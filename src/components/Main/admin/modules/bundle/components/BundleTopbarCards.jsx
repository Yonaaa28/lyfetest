import { useEffect, useState } from "react"

import {
  ADMIN_BUNDLES_UPDATED_EVENT,
  bundleSummaryCardConfig,
  getBundleSummaryValues,
  mockBundles,
} from "../data/bundleMockData"

function BundleSummaryCard({ card, value, compact = false }) {
  const Icon = card.icon
  const tone = `${card.iconBg} ${card.accent}`

  return (
    <article
      className={`min-h-[92px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition lg:min-h-[112px] lg:rounded-2xl lg:p-4 ${
        compact ? "" : "sm:min-h-[120px] sm:p-5"
      }`}
    >
      <div className="flex h-full items-start justify-between gap-2 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="truncate text-xs font-semibold leading-snug text-slate-700 lg:text-sm">
            {card.label}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:block">
            <p className="truncate text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] lg:mt-2 lg:text-2xl">
              {value}
            </p>
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:hidden ${tone}`}
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
          className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl lg:grid ${tone}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </article>
  )
}

export function BundleTopbarCards({ activeBranchId }) {
  const [summaryBundles, setSummaryBundles] = useState(mockBundles)
  const summaryValues = getBundleSummaryValues(activeBranchId, summaryBundles)

  useEffect(() => {
    const refreshBundles = (event) => {
      setSummaryBundles(event.detail?.bundles ?? mockBundles)
    }

    window.addEventListener(ADMIN_BUNDLES_UPDATED_EVENT, refreshBundles)

    return () => {
      window.removeEventListener(ADMIN_BUNDLES_UPDATED_EVENT, refreshBundles)
    }
  }, [])

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {bundleSummaryCardConfig.map((card) => (
        <BundleSummaryCard
          key={card.id}
          card={card}
          value={summaryValues[card.id]}
          compact
        />
      ))}
    </div>
  )
}
