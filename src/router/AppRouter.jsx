import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Contacts from '../pages/Contacts'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ListOfClubs from '../pages/ListOfClubs'
import ClubDetail from '../pages/ClubDetail'
import Event from '../pages/Event'
import EventDetail from '../pages/EventDetail'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'

const AppRouter = () => {
  return (
    <Routes>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/clubs" element={<ListOfClubs />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/events" element={<Event />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />   
    </Routes>
  )
}

export default AppRouter
