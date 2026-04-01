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

const getNavItems = (clubId, isSecretary, isSubLeader, isTreasurer, isLeader) => {
    const hasClubId = isValidClubId(clubId);
    const items = [
        { icon: Home, label: 'Dashboard', path: hasClubId ? `/clubs/manager/${clubId}/dashboard` : '/dashboard' },
        { icon: Bell, label: 'Thông báo', path: '/notifications' },
    ];

    if (isLeader && hasClubId) {
        items.push(
            { icon: Users, label: 'Duyệt Tham gia', path: `/clubs/manager/${clubId}/join-requests` },
            { icon: Users, label: 'Thành viên', path: hasClubId ? `/clubs/manager/${clubId}/members` : '/clubs' },
            { icon: LayoutGrid, label: 'Sự kiện CLB', path: '/clubEvent' },
            { icon: Banknote, label: 'Tài chính', path: `/clubs/manager/${clubId}/finance` },
            { icon: Wallet, label: 'Giao dịch', path: hasClubId ? `/clubs/manager/${clubId}/transactions` : '/dashboard' },
            { icon: BookMarked, label: 'Quy tắc điểm', path: hasClubId ? `/clubs/manager/${clubId}/point-rules-management` : '/clubs' },
            { icon: Calendar, label: 'Lịch', path: `/clubs/manager/${clubId}/activity-schedule`, end: false },
        );
    }
    if (isSubLeader && hasClubId) {
        items.push(
             { icon: LayoutGrid, label: 'Sự kiện CLB', path: '/clubEvent' },
        );
    }
    if (isSecretary && hasClubId) {
        items.push(        
            { icon: Calendar, label: 'Lịch', path: `/clubs/manager/${clubId}/activity-schedule`, end: false },
        );
    }
    if (isTreasurer && hasClubId) {
        items.push(
            { icon: Banknote, label: 'Tài chính', path: `/clubs/manager/${clubId}/finance` },
            { icon: Wallet, label: 'Giao dịch', path: hasClubId ? `/clubs/manager/${clubId}/transactions` : '/dashboard' },
        );
    }
    return items;
};

export function SidebarNav() {
    const params = useParams();
    const paramId = params.id ?? params.clubId;
    const clubId = isValidClubId(paramId) ? paramId : localStorage.getItem('clubId');
    const clubRole = Number(localStorage.getItem('clubRole'));
    //Role 0: Member, 1: Leader, 2:Sub_Leader , 3: Secretary, 4: Treasurer
    const isLeader = clubRole === 1;
    const isSubLeader = clubRole === 2;
    const isSecretary = clubRole === 3;
    const isTreasurer = clubRole === 4; 
    const navItems = getNavItems(clubId, isSecretary, isSubLeader, isTreasurer, isLeader);

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
            </nav>

            <div className="sidebar-bottom">
                <NavLink 
                    to={isValidClubId(clubId) ? `/clubs/${clubId}` : '/dashboard'} 
                    className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                >
                    <Calendar className="sidebar-icon" />
                    <span className="sidebar-label">Tổng quan</span>
                </NavLink>
            </div>
        </aside>
    );
}

export default SidebarNav;