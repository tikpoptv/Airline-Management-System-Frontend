import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Crew.css';
import { FaPlane, FaPlaneDeparture, FaRoute, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { MdAirplaneTicket } from "react-icons/md";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';

function Crew() {
  const [openPathway, setOpenPathway] = useState(false);
  const location = useLocation();
  const isPathwayActive = location.pathname.startsWith('/admin/pathways');
  return (
    <div className="crew-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
         <div className='sidebar-logo'> <MdAirplaneTicket /></div>
          <div className="airline-name">Airline name</div>
        </div>

        <NavLink to="/crew" end className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <TbLayoutDashboardFilled className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/crew/flight" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <FaPlaneDeparture className="sidebar-icon" />
          <span>Flight</span>
        </NavLink>

        {/* Pathway Dropdown */}
        <div 
          className={isPathwayActive ? 'sidebar-item pathway-item active' : 'sidebar-item pathway-item'} 
          style={{cursor:'pointer'}} 
          onClick={() => setOpenPathway(v => !v)}
        >
          <FaRoute className="sidebar-icon" />
          <span>Pathway</span>
          <span className="dropdown-arrow">{openPathway ? '▲' : '▼'}</span>
        </div>
        {openPathway && (
          <div className="sidebar-submenu">
            <NavLink to="/crew/pathways/routes" className={({ isActive }) => isActive ? 'sidebar-item-sub active' : 'sidebar-item-sub'}>
              <FaRoute className="icon" />
              Route
            </NavLink>
            <NavLink to="/crew/pathways/airport" className={({ isActive }) => isActive ? 'sidebar-item-sub active' : 'sidebar-item-sub'}>
              <FaMapMarkerAlt className="icon" />
              Airport
            </NavLink>
          </div>
        )}

        <NavLink to="/crew/aircrafts" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <FaPlane className="sidebar-icon" />
          <span>Aircraft</span>
        </NavLink>

        <NavLink to="/crew/crew" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <FaUser className="sidebar-icon" />
          <span>Crew</span>
        </NavLink>


      </aside>

      {/* Main content */}
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Crew;