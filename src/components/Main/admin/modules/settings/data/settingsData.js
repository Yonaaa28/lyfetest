import {
  HiOutlineArchiveBox,
  HiOutlineCog6Tooth,
} from "react-icons/hi2"
export const defaultPharmacySettings = {
  pharmacyName: "Lyfe pharmacy",
  branch: "Camalig",
  phone: "0993 257 83787",
  email: "lyfepharma@gmail.com",
  address: "Camalig zone 5",
}

export const settingsTabs = [
  {
    id: "general",
    label: "General",
    description: "Basic settings",
    icon: HiOutlineCog6Tooth,
  },
  {
    id: "archives",
    label: "Archives",
    description: "System Archives",
    icon: HiOutlineArchiveBox,
  },
]
