<<<<<<< HEAD
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
=======
import { Routes, Route } from 'react-router-dom'
>>>>>>> Thao
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
import MainLayout from '../layouts/MainLayout'

import Register from '../pages/Auth/Register'
import Login from '../pages/Auth/Login'


import ListOfClubs from '../pages/ClubPages/ListOfClubs'
import ClubDetail from '../pages/ClubPages/ClubDetail'
import ListOfMyClubs from '../pages/ClubPages/ListOfMyClubs'
import DashboardLeaderClub from '../pages/DashboardLeaderClub'
<<<<<<< HEAD
import EventAttendanceList from '../pages/leader/EventAttendanceList'
=======
import CreateClub from '../pages/ClubPages/CreateClub'
import TransactionList from '../pages/TransactionList'
>>>>>>> Quynh

import Event from '../pages/EventPages/EventInClub'
import EventPublic from '../pages/EventPages/EventPublic'
import MyEvent from '../pages/EventPages/MyEvent';
import EventDetail from '../pages/EventPages/EventDetail'
import NotificationCenter from "../pages/NotificationCenter";

import Profile from '../pages/Profile'

// import ViewJoinRequests from '../pages/ViewJoinRequests'
import NotFound from '../pages/NotFound'

//Admin Pages
import ClubRequests from '../pages/admin/ClubRequests'
import ClubRequestDetail from '../pages/admin/ClubRequestDetail'
import ClubList from '../pages/admin/ClubList'
import ClubDetailAdmin from '../pages/admin/ClubDetail'
import ClubMembers from '../pages/admin/ClubMembers'
import PlaceholderPage from '../pages/admin/PlaceholderPage'
import AdminDashboard from '../pages/admin/Dashboard'
import Rewards from '../pages/admin/Rewards'
import RewardDetail from '../pages/admin/RewardDetail'
import RedemptionHistory from '../pages/admin/RedemptionHistory'
import Badges from '../pages/admin/Badges'
import BadgeDetail from '../pages/admin/BadgeDetail'
import MembershipsPage from '../pages/Memberships';
import EventsPage from '../pages/Events';
import EventDetailPage from '../pages/EventDetail';
import CreateEventPage from '../pages/CreateEvent';
import UpdateEventPage from '../pages/UpdateEvent';
import NotificationsPage from '../pages/Notifications';
import Home from '../pages/Home';

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
        <Route path="/clubs/create" element={<CreateClub />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/events" element={<EventPublic />} />
        <Route path="/my-clubs" element={<ListOfMyClubs />} />
        <Route path="/club/:clubId/events" element={<Event />} />
        <Route path="/club/:clubId/events/:eventId" element={<EventDetail />} />
        <Route path="/my-notifications" element={<NotificationCenter />} />

        <Route path="/my-events" element={<MyEvent />} />
        {/* <Route path="/my-requests" element={<ViewJoinRequests />} /> */}

        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Dashboard/Club Routes with MainLayout (includes Sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="/clubs/:id/dashboard" element={<DashboardLeaderClub />} />
        <Route path="/dashboard/:clubId" element={<DashboardLeaderClub />} />
        <Route path="/clubs/:id/events/:eventId/attendance" element={<EventAttendanceList />} />
        {/* Treasurer: Quản lý tài chính CLB */}
        <Route path="/clubs/:id/transactions" element={<TransactionList />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/events/:eventId/update" element={<UpdateEventPage />} />
        <Route path="/memberships" element={<MembershipsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
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
        <Route index element={<AdminDashboard />} />
        <Route path="clubs-request" element={<ClubRequests />} />
        <Route path="club-request-detail/:id" element={<ClubRequestDetail />} />
        <Route path="list-clubs" element={<ClubList />} />
        <Route path="club-detail/:id" element={<ClubDetailAdmin />} />
        <Route path="club-members/:id" element={<ClubMembers />} />
        <Route path="announcements" element={<PlaceholderPage title="Quản lý thông báo" />} />
        <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
        {/* Reward & Badge Routes */}
        <Route path="rewards" element={<Rewards />} />
        <Route path="rewards/:rewardId" element={<RewardDetail />} />
        <Route path="reward-history" element={<RedemptionHistory />} />
        <Route path="badges" element={<Badges />} />
        <Route path="badges/:badgeId" element={<BadgeDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
