import { AdminTopbarActions } from "../../admin/shared/AdminTopbar"

function StaffLayout({
  branchName,
  staffName,
  activeItemLabel,
  topbarContent,
  hideTopbar = false,
  children,
}) {
  return (
    <div className="overflow-x-hidden bg-[#f9fafc] xl:h-screen xl:overflow-hidden">
      <div className="min-h-screen xl:h-screen">
        <main className="min-w-0 overflow-x-hidden px-4 sm:px-6 xl:h-screen xl:overflow-y-auto xl:px-8">
          <div className="flex w-full min-w-0 flex-col gap-6 pb-4 pt-4 sm:pb-6 sm:pt-6 xl:pb-7 xl:pt-0">
            {!hideTopbar && (
            <header className="hidden items-start justify-between gap-6 bg-[#f9fafc] px-6 py-3 xl:flex">
              <div className={topbarContent ? "min-w-0 flex-1" : undefined}>
                {topbarContent ?? (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0b6b51]/60">
                      Staff
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                      {branchName}
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {activeItemLabel}
                    </p>
                  </>
                )}
              </div>

              <AdminTopbarActions
                adminName={staffName}
              />
            </header>
            )}

            <section aria-label={activeItemLabel}>{children}</section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
