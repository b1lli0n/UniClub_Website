import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from '../components/layout/SidebarNav'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/MainLayout.css'

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <div className="main-layout-body">
                <SidebarNav />
                <main className="main-layout-content">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default MainLayout
