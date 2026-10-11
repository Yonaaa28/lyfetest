import { useState } from "react"
import {
  HiOutlineBellAlert,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlineReceiptPercent,
  HiOutlineUsers,
} from "react-icons/hi2"

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

function EditBranch({ branch, onCancel, onSave }) {
  const [formData, setFormData] = useState(branch)
  const [errors, setErrors] = useState({})

  if (!branch || !formData) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const normalizedEmail = formData.email.trim()
    const contactDigits = formData.contact.replace(/\D/g, "")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!/^09\d{9}$/.test(contactDigits)) {
      nextErrors.contact = "Use an 11-digit mobile number starting with 09."
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const formattedContact = contactDigits.replace(
      /(\d{4})(\d{3})(\d{4})/,
      "$1 $2 $3"
    )

    onSave?.({
      ...formData,
      email: normalizedEmail,
      contact: formattedContact,
      type: branch.id === "camalig" ? "Main Branch" : "Regular Branch",
    })
    setFormData((currentData) => ({
      ...currentData,
      email: normalizedEmail,
      contact: formattedContact,
    }))
  }

  const statistics = [
    {
      label: "Total Users",
      value: branch.statistics.totalUsers,
      icon: HiOutlineUsers,
    },
    {
      label: "Total Sales (MTD)",
      value: branch.statistics.totalSales,
      icon: HiOutlineCurrencyDollar,
    },
    {
      label: "Total Transactions (MTD)",
      value: branch.statistics.totalTransactions,
      icon: HiOutlineReceiptPercent,
    },
    {
      label: "Low Stock Items",
      value: branch.statistics.lowStockItems,
      icon: HiOutlineBellAlert,
      alert: true,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 p-4 sm:p-5">
      <Card className="p-5">
        <div className="flex flex-col gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f2fbf7] text-[#0b6b51]">
              <HiOutlineBuildingStorefront className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {formData.name}
                </h2>
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {formData.status}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {branch.id === "camalig" ? "Main Branch" : "Regular Branch"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryField label="Branch Code" value={formData.code} />
            <SummaryField
              label="Branch Admin"
              value={formData.admin}
              secondary={formData.email}
            />
            <SummaryField label="Contact Number" value={formData.contact} />
            <SummaryField label="Date Added" value={branch.dateAdded} />
          </div>
        </div>
      </Card>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 xl:grid-cols-[0.92fr_1.08fr]"
        noValidate
      >
        <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Branch Information
          </h2>
          <div className="mt-5 space-y-4">
            <Field label="Branch Name">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={fieldClass}
              />
            </Field>
            <Field label="Branch Code">
              <input
                name="code"
                value={formData.code}
                readOnly
                className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
            </Field>
            <Field label="Branch Type">
              <input
                value={
                  branch.id === "camalig" ? "Main Branch" : "Regular Branch"
                }
                readOnly
                className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
            </Field>
            <Field label="Address">
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={fieldClass}
              />
            </Field>
            <Field label="Operating Hours">
              <input
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                className={fieldClass}
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Branch Admin Information
            </h2>
            <div className="mt-5 space-y-4">
              <Field label="Admin Name">
                <input
                  name="admin"
                  value={formData.admin}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </Field>
              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${fieldClass} ${
                    errors.email ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>
              <Field label="Contact Number" error={errors.contact}>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`${fieldClass} ${
                    errors.contact ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  aria-invalid={Boolean(errors.contact)}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Branch Statistics
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Statistics are display-only.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {statistics.map((statistic) => {
                const Icon = statistic.icon
                return (
                  <div
                    key={statistic.label}
                    className="rounded-xl border border-slate-200 p-3 text-center"
                  >
                    <span
                      className={`mx-auto grid h-9 w-9 place-items-center rounded-lg ${
                        statistic.alert
                          ? "bg-red-50 text-red-500"
                          : "bg-[#f2fbf7] text-[#0b6b51]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {statistic.label}
                    </p>
                    <p className="mt-1 break-words font-bold text-slate-900">
                      {statistic.value}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-lg border border-slate-200 bg-white px-8 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#00675b] px-8 text-sm font-bold text-white transition hover:bg-[#005348]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ children, error, label }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-slate-600">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-500">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function SummaryField({ label, secondary, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
      {secondary ? (
        <p className="mt-1 break-words text-xs font-medium text-slate-500">
          {secondary}
        </p>
      ) : null}
    </div>
  )
}

export default EditBranch
