export const userRoles = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  STAFF: "staff",
}

export const branches = [
  {
    id: "branch-camalig-albay",
    code: "CAM-ALBAY",
    name: "Camalig, Albay Branch",
    location: "Camalig, Albay",
  },
]

export const sampleAccounts = [
  {
    id: "user-superadmin-001",
    username: "superadmin.main",
    password: "1234",
    fullName: "System Super Admin",
    role: userRoles.SUPERADMIN,
    assignedBranchId: null,
    accessScope: "all-branches",
    status: "active",
  },
  {
    id: "user-admin-001",
    username: "admin.camalig",
    employeeId: "EMP-0004",
    email: "admin.camalig@lyfepharmacy.com",
    password: "1234",
    fullName: "Camalig Branch Admin",
    role: userRoles.ADMIN,
    assignedBranchId: "branch-camalig-albay",
    accessScope: "single-branch",
    status: "active",
  },
  {
    id: "user-staff-001",
    username: "staff.camalig",
    employeeId: "EMP-0007",
    email: "staff.camalig@lyfepharmacy.com",
    password: "1234",
    fullName: "Luna Reyes",
    role: userRoles.STAFF,
    assignedBranchId: "branch-camalig-albay",
    accessScope: "single-branch",
    status: "active",
  },
]

export const getBranchById = (branchId) =>
  branches.find((branch) => branch.id === branchId) ?? null

export const getAccountsByRole = (role) =>
  sampleAccounts.filter((account) => account.role === role)

export const getAccountsByBranch = (branchId) =>
  sampleAccounts.filter((account) => account.assignedBranchId === branchId)
