import { useEffect, useRef, useState } from "react"
import {
  HiCheckCircle,
  HiOutlineBuildingStorefront,
  HiOutlineCamera,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiXMark,
} from "react-icons/hi2"

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

const passwordFieldClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

function AdminProfile({
  branch,
  currentPassword,
  onPasswordChange,
  onPhotoChange,
  onSave,
  profile,
}) {
  const [formData, setFormData] = useState(profile)
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successText, setSuccessText] = useState("")
  const photoInputRef = useRef(null)

  useEffect(() => {
    if (!showSuccess) return undefined
    const timer = window.setTimeout(() => setShowSuccess(false), 5000)
    return () => window.clearTimeout(timer)
  }, [showSuccess, successText])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
    setShowSuccess(false)
  }

  const handleCancel = () => {
    setFormData(profile)
    setErrors({})
    setShowSuccess(false)
    setIsEditing(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const email = formData.email.trim()
    const contactDigits = formData.contact.replace(/\D/g, "")

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required."
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!formData.username.trim()) {
      nextErrors.username = "Username is required."
    }

    if (!/^09\d{9}$/.test(contactDigits)) {
      nextErrors.contact = "Use an 11-digit mobile number starting with 09."
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setShowSuccess(false)
      return
    }

    const updatedProfile = {
      ...formData,
      contact: contactDigits,
      email,
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
    }

    setFormData(updatedProfile)
    onSave(updatedProfile)
    setIsEditing(false)
    setSuccessText("Your account information was saved successfully.")
    setShowSuccess(true)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.")
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("The image must be 5 MB or smaller.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const photo = reader.result
      setFormData((current) => ({ ...current, photo }))
      onPhotoChange(photo)
      setPhotoError("")
      setSuccessText("Your profile photo was updated successfully.")
      setShowSuccess(true)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handlePasswordChange = (newPassword) => {
    onPasswordChange(newPassword)
    setIsPasswordModalOpen(false)
    setSuccessText("Your password was updated successfully.")
    setShowSuccess(true)
  }

  return (
    <div className="px-0 pb-4 pt-4 sm:px-4 lg:px-1">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit p-4 sm:p-6">
          <div className="flex flex-col items-center text-center">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Admin profile"
                className="h-32 w-32 rounded-full border-4 border-[#f2fbf7] object-cover"
              />
            ) : (
              <div className="grid h-32 w-32 place-items-center rounded-full bg-[#f2fbf7] text-[#0b6b51]">
                <HiOutlineUser className="h-20 w-20" />
              </div>
            )}
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Branch Administrator
            </p>
            <span className="mt-3 inline-flex rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {profile.status}
            </span>
            <p className="mt-3 text-sm font-bold text-[#0b6b51]">
              {branch?.name ?? profile.branchName}
            </p>
          </div>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#0b6b51] font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
          >
            <HiOutlineCamera className="h-5 w-5" />
            Change Photo
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photoError ? (
            <p className="mt-2 text-center text-xs font-semibold text-red-500">
              {photoError}
            </p>
          ) : null}
        </Card>

        <div className="min-w-0 space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Account Information
            </h2>

            {isEditing ? (
              <form
                onSubmit={handleSubmit}
                className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
                noValidate
              >
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                  />
                </Field>
                <Field label="Username" error={errors.username}>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Contact Number">
                  <input
                    type="tel"
                    value={profile.contact}
                    readOnly
                    className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                  />
                </Field>
                <Field label="Employee ID">
                  <input
                    type="text"
                    value={profile.employeeId}
                    readOnly
                    className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                  />
                </Field>
                <Field label="Account Role">
                  <input
                    type="text"
                    value="Branch Administrator"
                    readOnly
                    className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                  />
                </Field>

                <div className="flex flex-col-reverse gap-3 pt-2 md:col-span-2 md:flex-row md:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
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
              </form>
            ) : (
              <div className="mt-5">
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <ProfileValue label="Full Name" value={profile.fullName} />
                  <ProfileValue label="Email Address" value={profile.email} />
                  <ProfileValue label="Username" value={profile.username} />
                  <ProfileValue label="Contact Number" value={profile.contact} />
                  <ProfileValue label="Employee ID" value={profile.employeeId} />
                  <ProfileValue label="Account Role" value="Branch Administrator" />
                </div>
                <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile)
                      setErrors({})
                      setIsEditing(true)
                    }}
                    className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#f2fbf7] text-[#0b6b51]">
                  <HiOutlineShieldCheck className="h-6 w-6" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Security Information
                </h2>
              </div>

              <div className="divide-y divide-slate-200">
                <InfoRow label="Last Login" value={profile.lastLogin} />
                <InfoRow label="Password" value="**********" />
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0b6b51] px-5 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
              >
                <HiOutlineKey className="h-5 w-5" />
                Change Password
              </button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#f2fbf7] text-[#0b6b51]">
                  <HiOutlineBuildingStorefront className="h-6 w-6" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Assigned Branch
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileValue label="Branch Name" value={profile.branchName} />
                <ProfileValue label="Branch Code" value={profile.branchCode} />
                <ProfileValue label="Location" value={profile.branchLocation} />
                <ProfileValue label="Access Scope" value={profile.accessScope} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {showSuccess ? (
        <div
          role="status"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-[70] flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:left-auto sm:right-5 sm:w-[min(400px,calc(100vw-2rem))]"
        >
          <HiCheckCircle className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-700">Profile Updated</p>
            <p className="mt-1 text-sm text-slate-600">{successText}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ) : null}

      {isPasswordModalOpen ? (
        <ChangePasswordModal
          currentPassword={currentPassword}
          onCancel={() => setIsPasswordModalOpen(false)}
          onSave={handlePasswordChange}
        />
      ) : null}
    </div>
  )
}

function ChangePasswordModal({ currentPassword, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
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
      aria-labelledby="admin-change-password-title"
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
          id="admin-change-password-title"
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
          className={`${passwordFieldClass} ${error ? "border-red-400" : ""}`}
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

function ProfileValue({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value || "Not provided"}
      </p>
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

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}

export default AdminProfile
