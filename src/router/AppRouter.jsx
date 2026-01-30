import React from 'react'
import { Routes, Route } from 'react-router-dom'
import About from '../pages/About'
import Contacts from '../pages/Contacts'
import NotFound from '../pages/NotFound'
import MembershipsPage from '../pages/Memberships';
import EventsPage from '../pages/Events';
import EventDetailPage from '../pages/EventDetail';
import CreateEventPage from '../pages/CreateEvent';
import UpdateEventPage from '../pages/UpdateEvent';
import NotificationsPage from '../pages/Notifications';
import Dashboard from '../pages/Dashboard';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/create" element={<CreateEventPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/events/:eventId/edit" element={<UpdateEventPage />} />
      <Route path="/memberships" element={<MembershipsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
