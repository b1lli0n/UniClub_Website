import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Users, Bell, Info, Calendar, LogOut } from 'lucide-react';
import '../../styles/SidebarNav.css';

const getNavItems = (clubId) => [
    { icon: Home, label: 'Dashboard', path: clubId ? `/clubs/${clubId}/dashboard` : '/dashboard' },
    { icon: LayoutGrid, label: 'Sự kiện', path: '/events' },
    { icon: Users, label: 'Thành viên', path: '/memberships' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
    { icon: Info, label: 'Thông tin', path: '/about' },
];

export function SidebarNav() {
    const clubId = localStorage.getItem('clubId');
    const navItems = getNavItems(clubId);

    const handleNavClick = (path) => {
        // Lưu clubId vào localStorage khi navigate
        if (clubId) {
            localStorage.setItem('clubId', clubId);
        }
    };

    const handleLogout = () => {
        // Xóa auth tokens và redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('clubId');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className={({ isActive }) =>
                                `sidebar-item${isActive ? ' active' : ''}`
                            }
                        >
                            <IconComponent className="sidebar-icon" />
                            <span className="sidebar-label">{item.label}</span>
                            <span className="sidebar-active-indicator" />
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <button className="sidebar-button" type="button">
                    <Calendar className="sidebar-icon" />
                    <span className="sidebar-label">Lịch</span>
                </button>
            </div>
        </aside>
    );
}

export default SidebarNav;
