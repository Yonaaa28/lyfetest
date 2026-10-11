import { Suspense, lazy, useEffect, useRef, useState } from "react"

import Login from "./components/Login"
import { sampleAccounts, userRoles } from "./data/sampleAccounts"
import { NotificationProvider } from "./context/NotificationContext"
import LoadingScreen from "./components/shared/LoadingScreen"

const authStorageKey = "lyfe-authenticated-user-id"
const SuperAdminModule = lazy(() => import("./components/Main/superadmin/superadminmodule"))
const AdminModule = lazy(() => import("./components/Main/admin/adminmodule"))
const StaffModule = lazy(() => import("./components/Main/staff/staffmodule"))

const getStoredUser = () => {
  if (typeof window === "undefined") return null

  const storedUserId = window.localStorage.getItem(authStorageKey)
  if (!storedUserId) return null

  return (
    sampleAccounts.find(
      (account) => account.id === storedUserId && account.status === "active"
    ) ?? null
  )
}

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(getStoredUser)
  const [isEnteringModule, setIsEnteringModule] = useState(false)
  const loginTransitionTimerRef = useRef(null)

  useEffect(() => () => {
    if (loginTransitionTimerRef.current) {
      window.clearTimeout(loginTransitionTimerRef.current)
    }
  }, [])

  const handleLogin = (user, onLoaded) => {
    window.localStorage.setItem(authStorageKey, user.id)
    setAuthenticatedUser(user)
    setIsEnteringModule(true)
    loginTransitionTimerRef.current = window.setTimeout(() => {
      setIsEnteringModule(false)
      loginTransitionTimerRef.current = null
      window.setTimeout(() => onLoaded?.(), 0)
    }, 900)
  }

  const handleLogout = () => {
    if (loginTransitionTimerRef.current) {
      window.clearTimeout(loginTransitionTimerRef.current)
      loginTransitionTimerRef.current = null
    }
    window.localStorage.removeItem(authStorageKey)
    setIsEnteringModule(false)
    setAuthenticatedUser(null)
  }

  const loadingMessage = authenticatedUser?.role === userRoles.SUPERADMIN
    ? "Loading super admin"
    : authenticatedUser?.role === userRoles.ADMIN
      ? "Loading admin"
      : "Loading cashier"

  return (
    <NotificationProvider>
      {authenticatedUser && isEnteringModule ? (
        <LoadingScreen message={loadingMessage} />
      ) : authenticatedUser?.role === userRoles.SUPERADMIN ? (
        <Suspense fallback={<LoadingScreen message="Loading super admin" />}>
          <SuperAdminModule
            currentUser={authenticatedUser}
            onLogout={handleLogout}
          />
        </Suspense>
      ) : authenticatedUser?.role === userRoles.ADMIN ? (
        <Suspense fallback={<LoadingScreen message="Loading admin" />}>
          <AdminModule
            currentUser={authenticatedUser}
            onLogout={handleLogout}
          />
        </Suspense>
      ) : authenticatedUser?.role === userRoles.STAFF ? (
        <Suspense fallback={<LoadingScreen message="Loading cashier" />}>
          <StaffModule
            currentUser={authenticatedUser}
            onLogout={handleLogout}
          />
        </Suspense>
      ) : 
      (
        <Login onLogin={handleLogin} />
      )}
    </NotificationProvider>
  )
}

export default App
