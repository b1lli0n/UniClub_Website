import React from 'react'
import AppRouter from './router/AppRouter'
import { SidebarNav } from './components/layout/SidebarNav'

const App = () => {
  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="app-content">
        <main className="app-main">
          <AppRouter />
        </main>
      </div>
    </div>
  )
}

export default App
