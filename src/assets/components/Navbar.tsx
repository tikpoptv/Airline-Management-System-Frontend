import { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar" >
        <div className="logo">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            Airline Name
        </div>

      {/* <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul> */}

      <div className='user-type'>Admin</div>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>
    </nav>
  )
}

export default Navbar