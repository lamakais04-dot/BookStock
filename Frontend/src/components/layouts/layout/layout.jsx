import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'

import Login from '../../pages/login'
import Signup from '../../pages/signup'
import HomePage from '../../pages/homePage'
import AllBooks from '../../pages/books'
import SingleBook from '../../pages/singlebook'

import ProtectedRoute from '../../pages/ProtectedRoute'
export default function Layout() {
  return (
    <div className='layout'>
      <Navbar />

      <div id="component">
        <Routes>

          {/* פתוחים */}
          <Route path='/login' Component={Login} />
          <Route path='/signup' Component={Signup} />

          {/* נעולים */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/book'
            element={
              <ProtectedRoute>
                <AllBooks />
              </ProtectedRoute>
            }
          />

          <Route
            path='/book/:id'
            element={
              <ProtectedRoute>
                <SingleBook />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </div>
  )
}
