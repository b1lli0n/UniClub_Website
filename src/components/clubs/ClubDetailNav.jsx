import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, CircleStar, BookMarked, ScrollText, Calendar } from 'lucide-react';
import '../../styles/ClubDetailNav.css';

const ALL_TABS = [
  { key: 'overview', path: '', label: 'Tổng quan', Icon: LayoutDashboard, membersOnly: false },
  { key: 'activity-schedule', path: '/activity-schedule', label: 'Lịch hoạt động', Icon: Calendar, membersOnly: true },
  { key: 'leaderboard', path: '/leaderboard', label: 'BXH', Icon: Trophy, membersOnly: false },
  { key: 'point-rules', path: '/point-rules', label: 'Quy tắc điểm', Icon: BookMarked, membersOnly: false },
  { key: 'badges', path: '/badges', label: 'Huy hiệu', Icon: CircleStar, membersOnly: true },
  { key: 'points-history', path: '/points-history', label: 'Lịch sử điểm', Icon: ScrollText, membersOnly: true },
];

const ClubDetailNav = ({ clubName, isMember = false }) => {
  const { id: clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || '';

  if (!clubId) return null;

  const getActiveKey = () => {
    const base = `/clubs/${clubId}`;
    if (pathname === base || pathname === `${base}/`) return 'overview';
    if (pathname.includes('/activity-schedule')) return 'activity-schedule';
    if (pathname.includes('/leaderboard')) return 'leaderboard';
    if (pathname.includes('/badges')) return 'badges';
    if (pathname.includes('/point-rules')) return 'point-rules';
    if (pathname.includes('/points-history')) return 'points-history';
    return 'overview';
  };

  const activeKey = getActiveKey();

  const handleNavigate = (tab) => {
    const to = tab.path ? `/clubs/${clubId}${tab.path}` : `/clubs/${clubId}`;
    const state = { clubName: clubName || location.state?.clubName, isMember };
    navigate(to, { state });
  };

  const tabs = isMember ? ALL_TABS : ALL_TABS.filter((t) => !t.membersOnly);

  return (
    <nav className="clubdetail-nav">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        const Icon = tab.Icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={`clubdetail-nav-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => handleNavigate(tab)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default ClubDetailNav;
