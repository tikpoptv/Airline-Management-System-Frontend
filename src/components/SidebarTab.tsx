import { IconType } from 'react-icons'; // Make sure you import IconType
import { FaPlaneDeparture, FaRoute, FaUser, FaWrench } from 'react-icons/fa';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { PiAirplaneTiltFill } from 'react-icons/pi'; // Make sure this is imported correctly

// Define and export the tab list and type together
export const tabs = ['Dashboard', 'Flight', 'Pathway', 'Aircraft', 'Crew', 'Maintenance'] as const;
export type Tab = (typeof tabs)[number];

// Define icons for each tab
export const tabIcons: Record<Tab, IconType> = {
  Dashboard: TbLayoutDashboardFilled,
  Flight: FaPlaneDeparture,
  Pathway: FaRoute,
  Aircraft: PiAirplaneTiltFill,
  Crew: FaUser,
  Maintenance: FaWrench,
};

// No need to export Tab unless you are using it elsewhere