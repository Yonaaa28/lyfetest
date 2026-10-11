import { Suspense, lazy, useEffect, useState } from "react"

import { getBranchById } from "../../../data/sampleAccounts"
import LogoutConfirmModal from "../../shared/logout/LogoutConfirmModal"
import StaffLayout from "./shared/StaffLayout"

const StaffCashier = lazy(() => import("./modules/cashier/staffcashier"))

function StaffModuleFallback() {
  return (
    <div className="grid min-h-[24rem] place-items-center rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-500 shadow-sm">
      Loading cashier...
    </div>
  )
}

function StaffModule({ currentUser, onLogout }) {
  const activePageStorageKey = `lyfe-staff-active-page-${
    currentUser?.id ?? "default"
  }`
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const branch = currentUser?.assignedBranchId
    ? getBranchById(currentUser.assignedBranchId)
    : null

  /*
    Delete when backend is ready:
    Delete getBranchById import and this sample branch lookup.

    Integration:
    Use the branch object returned from login/session instead.

    const branch = currentUser.branch

    // backendWillProvide returns:
    // currentUser with id, fullName, role, and branch { id, name }.

    // Frontend keeps:
    // passing branch.id to staff modules and branch.name to StaffLayout.
  */

  const handleLogout = () => {
    window.localStorage.removeItem(activePageStorageKey)
    setIsLogoutModalOpen(false)
    onLogout?.()
  }

  useEffect(() => {
    const handleLogoutShortcut = (event) => {
      if (event.key !== "F2" || isLogoutModalOpen) {
        return
      }

      event.preventDefault()
      setIsLogoutModalOpen(true)
    }

    window.addEventListener("keydown", handleLogoutShortcut)

    return () => {
      window.removeEventListener("keydown", handleLogoutShortcut)
    }
  }, [isLogoutModalOpen])

  return (
    <>
      <StaffLayout
        branchName={branch?.name ?? "Lyfe Pharmacy Branch"}
        staffName={currentUser?.fullName ?? "Branch Staff"}
        activeItemLabel="Cashier"
        hideTopbar
      >
        <Suspense fallback={<StaffModuleFallback />}>
          <StaffCashier
            activeBranchId={branch?.id}
            branchName={branch?.name ?? "Lyfe Pharmacy Branch"}
            cashierStationLabel={currentUser?.cashierStationLabel ?? "Cashier 1"}
            staffName={currentUser?.fullName}
            onLogoutRequest={() => setIsLogoutModalOpen(true)}
          />
        </Suspense>
      </StaffLayout>

      {isLogoutModalOpen && (
        <LogoutConfirmModal
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  )
}

export default StaffModule
