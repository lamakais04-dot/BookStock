import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route, Outlet } from 'react-router-dom'
import '../../csspages/layout.css'


export default function Layout() {
    return (
        <>
            <div className='layout'>
                <Routes>
                    <Route path='/' Component={AllBooks} />
                </Routes>
                <Outlet />
            </div>
        </>
    )
}
