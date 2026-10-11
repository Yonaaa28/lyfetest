import { useEffect, useState } from "react"
import {
  HiBars3,
  HiCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2"

import SuperAdminDashboard from "./modules/dashboard/SuperAdminDashboard"
import SuperAdminBranches from "./modules/branches/SuperAdminBranches"
import BranchDetails from "./modules/branches/BranchDetails"
import EditBranch from "./modules/branches/EditBranch"
import AddBranch from "./modules/branches/AddBranch"
import { superAdminBranches } from "./modules/branches/branchData"
import { initialSuperAdminUsers } from "./modules/users/userData"
import SuperAdminProfile from "./modules/profile/SuperAdminProfile"
import SuperAdminSettings from "./modules/settings/SuperAdminSettings"
import SuperAdminUsers from "./modules/users/SuperAdminUsers"
import SuperAdminInventory from "./modules/inventory/SuperAdminInventory"
import SuperAdminPurchaseRequests from "./modules/purchase_requests/SuperAdminPurchaseRequests"
import SuperAdminSalesAnalytics from "./modules/sales_analytics/SuperAdminSalesAnalytics"
import SuperAdminSuppliers from "./modules/suppliers/SuperAdminSuppliers"
import SuperAdminDiscounts from "./modules/discounts/SuperAdminDiscounts"
import SuperAdminMasterData from "./modules/master_data/SuperAdminMasterData"
import SuperAdminNotificationDropdown from "./shared/SuperAdminNotificationDropdown"
import SuperAdminProfileMenu from "./shared/SuperAdminProfileMenu"
import SuperAdminSidebar from "./shared/SuperAdminSidebar"
import { superAdminNavigationItems } from "./shared/superAdminNavigation"

const getStoredSuperAdminPage = (userId) => {
  if (typeof window === "undefined") return "dashboard"

  const storageKey = `lyfe-superadmin-active-page-${userId ?? "default"}`
  const storedPage = window.localStorage.getItem(storageKey)
  const validPages = [
    ...superAdminNavigationItems.map((item) => item.id),
    "my-profile",
    "settings",
  ]

  return validPages.includes(storedPage) ? storedPage : "dashboard"
}

const getStoredRecords = (storageKey) => {
  if (typeof window === "undefined") return []

  try {
    const storedRecords = JSON.parse(window.localStorage.getItem(storageKey))
    return Array.isArray(storedRecords) ? storedRecords : []
  } catch {
    return []
  }
}

const normalizeBranchName = (value = "") => value
  .toLowerCase()
  .replace(/\(main branch\)|\bbranch\b/g, "")
  .replace(/\s+/g, " ")
  .trim()

function SuperAdminModule({ currentUser, onLogout }) {
  const activePageStorageKey = `lyfe-superadmin-active-page-${
    currentUser?.id ?? "default"
  }`
  const [activeItemId, setActiveItemId] = useState(() =>
    getStoredSuperAdminPage(currentUser?.id)
  )
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [isEditingBranch, setIsEditingBranch] = useState(false)
  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [branchRecords, setBranchRecords] = useState(() => superAdminBranches)
  const [archivedBranches, setArchivedBranches] = useState([])
  const usersStorageKey = `lyfe-superadmin-users-${currentUser?.id ?? "default"}`
  const archivedUsersStorageKey = `lyfe-superadmin-archived-users-${
    currentUser?.id ?? "default"
  }`
  const [userRecords, setUserRecords] = useState(() => {
    const storedUsers = getStoredRecords(usersStorageKey)
    return (storedUsers.length ? storedUsers : initialSuperAdminUsers).map((user) => {
      if (user.branchId || user.branch === "All Branches") return user
      const assignedBranch = superAdminBranches.find((branch) =>
        normalizeBranchName(user.branch) === normalizeBranchName(branch.name) || normalizeBranchName(user.branch) === normalizeBranchName(branch.shortName)
      )
      return assignedBranch ? { ...user, branchId: assignedBranch.id, branch: assignedBranch.name } : user
    })
  })
  const [archivedUsers, setArchivedUsers] = useState(() =>
    getStoredRecords(archivedUsersStorageKey)
  )
  const [archivedMasterRecords, setArchivedMasterRecords] = useState([])
  const [archivedInventoryItems, setArchivedInventoryItems] = useState([])
  const [archivedBundles, setArchivedBundles] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState("general")
  const [passwordResetRequestToOpen, setPasswordResetRequestToOpen] = useState(null)
  const [superAdminProfile, setSuperAdminProfile] = useState({
    fullName: "Super Admin",
    email: "admin@lyfepharmacy.com",
    username: "superadmin",
    contact: "09123456789",
    photo: "",
  })
  const passwordStorageKey = `lyfe-password-${
    currentUser?.id ?? "user-superadmin-001"
  }`
  const [accountPassword, setAccountPassword] = useState(
    () =>
      window.localStorage.getItem(passwordStorageKey) ??
      currentUser?.password ??
      "1234"
  )

  useEffect(() => {
    if (!successMessage) return undefined
    const timer = window.setTimeout(() => setSuccessMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    window.localStorage.setItem(usersStorageKey, JSON.stringify(userRecords))
  }, [userRecords, usersStorageKey])

  useEffect(() => {
    window.localStorage.setItem(
      archivedUsersStorageKey,
      JSON.stringify(archivedUsers)
    )
  }, [archivedUsers, archivedUsersStorageKey])

    const pagesWithOwnHeader = [
    "branches",
    "users",
    "inventory-control",
    "purchase-requests",
    "sales-analytics",
    "suppliers",
    "bundle-management",
    "discounts",
    "master-data",
    "settings",
    "my-profile",
  ]
  const pageHasOwnHeader = pagesWithOwnHeader.includes(activeItemId) && !selectedBranchId
  const shouldShowTopbar = !pageHasOwnHeader

  const shouldScrollPageHeader = [
    "branches",
    "users",
    "inventory-control",
    "purchase-requests",
    "sales-analytics",
    "suppliers",
    "bundle-management",
    "discounts",
    "master-data",
    "settings",
    "my-profile",
  ].includes(activeItemId)

  const setStoredActiveItemId = (itemId) => {
    window.localStorage.setItem(activePageStorageKey, itemId)
    setActiveItemId(itemId)
  }

  const requestLogout = () => {
    setIsMobileSidebarOpen(false)
    setIsLogoutModalOpen(true)
  }

  const handleLogout = () => {
    window.localStorage.removeItem(activePageStorageKey)
    setIsLogoutModalOpen(false)
    onLogout?.()
  }

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileSidebarOpen])

  const handleItemSelect = (itemId) => {
    setSelectedBranchId(null)
    setIsEditingBranch(false)
    setIsAddingBranch(false)
    if (
      ["system-settings", "audit-logs", "backup-restore"].includes(itemId)
    ) {
      const settingsTabByLegacyId = {
        "system-settings": "general",
        "audit-logs": "audit-logs",
        "backup-restore": "archives",
      }
      setActiveSettingsTab(settingsTabByLegacyId[itemId])
      setStoredActiveItemId("settings")
    } else {
      setStoredActiveItemId(itemId)
    }
    setIsMobileSidebarOpen(false)
  }

  const branchAdminById = new Map()
  userRecords.forEach((user) => {
    if (user.role !== "Branch Admin" || user.status !== "Active") return
    const assignedBranch = branchRecords.find((branch) =>
      user.branchId === branch.id || normalizeBranchName(user.branch) === normalizeBranchName(branch.name) || normalizeBranchName(user.branch) === normalizeBranchName(branch.shortName)
    )
    if (assignedBranch && !branchAdminById.has(assignedBranch.id)) branchAdminById.set(assignedBranch.id, user)
  })
  const synchronizedBranchRecords = branchRecords.map((branch) => {
    const administrator = branchAdminById.get(branch.id)
    return {
      ...branch,
      admin: administrator?.name ?? null,
      email: administrator?.email ?? "",
      contact: administrator?.contact ?? "",
      administratorId: administrator?.id ?? null,
    }
  })
  const selectedBranch = synchronizedBranchRecords.find(
    (branch) => branch.id === selectedBranchId
  )
  const eligibleBranchAdministrators = userRecords.filter(
    (user) => user.role === "Branch Admin" && user.status === "Active" && ![...branchAdminById.values()].some(
      (administrator) => administrator.id === user.id
    )
  )

  const handleViewBranch = (branchId) => {
    setIsAddingBranch(false)
    setSelectedBranchId(branchId)
    setIsEditingBranch(false)
    setStoredActiveItemId("branches")
  }

  const handleEditBranch = (branchId) => {
    setSelectedBranchId(branchId)
    setIsEditingBranch(true)
    setStoredActiveItemId("branches")
  }

  const handleBackToBranches = () => {
    setSelectedBranchId(null)
    setIsEditingBranch(false)
    setIsAddingBranch(false)
    setStoredActiveItemId("branches")
  }

  const handleAddBranch = () => {
    setSelectedBranchId(null)
    setIsEditingBranch(false)
    setIsAddingBranch(true)
    setStoredActiveItemId("branches")
  }

  const handleCreateBranch = (branch) => {
    const { administratorId, ...branchRecord } = branch
    setBranchRecords((currentBranches) => [...currentBranches, branchRecord])
    if (administratorId) {
      setUserRecords((currentUsers) => currentUsers.map((user) =>
        user.id === administratorId ? { ...user, branchId: branch.id, branch: branch.name } : user
      ))
    }
    setIsAddingBranch(false)
    setSelectedBranchId(null)
    setSuccessMessage("Branch added successfully.")
  }

  const handleAssignBranchAdministrator = (branchId, administrator) => {
    const branch = branchRecords.find((record) => record.id === branchId)
    if (!branch) return
    setUserRecords((currentUsers) => currentUsers.map((user) =>
      user.id === administrator.id ? { ...user, branchId, branch: branch.name } : user
    ))
    setSuccessMessage("Branch Administrator assigned successfully.")
  }

  const handleBackToBranchDetails = () => {
    setIsEditingBranch(false)
  }

  const handleSaveBranch = (updatedBranch) => {
    setBranchRecords((currentBranches) =>
      currentBranches.map((branch) =>
        branch.id === updatedBranch.id ? updatedBranch : branch
      )
    )
    setIsEditingBranch(false)
    setSuccessMessage("Branch changes saved successfully.")
  }

  const handleDeactivateBranch = (branchId, reason) => {
    const branch = branchRecords.find((record) => record.id === branchId)

    if (!branch || branch.status === "Inactive") {
      return
    }

    setBranchRecords((currentBranches) =>
      currentBranches.map((record) =>
        record.id === branchId ? { ...record, status: "Inactive" } : record
      )
    )
    setArchivedBranches((currentRecords) => [
      ...currentRecords.filter((record) => record.branchId !== branchId),
      {
        branchId,
        branchName: branch.name,
        branchCode: branch.code,
        branchAdmin: branch.admin,
        dateDeactivated: "June 14, 2026",
        deactivatedBy: "Super Admin",
        reason,
      },
    ])
  }

  const handleRestoreBranch = (branchId) => {
    setBranchRecords((currentBranches) =>
      currentBranches.map((record) =>
        record.id === branchId ? { ...record, status: "Active" } : record
      )
    )
    setArchivedBranches((currentRecords) =>
      currentRecords.filter((record) => record.branchId !== branchId)
    )
  }

  const handlePasswordChange = (newPassword) => {
    setAccountPassword(newPassword)
    window.localStorage.setItem(passwordStorageKey, newPassword)
  }

  const handleArchiveUser = (user, reason) => {
    setUserRecords((currentUsers) =>
      currentUsers.filter((record) => record.id !== user.id)
    )
    setArchivedUsers((currentRecords) => [
      ...currentRecords.filter((record) => record.user.id !== user.id),
      {
        user: { ...user, status: "Inactive" },
        dateDeactivated: "June 15, 2026",
        deactivatedBy: "Super Admin",
        reason,
      },
    ])
    setActiveSettingsTab("archives")
    setStoredActiveItemId("settings")
    setSuccessMessage(`${user.name} was archived and moved to Archives.`)
  }

  const handleArchiveInventoryItem = (item) => {
    setArchivedInventoryItems((currentRecords) => [
      ...currentRecords.filter((record) => record.code !== item.code),
      {
        code: item.code,
        name: item.name,
        genericName: item.genericName,
        category: item.category,
        totalStock: item.totalStock ?? 0,
        dateArchived: "June 27, 2026",
        archivedBy: "Super Admin",
        reason: "Archived from Inventory Control",
      },
    ])
    setSuccessMessage(`${item.name} was archived and moved to Archives.`)
  }


  const handleArchiveBundle = (bundle) => {
    setArchivedBundles((currentRecords) => [
      ...currentRecords.filter((record) => record.id !== bundle.id),
      {
        id: bundle.id,
        name: bundle.name,
        code: bundle.code,
        branch: bundle.branch,
        stock: bundle.stock,
        price: bundle.price,
        sales: bundle.sales,
        dateArchived: "June 30, 2026",
        archivedBy: "Super Admin",
        reason: "Archived from Bundle Management",
      },
    ])
    setActiveSettingsTab("archives")
    setStoredActiveItemId("settings")
    setSuccessMessage(`${bundle.name} was archived and moved to Archives.`)
  }

  const handleRestoreUser = (userId) => {
    const archivedRecord = archivedUsers.find(
      (record) => record.user.id === userId
    )
    if (!archivedRecord) return

    const previousUser = archivedRecord.user
    const previousBranch = branchRecords.find((branch) => branch.name === previousUser.branch)
    const branchAdminConflict = previousUser.role === "Branch Admin" && previousBranch?.admin && previousBranch.admin !== previousUser.name
    setUserRecords((currentUsers) => [
      ...currentUsers.filter((user) => user.id !== userId),
      { ...previousUser, status: "Active", branch: branchAdminConflict ? "Not Assigned" : previousUser.branch },
    ])
    setArchivedUsers((currentRecords) =>
      currentRecords.filter((record) => record.user.id !== userId)
    )
  }

  const handleRestoreArchivedRecord = (category, recordId) => {
    if (category === "users") { handleRestoreUser(recordId); return }
    if (category === "branches") { handleRestoreBranch(recordId); return }
    if (category === "inventory") {
      setArchivedInventoryItems((records) => records.filter((record) => (record.id ?? record.code) !== recordId))
    }
    if (category === "bundles") {
      setArchivedBundles((records) => records.filter((record) => (record.id ?? record.code) !== recordId))
    }
    if (category === "master") {
      setArchivedMasterRecords((records) => records.filter((record) => (record.id ?? record.code) !== recordId))
    }
  }

  return (
    <div className="superadmin-shell h-screen min-h-0 w-full min-w-0 overflow-hidden bg-[#f9fafc] supports-[height:100dvh]:h-dvh">
      <div
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block ${
          ["my-profile", "settings"].includes(activeItemId) ? "w-28" : "lg:w-[210px] xl:w-[250px]"
        }`}
      >
        <SuperAdminSidebar
          activeItemId={selectedBranchId ? "branches" : activeItemId}
          profileMode={["my-profile", "settings"].includes(activeItemId)}
          onItemSelect={handleItemSelect}
          onLogout={requestLogout}
        />
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative h-screen w-[min(84vw,300px)] supports-[height:100dvh]:h-dvh">
            <SuperAdminSidebar
              activeItemId={selectedBranchId ? "branches" : activeItemId}
              mobile
              onItemSelect={handleItemSelect}
              onLogout={requestLogout}
            />
          </div>
        </div>
      ) : null}

      <div
        className={`flex h-screen w-full min-w-0 flex-col supports-[height:100dvh]:h-dvh ${
          shouldScrollPageHeader ? "overflow-y-auto" : "overflow-hidden"
        } ${
          ["my-profile", "settings"].includes(activeItemId) ? "lg:pl-28" : "lg:pl-[210px] xl:pl-[250px]"
        }`}
      >
        {pageHasOwnHeader ? (
          <SuperAdminMobileTopbar
            onMenuOpen={() => setIsMobileSidebarOpen(true)}
            onBack={
              ["settings", "my-profile"].includes(activeItemId)
                ? () => handleItemSelect("dashboard")
                : undefined
            }
          />
        ) : null}

        {shouldShowTopbar ? (

        <header
          className={`z-30 flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-[#f9fafc] px-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:items-start sm:gap-4 sm:px-6 lg:border-b-0 lg:px-8 lg:shadow-none ${
            activeItemId === "dashboard" && !selectedBranchId ? "py-3 sm:py-4" : selectedBranchId ? "py-1.5" : "py-3"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:items-start sm:gap-4">
            {!selectedBranchId ? (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-[#0b6b51] transition hover:border-[#0b6b51]/30 lg:hidden"
                aria-label="Open navigation"
              >
                <HiBars3 className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            ) : null}
            {selectedBranchId ? (
              <button
                type="button"
                onClick={
                  isEditingBranch
                    ? handleBackToBranchDetails
                    : handleBackToBranches
                }
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                aria-label={
                  isEditingBranch
                    ? "Back to Branch Details"
                    : "Back to Branches"
                }
              >
                <HiOutlineArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">{isEditingBranch ? "Branch Details" : "Branches"}</span>
              </button>
            ) : null}
            {activeItemId === "dashboard" && !selectedBranchId ? (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold leading-tight text-slate-900 sm:text-3xl">
                  <span className="sm:hidden">Welcome back!</span>
                  <span className="hidden sm:inline">Welcome Back, Super Admin!</span>
                </h1>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 sm:mt-2 sm:text-sm sm:text-slate-600">
                  <span className="sm:hidden">Today's overview</span>
                  <span className="hidden sm:inline">Here's what's happening across all branches today.</span>
                </p>
              </div>
            ) : null}
          </div>
          {activeItemId === "dashboard" && !selectedBranchId ? (
            <div className="flex shrink-0 items-center gap-1.5 sm:items-start sm:gap-4">
              <SuperAdminNotificationDropdown onNavigate={(module, notification) => { if (notification?.requestId) setPasswordResetRequestToOpen(notification.requestId); handleItemSelect(module) }} />
              <button
                type="button"
                onClick={() => {
                  setActiveSettingsTab("general")
                  handleItemSelect("settings")
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] sm:h-12 sm:w-12"
                aria-label="Open settings"
                title="Settings"
              >
                <HiOutlineCog6Tooth className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <SuperAdminProfileMenu
                profile={superAdminProfile}
                onNavigate={handleItemSelect}
              />
            </div>
          ) : null}
        </header>
        ) : null}

        <main
          className={`min-w-0 flex-1 overflow-x-clip bg-[#f9fafc] ${selectedBranchId || ["settings", "my-profile"].includes(activeItemId) ? "pt-0" : activeItemId === "dashboard" ? "pt-2" : "pt-3 sm:pt-6"} ${
            shouldScrollPageHeader
              ? "min-h-fit overflow-y-visible"
              : "min-h-0 overflow-y-auto"
          }`}
        >
          {activeItemId === "dashboard" ? (
            <SuperAdminDashboard
              branchCount={branchRecords.filter((branch) => branch.status === "Active").length}
              users={userRecords.filter((user) => user.status === "Active")}
              onNavigate={handleItemSelect}
            />
          ) : null}
          {activeItemId === "branches" && !selectedBranchId ? (
            <SuperAdminBranches
              branches={synchronizedBranchRecords.filter(
                (branch) => branch.status === "Active"
              )}
              totalBranchCount={branchRecords.length}
              onAddBranch={handleAddBranch}
              onViewBranch={handleViewBranch}
            />
          ) : null}
          {activeItemId === "branches" && isAddingBranch ? (
            <AddBranch
              activeAdministratorCount={userRecords.filter((user) => user.role === "Branch Admin" && user.status === "Active").length}
              administrators={eligibleBranchAdministrators}
              existingCodes={branchRecords.map((branch) => branch.code)}
              onCancel={handleBackToBranches}
              onSave={handleCreateBranch}
            />
          ) : null}
          {activeItemId === "users" ? (
            <SuperAdminUsers
              branches={branchRecords.filter((branch) => branch.status === "Active")}
              users={userRecords}
              archivedUsers={archivedUsers}
              onArchiveUser={handleArchiveUser}
              onUsersChange={setUserRecords}
              passwordResetRequestToOpen={passwordResetRequestToOpen}
              onPasswordResetRequestOpened={() => setPasswordResetRequestToOpen(null)}
            />
          ) : null}
          {["inventory-control", "bundle-management"].includes(activeItemId) ? (
            <SuperAdminInventory initialView={activeItemId === "bundle-management" ? "bundles" : "products"} onArchiveBundle={handleArchiveBundle} onArchiveItem={handleArchiveInventoryItem} />
          ) : null}
          {activeItemId === "purchase-requests" ? (
            <SuperAdminPurchaseRequests currentUser={superAdminProfile} />
          ) : null}
          {activeItemId === "sales-analytics" ? (
            <SuperAdminSalesAnalytics />
          ) : null}
          {activeItemId === "suppliers" ? <SuperAdminSuppliers /> : null}
          {activeItemId === "discounts" ? <SuperAdminDiscounts users={userRecords} onUsersChange={setUserRecords} /> : null}
          {activeItemId === "master-data" ? (
            <SuperAdminMasterData
              onArchiveRecord={(record) => {
                setArchivedMasterRecords((currentRecords) => [
                  ...currentRecords.filter((item) => item.id !== record.id),
                  record,
                ])
                setSuccessMessage(
                  `${record.name} was deactivated and moved to Archives.`
                )
              }}
            />
          ) : null}
          {selectedBranchId && !isEditingBranch ? (
            <BranchDetails
              administrators={eligibleBranchAdministrators}
              branch={selectedBranch}
              onAssignAdministrator={handleAssignBranchAdministrator}
              onDeactivate={handleDeactivateBranch}
              onEdit={() => handleEditBranch(selectedBranchId)}
            />
          ) : null}
          {selectedBranchId && isEditingBranch ? (
            <EditBranch
              branch={selectedBranch}
              onCancel={handleBackToBranchDetails}
              onSave={handleSaveBranch}
            />
          ) : null}
          {activeItemId === "my-profile" ? (
            <SuperAdminProfile
              currentPassword={accountPassword}
              onPasswordChange={handlePasswordChange}
              profile={superAdminProfile}
              onPhotoChange={(photo) =>
                setSuperAdminProfile((current) => ({ ...current, photo }))
              }
              onSave={setSuperAdminProfile}
            />
          ) : null}
          {activeItemId === "settings" ? (
            <SuperAdminSettings
              activeTab={activeSettingsTab}
              archivedBranches={archivedBranches}
              archivedMasterRecords={archivedMasterRecords}
              archivedInventoryItems={archivedInventoryItems}
              archivedBundles={archivedBundles}
              archivedUsers={archivedUsers}
              onRestoreRecord={handleRestoreArchivedRecord}
              onTabChange={setActiveSettingsTab}
            />
          ) : null}
        </main>
      </div>

      {isLogoutModalOpen ? (
        <SuperAdminLogoutModal
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      ) : null}

      {successMessage ? (
        <button
          type="button"
          role="status"
          onClick={() => {
            setActiveSettingsTab("archives")
            setStoredActiveItemId("settings")
            setSuccessMessage("")
          }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-[70] flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-left shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:border-[#0b6b51]/40 hover:shadow-[0_22px_60px_rgba(15,23,42,0.22)] sm:left-auto sm:right-5 sm:w-[min(400px,calc(100vw-2rem))]"
        >
          <HiCheckCircle className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-700">Changes Saved</p>
            <p className="mt-1 text-sm text-slate-600">{successMessage}</p>
          </div>
          <span className="text-xl leading-none text-slate-400" aria-hidden="true">
            &times;
          </span>
        </button>
      ) : null}
    </div>
  )
}

function SuperAdminLogoutModal({ onCancel, onConfirm }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onCancel()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/55 px-3 py-[max(1rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cancel logout"
        onClick={onCancel}
      />
      <section className="relative w-[calc(100%_-_1.5rem)] max-w-[420px] rounded-2xl bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:w-full sm:max-w-[560px] sm:rounded-[28px] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 sm:hidden">
                <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
              </span>
              <h2 className="text-[22px] font-bold leading-tight text-slate-950 sm:text-2xl">Log out?</h2>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
              Are you sure you want to log out of your account?
            </p>
          </div>
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 sm:grid">
            <HiOutlineArrowRightOnRectangle className="h-6 w-6" />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-2.5 sm:mt-8 sm:flex sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 min-w-0 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:h-12 sm:rounded-xl sm:px-8"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 sm:h-12 sm:rounded-xl sm:px-8"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            Log out
          </button>
        </div>
      </section>
    </div>
  )
}

function SuperAdminMobileTopbar({ onBack, onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center border-b border-slate-200 bg-[#f9fafc]/95 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onBack ?? onMenuOpen}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-[#0b6b51] transition hover:border-[#0b6b51]/30"
        aria-label={onBack ? "Back to dashboard" : "Open navigation"}
      >
        {onBack ? <HiOutlineArrowLeft className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
      </button>
    </header>
  )
}

export default SuperAdminModule










