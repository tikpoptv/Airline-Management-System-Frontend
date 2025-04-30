import { IconType } from 'react-icons';
import { FaPlaneDeparture, FaRoute, FaUser, FaWrench } from 'react-icons/fa';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { PiAirplaneTiltFill } from 'react-icons/pi';
import { MdOutlineFlight, MdOutlineLocalAirport } from 'react-icons/md';

export type Tab = 
  | "Dashboard"
  | "Flight"
  | "Pathway"
  | "Aircraft"
  | "Crew"
  | "Maintenance"
  | "Routes"
  | "Airport";

export type TabInfo = {
  name: Tab;
  icon: IconType;
  parent?: "Pathway"; // <- optional: if it's a nested tab under Pathway
};

// ONE SINGLE SOURCE of truth
export const tabInfoList: TabInfo[] = [
  { name: "Dashboard", icon: TbLayoutDashboardFilled },
  { name: "Flight", icon: FaPlaneDeparture },
  { name: "Pathway", icon: FaRoute },
  { name: "Aircraft", icon: PiAirplaneTiltFill },
  { name: "Crew", icon: FaUser },
  { name: "Maintenance", icon: FaWrench },
  { name: "Routes", icon: MdOutlineFlight, parent: "Pathway" },  // nested under Pathway
  { name: "Airport", icon: MdOutlineLocalAirport, parent: "Pathway" },  // nested under Pathway
];