import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from '../components/navbar/SidebarNav'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/LeaderLayout.css'

const LeaderLayout = () => {
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

export default LeaderLayout
