import React from 'react'
import { NavLink } from 'react-router-dom'
import '../../csspages/navbar.css'
import logo from '../../../../BookStockLogo.png'

export default function Navbar() {
  return (
    <>
      <div>
        <nav className="navbar">
          <NavLink
            to="/"
          >
            <img className="navbar-logo" src={logo} />
          </NavLink>
          <NavLink
            to="/book"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            כל הספרים
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            התחברות
          </NavLink>
                    <NavLink
            to="/signup"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            הרשמה
          </NavLink>
        </nav>
      </div>
    </>
  )
}