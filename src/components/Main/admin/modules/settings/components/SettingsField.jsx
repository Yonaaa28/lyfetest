function SettingsField({ icon: Icon, label, value, isEditing, onChange }) {
  return (
    <label className={label === "Address" ? "lg:col-span-2" : undefined}>
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <div className="mt-3 flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:min-h-16 sm:gap-4 sm:px-5">
        <Icon className="h-5 w-5 shrink-0 text-[#0b6b51] sm:h-6 sm:w-6" />
        {isEditing ? (
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none sm:text-base"
          />
        ) : (
          <span className="min-w-0 flex-1 break-words text-sm font-semibold text-slate-700 sm:text-base">
            {value}
          </span>
        )}
      </div>
    </label>
  )
}

export default SettingsField
