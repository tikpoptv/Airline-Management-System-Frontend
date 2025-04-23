import { useState } from 'react'
import './Admin.css'
import CrewPage from './CrewPage/CrewPage'
import AircraftPage from './AircraftPage/AircraftPage'
import Navbar from '../../components/Navbar'
import { FaTachometerAlt, FaPlane, FaPlaneDeparture, FaRoute, FaUser, FaWrench } from 'react-icons/fa';
import { IconType } from 'react-icons';

import { tabs,Tab } from '../../components/SidebarTab'

const tabIcons: Record<Tab, IconType> = {
  Dashboard: FaTachometerAlt,
  Flight: FaPlaneDeparture, // Now different
  Route: FaRoute,
  Aircraft: FaPlane,        // Still FaPlane
  Crew: FaUser,
  Maintenance: FaWrench,
};

function Admin() {
  const [selectedTab, setSelectedTab] = useState<Tab>('Dashboard');

  return (
    <div className="Admin">
      <Navbar />
      <div className="main-layout">
      <aside className="sidebar">
        {tabs.map((tab) => {
          const Icon = tabIcons[tab];
          return (
            <div
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`sidebar-item ${selectedTab === tab ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span>{tab}</span>
            </div>
          );
        })}
      </aside>
        <main className="content">
          {selectedTab === 'Crew' && <CrewPage />}
          {selectedTab === 'Dashboard' && <div>Dashboard Page</div>}
          {selectedTab === 'Aircraft' && <AircraftPage/>}
          {selectedTab === 'Flight' && <div>Flight Page</div>}
          {selectedTab === 'Maintenance' && <div>Maintenance Page</div>}
        </main>
      </div>
    </div>
  )
}

export default Admin
