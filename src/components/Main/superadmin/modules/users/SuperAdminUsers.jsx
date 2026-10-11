import { useEffect, useMemo, useState } from "react"
import { FiChevronUp, FiMoreVertical } from "react-icons/fi"
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineArchiveBox,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiXMark,
} from "react-icons/hi2"

const roleBadgeStyles = {
  "Super Admin": "bg-violet-100 text-violet-700",
  "Branch Admin": "bg-blue-50 text-blue-600",
  Cashier: "bg-emerald-50 text-emerald-700",
}

const statusBadgeStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Archived: "bg-slate-100 text-slate-600",
  Pending: "bg-amber-50 text-amber-700",
}

const permissionSets = {
  "Super Admin": ["Full Access"],
  "Branch Admin": ["Products", "Inventory", "Purchase Requests", "Sales Reports"],
  Cashier: ["Cashier", "Products View", "Sales Transactions"],
}

const emptyUser = {
  name: "",
  employeeId: "",
  role: "Cashier",
  branch: "",
  branchId: "",
  email: "",
  contact: "",
  status: "Active",
  createdOn: "May 15, 2026",
  temporaryPassword: "",
}

function normalizeUser(user, branches, employeeId) {
  const createdOn = user.createdOn ?? user.lastLoginDate ?? "May 15, 2026"
  const assignedBranch = branches.find((branch) => user.branchId === branch.id || normalizeBranchName(user.branch) === normalizeBranchName(branch.name) || normalizeBranchName(user.branch) === normalizeBranchName(branch.shortName))

  return {
    ...user,
    employeeId,
    createdOn,
    contact: String(user.contact ?? "").replace(/\D/g, "").slice(0, 11),
    branch: assignedBranch?.name ?? user.branch,
    branchId: assignedBranch?.id ?? user.branchId ?? "",
    status: user.status === "Inactive" ? "Archived" : user.status,
  }
}

function normalizeUsersWithUniqueIds(users, archivedUsers, branches) {
  const archivedIds = archivedUsers.map((record) => record.user?.employeeId).filter(Boolean)
  const suppliedIds = users.map((user) => user.employeeId).filter(Boolean)
  const usedIds = new Set(archivedIds.map((id) => id.toUpperCase()))
  let nextIdNumber = getHighestEmployeeIdNumber([...archivedIds, ...suppliedIds]) + 1

  return users.map((user) => {
    let employeeId = user.employeeId?.toUpperCase()
    if (!employeeId || usedIds.has(employeeId)) {
      do {
        employeeId = `EMP-${String(nextIdNumber).padStart(4, "0")}`
        nextIdNumber += 1
      } while (usedIds.has(employeeId))
    }
    usedIds.add(employeeId)
    return normalizeUser(user, branches, employeeId)
  })
}

function SuperAdminUsers({ archivedUsers = [], branches = [], onArchiveUser, onPasswordResetRequestOpened, onUsersChange, passwordResetRequestToOpen, users }) {
  const resetStorageKey = "lyfe-password-reset-requests"
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [userToArchive, setUserToArchive] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [archivedUserName, setArchivedUserName] = useState("")
  const [actionMenu, setActionMenu] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDialog, setBulkDialog] = useState(null)
  const [branchChangeMessage, setBranchChangeMessage] = useState("")
  const [resetRequests, setResetRequests] = useState(() => JSON.parse(window.localStorage.getItem(resetStorageKey) ?? "[]"))
  const [showResetRequests, setShowResetRequests] = useState(false)
  const [selectedResetRequest, setSelectedResetRequest] = useState(null)
  const pendingResetRequests = resetRequests.filter((request) => request.status === "Pending")
  const saveResetRequests = (requests) => { setResetRequests(requests); window.localStorage.setItem(resetStorageKey, JSON.stringify(requests)) }
  const completeResetRequest = (request) => { const temporaryPassword = generatePassword(); window.localStorage.setItem(`lyfe-password-${request.accountId}`, temporaryPassword); window.localStorage.setItem(`lyfe-must-change-password-${request.accountId}`, "true"); saveResetRequests(resetRequests.map((item) => item.id === request.id ? { ...item, status: "Completed", completedAt: new Date().toISOString(), processedBy: "Super Admin", temporaryPasswordIssued: true } : item)); return temporaryPassword }
  const rejectResetRequest = (request) => saveResetRequests(resetRequests.map((item) => item.id === request.id ? { ...item, status: "Rejected", completedAt: new Date().toISOString(), processedBy: "Super Admin" } : item))

  useEffect(() => {
    const refreshRequests = () => setResetRequests(JSON.parse(window.localStorage.getItem(resetStorageKey) ?? "[]"))
    window.addEventListener("storage", refreshRequests)
    window.addEventListener("focus", refreshRequests)
    window.addEventListener("lyfe-password-reset-updated", refreshRequests)
    return () => { window.removeEventListener("storage", refreshRequests); window.removeEventListener("focus", refreshRequests); window.removeEventListener("lyfe-password-reset-updated", refreshRequests) }
  }, [])

  const activeResetRequest = selectedResetRequest ?? resetRequests.find((item) => item.id === passwordResetRequestToOpen) ?? null

  const normalizedUsers = useMemo(
    () => normalizeUsersWithUniqueIds(users, archivedUsers, branches),
    [archivedUsers, branches, users]
  )
  const allUsers = normalizedUsers.filter((user) => user.status !== "Archived")

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return allUsers.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [user.name, user.employeeId, user.email].some(
          (value) => value.toLowerCase().includes(normalizedQuery)
        )
      const matchesRole = roleFilter === "All Roles" || user.role === roleFilter

      return matchesQuery && matchesRole
    })
  }, [allUsers, query, roleFilter])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )
  const paginationItems = getPaginationItems(currentPage, pageCount)
  const selectedUsers = normalizedUsers.filter((user) => selectedIds.includes(user.id))
  const canBulkChangeBranch = selectedUsers.length >= 2 && selectedUsers.every((user) => user.role === "Cashier")
  const visibleIds = visibleUsers.map((user) => user.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const activeCount = normalizedUsers.filter((user) => user.status === "Active").length
  const archivedCount = archivedUsers.length + normalizedUsers.filter((user) => user.status === "Archived").length
  const branchAdminCount = normalizedUsers.filter((user) => user.role === "Branch Admin" && user.status === "Active").length

  const summaryCards = [
    {
      label: "Total Users",
      value: allUsers.length + archivedCount,
      detail: "",
      icon: HiOutlineUserGroup,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Users",
      value: activeCount,
      detail: "",
      icon: HiOutlineShieldCheck,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Archived Users",
      value: archivedCount,
      detail: "",
      icon: HiOutlineArchiveBox,
      tone: "bg-slate-100 text-slate-600",
    },
    {
      label: "Branch Admins",
      value: branchAdminCount,
      detail: "",
      icon: HiOutlineBriefcase,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ]

  const openView = (user) => setDialog({ mode: "view", form: { ...user } })
  const openEdit = (user) => setDialog({ mode: "edit", form: { ...user } })
  const openCreate = () =>
    setDialog({
      mode: "create",
      form: {
        ...emptyUser,
        employeeId: getNextEmployeeId(normalizedUsers, archivedUsers),
      },
    })

  const saveUser = (updatedUser) => {
    const assignedBranch = branches.find((branch) => branch.id === updatedUser.branchId)
    const cleanedUser = {
      ...updatedUser,
      branch: updatedUser.role === "Super Admin" ? "All Branches" : assignedBranch?.name ?? "",
      branchId: updatedUser.role === "Super Admin" ? null : assignedBranch?.id ?? null,
      lastLoginDate: updatedUser.lastLoginDate ?? "-",
      lastLoginTime: updatedUser.lastLoginTime ?? "-",
    }

    if (dialog.mode === "create") {
      onUsersChange((currentUsers) => [
        ...currentUsers,
        {
          ...cleanedUser,
          id: `${cleanedUser.employeeId.toLowerCase()}-${Date.now()}`,
        },
      ])
      setPage(1)
      setDialog(null)
      return
    }

    onUsersChange((currentUsers) =>
      currentUsers.map((user) => (user.id === cleanedUser.id ? cleanedUser : user))
    )
    setDialog(null)
  }

  const archiveUser = (reason) => {
    setArchivedUserName(userToArchive.name)
    onArchiveUser(userToArchive, reason)
    setPage(Math.min(currentPage, Math.max(1, Math.ceil((filteredUsers.length - 1) / rowsPerPage))))
    setUserToArchive(null)
  }

  const toggleUserSelection = (userId) => {
    setSelectedIds((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId])
  }

  const toggleVisibleSelection = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  const changeSelectedBranch = (branchId) => {
    const branch = branches.find((record) => record.id === branchId)
    if (!branch || selectedUsers.some((user) => user.role !== "Cashier")) return
    const movedUserCount = selectedUsers.length
    onUsersChange((currentUsers) => currentUsers.map((user) => selectedIds.includes(user.id)
      ? { ...user, branchId: branch.id, branch: branch.name }
      : user))
    setBranchChangeMessage(`${movedUserCount} user${movedUserCount === 1 ? " was" : "s were"} moved to ${branch.shortName ?? branch.name}.`)
    setSelectedIds([])
    setBulkDialog(null)
  }

  const archiveSelectedUsers = () => {
    selectedUsers.forEach((user) => onArchiveUser(user, "Bulk archive by Super Admin"))
    setArchivedUserName(`${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"}`)
    setPage(Math.min(currentPage, Math.max(1, Math.ceil((filteredUsers.length - selectedUsers.length) / rowsPerPage))))
    setSelectedIds([])
    setBulkDialog(null)
  }

  useEffect(() => {
    if (!actionMenu) return undefined
    const closeMenu = () => setActionMenu(null)
    document.addEventListener("mousedown", closeMenu)
    window.addEventListener("resize", closeMenu)
    window.addEventListener("scroll", closeMenu, true)
    return () => {
      document.removeEventListener("mousedown", closeMenu)
      window.removeEventListener("resize", closeMenu)
      window.removeEventListener("scroll", closeMenu, true)
    }
  }, [actionMenu])

  const toggleActionMenu = (event, user) => {
    event.stopPropagation()
    if (actionMenu?.user.id === user.id) {
      setActionMenu(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const openUp = window.innerHeight - rect.bottom < 155
    setActionMenu({
      user,
      right: Math.max(12, window.innerWidth - rect.right),
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 sm:px-6 lg:px-8">
      <section className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <article
                key={card.label}
                className="min-h-[92px] rounded-[22px] border border-white/60 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:min-h-[112px] xl:rounded-2xl xl:border-slate-200 xl:p-4 xl:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight text-slate-700 sm:text-sm">{card.label}</p>
                    <p className="mt-3 text-xl font-bold leading-tight text-slate-900 [font-variant-numeric:tabular-nums] xl:mt-2 xl:text-2xl">{card.value}</p>
                    {card.detail ? <p className="mt-2 hidden text-xs font-medium leading-5 text-slate-500 xl:block">{card.detail}</p> : null}
                  </div>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10 sm:rounded-2xl xl:h-11 xl:w-11 ${card.tone}`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6" />
                  </span>
                </div>
              </article>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 sm:w-[420px]">
            <span className="sr-only">Search users</span>
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
                setSelectedIds([])
              }}
              placeholder="Search name, email or employee ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value)
                setPage(1)
                setSelectedIds([])
              }}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#0b6b51] sm:w-auto sm:min-w-40"
            >
              {["All Roles", ...Object.keys(roleBadgeStyles)].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowResetRequests(true)} className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50">Reset Requests ({pendingResetRequests.length})</button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white transition hover:bg-[#005348]"
            >
              <HiOutlinePlus className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        {showResetRequests ? <PasswordResetRequestsModal requests={resetRequests} onClose={() => setShowResetRequests(false)} onComplete={(request) => { setShowResetRequests(false); setSelectedResetRequest(request) }} onReject={(request) => { setShowResetRequests(false); setSelectedResetRequest(request) }} /> : null}
        {activeResetRequest ? <PasswordResetRequestDetails request={resetRequests.find((item) => item.id === activeResetRequest.id) ?? activeResetRequest} onClose={() => { setSelectedResetRequest(null); onPasswordResetRequestOpened?.() }} onComplete={completeResetRequest} onReject={rejectResetRequest} /> : null}

        {selectedUsers.length ? (
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-[#0b6b51]">{selectedUsers.length} user{selectedUsers.length === 1 ? "" : "s"} selected</p>
              <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Clear Selection</button>
            </div>
            {selectedUsers.length >= 2 ? <div className="flex flex-wrap gap-2">
              <span className="inline-flex" title={!canBulkChangeBranch ? "Bulk branch changes are only available for Cashier accounts. Branch Administrators must be managed individually." : undefined}>
              <button
                type="button"
                disabled={!canBulkChangeBranch}
                onClick={() => setBulkDialog("branch")}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:border-slate-200"
              >Change Branch</button>
              </span>
              <button type="button" onClick={() => setBulkDialog("archive")} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700">Archive Selected</button>
            </div> : null}
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:overflow-hidden lg:rounded-xl lg:border-slate-200 lg:p-0 lg:shadow-none">
        <div className="space-y-2.5 lg:hidden">
          {visibleUsers.length ? visibleUsers.map((user) => (
            <div key={user.id} className="flex w-full items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30">
              <label className="grid h-10 w-9 shrink-0 cursor-pointer place-items-center" aria-label={`Select ${user.name}`}>
                <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]" />
              </label>
              <button type="button" onClick={() => openView(user)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2fbf7] text-xs font-bold text-[#0b6b51]">{getInitials(user.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-sm font-bold text-slate-900">{user.name}</span>
                <span className="mt-0.5 flex flex-wrap items-start gap-x-1.5 text-xs font-medium text-slate-500"><span className="shrink-0">{user.employeeId} ·</span><span className="line-clamp-2"><BranchDisplay user={user} compact /></span></span>
                <span className="mt-1.5 flex flex-wrap items-center gap-2"><RoleBadge role={user.role} /><StatusBadge status={user.status} /></span>
              </span>
              <HiChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </button>
            </div>
          )) : <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center"><p className="text-sm font-semibold text-slate-600">No users found.</p><p className="mt-1 text-xs text-slate-400">Try adjusting your search or role filter.</p></div>}
        </div>

        <div className="hidden max-w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-700">
              <tr>
                <th className="w-12 px-4 py-4 text-center">
                  <input
                    ref={(checkbox) => { if (checkbox) checkbox.indeterminate = someVisibleSelected }}
                    type="checkbox"
                    checked={allVisibleSelected}
                    disabled={!visibleUsers.length}
                    onChange={toggleVisibleSelection}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b] disabled:cursor-not-allowed"
                    aria-label="Select all users on this page"
                  />
                </th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4">Employee ID</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Branch</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created On</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.length ? visibleUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="w-12 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#00675b]"
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2fbf7] text-xs font-bold text-[#0b6b51]">
                        {getInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    {user.employeeId}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-slate-700"><BranchDisplay user={user} /></td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {user.createdOn}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={(event) => toggleActionMenu(event, user)} className="mx-auto grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100" aria-label="User actions" aria-expanded={actionMenu?.user.id === user.id} title="User actions"><FiMoreVertical className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-100">
                  <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    <p className="font-semibold text-slate-600">No users found.</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">Try adjusting your search or role filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex min-h-14 flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:mt-0 lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-t lg:border-slate-100 lg:px-5">
          <p>
            {filteredUsers.length
              ? `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredUsers.length)} of ${filteredUsers.length} users`
              : "Showing 0 of 0 users"}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
            <label className="relative block min-w-[8.5rem] lg:min-w-[10.75rem]">
              <span className="sr-only">Entries per page</span>
              <select
                value={rowsPerPage}
                onChange={(event) => {
                setRowsPerPage(Number(event.target.value))
                setPage(1)
                setSelectedIds([])
                }}
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 lg:h-11 lg:rounded-xl lg:px-4 lg:pr-10 lg:text-base lg:text-slate-700"
              >
                {[10, 25, 50].map((amount) => <option key={amount} value={amount}>{amount} entries</option>)}
              </select>
              <FiChevronUp className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 lg:right-4" />
            </label>
            <nav aria-label="Users pagination" className="flex items-center gap-2">
              <PageButton disabled={currentPage === 1 || filteredUsers.length === 0} label="Previous page" onClick={() => setPage(Math.max(1, currentPage - 1))}>
                <HiChevronLeft className="h-5 w-5" />
              </PageButton>
              {filteredUsers.length > 0 && paginationItems.map((item, index) => item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} aria-hidden="true" className="grid h-9 w-9 place-items-center text-sm font-semibold text-slate-400">...</span>
              ) : (
                <PageButton key={item} active={item === currentPage} label={`Page ${item}`} onClick={() => setPage(item)}>
                  {item}
                </PageButton>
              ))}
              <PageButton disabled={currentPage === pageCount || filteredUsers.length === 0} label="Next page" onClick={() => setPage(Math.min(pageCount, currentPage + 1))}>
                <HiChevronRight className="h-5 w-5" />
              </PageButton>
            </nav>
          </div>
        </div>
        </div>
      </section>

      {dialog ? (
        <UserDialog
          branches={branches}
          dialog={dialog}
          onCancel={() => setDialog(dialog.returnTo ?? null)}
          onChange={(form) => setDialog((current) => ({ ...current, form }))}
          onReset={(user) => setResetTarget(user)}
          onSave={saveUser}
          users={normalizedUsers}
        />
      ) : null}
      {actionMenu ? <UserActionMenu
        menu={actionMenu}
        onArchive={(user) => { setActionMenu(null); setUserToArchive(user) }}
        onEdit={(user) => { setActionMenu(null); openEdit(user) }}
        onOverview={(user) => { setActionMenu(null); openView(user) }}
      /> : null}
      {resetTarget ? <ResetPasswordModal user={resetTarget} onCancel={() => setResetTarget(null)} onConfirm={() => setResetTarget(null)} /> : null}
      {bulkDialog === "branch" ? <BulkChangeBranchModal branches={branches} users={selectedUsers} onCancel={() => setBulkDialog(null)} onConfirm={changeSelectedBranch} /> : null}
      {bulkDialog === "archive" ? <BulkArchiveModal users={selectedUsers} onCancel={() => setBulkDialog(null)} onConfirm={archiveSelectedUsers} /> : null}
      {userToArchive ? (
        <ArchiveUserModal
          user={userToArchive}
          onCancel={() => setUserToArchive(null)}
          onConfirm={archiveUser}
        />
      ) : null}
      {archivedUserName ? (
        <Toast name={archivedUserName} onDismiss={() => setArchivedUserName("")} />
      ) : null}
      {branchChangeMessage ? <SuccessToast message={branchChangeMessage} onDismiss={() => setBranchChangeMessage("")} /> : null}
    </div>
  )
}

function UserDialog({ branches, dialog, onCancel, onChange, onReset, onSave, users }) {
  const isView = dialog.mode === "view"
  const form = dialog.form
  const [setupMethod, setSetupMethod] = useState("invite")
  const update = (name, value) => {
    const nextForm = { ...form, [name]: value }

    if (name === "role") {
      nextForm.branch = ""
      nextForm.branchId = ""
    }

    onChange(nextForm)
  }

  if (isView) {
    return (
      <ModalShell title="User Details" onCancel={onCancel} maxWidth="max-w-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 pr-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f2fbf7] text-lg font-bold text-[#0b6b51]">
                {getInitials(form.name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-xl font-bold text-slate-900">{form.name}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{form.role} <span className="px-1 text-slate-300">•</span> {getBranchName(form.branch)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{form.employeeId}</p>
              </div>
            </div>
            <StatusBadge status={form.status} />
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2 md:divide-x md:divide-slate-100">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">User Information</h3>
            <div className="mt-3 divide-y divide-slate-100">
              <DetailRow label="Email" value={form.email} />
              <DetailRow label="Contact Number" value={form.contact} />
              <DetailRow label="Assigned Branch" value={getBranchName(form.branch)} />
              <DetailRow label="Created On" value={form.createdOn} />
            </div>
          </section>
          <section className="md:pl-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Access &amp; Account</h3>
              <p className="mt-3 text-sm font-semibold text-slate-700">Role: {form.role}</p>
              <p className="mt-1 text-xs text-slate-500">Permissions inherited from {form.role} role</p>
              <div className="flex flex-wrap gap-2">
                {(permissionSets[form.role] ?? []).map((permission) => (
                  <span key={permission} className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0b6b51]">
                    {permission}
                  </span>
                ))}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Last Login</p><p className="mt-2 text-sm font-bold text-slate-900">{form.lastLoginDate && form.lastLoginDate !== "-" ? `${form.lastLoginDate} ${form.lastLoginTime ?? ""}` : "Never"}</p></div>
          </section>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title={dialog.mode === "create" ? "Add User" : "Edit User"} onCancel={onCancel} maxWidth="max-w-3xl" showClose={dialog.mode === "edit"}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(form)
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DialogField label="Full Name">
            <input required value={form.name} onChange={(event) => update("name", event.target.value)} className={dialogInputClass} />
          </DialogField>
          <DialogField label="Employee ID">
            <input required readOnly value={form.employeeId} className={`${dialogInputClass} cursor-not-allowed bg-slate-50 text-slate-500`} />
            <span className="mt-1 block text-xs text-slate-400">Auto-generated</span>
          </DialogField>
          <DialogField label="Email">
            <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={dialogInputClass} />
          </DialogField>
          <DialogField label="Contact Number">
            <input required inputMode="numeric" maxLength={11} minLength={11} pattern="[0-9]{11}" title="Enter exactly 11 digits." value={form.contact} onChange={(event) => update("contact", event.target.value.replace(/\D/g, "").slice(0, 11))} className={dialogInputClass} />
          </DialogField>
          <DialogField label="Role">
            <select value={form.role} onChange={(event) => update("role", event.target.value)} className={dialogInputClass}>
              {["Branch Admin", "Cashier"].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </DialogField>
          <DialogField label="Assigned Branch" optional={form.role === "Branch Admin"} required={form.role === "Cashier"}>
            <select
              required={form.role !== "Branch Admin"}
              value={form.branchId ?? ""}
              onChange={(event) => update("branchId", event.target.value)}
              className={dialogInputClass}
            >
              <option value="">{form.role === "Branch Admin" ? "Not Assigned" : "Select Branch"}</option>
              {branches.map((branch) => {
                const assignedAdministrator = users.find((user) => user.id !== form.id && user.role === "Branch Admin" && user.status === "Active" && user.branchId === branch.id)
                const unavailable = form.role === "Branch Admin" && Boolean(assignedAdministrator)
                return <option key={branch.id} value={branch.id} disabled={unavailable}>{branch.shortName ?? branch.name}{form.role === "Branch Admin" ? (unavailable ? ` — ${assignedAdministrator.name} assigned` : " — Available") : ""}</option>
              })}
            </select>
            <span className="mt-1 block text-xs font-medium text-slate-400">{form.role === "Branch Admin" ? "Assign this administrator to a branch now, or leave unassigned and assign later." : "A branch is required for Cashier accounts."}</span>
          </DialogField>
        </div>
        {dialog.mode === "create" ? <section className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-sm font-bold text-slate-900">Account Setup</h3><div className="mt-3 flex flex-wrap gap-5 text-sm font-semibold text-slate-700"><label className="flex items-center gap-2"><input type="radio" checked={setupMethod === "invite"} onChange={() => setSetupMethod("invite")} />Send account invitation</label><label className="flex items-center gap-2"><input type="radio" checked={setupMethod === "password"} onChange={() => setSetupMethod("password")} />Create temporary password</label></div>{setupMethod === "password" ? <div className="mt-4 max-w-sm"><DialogField label="Temporary Password"><div className="flex gap-2"><input value={form.temporaryPassword ?? ""} onChange={(event) => update("temporaryPassword", event.target.value)} className={dialogInputClass} /><button type="button" onClick={() => update("temporaryPassword", generatePassword())} className="rounded-lg border border-slate-200 px-4 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50">Generate</button></div></DialogField></div> : null}</section> : <section className="mt-5 flex items-center justify-between gap-4 border-y border-slate-100 py-4"><div><h3 className="text-sm font-bold text-slate-900">Account Security</h3><p className="mt-1 text-xs font-medium text-slate-500">Manage this user&apos;s account password. Passwords cannot be viewed.</p></div><button type="button" onClick={() => onReset(form)} className="h-10 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-bold text-[#0b6b51] transition hover:border-[#0b6b51]/40 hover:bg-emerald-50">Reset Password</button></section>}
        <div className="mt-6 flex justify-end gap-3">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <button type="submit" className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]">
            {dialog.mode === "create" ? "Add User" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ModalShell({ children, maxWidth = "max-w-xl", onCancel, showClose = true, title }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 sm:p-4 lg:pl-[226px] xl:pl-[266px]">
      <button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close dialog" />
      <section className={`relative max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6`}>
        {showClose ? <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
          <HiXMark className="h-5 w-5" />
        </button> : null}
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  )
}

function ResetPasswordModal({ onCancel, onConfirm, user }) {
  const [method, setMethod] = useState("link")
  const [password, setPassword] = useState("")
  const [requireChange, setRequireChange] = useState(true)
  const canContinue = method === "link" || Boolean(password)
  return <ModalShell title="Reset Password" onCancel={onCancel} maxWidth="max-w-md"><p className="text-sm font-semibold text-slate-900">Reset the password for {user.name}?</p><p className="mt-1 text-sm text-slate-500">Choose how to reset the account password.</p><div className="mt-4 space-y-2"><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3"><input type="radio" name="reset-method" checked={method === "link"} onChange={() => setMethod("link")} className="mt-1" /><span><span className="block text-sm font-bold text-slate-800">Send password reset link</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">A reset link will be sent to {user.email}.</span></span></label><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3"><input type="radio" name="reset-method" checked={method === "temporary"} onChange={() => setMethod("temporary")} className="mt-1" /><span className="text-sm font-bold text-slate-800">Create temporary password</span></label></div>{method === "temporary" ? <div className="mt-4"><DialogField label="New Temporary Password"><div className="flex gap-2"><input type="text" value={password} onChange={(event) => setPassword(event.target.value)} className={dialogInputClass} /><button type="button" onClick={() => setPassword(generatePassword())} className="rounded-lg border border-slate-200 px-4 text-sm font-bold text-[#0b6b51] hover:bg-emerald-50">Generate</button></div></DialogField><label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={requireChange} onChange={(event) => setRequireChange(event.target.checked)} />Require password change on next login</label></div> : null}<div className="mt-6 flex justify-end gap-3"><SecondaryButton onClick={onCancel}>Cancel</SecondaryButton><button type="button" disabled={!canContinue} onClick={() => onConfirm(method === "link" ? { method, email: user.email } : { method, password, requireChange })} className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348] disabled:bg-slate-300">Continue</button></div></ModalShell>
}

function ArchiveUserModal({ onCancel, onConfirm, user }) {
  const [reason, setReason] = useState("")

  return (
    <ModalShell title="Archive User" onCancel={onCancel} maxWidth="max-w-md">
      <div className="space-y-2 text-sm leading-6 text-slate-600">
        <p>Are you sure you want to archive <strong className="text-slate-900">{user.name}</strong>?</p>
        {user.role === "Branch Admin" && user.branchId ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>{user.name}</strong> is currently the Branch Administrator of <strong>{getBranchName(user.branch)}</strong>. Archiving this user will leave that branch without an assigned administrator.</p> : null}
        <p>The user will lose access to the system. Their record will be retained and can be restored later.</p>
      </div>
      <label className="mt-4 block text-left">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Reason <span className="font-normal text-slate-400">(Optional)</span></span>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Enter reason for archiving..." />
      </label>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <button type="button" onClick={() => onConfirm(reason.trim())} className="h-11 rounded-lg bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700">
          Archive User
        </button>
      </div>
    </ModalShell>
  )
}

function BulkChangeBranchModal({ branches, onCancel, onConfirm, users }) {
  const [branchId, setBranchId] = useState("")
  const canChangeBranch = users.length > 0 && users.every((user) => user.role === "Cashier")

  return <ModalShell title="Change Branch" onCancel={onCancel} maxWidth="max-w-md">
    <p className="text-sm leading-6 text-slate-600">Move {users.length} selected user{users.length === 1 ? "" : "s"} to another branch.</p>
    {!canChangeBranch ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900"><strong>Change Branch is only available when all selected users are Cashiers.</strong> Branch Administrator assignments must be managed individually.</div> : null}
    <label className="mt-5 block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Assigned Branch</span>
      <select value={branchId} disabled={!canChangeBranch} onChange={(event) => setBranchId(event.target.value)} className={dialogInputClass}>
        <option value="">Select Branch</option>
        {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.shortName ?? branch.name}</option>)}
      </select>
    </label>
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><SecondaryButton onClick={onCancel}>Cancel</SecondaryButton><button type="button" disabled={!canChangeBranch || !branchId} onClick={() => onConfirm(branchId)} className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white hover:bg-[#005348] disabled:cursor-not-allowed disabled:bg-slate-300">Update Branch</button></div>
  </ModalShell>
}

function BulkArchiveModal({ onCancel, onConfirm, users }) {
  const count = users.length
  const assignedAdministrators = users.filter((user) => user.role === "Branch Admin" && user.branchId)

  return <ModalShell title={`Archive ${count} User${count === 1 ? "" : "s"}?`} onCancel={onCancel} maxWidth="max-w-md">
    <p className="text-sm leading-6 text-slate-600">{count} selected user account{count === 1 ? "" : "s"} will lose access to the system. Their records will be retained for audit purposes and can be restored later.</p>
    {assignedAdministrators.length ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-amber-900"><p className="text-xs font-extrabold uppercase tracking-wide">Warning</p><div className="mt-2 space-y-2 text-sm leading-5">{assignedAdministrators.map((user) => <p key={user.id}><strong>{user.name}</strong> is currently the Branch Administrator of <strong>{getBranchName(user.branch)}</strong>. Archiving this user will leave that branch without an assigned Branch Administrator.</p>)}</div></div> : null}
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><SecondaryButton onClick={onCancel}>Cancel</SecondaryButton><button type="button" onClick={onConfirm} className="h-11 rounded-lg bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700">Archive {count} User{count === 1 ? "" : "s"}</button></div>
  </ModalShell>
}

function Toast({ name, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <div role="status" className="fixed bottom-5 right-5 z-[70] flex w-[min(430px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
      <HiOutlineCheckCircle className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-emerald-700">User Archived Successfully</p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{name} has been moved to Archives and can be restored later.</p>
      </div>
      <button type="button" onClick={onDismiss} className="text-xl leading-none text-slate-400 hover:text-slate-700" aria-label="Dismiss notification">
        &times;
      </button>
    </div>
  )
}

function SuccessToast({ message, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return <div role="status" className="fixed bottom-5 right-5 z-[100] flex w-[min(430px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
    <HiOutlineCheckCircle className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
    <div className="min-w-0 flex-1"><p className="font-bold text-emerald-700">Branch Changed Successfully</p><p className="mt-1 text-sm leading-5 text-slate-600">{message}</p></div>
    <button type="button" onClick={onDismiss} className="text-xl leading-none text-slate-400 hover:text-slate-700" aria-label="Dismiss notification">&times;</button>
  </div>
}

function RoleBadge({ role }) {
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${roleBadgeStyles[role]}`}>{role}</span>
}

function StatusBadge({ status }) {
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusBadgeStyles[status] ?? statusBadgeStyles.Archived}`}>{status}</span>
}

const dialogInputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b6b51] disabled:bg-slate-50 disabled:text-slate-600"

function DialogField({ children, label, optional = false, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700"><span>{label}{required ? <span className="text-red-500"> *</span> : null}</span>{optional ? <span className="text-xs font-medium text-slate-400">Optional</span> : null}</span>
      {children}
    </label>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
      <span className="font-medium text-slate-500">{label}</span>
      <div className="break-words font-semibold text-slate-900 sm:text-right">{value}</div>
    </div>
  )
}

function SecondaryButton({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50">
      {children}
    </button>
  )
}

function UserActionMenu({ menu, onArchive, onEdit, onOverview }) {
  return (
    <div
      role="menu"
      onMouseDown={(event) => event.stopPropagation()}
      className="fixed z-[100] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
      style={{ right: menu.right, top: menu.top, bottom: menu.bottom }}
    >
      <MenuAction icon={HiOutlineEye} label="Overview" onClick={() => onOverview(menu.user)} />
      <MenuAction icon={HiOutlinePencilSquare} label="Edit" onClick={() => onEdit(menu.user)} />
      <MenuAction danger icon={HiOutlineArchiveBox} label="Archive" onClick={() => onArchive(menu.user)} />
    </div>
  )
}

function MenuAction({ danger = false, icon: Icon, label, onClick }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#0b6b51]"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button>
}

function PageButton({ active, children, disabled, label, onClick }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold transition ${active ? "bg-[#00675b] text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-[#0b6b51]/40 hover:text-[#0b6b51]"} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500`} aria-label={label} aria-current={active ? "page" : undefined}>
      {children}
    </button>
  )
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getBranchName(branch) {
  if (!branch) return "Not Assigned"
  return branch === "All Branches" ? branch : branch.replace(/ Branch$/, "")
}

function getPaginationItems(currentPage, pageCount) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1])
  if (currentPage <= 3) [2, 3, 4].forEach((page) => pages.add(page))
  if (currentPage >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((page) => pages.add(page))

  const visiblePages = [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)
  return visiblePages.flatMap((page, index) => {
    if (index === 0 || page === visiblePages[index - 1] + 1) return [page]
    return ["ellipsis", page]
  })
}

function getHighestEmployeeIdNumber(employeeIds) {
  return employeeIds.reduce((highest, employeeId) => {
    const match = /^EMP-(\d+)$/i.exec(String(employeeId).trim())
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
}

function getNextEmployeeId(users, archivedUsers) {
  const employeeIds = [
    ...users.map((user) => user.employeeId),
    ...archivedUsers.map((record) => record.user?.employeeId),
  ].filter(Boolean)
  const usedIds = new Set(employeeIds.map((employeeId) => String(employeeId).toUpperCase()))
  let nextIdNumber = getHighestEmployeeIdNumber(employeeIds) + 1
  let nextEmployeeId = `EMP-${String(nextIdNumber).padStart(4, "0")}`

  while (usedIds.has(nextEmployeeId)) {
    nextIdNumber += 1
    nextEmployeeId = `EMP-${String(nextIdNumber).padStart(4, "0")}`
  }
  return nextEmployeeId
}

function BranchDisplay({ compact = false, user }) {
  if (user.role === "Branch Admin" && !user.branchId) return <span className={compact ? "font-bold text-amber-700" : "inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"}>Not Assigned</span>
  return <span>{getBranchName(user.branch)}</span>
}

function normalizeBranchName(value = "") {
  return value.toLowerCase().replace(/\(main branch\)|\bbranch\b/g, "").replace(/\s+/g, " ").trim()
}

function generatePassword() {
  return `Lyfe-${Math.random().toString(36).slice(2, 8)}!`
}

function PasswordResetRequestDetails({ onClose, onComplete, onReject, request }) {
  const [step, setStep] = useState("details")
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const pending = request.status === "Pending"
  const role = request.role === "admin" ? "Branch Admin" : "Cashier"
  if (step === "reset") return <ResetRequestShell title="Reset Password" onClose={onClose}><h3 className="font-bold text-slate-950">{request.fullName}</h3><p className="mt-1 text-sm text-slate-500">{request.employeeId}</p><p className="mt-5 text-sm leading-6 text-slate-600">A temporary password will be generated. The user will be required to create a new password after signing in.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setStep("details")} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold">Cancel</button><button type="button" onClick={() => { const password = onComplete(request); setTemporaryPassword(password); setStep("success") }} className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white">Generate Temporary Password</button></div></ResetRequestShell>
  if (step === "reject") return <ResetRequestShell title="Reject Password Reset Request?" onClose={onClose}><h3 className="font-bold text-slate-950">{request.fullName}</h3><p className="mt-1 text-sm text-slate-500">{request.employeeId}</p><p className="mt-5 text-sm leading-6 text-slate-600">This request will be marked as rejected. The user&apos;s current password and account will not be changed.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setStep("details")} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold">Cancel</button><button type="button" onClick={() => { onReject(request); onClose() }} className="h-11 rounded-lg bg-red-600 px-5 text-sm font-bold text-white">Reject Request</button></div></ResetRequestShell>
  if (step === "success") return <ResetRequestShell title="Password Reset Successful" onClose={onClose}><h3 className="font-bold text-slate-950">{request.fullName}</h3><p className="mt-1 text-sm text-slate-500">{request.employeeId}</p><label className="mt-5 block text-sm font-bold text-slate-700">Temporary Password<div className="mt-2 flex h-11 items-center rounded-lg border border-slate-200 px-3"><span className="min-w-0 flex-1 font-mono">{visible ? temporaryPassword : "•".repeat(temporaryPassword.length)}</span><button type="button" onClick={() => setVisible((value) => !value)} className="text-xs font-bold text-[#00675b]">{visible ? "Hide" : "Show"}</button></div></label><button type="button" onClick={() => navigator.clipboard?.writeText(temporaryPassword)} className="mt-3 text-sm font-bold text-[#00675b]">Copy Temporary Password</button><p className="mt-4 text-sm leading-6 text-slate-500">The user must create a new password after signing in with this temporary password.</p><div className="mt-6 flex justify-end"><button type="button" onClick={onClose} className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white">Done</button></div></ResetRequestShell>
  return <ResetRequestShell title="Password Reset Request" onClose={onClose}><div className="border-b border-slate-100 pb-4"><h3 className="text-lg font-bold text-slate-950">{request.fullName}</h3><p className="mt-1 font-semibold text-slate-700">{request.employeeId}</p><p className="mt-1 text-sm text-slate-500">{role} • {request.branchName}</p></div><h4 className="mt-5 text-xs font-bold uppercase text-slate-500">Account Information</h4><dl className="mt-2 divide-y divide-slate-100 text-sm">{[["Email", request.email], ["Account Status", "Active"], ["Requested", new Date(request.requestedAt).toLocaleString()], ["Request Status", request.status], ...(request.completedAt ? [["Processed", new Date(request.completedAt).toLocaleString()], ["Processed By", request.processedBy]] : [])].map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] gap-4 py-3"><dt className="text-slate-500">{label}</dt><dd className="font-bold text-slate-900">{value}</dd></div>)}</dl>{pending ? <div className="mt-6 flex justify-between gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setStep("reject")} className="h-11 rounded-lg px-4 text-sm font-bold text-red-600 hover:bg-red-50">Reject Request</button><button type="button" onClick={() => setStep("reset")} className="h-11 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white">Reset Password</button></div> : null}</ResetRequestShell>
}

function ResetRequestShell({ children, onClose, title }) { return <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 p-4 lg:pl-[226px] xl:pl-[266px]"><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-slate-950">{title}</h2><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><HiXMark className="h-5 w-5" /></button></div><div className="mt-5">{children}</div></section></div> }

function PasswordResetRequestsModal({ onClose, onComplete, onReject, requests }) {
  const [status, setStatus] = useState("Pending")
  const visible = requests.filter((request) => request.status === status)
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 lg:pl-[226px] xl:pl-[266px]"><section className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-950">Password Reset Requests</h2><p className="mt-1 text-sm text-slate-500">Review account recovery requests without viewing existing passwords.</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><HiXMark className="h-5 w-5" /></button></div><div className="mt-5 flex gap-2">{["Pending", "Completed", "Rejected"].map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-lg px-4 py-2 text-sm font-bold ${status === item ? "bg-[#00675b] text-white" : "bg-slate-100 text-slate-600"}`}>{item}</button>)}</div><div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Employee ID</th><th className="px-4 py-3">Role / Branch</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{visible.length ? visible.map((request) => <tr key={request.id} className="border-t border-slate-100"><td className="px-4 py-3"><p className="font-bold text-slate-900">{request.fullName}</p><p className="text-xs text-slate-500">{request.email}</p></td><td className="px-4 py-3 font-semibold">{request.employeeId}</td><td className="px-4 py-3"><p>{request.role === "admin" ? "Branch Admin" : "Cashier"}</p><p className="text-xs text-slate-500">{request.branchName}</p></td><td className="px-4 py-3">{new Date(request.requestedAt).toLocaleString()}</td><td className="px-4 py-3">{request.status === "Pending" ? <div className="flex gap-2"><button type="button" onClick={() => onComplete(request)} className="rounded-lg bg-[#00675b] px-3 py-2 text-xs font-bold text-white">Reset Password</button><button type="button" onClick={() => onReject(request)} className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Reject</button></div> : <span className="font-bold text-slate-500">{request.status}</span>}</td></tr>) : <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No {status.toLowerCase()} requests.</td></tr>}</tbody></table></div></div></section></div>
}

export default SuperAdminUsers



