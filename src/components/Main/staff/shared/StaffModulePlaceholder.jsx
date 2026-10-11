function StaffModulePlaceholder({ title, description }) {
  return (
    <section className="rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0b6b51]/60">
        Staff Module
      </p>
      <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
        {description}
      </p>
    </section>
  )
}

export default StaffModulePlaceholder
