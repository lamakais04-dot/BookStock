import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'
import Login from '../../pages/login'
import HomePage from '../../pages/homePage'

export default function Layout() {
    return (
        <>
            <div className='layout'>
                <Navbar></Navbar>
                <div id="component">
                <Routes>
                    <Route path='/book' Component={AllBooks} />
                    <Route path='/login' Component={Login}/>
                    <Route path='/' Component={HomePage}/>
                </Routes>
                </div>
                <Outlet />
            </div>
        </>
    )
}
