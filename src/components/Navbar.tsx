import { useState } from 'react';
import { tabs, tabIcons, Tab } from './SidebarTab'; // Import tabs and icons
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import './Navbar.css';
import { MdAirplaneTicket } from "react-icons/md";

const Navbar = ({ setSelectedTab }: { setSelectedTab: (tab: Tab) => void }) => {
  const [isPathwayOpen, setIsPathwayOpen] = useState(false);

  const handleTabClick = (tab: Tab) => {
    setSelectedTab(tab); // Update selected tab
    if (tab === 'Pathway') {
      setIsPathwayOpen(!isPathwayOpen); // Toggle Pathway open/close
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <MdAirplaneTicket />
        Airline Name
      </div>

      <div className="navbar-menu">
        {/* Iterate over the tabs to create each menu item */}
        {tabs.map((tab) => {
          const Icon = tabIcons[tab];
          const isPathway = tab === 'Pathway';

          return (
            <div key={tab} className="navbar-item">
              <div
                onClick={() => handleTabClick(tab)}
                className={`navbar-link ${isPathway && isPathwayOpen ? 'expanded' : ''}`}
              >
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
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;