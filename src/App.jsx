import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './router/AppRouter'
import { useLocation } from 'react-router-dom'
const App = () => {
  const location = useLocation();
  // Kiểm tra nếu đang ở trang event để ẩn Header đen
  const isEventPage = location.pathname.startsWith('/event') || location.pathname.startsWith('/my-events');
  return (
    <>
      {/* Chỉ hiện Header nếu KHÔNG PHẢI trang event */}
      {!isEventPage && <Header />}
      <main>
        <AppRouter />
      </main>
      <Footer />
    </>
  )
}

export default App
