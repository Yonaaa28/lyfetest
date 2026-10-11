function DashboardPanel({
  title,
  actionLabel,
  action,
  children,
  className = "",
}) {
  return (
    <article
      className={`min-w-0 rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:px-6 sm:py-6 ${className}`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {title}
        </h2>
        {action ? (
          <div className="shrink-0">{action}</div>
        ) : actionLabel ? (
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </article>
  )
}

export default DashboardPanel
