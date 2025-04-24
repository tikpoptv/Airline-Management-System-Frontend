import { useState } from 'react'
import './Admin.css'
import CrewPage from './CrewPage/CrewPage'
import AircraftPage from './AircraftPage/AircraftPage'
import Navbar from '../../components/Navbar'
import AdminLayout from '../../layouts/AdminLayout';
import { FaPlane, FaPlaneDeparture, FaRoute, FaUser, FaWrench } from 'react-icons/fa';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IconType } from 'react-icons';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { tabs,Tab } from '../../components/SidebarTab'

const tabIcons: Record<Tab, IconType> = {
  Dashboard: TbLayoutDashboardFilled,
  Flight: FaPlaneDeparture, // Now different
  Pathway: FaRoute,
  Aircraft: FaPlane,        // Still FaPlane
  Crew: FaUser,
  Maintenance: FaWrench,
};

function Admin() {
  const [selectedTab, setSelectedTab] = useState<Tab>('Dashboard');
  const [isPathwayOpen, setIsPathwayOpen] = useState(false);

  return (
    <AdminLayout>
    <div className="Admin">
      <Navbar />
      <div className="main-layout">
      <aside className="sidebar">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              const isPathway = tab === 'Pathway';

              return (
                <div key={tab}>
                  <div
                    onClick={() => {
                      if (isPathway) {
                        setIsPathwayOpen(!isPathwayOpen);
                      } else {
                        setSelectedTab(tab);
                        setIsPathwayOpen(false);
                      }
                    }}
                    className={`sidebar-item ${selectedTab === tab ? 'active' : ''} ${isPathway && isPathwayOpen ? 'expanded' : ''}`}
                  >
                    <div className="sidebar-content">
                      <Icon className="tab-icon" />
                      <span>{tab}</span>
                      {isPathway &&
                        (isPathwayOpen ? (
                          <IoIosArrowDown className="arrow-icon" />
                        ) : (
                          <IoIosArrowForward className="arrow-icon" />
                        ))}
                    </div>

                    {/* Nested buttons inside Pathway */}
                    {isPathway && isPathwayOpen && (
                      <div className="nested-buttons">
                        <button
                          className="nested-tab-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab('Routes' as Tab);
                          }}
                        >
                          Routes
                        </button>
                        <button
                          className="nested-tab-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab('Airport' as Tab);
                          }}
                        >
                          Airport
                        </button>
                      </div>
                    )}
                  </div>
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
    </AdminLayout>
  )
}

export default Admin
