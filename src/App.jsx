import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './router/AppRouter'
import './styles/App.css'

const App = () => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <AppRouter />
      </main>
      {!isAuthPage && <Footer />}
    </>
  )
}

export default App
