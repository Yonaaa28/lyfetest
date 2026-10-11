import {
  HiOutlineBuildingStorefront,
  HiOutlineChartBar,
  HiOutlineCircleStack,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCube,
  HiOutlineReceiptPercent,
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineUsers,
} from "react-icons/hi2"

export const superAdminNavigationSections = [
  {
    id: "navigation",
    items: [
      {
        id: "dashboard",
        label: "Home",
        icon: HiOutlineHome,
      },
      {
        id: "branches",
        label: "Branches",
        icon: HiOutlineBuildingStorefront,
      },
      {
        id: "users",
        label: "Users",
        icon: HiOutlineUsers,
      },
      {
        id: "inventory-control",
        label: "Inventory Control",
        icon: HiOutlineCube,
      },
      {
        id: "purchase-requests",
        label: "Purchase Requests",
        icon: HiOutlineClipboardDocumentCheck,
      },
      {
        id: "sales-analytics",
        label: "Sales Analytics",
        icon: HiOutlineChartBar,
      },
      {
        id: "suppliers",
        label: "Suppliers",
        icon: HiOutlineTruck,
      },
      {
        id: "discounts",
        label: "Card Management",
        icon: HiOutlineReceiptPercent,
      },
      {
        id: "master-data",
        label: "Master Data",
        icon: HiOutlineCircleStack,
      },
    ],
  },
]

export const superAdminNavigationItems = superAdminNavigationSections.flatMap(
  (section) => section.items
)
