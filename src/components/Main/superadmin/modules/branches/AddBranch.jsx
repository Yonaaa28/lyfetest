import { useEffect, useMemo, useState } from "react"
import { HiOutlineExclamationTriangle, HiOutlinePlus, HiXMark } from "react-icons/hi2"

const initialForm = { name: "", code: "", address: "", openingTime: "08:00", closingTime: "20:00", type: "Regular Branch", administratorId: "" }
const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function AddBranch({ activeAdministratorCount = 0, administrators = [], existingCodes = [], onCancel, onSave }) {
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const normalizedCode = form.code.trim().toUpperCase()
  const isDuplicateCode = existingCodes.some((code) => code.toUpperCase() === normalizedCode)
  const hasValidHours = Boolean(form.openingTime && form.closingTime && form.openingTime < form.closingTime)
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)
  const isValid = Boolean(form.name.trim() && normalizedCode && !isDuplicateCode && form.address.trim() && hasValidHours)
  const selectedAdministrator = useMemo(() => administrators.find((user) => user.id === form.administratorId), [administrators, form.administratorId])
  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const handleCancel = () => {
    if (isDirty && !window.confirm("Discard the information entered for this branch?")) return
    onCancel()
  }

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return
      if (isDirty && !window.confirm("Discard the information entered for this branch?")) return
      onCancel()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isDirty, onCancel])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isValid || isSaving) return
    setIsSaving(true)
    onSave({
      id: `${normalizedCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: form.name.trim(), shortName: form.name.trim(), code: normalizedCode,
      address: form.address.trim(), type: form.type,
      operatingHours: `${formatTime(form.openingTime)} - ${formatTime(form.closingTime)}`,
      administratorId: selectedAdministrator?.id ?? null,
      createdAt: new Date().toISOString(),
      dateAdded: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date()),
      status: "Active",
      statistics: { totalUsers: "0", totalSales: "₱0.00", totalTransactions: "0", lowStockItems: "0" },
    })
  }

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[1px] sm:p-5 lg:left-[210px] xl:left-[250px]">
      <button type="button" className="absolute inset-0 cursor-default" onClick={handleCancel} aria-label="Close Add Branch dialog" />
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="add-branch-title" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[900px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h1 id="add-branch-title" className="text-xl font-bold text-slate-900">Add New Branch</h1><p className="mt-0.5 text-sm font-medium text-slate-500">Create a new pharmacy branch</p></div>
          <button type="button" onClick={handleCancel} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51]" aria-label="Close"><HiXMark className="h-5 w-5" /></button>
        </header>
        <section className="p-4 sm:p-5">
          <SectionHeading title="Branch Information" description="Basic information and operating details for this branch" />
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <Field label="Branch Name" required><input value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></Field>
            <Field label="Branch Code" required error={normalizedCode && isDuplicateCode ? "Branch code must be unique." : ""}><input value={form.code} onChange={(event) => update("code", event.target.value)} className={inputClass} /></Field>
            <Field label="Address" required wide><input value={form.address} onChange={(event) => update("address", event.target.value)} className={inputClass} /></Field>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:col-span-2 sm:grid-cols-3">
              <Field label="Opening Time" required><input type="time" value={form.openingTime} onChange={(event) => update("openingTime", event.target.value)} className={inputClass} /></Field>
              <Field label="Closing Time" required error={!hasValidHours ? "Closing time must be after opening time." : ""}><input type="time" value={form.closingTime} onChange={(event) => update("closingTime", event.target.value)} className={inputClass} /></Field>
              <Field label="Branch Type"><select value={form.type} onChange={(event) => update("type", event.target.value)} className={inputClass}><option>Regular Branch</option><option>Main Branch</option></select></Field>
            </div>
          </div>
        </section>
        <section className="border-t border-slate-200 p-4 sm:p-5">
          <SectionHeading title="Branch Administrator" description="Assign an existing Branch Admin now, or assign one later." />
          <div className="mt-4">
            <Field label="Administrator" optional>
              <select value={form.administratorId} onChange={(event) => update("administratorId", event.target.value)} className={inputClass}>
                <option value="">Select branch administrator</option>
                {administrators.length ? administrators.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>) : <>
                  <option disabled>No available Branch Administrators</option>
                  <option disabled>{activeAdministratorCount ? "All active Branch Admins are already assigned." : "Create or activate a Branch Admin under Users."}</option>
                </>}
              </select>
            </Field>
            {!administrators.length ? <NoAdministrators hasActiveAccounts={activeAdministratorCount > 0} /> : null}
          </div>
        </section>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <button type="button" onClick={handleCancel} className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={!isValid || isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white transition hover:bg-[#005348] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
            <HiOutlinePlus className="h-4 w-4" /> {isSaving ? "Adding Branch..." : "Add Branch"}
          </button>
        </div>
      </form>
    </div>
  )
}

function SectionHeading({ title, description }) {
  return <div><h2 className="text-base font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">{description}</p></div>
}

function NoAdministrators({ hasActiveAccounts }) {
  return <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-900"><HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-bold">{hasActiveAccounts ? "No available Branch Administrators" : "No Branch Admin accounts available"}</p><p className="mt-0.5 text-xs font-medium leading-5 text-amber-800">{hasActiveAccounts ? "All active Branch Admin users are currently assigned to other branches. You can create this branch now and assign an administrator later." : "Create or activate a Branch Admin under Users. You can still create this branch and assign an administrator later."}</p></div></div>
}

function Field({ children, error, label, optional, required, wide }) {
  return <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""}`}><span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-600"><span>{label}{required ? <span className="text-red-500"> *</span> : null}</span>{optional ? <span className="text-xs font-medium text-slate-400">Optional</span> : null}</span>{children}{error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}</label>
}

function formatTime(value) {
  const [hours, minutes] = value.split(":").map(Number)
  const suffix = hours >= 12 ? "PM" : "AM"
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`
}

export default AddBranch
