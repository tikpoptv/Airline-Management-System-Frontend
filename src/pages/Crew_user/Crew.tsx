import { Outlet, NavLink} from 'react-router-dom';
import styles from './Crew.module.css';
import { FaUser } from 'react-icons/fa';
import { MdAirplaneTicket } from "react-icons/md";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import Sidebar from '../../components/Sidebar';
import { useState, useEffect } from 'react';
import { getCrewProfile } from '../../services/crewuser/crewuserService';

function Crew() {
  // const [openPathway, setOpenPathway] = useState(false);
  // const location = useLocation();
  // const isPathwayActive = location.pathname.startsWith('/admin/pathways');
  const [crewId, setCrewId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCrewData = async () => {
      try {
        const crewData = await getCrewProfile();
        setCrewId(crewData.crew_id);
      } catch (error) {
        console.error('Failed to fetch crew data:', error);
      }
    };

    fetchCrewData();
  }, []);

  return (
    <div className={styles['crew-container']}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles['sidebar-header']}>
         <div className={styles['sidebar-logo']}> <MdAirplaneTicket /></div>
          <div className={styles['airline-name']}>Airline name</div>
        </div>

        <NavLink to="/crew" end className={({ isActive }) => isActive ? `${styles['sidebar-item']} ${styles.active}` : styles['sidebar-item']}>
          <TbLayoutDashboardFilled className={styles['sidebar-icon']} />
          <span>Dashboard</span>
        </NavLink>

        {/* <NavLink to="/crew/flight" className={({ isActive }) => isActive ? `${styles['sidebar-item']} ${styles.active}` : styles['sidebar-item']}>
          <FaPlaneDeparture className={styles['sidebar-icon']} />
          <span>Flight</span>
        </NavLink> */}

        {/* Pathway Dropdown */}
        {/* <div 
          className={isPathwayActive ? `${styles['sidebar-item']} ${styles['pathway-item']} ${styles.active}` : `${styles['sidebar-item']} ${styles['pathway-item']}`}
          style={{cursor:'pointer'}} 
          onClick={() => setOpenPathway(v => !v)}
        >
          <FaRoute className={styles['sidebar-icon']} />
          <span>Pathway</span>
          <span className={styles['dropdown-arrow']}>{openPathway ? '▲' : '▼'}</span>
        </div>
        {openPathway && (
          <div className={styles['sidebar-submenu']}>
            <NavLink to="/crew/pathways/routes" className={({ isActive }) => isActive ? `${styles['sidebar-item-sub']} ${styles.active}` : styles['sidebar-item-sub']}>
              <FaRoute className={styles.icon} />
              Route
            </NavLink>
            <NavLink to="/crew/pathways/airport" className={({ isActive }) => isActive ? `${styles['sidebar-item-sub']} ${styles.active}` : styles['sidebar-item-sub']}>
              <FaMapMarkerAlt className={styles.icon} />
              Airport
            </NavLink>
          </div>
        )} */}

        {/* <NavLink to="/crew/aircrafts" className={({ isActive }) => isActive ? `${styles['sidebar-item']} ${styles.active}` : styles['sidebar-item']}>
          <FaPlane className={styles['sidebar-icon']} />
          <span>Aircraft</span>
        </NavLink> */}

        <NavLink to={crewId ? `/crew/crew/${crewId}` : "/crew/details"} className={({ isActive }) => isActive ? `${styles['sidebar-item']} ${styles.active}` : styles['sidebar-item']}>
          <FaUser className={styles['sidebar-icon']} />
          <span>Crew</span>
        </NavLink>


      </aside>

      {/* Main content */}
      <div className={styles['main-content']}>
        <Sidebar />
        <div className={styles['content-area']}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Crew;