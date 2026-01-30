import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = [
    { match: '/dashboard', title: 'Dashboard' },
    { match: '/events/create', title: 'Tạo sự kiện' },
    { match: '/events', title: 'Sự kiện' },
    { match: '/memberships', title: 'Thành viên' },
    { match: '/notifications', title: 'Thông báo' }
];

const Topbar = ({ userName = 'Trần Tiến', userRole = 'Club Leader' }) => {
    const location = useLocation();

    const pageTitle = useMemo(() => {
        const found = routeTitles.find((r) => location.pathname.startsWith(r.match));
        if (found) return found.title;
        return 'Dashboard';
    }, [location.pathname]);

    const initials = useMemo(() => {
        if (!userName) return '?';
        const parts = userName.trim().split(' ');
        return parts.slice(-2).map((p) => p[0]).join('').toUpperCase();
    }, [userName]);

    return (
        <header className="app-topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="topbar-user">
                <div className="user-meta">
                    <div className="user-name">{userName}</div>
                    <div className="user-role">{userRole}</div>
                </div>
                <div className="user-avatar" aria-hidden>{initials}</div>
            </div>
        </header>
    );
};

export default Topbar;
