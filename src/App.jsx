import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './router/AppRouter'

const App = () => {
  return (
    <>
      <Header />
      <main>
        <AppRouter />
      </main>
      <Footer />
    </>
  )
}

export default App
