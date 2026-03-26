import React from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import '../styles/admin.css'
import { useAuth } from '../context/AuthContext'

const AdminLayout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const menu = [
        { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', path: '/admin', end: true },
        { key: 'registrations', label: 'Danh sách đăng ký', icon: 'fa-list-check', path: '/admin/clubs-request' },
        { key: 'clubs', label: 'Quản lý câu lạc bộ', icon: 'fa-sitemap', path: '/admin/list-clubs' },
        { key: 'rewards', label: 'Phần thưởng', icon: 'fa-gift', path: '/admin/rewards' },
        { key: 'badges', label: 'Huy hiệu', icon: 'fa-medal', path: '/admin/badges' },
        { key: 'rewardLogs', label: 'Ghi nhận đổi thưởng', icon: 'fa-clock-rotate-left', path: '/admin/reward-point-logs' },
        { key: 'announcements', label: 'Quản lý thông báo', icon: 'fa-bullhorn', path: '/admin/announcements' },
    ]

    const bottom = [
        { key: 'logout', label: 'Logout', icon: 'fa-right-from-bracket', path: '/logout' },
    ]

    const { logout } = useAuth()

    const [showLogoutModal, setShowLogoutModal] = React.useState(false)

    const handleLogout = async () => {
        setShowLogoutModal(true)
    }

    const handleLogoutConfirm = async () => {
        try {
            await logout()
            if (location.pathname === '/admin/profile') {
                navigate('/login')
            }
        } catch (error) {
            console.error('Logout error:', error)
            if (location.pathname === '/admin/profile') {
                navigate('/login')
            }
        }
        setShowLogoutModal(false)
    }

    const handleLogoutCancel = () => {
        setShowLogoutModal(false)
    }

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="admin-profile">
                    <div className="admin-logo-circle" onClick={() => navigate('/')}></div>
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
                                    (m.key === 'registrations' && location.pathname.startsWith('/admin/club-request-detail')) ||
                                    (m.key === 'rewards' && (location.pathname.startsWith('/admin/rewards/') || location.pathname === '/admin/reward-history')) ||
                                    (m.key === 'badges' && location.pathname.startsWith('/admin/badges/')) ||
                                    (m.key === 'rewardLogs' && (
                                        location.pathname.startsWith('/admin/reward-point-logs') ||
                                        location.pathname.startsWith('/admin/reward-history') ||
                                        location.pathname.startsWith('/admin/rewards')
                                    ))
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
                            onClick={b.key === 'logout' ? handleLogout : undefined}
                        >
                            <i className={`${b.iconStyle ?? 'fa-solid'} ${b.icon} admin-menu-icon`} />
                            <span className="admin-menu-label">{b.label}</span>
                        </button>
                    ))}
                </div>

                {showLogoutModal && (
                    <div className="logout-modal-overlay" onClick={handleLogoutCancel}>
                        <div className="logout-modal" onClick={e => e.stopPropagation()}>
                            <div className="logout-modal-header">
                                <h3 className="logout-modal-title">Xác nhận đăng xuất</h3>
                            </div>
                            <div className="logout-modal-body">
                                <p className="logout-modal-message">Bạn có chắc muốn đăng xuất?</p>
                            </div>
                            <div className="logout-modal-footer">
                                <button
                                    type="button"
                                    className="logout-modal-btn logout-modal-btn-cancel"
                                    onClick={handleLogoutCancel}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="logout-modal-btn logout-modal-btn-confirm"
                                    onClick={handleLogoutConfirm}
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
