import React from 'react'
import { NavLink } from 'react-router-dom'
import '../../csspages/navbar.css'
 
export default function Navbar() {
  return (
    <>
      <div>
        <nav className="navbar">
          <NavLink 
            to="/book" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            כל הספרים
          </NavLink>
        </nav>    
      </div>
    </>
  )
}