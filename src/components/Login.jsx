import { useMemo, useState } from "react"
import {
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiShield,
  FiX,
  FiXCircle,
} from "react-icons/fi"

import { getBranchById, sampleAccounts, userRoles } from "../data/sampleAccounts"
import { initialSuperAdminUsers } from "./Main/superadmin/modules/users/userData"
import useNotification from "../hooks/useNotification"

const passwordResetRequestStorageKey = "lyfe-password-reset-requests"

const forgotPasswordStates = {
  FORM: "form",
  INVALID: "invalid",
  LOADING: "loading",
  SUCCESS: "success",
  FAILED: "failed",
}

const resetPasswordStates = {
  EXPIRED: "expired",
  FORM: "form",
  LOADING: "loading",
  SUCCESS: "success",
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordRequirements = [
  {
    id: "length",
    label: "At least 8 characters",
    isMet: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    isMet: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    isMet: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "One number",
    isMet: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "One special character",
    isMet: (password) => /[^A-Za-z0-9]/.test(password),
  },
]

const waitForMockResponse = (delay = 900) =>
  new Promise((resolve) => window.setTimeout(resolve, delay))

async function requestForgotPassword(identifier) {
  // TODO: Backend developer will connect the forgot-password API endpoint here.
  await waitForMockResponse()
  return {
    ok: true,
    sentToSuperAdmin: createMockSuperAdminResetRequest(identifier),
  }
}

async function resetPassword(newPassword) {
  void newPassword
  // TODO: Backend developer will connect the reset-password API endpoint here.
  await waitForMockResponse()
  return { ok: true }
}

const isEmailLike = (value) => value.includes("@")
const isValidIdentifier = (value) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return false
  if (isEmailLike(trimmedValue)) return emailPattern.test(trimmedValue)

  return true
}

const safelyParseJsonArray = (value) => {
  try {
    const parsedValue = JSON.parse(value ?? "[]")
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

const getManagedUsers = () => {
  const storedUsers = safelyParseJsonArray(
    window.localStorage.getItem("lyfe-superadmin-users-user-superadmin-001")
  )
  const users = storedUsers.length ? storedUsers : initialSuperAdminUsers

  return users.map((user, index) => ({
    ...user,
    employeeId: user.employeeId ?? `EMP-${String(index + 1).padStart(4, "0")}`,
  }))
}

const matchesIdentifier = (account, identifier) =>
  [account.employeeId, account.email].some(
    (value) => value?.trim().toLowerCase() === identifier
  )

const findAdminOrStaffResetAccount = (identifier) => {
  const normalizedIdentifier = identifier.trim().toLowerCase()
  const sampleAccount = sampleAccounts.find(
    (account) =>
      [userRoles.ADMIN, userRoles.STAFF].includes(account.role) &&
      account.status === "active" &&
      matchesIdentifier(account, normalizedIdentifier)
  )

  if (sampleAccount) {
    const branch = getBranchById(sampleAccount.assignedBranchId)

    return {
      accountId: sampleAccount.id,
      branchName: branch?.name ?? "All branches",
      email: sampleAccount.email,
      employeeId: sampleAccount.employeeId,
      fullName: sampleAccount.fullName,
      role: sampleAccount.role,
    }
  }

  const managedUser = getManagedUsers().find(
    (user) =>
      ["Branch Admin", "Cashier"].includes(user.role) &&
      user.status === "Active" &&
      matchesIdentifier(user, normalizedIdentifier)
  )

  if (!managedUser) return null

  return {
    accountId: managedUser.id,
    branchName: managedUser.branch,
    email: managedUser.email,
    employeeId: managedUser.employeeId,
    fullName: managedUser.name,
    role: managedUser.role === "Branch Admin" ? userRoles.ADMIN : userRoles.STAFF,
  }
}

const createMockSuperAdminResetRequest = (identifier) => {
  const account = findAdminOrStaffResetAccount(identifier)

  if (!account) return false

  const requests = safelyParseJsonArray(
    window.localStorage.getItem(passwordResetRequestStorageKey)
  )
  const hasPendingRequest = requests.some(
    (request) =>
      request.accountId === account.accountId && request.status === "Pending"
  )

  if (hasPendingRequest) return true

  requests.unshift({
    id: `password-reset-${Date.now()}`,
    accountId: account.accountId,
    employeeId: account.employeeId,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    branchName: account.branchName,
    requestedAt: new Date().toISOString(),
    status: "Pending",
    source: "login-forgot-password",
  })
  window.localStorage.setItem(
    passwordResetRequestStorageKey,
    JSON.stringify(requests)
  )
  window.dispatchEvent(new Event("lyfe-password-reset-updated"))
  return true
}

function PasswordResetRequestModal({ onClose }) {
  const [identifier, setIdentifier] = useState("")
  const [modalState, setModalState] = useState(forgotPasswordStates.FORM)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [sentToSuperAdmin, setSentToSuperAdmin] = useState(false)

  const trimmedIdentifier = identifier.trim()
  const isInvalidEmail =
    trimmedIdentifier &&
    isEmailLike(trimmedIdentifier) &&
    !emailPattern.test(trimmedIdentifier)
  const isSubmitDisabled =
    modalState === forgotPasswordStates.LOADING ||
    !trimmedIdentifier ||
    isInvalidEmail
  const shouldShowValidation =
    (modalState === forgotPasswordStates.INVALID || hasInteracted) &&
    Boolean(isInvalidEmail)

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value)

    if (modalState === forgotPasswordStates.INVALID) {
      setModalState(forgotPasswordStates.FORM)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasInteracted(true)

    if (!isValidIdentifier(identifier)) {
      setModalState(forgotPasswordStates.INVALID)
      return
    }

    setModalState(forgotPasswordStates.LOADING)

    try {
      const response = await requestForgotPassword(trimmedIdentifier)
      setSentToSuperAdmin(Boolean(response.sentToSuperAdmin))
      setModalState(forgotPasswordStates.SUCCESS)
    } catch {
      setModalState(forgotPasswordStates.FAILED)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {modalState === forgotPasswordStates.SUCCESS
                ? "Check Your Email"
                : "Forgot Password"}
            </h2>
            {modalState === forgotPasswordStates.FORM ||
            modalState === forgotPasswordStates.INVALID ||
            modalState === forgotPasswordStates.LOADING ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the Employee ID or registered email address associated
                with your account.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {modalState === forgotPasswordStates.SUCCESS ? (
          <div className="mt-6 text-center">
            <FiCheckCircle className="mx-auto h-12 w-12 text-[#00675b]" />
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {sentToSuperAdmin
                ? "Your password-reset request has been sent to the Super Admin for review."
                : "If the information matches an account, password-reset instructions will be sent to the registered email address."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 rounded-xl bg-[#00675b] px-6 text-sm font-bold text-white"
            >
              Back to Login
            </button>
          </div>
        ) : modalState === forgotPasswordStates.FAILED ? (
          <div className="mt-6 text-center">
            <FiXCircle className="mx-auto h-12 w-12 text-[#d64545]" />
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
              We couldn’t submit your request. Please try again.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setModalState(forgotPasswordStates.FORM)}
                className="h-11 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6" noValidate>
            <label className="block text-sm font-bold text-slate-700">
              Employee ID or Registered Email
              <input
                value={identifier}
                onBlur={() => setHasInteracted(true)}
                onChange={handleIdentifierChange}
                className={`mt-2 h-11 w-full rounded-xl border px-4 outline-none focus:border-[#00675b] ${
                  shouldShowValidation
                    ? "border-[#d64545]"
                    : "border-slate-200"
                }`}
                placeholder="Enter Employee ID or email address"
              />
            </label>
            {shouldShowValidation ? (
              <p className="mt-2 text-sm font-semibold text-[#d64545]">
                Enter a valid Employee ID or email address.
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={modalState === forgotPasswordStates.LOADING}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="h-11 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {modalState === forgotPasswordStates.LOADING
                  ? "Submitting…"
                  : "Submit Reset Request"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function CreateNewPassword({ account, onBackToLogin, resetLinkStatus = "valid" }) {
  const [screenState, setScreenState] = useState(
    resetLinkStatus === "valid"
      ? resetPasswordStates.FORM
      : resetPasswordStates.EXPIRED
  )
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [visibleFields, setVisibleFields] = useState({})

  const requirementStatus = useMemo(
    () =>
      passwordRequirements.map((requirement) => ({
        ...requirement,
        met: requirement.isMet(password),
      })),
    [password]
  )
  const hasMetRequirements = requirementStatus.every(
    (requirement) => requirement.met
  )

  const updatePassword = (value) => {
    setPassword(value)
    setErrors((current) => ({ ...current, password: "" }))
  }

  const updateConfirmPassword = (value) => {
    setConfirmPassword(value)
    setErrors((current) => ({ ...current, confirmPassword: "" }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!password) {
      nextErrors.password = "New password is required."
    } else if (!hasMetRequirements) {
      nextErrors.password = "Password must meet all requirements."
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required."
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords must match."
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setScreenState(resetPasswordStates.LOADING)
    await resetPassword(password)
    if (account?.id) {
      window.localStorage.setItem(`lyfe-password-${account.id}`, password)
      window.localStorage.removeItem(`lyfe-must-change-password-${account.id}`)
    }
    setScreenState(resetPasswordStates.SUCCESS)
  }

  if (screenState === resetPasswordStates.EXPIRED) {
    return (
      <ResetPasswordShell>
        <FiXCircle className="h-12 w-12 text-[#d64545]" />
        <h1 className="mt-5 text-2xl font-bold text-[#003e30]">
          Reset Link Expired or Invalid
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please return to login and request a new password-reset link.
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-6 h-11 rounded-xl bg-[#00675b] px-6 text-sm font-bold text-white"
        >
          Back to Login
        </button>
      </ResetPasswordShell>
    )
  }

  if (screenState === resetPasswordStates.SUCCESS) {
    return (
      <ResetPasswordShell>
        <FiCheckCircle className="h-12 w-12 text-[#00675b]" />
        <h1 className="mt-5 text-2xl font-bold text-[#003e30]">
          Password Reset Successful
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your password has been reset successfully. You can now log in.
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-6 h-11 rounded-xl bg-[#00675b] px-6 text-sm font-bold text-white"
        >
          Go to Login
        </button>
      </ResetPasswordShell>
    )
  }

  return (
    <ResetPasswordShell>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-[#00675b]">
        <FiShield className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-[#003e30]">
        Create New Password
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Set a new password for your Lyfe Pharmacy account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <PasswordField
          error={errors.password}
          label="New Password"
          name="new-password"
          value={password}
          visible={visibleFields.password}
          onChange={(event) => updatePassword(event.target.value)}
          onToggle={() =>
            setVisibleFields((current) => ({
              ...current,
              password: !current.password,
            }))
          }
        />
        <PasswordField
          error={errors.confirmPassword}
          label="Confirm New Password"
          name="confirm-new-password"
          value={confirmPassword}
          visible={visibleFields.confirmPassword}
          onChange={(event) => updateConfirmPassword(event.target.value)}
          onToggle={() =>
            setVisibleFields((current) => ({
              ...current,
              confirmPassword: !current.confirmPassword,
            }))
          }
        />

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Password Requirements
          </p>
          <ul className="mt-3 space-y-2">
            {requirementStatus.map((requirement) => (
              <li
                key={requirement.id}
                className={`flex items-center gap-2 text-sm font-semibold ${
                  requirement.met ? "text-[#00675b]" : "text-slate-500"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full ${
                    requirement.met
                      ? "bg-emerald-100 text-[#00675b]"
                      : "bg-white text-slate-400"
                  }`}
                >
                  <FiCheck className="h-3.5 w-3.5" />
                </span>
                {requirement.label}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={screenState === resetPasswordStates.LOADING}
          className="h-11 w-full rounded-xl bg-[#00675b] text-sm font-bold text-white hover:bg-[#005348] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {screenState === resetPasswordStates.LOADING
            ? "Resetting…"
            : "Reset Password"}
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-sm font-bold text-[#00675b] hover:underline"
        >
          Back to Login
        </button>
      </form>
    </ResetPasswordShell>
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
  const VisibilityIcon = visible ? FiEyeOff : FiEye

  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <span className="relative mt-2 block">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`h-11 w-full rounded-xl border px-4 pr-11 outline-none focus:border-[#00675b] ${
            error ? "border-[#d64545]" : "border-slate-200"
          }`}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          <VisibilityIcon className="h-5 w-5" />
        </button>
      </span>
      {error ? (
        <span className="mt-2 block text-sm font-semibold text-[#d64545]">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function ResetPasswordShell({ children }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f8f8f6] p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
        {children}
      </section>
    </main>
  )
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordResetRequestOpen, setIsPasswordResetRequestOpen] =
    useState(false)
  const [passwordChangeAccount, setPasswordChangeAccount] = useState(null)
  const { showError, showSuccess } = useNotification()

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedCredential = formData.username.trim().toLowerCase()
    const normalizedPassword = formData.password.trim()

    if (!normalizedCredential || !normalizedPassword) {
      const validationMessage = "Please enter your email and password."

      setErrorMessage(validationMessage)
      showError(validationMessage)
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const matchedAccount = sampleAccounts.find((account) => {
        const savedPassword = window.localStorage.getItem(
          `lyfe-password-${account.id}`
        )

        return (
          [account.email, account.username].some(
            (credential) => credential?.toLowerCase() === normalizedCredential
          ) &&
          (savedPassword ?? account.password) === normalizedPassword &&
          account.status === "active"
        )
      })

      if (!matchedAccount) {
        const invalidCredentialsMessage = "Invalid username or password."

        setErrorMessage(invalidCredentialsMessage)
        setIsSubmitting(false)
        showError(invalidCredentialsMessage)
        return
      }

      if (
        ![userRoles.SUPERADMIN, userRoles.ADMIN, userRoles.STAFF].includes(
          matchedAccount.role
        )
      ) {
        const accessDeniedMessage =
          "This account does not have access to this module yet."

        setErrorMessage(accessDeniedMessage)
        setIsSubmitting(false)
        showError(accessDeniedMessage, {
          title: "Access denied",
        })
        return
      }

      setErrorMessage("")
      setIsSubmitting(false)
      if (
        window.localStorage.getItem(
          `lyfe-must-change-password-${matchedAccount.id}`
        ) === "true"
      ) {
        setPasswordChangeAccount(matchedAccount)
        return
      }
      onLogin?.(matchedAccount, () => showSuccess("Login successful"))
    }, 900)
  }

  if (passwordChangeAccount) {
    return (
      <CreateNewPassword
        account={passwordChangeAccount}
        onBackToLogin={() => setPasswordChangeAccount(null)}
      />
    )
  }

  return (
    <main className="min-h-dvh overflow-y-auto bg-[#f8f8f6] p-3 sm:p-4 lg:p-5">
      <section className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-[100rem] items-center justify-center sm:min-h-[calc(100dvh-2rem)] lg:min-h-[calc(100dvh-2.5rem)]">
        <div className="grid w-full max-w-[75rem] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:max-h-[calc(100dvh-2.5rem)] lg:min-h-[34rem] lg:grid-cols-[1.15fr_0.85fr] xl:min-h-[42rem] xl:rounded-[42px]">
          <div className="flex min-h-0 flex-col overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 md:px-14 lg:px-16 xl:px-20 2xl:px-24">
            <div className="flex items-center gap-4">
              <img
                src="/Logo.jpg"
                alt="Lyfe Pharmacy logo"
                className="h-14 w-14 rounded-full object-cover xl:h-16 xl:w-16"
              />
              <p className="text-xl font-semibold text-[#003e30] sm:text-2xl xl:text-2xl">
                Lyfe Pharmacy
              </p>
            </div>

            <div className="flex flex-1 items-center py-8 sm:py-10 lg:py-6">
              <div className="w-full max-w-[34rem]">
                <div className="w-full lg:pl-6 xl:pl-10">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-[#003e30] sm:text-5xl">
                      Login
                    </h1>
                    <p className="max-w-xl text-base text-[#003e30] sm:text-lg xl:text-xl">
                      Welcome back! Please provide your login details.
                    </p>
                  </div>

                  <form
                    className="mt-8 space-y-5 sm:space-y-6 xl:mt-10 xl:space-y-7"
                    onSubmit={handleSubmit}
                  >
                    <div className="space-y-2 xl:space-y-3">
                      <label
                        htmlFor="username"
                        className="block text-lg font-medium text-[#2a2a2a] sm:text-xl"
                      >
                        Email
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="h-13 w-full rounded-[18px] border border-black/70 bg-white px-5 text-base outline-none transition focus:border-[#003e30] focus:ring-2 focus:ring-[#0d5c17]/20"
                      />
                    </div>

                    <div className="space-y-2 xl:space-y-3">
                      <label
                        htmlFor="password"
                        className="block text-lg font-medium text-[#2a2a2a] sm:text-xl"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-13 w-full rounded-[18px] border border-black/70 bg-white px-5 text-base outline-none transition focus:border-[#0d5c17] focus:ring-2 focus:ring-[#0d5c17]/20"
                      />
                    </div>

                    {errorMessage ? (
                      <p className="text-sm font-medium text-[#d64545]">
                        {errorMessage}
                      </p>
                    ) : null}

                    <div className="pt-2 text-center xl:pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-w-48 items-center justify-center rounded-[18px] bg-[#003e30] px-8 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-[#004a08] sm:min-w-55 xl:min-w-60 xl:py-4 xl:text-xl disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {isSubmitting ? "Signing in..." : "Login"}
                      </button>
                      <p className="mt-4 text-center text-sm xl:mt-6">
                        <button
                          type="button"
                          onClick={() => setIsPasswordResetRequestOpen(true)}
                          className="font-semibold text-[#00675b] transition hover:underline"
                        >
                          Forgot password?
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden min-h-0 p-5 lg:block xl:p-8">
            <div className="relative h-full overflow-hidden rounded-[42px] xl:rounded-[56px]">
              <img
                src="/LoginBg.jpg"
                alt="Lyfe Pharmacy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-white/55" />
            </div>
          </div>
        </div>
      </section>

      {isPasswordResetRequestOpen && (
        <PasswordResetRequestModal
          onClose={() => setIsPasswordResetRequestOpen(false)}
        />
      )}
    </main>
  )
}

export default Login
