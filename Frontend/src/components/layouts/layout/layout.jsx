import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route, Outlet } from 'react-router-dom'



export default function Layout() {
    return (
        <>
            <Routes>
                <Route path='/' Component={AllBooks} />
            </Routes>
            <Outlet />

        </>
    )
}
