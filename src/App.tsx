import { useState } from 'react'
import './App.css'
import CrewPage from './assets/components/crewpage'
import Navbar from './assets/components/Navbar'

function App() {
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

export default App
