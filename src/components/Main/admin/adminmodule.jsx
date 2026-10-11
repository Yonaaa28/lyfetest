import { Suspense, lazy, useState } from "react"

import { getBranchById } from "../../../data/sampleAccounts"
import AdminLayout from "./shared/AdminLayout"
import { adminNavigation } from "./shared/adminNavigation"

const AdminBundle = lazy(() => import("./modules/bundle/adminbundle"))
const AdminDashboard = lazy(() => import("./modules/dashboard/admindashboard"))
const AdminDiscounts = lazy(() => import("./modules/discounts/admindiscounts"))
const AdminInventory = lazy(() => import("./modules/inventory/admininventory"))
const AdminOrders = lazy(() => import("./modules/orders/adminorders"))
const AdminProfile = lazy(() => import("./modules/profile/AdminProfile"))
const AdminPurchaseRequisition = lazy(() =>
  import("./modules/purchase_requisition/adminpurchaserequisition")
)
const AdminSalesReport = lazy(() => import("./modules/sales_report/adminsalesreport"))
const AdminSettings = lazy(() => import("./modules/settings/adminsettings"))
const BundleTopbarCards = lazy(() =>
  import("./modules/bundle/components/BundleTopbarCards").then((module) => ({
    default: module.BundleTopbarCards,
  }))
)
const DiscountsTopbarCards = lazy(() =>
  import("./modules/discounts/admindiscounts").then((module) => ({
    default: module.DiscountsTopbarCards,
  }))
)
const InventoryTopbarCards = lazy(() =>
  import("./modules/inventory/admininventory").then((module) => ({
    default: module.InventoryTopbarCards,
  }))
)
const OrdersTopbarCards = lazy(() =>
  import("./modules/orders/adminorders").then((module) => ({
    default: module.OrdersTopbarCards,
  }))
)
const PurchaseRequisitionTopbarCards = lazy(() =>
  import("./modules/purchase_requisition/adminpurchaserequisition").then(
    (module) => ({
      default: module.PurchaseRequisitionTopbarCards,
    })
  )
)
const SalesReportTopbarCards = lazy(() =>
  import("./modules/sales_report/components/SalesReportTopbarCards")
)

function AdminModuleFallback({ label = "Loading module" }) {
  return (
    <div className="grid min-h-[18rem] place-items-center rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-500 shadow-sm">
      {label}...
    </div>
  )
}

function TopbarCardsFallback() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 lg:gap-4 xl:grid-cols-4 xl:max-w-6xl">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[92px] animate-pulse rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:min-h-[112px] lg:rounded-2xl lg:p-4"
        >
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="mt-6 h-7 w-16 rounded bg-slate-100" />
          <div className="mt-3 hidden h-3 w-32 rounded bg-slate-100 lg:block" />
        </div>
      ))}
    </div>
  )
}

const getStoredAdminPage = (userId) => {
  if (typeof window === "undefined") return "dashboard"

  const storedPage = window.localStorage.getItem(
    `lyfe-admin-active-page-${userId ?? "default"}`
  )
  const validPages = [
    ...adminNavigation.map((item) => item.id),
    "my-profile",
    "settings",
  ]

  return validPages.includes(storedPage) ? storedPage : "dashboard"
}

const getInitialAdminProfile = (currentUser, branch) => ({
  accessScope: currentUser?.accessScope === "single-branch" ? "Single Branch" : "Assigned Branch",
  branchCode: branch?.code ?? "N/A",
  branchLocation: branch?.location ?? "N/A",
  branchName: branch?.name ?? "Lyfe Pharmacy Branch",
  contact: currentUser?.contact ?? "09123456789",
  email: currentUser?.email ?? "admin@lyfepharmacy.com",
  employeeId: currentUser?.employeeId ?? "EMP-0000",
  fullName: currentUser?.fullName ?? "Branch Admin",
  lastLogin: currentUser?.lastLogin ?? "May 15, 2026 - 10:30 AM",
  photo: "",
  status: currentUser?.status === "active" ? "Active" : "Inactive",
  username: currentUser?.username ?? "branch.admin",
})

function AdminModule({ currentUser, onLogout }) {
  const activePageStorageKey = `lyfe-admin-active-page-${
    currentUser?.id ?? "default"
  }`
  const [activeItemId, setActiveItemId] = useState(() =>
    getStoredAdminPage(currentUser?.id)
  )
  const [isSalesReportDetailsOpen, setIsSalesReportDetailsOpen] =
    useState(false)

  const branch = currentUser?.assignedBranchId
    ? getBranchById(currentUser.assignedBranchId)
    : null

  const [adminProfile, setAdminProfile] = useState(() =>
    getInitialAdminProfile(currentUser, branch)
  )
  const passwordStorageKey = `lyfe-password-${currentUser?.id ?? "user-admin-001"}`
  const [accountPassword, setAccountPassword] = useState(
    () =>
      window.localStorage.getItem(passwordStorageKey) ??
      currentUser?.password ??
      "1234"
  )

  const activeItem = adminNavigation.find((item) => item.id === activeItemId)
  const activeItemLabel =
    activeItem?.label ??
    (activeItemId === "settings"
      ? "Settings"
      : activeItemId === "my-profile"
        ? "My Profile"
        : "Admin")

  const handleLogout = () => {
    window.localStorage.removeItem(activePageStorageKey)
    onLogout?.()
  }

  const handleItemSelect = (itemId) => {
    setIsSalesReportDetailsOpen(false)
    window.localStorage.setItem(activePageStorageKey, itemId)
    setActiveItemId(itemId)
  }

  const handlePasswordChange = (newPassword) => {
    setAccountPassword(newPassword)
    window.localStorage.setItem(passwordStorageKey, newPassword)
  }

  const renderActiveModule = () => {
    if (activeItemId === "dashboard") {
      return (
        <AdminDashboard
          activeBranchId={branch?.id}
          onInventoryClick={() => handleItemSelect("inventory")}
        />
      )
    }

    if (activeItemId === "inventory") {
      return <AdminInventory activeBranchId={branch?.id} />
    }

    if (activeItemId === "bundle") {
      return <AdminBundle activeBranchId={branch?.id} />
    }

    if (activeItemId === "discounts") {
      return <AdminDiscounts activeBranchId={branch?.id} />
    }

    if (activeItemId === "purchase-requisition") {
      return (
        <AdminPurchaseRequisition
          activeBranchId={branch?.id}
          requestedBy={currentUser?.fullName}
        />
      )
    }

    if (activeItemId === "orders") {
      return <AdminOrders activeBranchId={branch?.id} />
    }

    if (activeItemId === "sales-report") {
      return (
        <AdminSalesReport
          activeBranchId={branch?.id}
          onDetailsModeChange={setIsSalesReportDetailsOpen}
        />
      )
    }

    if (activeItemId === "settings") {
      return <AdminSettings branch={branch} />
    }

    if (activeItemId === "my-profile") {
      return (
        <AdminProfile
          branch={branch}
          currentPassword={accountPassword}
          onPasswordChange={handlePasswordChange}
          profile={adminProfile}
          onPhotoChange={(photo) =>
            setAdminProfile((current) => ({ ...current, photo }))
          }
          onSave={setAdminProfile}
        />
      )
    }

    return <div className="p-6 text-sm font-semibold text-slate-500">Module not found.</div>
  }

  const renderTopbarContent = () => {
    const content =
      activeItemId === "inventory" ? (
        <InventoryTopbarCards activeBranchId={branch?.id} />
      ) : activeItemId === "bundle" ? (
        <BundleTopbarCards activeBranchId={branch?.id} />
      ) : activeItemId === "discounts" ? (
        <DiscountsTopbarCards activeBranchId={branch?.id} />
      ) : activeItemId === "purchase-requisition" ? (
        <PurchaseRequisitionTopbarCards activeBranchId={branch?.id} />
      ) : activeItemId === "orders" ? (
        <OrdersTopbarCards activeBranchId={branch?.id} />
      ) : activeItemId === "sales-report" && !isSalesReportDetailsOpen ? (
        <SalesReportTopbarCards activeBranchId={branch?.id} />
      ) : undefined

    return content ? (
      <Suspense fallback={<TopbarCardsFallback />}>{content}</Suspense>
    ) : undefined
  }

  return (
    <AdminLayout
      branchName={branch?.name ?? "Lyfe Pharmacy Branch"}
      activeBranchId={branch?.id}
      adminId={currentUser?.id}
      adminName={adminProfile.fullName}
      profilePhoto={adminProfile.photo}
      navigationItems={adminNavigation}
      activeItemId={activeItemId}
      activeItemLabel={activeItemLabel}
      topbarEyebrow={
        activeItemId === "orders"
          ? "Order Processing"
          : activeItemId === "my-profile"
            ? "Admin Account"
            : undefined
      }
      topbarTitle={
        activeItemId === "orders"
          ? "Approved Orders"
          : activeItemId === "my-profile"
            ? "My Profile"
            : undefined
      }
      hideTopbar={
        activeItemId === "settings" ||
        (activeItemId === "sales-report" && isSalesReportDetailsOpen)
      }
      showTopbarActions={activeItemId === "dashboard"}
      stickyTopbar={
        ![
          "inventory",
          "bundle",
          "discounts",
          "purchase-requisition",
          "orders",
          "sales-report",
        ].includes(activeItemId)
      }
      topbarContent={renderTopbarContent()}
      onItemSelect={handleItemSelect}
      onProfileClick={() => handleItemSelect("my-profile")}
      onSettingsClick={() => handleItemSelect("settings")}
      onLogout={handleLogout}
    >
      <Suspense fallback={<AdminModuleFallback label={activeItemLabel} />}>
        {renderActiveModule()}
      </Suspense>
    </AdminLayout>
  )
}

export default AdminModule
