function SettingsSidebar({ activeSettingsTab, tabs, onTabChange }) {
  return (
    <aside className="self-start rounded-3xl border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-4 xl:min-h-[320px]">
      <h2 className="px-2 text-base font-extrabold text-slate-950 sm:text-lg">
        Settings
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3 xl:block xl:space-y-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSettingsTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full min-w-0 items-center gap-2 rounded-2xl px-3 py-3 text-left transition sm:gap-3 sm:px-4 xl:py-4 ${
                isActive
                  ? "bg-emerald-50/75 text-[#0b6b51]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10 ${
                  isActive
                    ? "bg-emerald-100 text-[#0b6b51]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold sm:text-base">
                  {tab.label}
                </span>
                <span className="mt-1 hidden text-sm font-semibold text-slate-500 sm:block">
                  {tab.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default SettingsSidebar
