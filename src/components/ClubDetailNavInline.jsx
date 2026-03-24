import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, CircleStar, BookMarked, ScrollText } from 'lucide-react';
import '../styles/ClubDetailNavInline.css';

const TABS = [
  { key: 'overview', path: '', label: 'Tổng quan', Icon: LayoutDashboard, membersOnly: false },
  { key: 'leaderboard', path: '/leaderboard', label: 'BXH', Icon: Trophy, membersOnly: false },
  { key: 'point-rules', path: '/point-rules', label: 'Quy tắc điểm', Icon: BookMarked, membersOnly: false },
  { key: 'badges', path: '/badges', label: 'Huy hiệu', Icon: CircleStar, membersOnly: true },
  { key: 'points-history', path: '/points-history', label: 'Lịch sử điểm', Icon: ScrollText, membersOnly: true },
];

const ClubDetailNavInline = ({ clubName, isMember = true }) => {
  const { id: clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || '';

  if (!clubId) return null;

  const getActiveKey = () => {
    const base = `/clubs/${clubId}`;
    if (pathname === base || pathname === `${base}/`) return 'overview';
    if (pathname.includes('/leaderboard')) return 'leaderboard';
    if (pathname.includes('/badges')) return 'badges';
    if (pathname.includes('/point-rules')) return 'point-rules';
    if (pathname.includes('/points-history')) return 'points-history';
    return 'overview';
  };

  const activeKey = getActiveKey();
  const tabs = isMember ? TABS : TABS.filter((t) => !t.membersOnly);

  const handleNavigate = (tab) => {
    const to = tab.path ? `/clubs/${clubId}${tab.path}` : `/clubs/${clubId}`;
    navigate(to, { state: { clubName: clubName || location.state?.clubName, isMember } });
  };

  return (
    <nav className="clubdetail-nav-inline" aria-label="Điều hướng CLB">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        const Icon = tab.Icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={`clubdetail-nav-inline__item ${isActive ? 'is-active' : ''}`}
            onClick={() => handleNavigate(tab)}
            aria-current={isActive ? 'page' : undefined}
            title={tab.label}
          >
            <span className="clubdetail-nav-inline__icon">
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="clubdetail-nav-inline__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default ClubDetailNavInline;
