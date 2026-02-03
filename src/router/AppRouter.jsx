import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'  

import Register from '../pages/Auth/Register'
import Login from '../pages/Auth/Login'

import Home from '../pages/Home'

import ListOfClubs from '../pages/ClubPages/ListOfClubs'
import ClubDetail from '../pages/ClubPages/ClubDetail'

import Event from '../pages/EventPages/EventInClub'
import EventPublic from '../pages/EventPages/EventPublic'
import MyEvent from '../pages/EventPages/MyEvent';
import EventDetail from '../pages/EventPages/EventDetail'

import Profile from '../pages/Profile'

import About from '../pages/About'
import Contacts from '../pages/Contacts'
import NotFound from '../pages/NotFound'

//Admin Pages
import ClubRequests from '../pages/admin/ClubRequests'
import ClubRequestDetail from '../pages/admin/ClubRequestDetail'
import ClubList from '../pages/admin/ClubList'
import ClubDetailAdmin from '../pages/admin/ClubDetail'
import ClubMembers from '../pages/admin/ClubMembers'
import PlaceholderPage from '../pages/admin/PlaceholderPage'
import Dashboard from '../pages/admin/Dashboard'

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
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/events" element={<EventPublic />} />
        <Route path="/club/:clubId/events" element={<Event />} />
        <Route path="/club/:clubId/events/:eventId" element={<EventDetail />} />
        <Route path="/my-events" element={<MyEvent />} />



        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
    
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Routes with ProtectedRoute */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Dashboard />} />
        <Route path="clubs-request" element={<ClubRequests />} />
        <Route path="club-request-detail/:id" element={<ClubRequestDetail />} />
        <Route path="list-clubs" element={<ClubList />} />
        <Route path="club-detail/:id" element={<ClubDetailAdmin />} />
        <Route path="club-members/:id" element={<ClubMembers />} />
        <Route path="announcements" element={<PlaceholderPage title="Quản lý thông báo" />} />
        <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
