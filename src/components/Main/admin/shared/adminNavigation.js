import {
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineTag,
} from "react-icons/hi2"

export const adminNavigation = [
  {
    id: "dashboard",
    label: "Home",
    icon: HiOutlineHome,
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: HiOutlineCube,
  },
  {
    id: "bundle",
    label: "Bundle",
    icon: HiOutlineShoppingBag,
  },
  {
    id: "discounts",
    label: "Discounts",
    icon: HiOutlineTag,
  },
  {
    id: "purchase-requisition",
    label: "Purchase Requisition",
    icon: HiOutlineClipboardDocumentList,
  },
  {
    id: "orders",
    label: "Orders",
    icon: HiOutlineShoppingCart,
  },
  {
    id: "sales-report",
    label: "Sales Report",
    icon: HiOutlineChartBar,
  },
]
