import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'
import Login from '../../pages/login'
import HomePage from '../../pages/homePage'
import Signup from '../../pages/signup'

export default function Layout() {
    return (
        <>
            <div className='layout'>
                <Navbar />
                <div id="component">
                    <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/book' element={<AllBooks />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/signup' element={<Signup />} />
                    </Routes>
                </div>
            </div>
        </>
    )
}
