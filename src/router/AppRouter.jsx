import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'  
import Register from '../pages/Register'

import Home from '../pages/Home'
import About from '../pages/About'
import Contacts from '../pages/Contacts'
import Login from '../pages/Login'
import ListOfClubs from '../pages/ListOfClubs'
import ClubDetail from '../pages/ClubDetail'
import Event from '../pages/Event'
import EventDetail from '../pages/EventDetail'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import MyEvent from '../pages/MyEvent';

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth Routes (no layout) */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* User Routes with Layout */}
      <Route element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="/clubs" element={<ListOfClubs />} />


        
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/events" element={<Event />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/event/:eventId" element={<EventDetail />} />
        <Route path="/my-events" element={<MyEvent />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Routes with ProtectedRoute */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
