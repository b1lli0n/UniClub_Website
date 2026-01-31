import { Home, Calendar, Bell, Users, Info, LayoutGrid } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import '../../styles/SidebarNav.css';

const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Info, label: 'Thông tin', path: '/about' },
    { icon: LayoutGrid, label: 'Sự kiện', path: '/events' },
    { icon: Users, label: 'Thành viên', path: '/memberships' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
];

export function SidebarNav() {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 hover:w-56 group">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-sidebar-border px-3 gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
                    <span className="text-lg font-bold text-primary-foreground">U</span>
                </div>
                <span className="font-semibold text-sidebar-foreground opacity-0 transition-opacity whitespace-nowrap group-hover:opacity-100 sidebar-text">
                    UniClub
                </span>
            </div>

            {/* Club Avatar */}
            <div className="flex items-center border-b border-sidebar-border py-4 px-3 gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 overflow-hidden shrink-0">
                    <span className="text-lg">🎮</span>
                </div>
                <span className="text-sm font-medium text-sidebar-foreground opacity-0 transition-opacity whitespace-nowrap group-hover:opacity-100 sidebar-text">
                    Câu lạc bộ
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    const baseClasses = 'flex items-center rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all duration-200 no-underline text-decoration-none';
                    const activeClasses = isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50';
                    const finalClass = `${baseClasses} ${activeClasses}`;

                    const IconComponent = item.icon;
                    const iconClass = `h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}`;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`${finalClass} sidebar-link`}
                        >
                            <IconComponent className={`${iconClass} sidebar-icon`} />
                            <span className="ml-3 whitespace-nowrap opacity-0 transition-opacity">
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Calendar icon at bottom */}
            <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer">
                    <Calendar className="h-5 w-5 shrink-0 sidebar-icon" />
                    <span className="ml-3 whitespace-nowrap opacity-0 transition-opacity">
                        Lịch
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default SidebarNav;
