 import React from 'react'
import { Link } from 'react-router-dom'
import '../../csspages/navbar.css'
 
 export default function Navbar() {
   return (
    <>
        <div>
            <nav className="navbar">
              <Link to="/book">
              All Books
              </Link>
            </nav>    

        </div>
    </>
   )
 }
 