import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './router/AppRouter'

const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? 'admin-fullpage' : ''}>
        <AppRouter />
      </main>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
