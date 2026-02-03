import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import '../styles/admin.css'

const AdminLayout = () => {
    const location = useLocation()
    const menu = [
        { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', path: '/admin', end: true },
        { key: 'registrations', label: 'Danh sách đăng ký', icon: 'fa-list-check', path: '/admin/clubs-request' },
        { key: 'clubs', label: 'Quản lý câu lạc bộ', icon: 'fa-sitemap', path: '/admin/list-clubs' },
        { key: 'announcements', label: 'Quản lý thông báo', icon: 'fa-bullhorn', path: '/admin/announcements' },
        { key: 'users', label: 'Quản lý người dùng', icon: 'fa-users', path: '/admin/users' },
    ]

    const bottom = [
        { key: 'alerts', label: 'Thông báo', icon: 'fa-bell', iconStyle: 'fa-regular', path: '#' },
        { key: 'logout', label: 'Logout', icon: 'fa-right-from-bracket', path: '/logout' },
    ]

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="admin-profile">
                    <div className="admin-logo-circle">U</div>
                    <div className="admin-logo-text">
                        <span className="admin-logo-title">UniClub</span>
                        <span className="admin-logo-subtitle">Admin Dashboard</span>
                    </div>
                </div>

                <nav className="admin-menu-list">
                    {menu.map((m) => (
                        <NavLink
                            key={m.key}
                            to={m.path}
                            end={m.end}
                            className={({ isActive }) => {
                                const active = isActive ||
                                    (m.key === 'clubs' && location.pathname.startsWith('/admin/club-detail')) ||
                                    (m.key === 'registrations' && location.pathname.startsWith('/admin/club-request-detail'))
                                return `admin-menu-item ${m.key === 'registrations' ? 'admin-menu-item--primary' : ''} ${active ? 'is-active' : ''}`
                            }}
                        >
                            <i
                                className={`fa-solid ${m.icon} ${m.key === 'registrations' ? 'admin-menu-icon-task' : 'admin-menu-icon'
                                    }`}
                            />
                            <span className="admin-menu-label">{m.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-menu-bottom">
                    {bottom.map((b) => (
                        <button
                            key={b.key}
                            type="button"
                            className={`admin-menu-item ${b.key === 'logout' ? 'admin-menu-item--logout' : ''}`}
                        >
                            <i className={`${b.iconStyle ?? 'fa-solid'} ${b.icon} admin-menu-icon`} />
                            <span className="admin-menu-label">{b.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            <section className="admin-content">
                <div className="admin-content-shell">
                    <Outlet />
                </div>
            </section>
        </div>
    )
}

export default AdminLayout
