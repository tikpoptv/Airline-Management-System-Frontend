import { useState } from 'react'
import './Admin.css'
import CrewPage from './CrewPage/CrewPage'
import Navbar from '../../components/Navbar'

function Admin() {
  const [selectedTab, setSelectedTab] = useState('Dashboard')

  return (
    <div className="app">
      <Navbar />
      <div className="main-layout">
        <aside className="sidebar">
          {['Dashboard', 'Aircraft', 'Flight', 'Crew', 'Maintenance'].map((tab) => (
            <div
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`sidebar-item ${selectedTab === tab ? 'active' : ''}`}
            >
              {tab}
            </div>
          ))}
        </aside>
        <main className="content">
          {selectedTab === 'Crew' && <CrewPage />}
        </main>
      </div>
    </div>
  )
}

export default Admin
