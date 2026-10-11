import { useState } from "react"
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineKey,
  HiXMark,
} from "react-icons/hi2"

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function ChangePasswordModal({ currentPassword, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [visibleFields, setVisibleFields] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (formData.currentPassword !== currentPassword) {
      nextErrors.currentPassword = "The current password is incorrect."
    }
    if (formData.newPassword.length < 6) {
      nextErrors.newPassword = "Use at least 6 characters."
    } else if (formData.newPassword === currentPassword) {
      nextErrors.newPassword = "Choose a different password."
    }
    if (formData.confirmPassword !== formData.newPassword) {
      nextErrors.confirmPassword = "The passwords do not match."
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave(formData.newPassword)
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
        aria-label="Close change password dialog"
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
        noValidate
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          aria-label="Close"
        >
          <HiXMark className="h-5 w-5" />
        </button>

        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#f2fbf7] text-[#0b6b51]">
          <HiOutlineKey className="h-6 w-6" />
        </span>
        <h2
          id="change-password-title"
          className="mt-4 text-xl font-bold text-slate-900"
        >
          Change Password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your current password before choosing a new one.
        </p>

        <div className="mt-6 space-y-4">
          {[
            ["currentPassword", "Current Password"],
            ["newPassword", "New Password"],
            ["confirmPassword", "Confirm New Password"],
          ].map(([name, label]) => (
            <PasswordField
              key={name}
              error={errors[name]}
              label={label}
              name={name}
              value={formData[name]}
              visible={visibleFields[name]}
              onChange={handleChange}
              onToggle={() =>
                setVisibleFields((current) => ({
                  ...current,
                  [name]: !current[name],
                }))
              }
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white transition hover:bg-[#005348]"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  )
}

function PasswordField({
  error,
  label,
  name,
  onChange,
  onToggle,
  value,
  visible,
}) {
  const VisibilityIcon = visible ? HiOutlineEyeSlash : HiOutlineEye

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputClass} ${error ? "border-red-400" : ""}`}
          autoComplete={
            name === "currentPassword" ? "current-password" : "new-password"
          }
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          <VisibilityIcon className="h-5 w-5" />
        </button>
      </span>
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-500">
          {error}
        </span>
      ) : null}
    </label>
  )
}

export default ChangePasswordModal
