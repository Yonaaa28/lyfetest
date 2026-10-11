import {
  HiOutlineArchiveBox,
  HiOutlineCube,
  HiOutlineGift,
} from "react-icons/hi2"
import { FiTag } from "react-icons/fi"

import { mockInventoryItems } from "../../inventory/data/inventoryMockData"
import { mockBundles } from "../../bundle/data/bundleMockData"

const biogesic = mockInventoryItems.find((item) => item.id === "med-001")
const painReliefPack = mockBundles.find((bundle) => bundle.id === "bundle-001")
export const archiveSummaryCards = [
  {
    id: "products",
    label: "Products",
    value: 24,
    caption: "Archived",
    icon: HiOutlineCube,
    iconClassName: "bg-emerald-100 text-[#0b6b51]",
    cardClassName: "bg-emerald-50/70",
  },
  {
    id: "bundles",
    label: "Bundles",
    value: 4,
    caption: "Archived",
    icon: HiOutlineGift,
    iconClassName: "bg-violet-100 text-violet-600",
    cardClassName: "bg-violet-50/70",
  },
  {
    id: "discounts",
    label: "Discounts",
    value: 0,
    caption: "Archived",
    icon: FiTag,
    iconClassName: "bg-sky-100 text-sky-600",
    cardClassName: "bg-sky-50/70",
  },
  {
    id: "all",
    label: "All Archives",
    value: 28,
    caption: "Total Records",
    icon: HiOutlineArchiveBox,
    iconClassName: "bg-orange-100 text-orange-600",
    cardClassName: "bg-orange-50/70",
  },
]

export const archiveTabs = [
  { id: "products", label: "Products", icon: HiOutlineCube },
  { id: "bundles", label: "Bundles", icon: HiOutlineGift },
  { id: "discounts", label: "Discounts", icon: FiTag },
]
export const archivedProducts = [
  {
    id: "archived-product-001",
    productId: biogesic?.id ?? "med-001",
    productName: biogesic?.productName ?? "Biogesic",
    dosage: biogesic?.dosage ?? "500mg",
    displayName: "Biogesic 500mg",
    image: biogesic?.image,
    imageTone: biogesic?.imageTone ?? "blue",
    brand: biogesic?.brand ?? "Biogesic",
    category: biogesic?.category ?? "Analgesic",
    dosageForm: biogesic?.dosageForm ?? "Tablet",
    archivedAt: "2026-05-28T10:30:00",
  },
]
export const archivedBundles = [
  {
    ...(painReliefPack ?? {}),
    id: "archived-bundle-001",
    bundleId: painReliefPack?.id ?? "bundle-001",
    name: painReliefPack?.name ?? "Pain Relief Pack",
    bundleCode: painReliefPack?.bundleCode ?? "BND-001",
    includedItems: painReliefPack?.includedItems ?? [],
    archivedAt: "2026-05-28T10:30:00",
  },
]
