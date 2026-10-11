export const initialSuperAdminUsers = [
  ["super-admin", "Super Admin", "Super Admin", "All Branches", "superadmin@lyfepharmacy.com", "0912 000 0000", "Active", "May 15, 2026", "12:00 AM"],
  ["camalig-admin", "Camalig Admin", "Branch Admin", "Camalig (Main Branch)", "camalig@lyfepharmacy.com", "0912 345 6789", "Active", "May 15, 2026", "10:30 AM"],
  ["guinobatan-admin", "Guinobatan Admin", "Branch Admin", "Guinobatan", "guinobatan@lyfepharmacy.com", "0912 345 6790", "Active", "May 15, 2026", "09:15 AM"],
  ["polangui-admin", "Polangui Admin", "Branch Admin", "Polangui", "polangui@lyfepharmacy.com", "0912 345 6791", "Active", "May 15, 2026", "11:05 AM"],
  ["daraga-admin", "Daraga Admin", "Branch Admin", "Daraga", "daraga@lyfepharmacy.com", "0912 345 6792", "Active", "May 15, 2026", "08:45 AM"],
  ["manito-admin", "Manito Admin", "Branch Admin", "Manito", "manito@lyfepharmacy.com", "0912 345 6793", "Active", "May 15, 2026", "10:50 AM"],
  ["camalig-cashier-2", "Camalig Cashier 2", "Cashier", "Camalig (Main Branch)", "cashier2.camalig@lyfepharmacy.com", "0912 100 0001", "Active", "May 15, 2026", "08:10 AM"],
  ["camalig-cashier", "Camalig Cashier", "Cashier", "Camalig (Main Branch)", "cashier.camalig@lyfepharmacy.com", "0912 200 0001", "Active", "May 15, 2026", "08:05 AM"],
  ["guinobatan-cashier-2", "Guinobatan Cashier 2", "Cashier", "Guinobatan", "cashier2.guinobatan@lyfepharmacy.com", "0912 100 0002", "Active", "May 15, 2026", "08:20 AM"],
  ["guinobatan-cashier", "Guinobatan Cashier", "Cashier", "Guinobatan", "cashier.guinobatan@lyfepharmacy.com", "0912 200 0002", "Active", "May 15, 2026", "08:12 AM"],
  ["polangui-cashier-2", "Polangui Cashier 2", "Cashier", "Polangui", "cashier2.polangui@lyfepharmacy.com", "0912 100 0003", "Active", "May 15, 2026", "08:25 AM"],
  ["polangui-cashier", "Polangui Cashier", "Cashier", "Polangui", "cashier.polangui@lyfepharmacy.com", "0912 200 0003", "Active", "May 15, 2026", "08:18 AM"],
  ["daraga-cashier-2", "Daraga Cashier 2", "Cashier", "Daraga", "cashier2.daraga@lyfepharmacy.com", "0912 100 0004", "Active", "May 15, 2026", "08:30 AM"],
  ["daraga-cashier", "Daraga Cashier", "Cashier", "Daraga", "cashier.daraga@lyfepharmacy.com", "0912 200 0004", "Active", "May 15, 2026", "08:22 AM"],
  ["manito-cashier-2", "Manito Cashier 2", "Cashier", "Manito", "cashier2.manito@lyfepharmacy.com", "0912 100 0005", "Active", "May 15, 2026", "08:35 AM"],
  ["manito-cashier", "Manito Cashier", "Cashier", "Manito", "cashier.manito@lyfepharmacy.com", "0912 200 0005", "Active", "May 15, 2026", "08:28 AM"],
].map(
  ([id, name, role, branch, email, contact, status, lastLoginDate, lastLoginTime]) => ({
    id,
    name,
    role,
    branch,
    email,
    contact,
    status,
    lastLoginDate,
    lastLoginTime,
  })
)

