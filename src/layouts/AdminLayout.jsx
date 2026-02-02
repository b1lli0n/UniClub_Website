import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout