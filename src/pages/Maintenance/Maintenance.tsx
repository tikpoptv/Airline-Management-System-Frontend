import { Outlet, NavLink } from 'react-router-dom';
import styles from './Maintenance.module.css';
import { FaWrench } from 'react-icons/fa';
import { MdAirplaneTicket } from "react-icons/md";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import Navbar from '../../components/Sidebar';

function Maintenance() {
  return (
    <div className={styles.container}>
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
         <div className={styles.sidebarLogo}> <MdAirplaneTicket /></div>
          <div className={styles.airlineName}>Airline name</div>
        </div>

        <NavLink to="/maintenance" end className={({ isActive }) => isActive ? `${styles.sidebarItem} ${styles.active}` : styles.sidebarItem}>
          <TbLayoutDashboardFilled className={styles.sidebarIcon} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/maintenance/log" className={({ isActive }) => isActive ? `${styles.sidebarItem} ${styles.active}` : styles.sidebarItem}>
          <FaWrench className={styles.sidebarIcon} />
          <span>Maintenance</span>
        </NavLink>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        <Navbar />
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default Maintenance;