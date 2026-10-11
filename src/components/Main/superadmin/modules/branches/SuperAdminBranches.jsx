import { useMemo, useState } from "react"
import {
  HiChevronRight,
  HiOutlineBuildingStorefront,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineUser,
  HiXMark,
} from "react-icons/hi2"

const emptyBranch = {
  name: "",
  code: "",
  admin: "",
  email: "",
  contact: "",
  address: "",
  operatingHours: "8:00 AM - 8:00 PM",
  status: "Active",
}

const getSummaryCards = (totalCount, activeCount) => [
  {
    label: "Total Branches",
    value: String(totalCount),
    detail: "Fixed locations",
    icon: HiOutlineBuildingStorefront,
    tone: "green",
  },
  {
    label: "Active Branches",
    value: String(activeCount),
    detail: activeCount === totalCount ? "All operational" : `${activeCount} operational`,
    icon: HiOutlineBuildingStorefront,
    tone: "green",
  },
  {
    label: "Inactive Branches",
    value: String(totalCount - activeCount),
    detail:
      totalCount === activeCount
        ? "No inactive branches"
        : "Stored in Backup & Restore",
    icon: HiOutlineBuildingStorefront,
    tone: totalCount === activeCount ? "green" : "orange",
  },
]

const toneClasses = {
  green: {
    icon: "bg-[#00675b] text-white",
    detail: "text-[#0b6b51]",
  },
  blue: {
    icon: "bg-blue-600 text-white",
    detail: "text-blue-600",
  },
  orange: {
    icon: "bg-orange-500 text-white",
    detail: "text-orange-500",
  },
  purple: {
    icon: "bg-violet-600 text-white",
    detail: "text-violet-600",
  },
}

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

function SuperAdminBranches({
  branches = [],
  totalBranchCount = branches.length,
  onAddBranch,
  onViewBranch,
}) {
  const [query, setQuery] = useState("")
  const summaryCards = getSummaryCards(totalBranchCount, branches.length)
  const filteredBranches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return branches
    return branches.filter((branch) =>
      [branch.name, branch.shortName, branch.code, branch.admin].some((value) =>
        value?.toLowerCase().includes(term)
      )
    )
  }, [branches, query])

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 px-4 pb-4 sm:p-5">
      <Card className="p-4 sm:hidden">
        <h2 className="text-base font-bold text-slate-900">Branches Overview</h2>
        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100">
          {[
            ["Total", totalBranchCount, "Fixed"],
            ["Active", branches.length, "Operational"],
            ["Inactive", totalBranchCount - branches.length, totalBranchCount === branches.length ? "None" : "Archived"],
          ].map(([label, value, helper]) => (
            <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0">
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-[22px] font-bold leading-none text-slate-900">{value}</p>
              <p className="mt-1.5 truncate text-[10px] font-semibold text-[#0b6b51]">{helper}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          const tone = toneClasses[card.tone]

          return (
            <Card key={card.label} className="min-h-[112px] rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-slate-700">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums]">
                    {card.value}
                  </p>
                  <p className={`mt-2 text-xs font-medium leading-5 ${tone.detail}`}>
                    {card.detail}
                  </p>
                </div>
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone.icon}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <section className="sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">All Branches</h2>
          <button type="button" onClick={onAddBranch} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#00675b] px-3 text-xs font-bold text-white">
            <HiOutlinePlus className="h-4 w-4" /> Add Branch
          </button>
        </div>
        <SearchField value={query} onChange={setQuery} />
        <div className="mt-3 space-y-2.5">
          {filteredBranches.map((branch) => (
            <button
              key={branch.code}
              type="button"
              onClick={() => onViewBranch?.(branch.id)}
              className="flex min-h-[88px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-bold text-slate-900">{branch.shortName ?? branch.name}</span>
                  {branch.type === "Main Branch" ? <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#0b6b51]">MAIN</span> : null}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500">{branch.code}</span>
                {branch.admin ? <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{branch.admin}</span> : <span className="mt-1 inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Not Assigned</span>}
                <span className={`mt-1.5 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${branch.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{branch.status}</span>
              </span>
              <HiChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            </button>
          ))}
          {!filteredBranches.length ? <EmptyState /> : null}
        </div>
      </section>

      <Card className="hidden overflow-hidden sm:block">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
            <h2 className="text-xl font-bold text-slate-900">All Branches</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage and monitor all pharmacy branches
            </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchField value={query} onChange={setQuery} compact />
              <button type="button" onClick={onAddBranch} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white transition hover:bg-[#005348]">
                <HiOutlinePlus className="h-5 w-5" /> Add Branch
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Branch</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Branch Admin</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length ? filteredBranches.map((branch) => (
                <tr
                  key={branch.code}
                  className="border-t border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{branch.shortName ?? branch.name}</span>
                      {branch.type === "Main Branch" ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0b6b51]">MAIN</span> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-[#0b6b51]">
                      {branch.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                        <HiOutlineUser className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        {branch.admin ? <>
                        <p className="font-semibold text-slate-900">
                          {branch.admin}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {branch.email}
                        </p>
                        </> : <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Not Assigned</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">{branch.contact}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                        branch.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <ActionButton
                        label="View Branch"
                        icon={HiOutlineEye}
                        className="border-emerald-300 text-[#0b6b51] hover:bg-emerald-50"
                        onClick={() => onViewBranch?.(branch.id)}
                      />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                    No branches match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </Card>

    </div>
  )
}

function SearchField({ value, onChange, compact = false }) {
  return (
    <label className={`relative block ${compact ? "w-64" : "mt-3 w-full"}`}>
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search branches..." className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15" />
    </label>
  )
}

function EmptyState() {
  return <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">No branches match your search.</div>
}

export function AddBranchDialog({ onCancel, onSave }) {
  const [form, setForm] = useState(emptyBranch)
  const [errors, setErrors] = useState({})

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const normalizedEmail = form.email.trim()
    const contactDigits = form.contact.replace(/\D/g, "")

    if (!form.name.trim()) nextErrors.name = "Branch name is required."
    if (!form.code.trim()) nextErrors.code = "Branch code is required."
    if (!form.admin.trim()) nextErrors.admin = "Branch admin is required."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = "Enter a valid email address."
    if (!/^09\d{9}$/.test(contactDigits)) nextErrors.contact = "Use an 11-digit mobile number starting with 09."

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave({
      ...form,
      id: `${form.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      admin: form.admin.trim(),
      email: normalizedEmail,
      contact: contactDigits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"),
      type: "Regular Branch",
      dateAdded: "May 15, 2026",
      statistics: {
        totalUsers: "0",
        totalSales: "₱0.00",
        totalTransactions: "0",
        lowStockItems: "0",
      },
    })
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4">
      <button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close dialog" />
      <form onSubmit={handleSubmit} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:p-6" noValidate>
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]" aria-label="Close">
          <HiXMark className="h-5 w-5" />
        </button>
        <h2 className="pr-10 text-xl font-bold text-slate-900">Add Branch</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Branch Name" error={errors.name}>
            <input value={form.name} onChange={(event) => update("name", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Branch Code" error={errors.code}>
            <input value={form.code} onChange={(event) => update("code", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Branch Admin" error={errors.admin}>
            <input value={form.admin} onChange={(event) => update("admin", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Contact Number" error={errors.contact}>
            <input type="tel" value={form.contact} onChange={(event) => update("contact", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Operating Hours">
            <input value={form.operatingHours} onChange={(event) => update("operatingHours", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Address">
            <input value={form.address} onChange={(event) => update("address", event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => update("status", event.target.value)} className={fieldClass}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]">Add Branch</button>
        </div>
      </form>
    </div>
  )
}

const fieldClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function Field({ children, error, label }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  )
}

function ActionButton({ className, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg border transition ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

export default SuperAdminBranches

