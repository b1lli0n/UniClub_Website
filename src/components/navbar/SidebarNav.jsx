import { NavLink, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import {
    Home,
    LayoutGrid,
    Users,
    Bell,
    Info,
    Calendar,
    Wallet,
    Gift,
    Banknote,
    LayoutDashboard,
    Trophy,
    BookMarked,
    CircleStar,
    ScrollText,
} from 'lucide-react';
import '../../styles/SidebarNav.css';

const isValidClubId = (id) =>
    id != null && id !== '' && String(id) !== 'null' && String(id) !== 'undefined';

const getNavItems = (clubId, isTreasurer) => {
    const hasClubId = isValidClubId(clubId);
    const items = [
        { icon: Home, label: 'Dashboard', path: hasClubId ? `/clubs/${clubId}/dashboard` : '/dashboard' },
        { icon: LayoutGrid, label: 'Sự kiện', path: '/events' },
        { icon: Users, label: 'Thành viên', path: '/memberships' },
        { icon: Gift, label: 'Request Reward', path: hasClubId ? `/clubs/${clubId}/rewards/requests` : '/clubs' },
        { icon: Wallet, label: 'Giao dịch', path: hasClubId ? `/clubs/${clubId}/transactions` : '/dashboard' },
    ];

    if (isTreasurer && hasClubId) {
        items.push({ icon: Banknote, label: 'Financial', path: `/clubs/${clubId}/finance` });
    }

    items.push(
        { icon: Bell, label: 'Thông báo', path: '/notifications' },
        { icon: Info, label: 'Thông tin', path: '/about' }
    );

    return items;
};

const getClubPageNavItems = (clubId) => [
    { icon: LayoutDashboard, label: 'Tổng quan', path: `/clubs/${clubId}`, end: true },
    { icon: Trophy, label: 'BXH', path: `/clubs/${clubId}/leaderboard`, end: false },
    { icon: BookMarked, label: 'Quy tắc điểm', path: `/clubs/${clubId}/point-rules`, end: false },
    { icon: CircleStar, label: 'Huy hiệu', path: `/clubs/${clubId}/badges`, end: false },
    { icon: ScrollText, label: 'Lịch sử điểm', path: `/clubs/${clubId}/points-history`, end: false },
];

export function SidebarNav() {
    const params = useParams();
    const paramId = params.id ?? params.clubId;
    const clubId = isValidClubId(paramId) ? paramId : localStorage.getItem('clubId');
    const clubRole = Number(localStorage.getItem('clubRole'));
    const isTreasurer = clubRole === 4;
    const navItems = getNavItems(clubId, isTreasurer);
    const clubPageItems = isValidClubId(clubId) ? getClubPageNavItems(clubId) : [];

    useEffect(() => {
        if (isValidClubId(paramId)) localStorage.setItem('clubId', paramId);
    }, [paramId]);

    const handleNavClick = () => {
        if (isValidClubId(clubId)) {
            localStorage.setItem('clubId', clubId);
        }
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
                            onClick={handleNavClick}
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
                {clubPageItems.length > 0 && (
                    <div className="sidebar-nav-divider" aria-hidden="true" />
                )}
                {clubPageItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `sidebar-item sidebar-item--club${isActive ? ' active' : ''}`
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