import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Contacts from '../pages/Contacts'
import NotFound from '../pages/NotFound'
import Event from '../pages/Event';
import EventDetail from '../pages/EventDetail';
import MyEvent from '../pages/MyEvent';
const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/event" element={<Event />} />
      <Route path="/event/:eventId" element={<EventDetail />} />
      <Route path="/my-events" element={<MyEvent />} />
    </Routes>
  )
}

export default AppRouter
