import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'
import Login from '../../pages/login'
import Signup from '../../pages/signup'


export default function Layout() {
    return (
        <>
            <div className='layout'>
                <Navbar></Navbar>
                <Routes>
                    <Route path='/book' Component={AllBooks} />
                    <Route path='/login' Component={Login}/>
                    <Route path='/signup' Component={Signup}/>
                </Routes>
                <Outlet />
            </div>
        </>
    )
}
