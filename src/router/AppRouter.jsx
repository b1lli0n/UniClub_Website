import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import Contacts from '../pages/Contacts'
import NotFound from '../pages/NotFound'

const AppRouter = () => {
  return (
    <Routes>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="*" element={<NotFound />} />   
    </Routes>
  )
}

export default AppRouter
