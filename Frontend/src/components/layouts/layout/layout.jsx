import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../header/navbar'
import '../../csspages/layout.css'

import Login from '../../pages/login'
import Signup from '../../pages/signup'
import HomePage from '../../pages/homePage'
import AllBooks from '../../pages/books'
import FavoritesPage from '../../pages/favorites'
import SingleBook from '../../pages/singlebook'
import Profile from '../../pages/profile'
import AdminActivity from '../../pages/admin/AdminActivity'
import ProtectedRoute from '../../pages/ProtectedRoute'
import AdminCategory from '../../pages/admin/AdminCategory'
import AdminUsers from '../../pages/admin/AdminUsers'
import AdminUserBorrows from '../../pages/admin/AdminUsersBorrow'
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

                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute blockAdmin>
                                <FavoritesPage />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/activity"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminActivity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/categories"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminCategory />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/users/:id"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminUserBorrows />
                            </ProtectedRoute>
                        }
                    />
                </Routes>


            </div>
        </div>
    )
}
