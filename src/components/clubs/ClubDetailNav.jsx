import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, CircleStar, BookMarked, ScrollText, Calendar, Gift } from 'lucide-react';
import '../../styles/ClubDetailNav.css';

const ALL_TABS = [
  { key: 'overview', path: '', label: 'Tổng quan', Icon: LayoutDashboard, membersOnly: false },
  { key: 'activity-schedule', path: '/activity-schedule', label: 'Lịch hoạt động', Icon: Calendar, membersOnly: true },
  { key: 'leaderboard', path: '/leaderboard', label: 'BXH', Icon: Trophy, membersOnly: false },
  { key: 'point-rules', path: '/point-rules', label: 'Quy tắc điểm', Icon: BookMarked, membersOnly: false },
  // Sử dụng path đặc biệt cho tab reward để điều hướng đúng route
  { key: 'rewards', path: '/rewards', label: 'Phần thưởng', Icon: Gift, membersOnly: false, isReward: true },
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
    if (pathname.includes('/rewards')) return 'rewards';
    return 'overview';
  };

  const activeKey = getActiveKey();

  const handleNavigate = (tab) => {
    let to;
    if (tab.isReward) {
      // Điều hướng đúng route reward: /club/:id/rewards
      to = `/club/${clubId}/rewards`;
    } else {
      to = tab.path ? `/clubs/${clubId}${tab.path}` : `/clubs/${clubId}`;
    }
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
