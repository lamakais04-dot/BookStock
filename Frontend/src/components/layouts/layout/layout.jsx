import React from 'react'
import AllBooks from '../../pages/books'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'
import Login from '../../pages/login'
import HomePage from '../../pages/homePage'
import Signup from '../../pages/signup'
import SingleBook from '../../pages/singlebook'

export default function Layout() {
    return (
        <>
            <div className='layout'>
                <Navbar />
                <div id="component">
                    <Routes>
                        <Route path='/book' Component={AllBooks} />
                        <Route path='/login' Component={Login} />
                        <Route path='/' Component={HomePage} />
                        <Route path='/signup' Component={Signup} />
                        <Route path="/book/:id" Component={SingleBook}/>
                    </Routes>
                </div>
            </div>
        </>
    )
}
