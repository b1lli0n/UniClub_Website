import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Trophy, Medal } from 'lucide-react';
import { getMonthlyLeaderboard } from '../../api/pointsApi';
import { getClubById } from '../../api/clubApi';
import ClubDetailNav from '../../components/clubs/ClubDetailNav';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Leaderboard.css';
import { ASSET_BASE } from '../../api/api';

const getCurrentMonthKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-');
  if (!y || !m) return monthStr;
  return `Tháng ${m} / ${y}`;
};

const isSameUser = (item, userId) => {
  if (!userId || !item) return false;
  const uid = String(userId);
  return (
    String(item._id ?? '') === uid ||
    String(item.user?._id ?? '') === uid ||
    String(item.userId ?? '') === uid
  );
};

const ClubLeaderboard = () => {
  const { id: clubId } = useParams();
  const location = useLocation();
  const { showFloatingNav } = useOutletContext() || {};
  const { user } = useAuth();
  const [month] = useState(getCurrentMonthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubNameFallback, setClubNameFallback] = useState('');

  const clubName =
    location.state?.clubName ||
    data?.clubName ||
    data?.club?.name ||
    clubNameFallback ||
    'Câu lạc bộ';
  const isMember = location.state?.isMember ?? false;
  const myUserId = user?._id || user?.id;

  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const res = await getMonthlyLeaderboard(clubId, month, 10);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.message || 'Không có dữ liệu bảng xếp hạng');
          setData(null);
        }
      } catch (error) {
        console.error('Fetch leaderboard error:', error);
        toast.error(error?.message || 'Không thể tải bảng xếp hạng');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [clubId, month]);

  useEffect(() => {
    const fetchClubName = async () => {
      if (!clubId) return;
      try {
        const res = await getClubById(clubId);
        if (res?.success && res?.data?.name) {
          setClubNameFallback(res.data.name);
        }
      } catch {
      }
    };
    fetchClubName();
  }, [clubId]);

  const items = data?.items || [];
  const top3 = items.slice(0, 3);
  const myItem = myUserId ? items.find((it) => isSameUser(it, myUserId)) : null;
  const tableItems = items;

  const initials = (data?.userFullName || '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const renderPodiumPillar = (item, rank, variant) => {
    const IconComp = rank === 1 ? Trophy : Medal;
    if (!item) {
      return (
        <div className={`leaderboard-pillar leaderboard-pillar--${variant}`}>
          <div className="leaderboard-pillar-head">
            <div className="leaderboard-avatar leaderboard-avatar--podium-pillar leaderboard-avatar--empty-pillar" />
            <div className="leaderboard-name-pill">—</div>
          </div>
          <div className="leaderboard-pillar-block leaderboard-pillar-block--empty">
            <IconComp className="leaderboard-pillar-icon" size={28} strokeWidth={2} aria-hidden />
            <span className="leaderboard-pillar-rank-num">{rank}</span>
            <span className="leaderboard-pillar-score">—</span>
          </div>
        </div>
      );
    }

    const name = item.name || 'Thành viên';
    const achievements = item.totalAchievement ?? 0;
    const avatar = item.avatar_url || item.avatar || '';

    return (
      <div className={`leaderboard-pillar leaderboard-pillar--${variant}`}>
        <div className="leaderboard-pillar-head">
          <div
            className={
              rank === 1
                ? 'leaderboard-avatar leaderboard-avatar--podium-pillar leaderboard-avatar--podium-pillar-xl'
                : 'leaderboard-avatar leaderboard-avatar--podium-pillar'
            }
          >
            {avatar ? (
              <img
                src={avatar.startsWith('http') ? avatar : `${ASSET_BASE}${avatar}`}
                alt={name}
                className="profile-avatar-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/default-avatar.png';
                }}
              />
            ) : (
              <div className="profile-avatar">{initials || 'UC'}</div>
            )}
          </div>
          <div className="leaderboard-name-pill" title={name}>
            {name}
          </div>
        </div>
        <div className="leaderboard-pillar-block">
          <IconComp
            className="leaderboard-pillar-icon"
            size={rank === 1 ? 32 : 26}
            strokeWidth={2}
            aria-hidden
          />
          <span className="leaderboard-pillar-rank-num">{rank}</span>
          <span className="leaderboard-pillar-score">
            <strong>{achievements}</strong>
            <span className="leaderboard-pillar-score-label"> cống hiến</span>
          </span>
        </div>
      </div>
    );
  };

  const renderTableRow = (item, idx, { sticky } = {}) => {
    const rank = item.rank ?? idx + 1;
    const name = item.name || 'Thành viên';
    const achievements = item.totalAchievement ?? 0;
    const badge = item.badge ?? 0;
    const rankClass =
      rank === 1
        ? 'leaderboard-rank-num--1'
        : rank === 2
          ? 'leaderboard-rank-num--2'
          : rank === 3
            ? 'leaderboard-rank-num--3'
            : '';

    return (
      <div
        key={`${item._id ?? item.user?._id ?? rank}-${sticky ? 'sticky' : 'row'}`}
        className={`leaderboard-table-row ${sticky ? 'leaderboard-table-row--me' : ''}`}
      >
        <span className={`leaderboard-rank-num ${rankClass}`}>{String(rank).padStart(2, '0')}</span>
        <div className="leaderboard-avatar leaderboard-avatar--table">
          {item.avatar_url ? (
            <img
              src={
                item.avatar_url.startsWith('http')
                  ? item.avatar_url
                  : `${ASSET_BASE}${item.avatar_url}`
              }
              alt={name}
              className="profile-avatar-image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/default-avatar.png';
              }}
            />
          ) : (
            <div className="profile-avatar">{initials || 'UC'}</div>
          )}
        </div>
        <div className="leaderboard-user-name leaderboard-user-name--table">{name}</div>
        <div className="leaderboard-stat-badge">
          <span className="val">{badge}</span>
          <span className="lbl">HH</span>
        </div>
        <div className="leaderboard-stat-badge">
          <span className="val">{achievements}</span>
          <span className="lbl">Điểm</span>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-shell">
        <header className="leaderboard-head">
          <h1 className="leaderboard-title">CLB {clubName}</h1>
          <div className="leaderboard-month-pill">
            <Calendar className="leaderboard-month-icon" size={17} strokeWidth={2} aria-hidden />
            <span>{formatMonthLabel(data?.month || month)}</span>
          </div>
        </header>

        {loading ? (
          <div className="leaderboard-loading">Đang tải...</div>
        ) : (
          <div className="leaderboard-split">
            <aside className="leaderboard-col-left">
              <div className="leaderboard-highlight-bg" aria-hidden />
              <div className="leaderboard-podium-row">
                {renderPodiumPillar(top3[1], 2, 'second')}
                {renderPodiumPillar(top3[0], 1, 'first')}
                {renderPodiumPillar(top3[2], 3, 'third')}
              </div>
            </aside>

            <div className="leaderboard-col-right">
              <div className="leaderboard-table-header">
                <span>Hạng</span>
                <span />
                <span>Thành viên</span>
                <span>Thành tích</span>
                <span>Cống hiến</span>
              </div>
              <div className="leaderboard-table-scroll">
                {tableItems.map((item, idx) => renderTableRow(item, idx, { sticky: false }))}
              </div>
              {myItem ? (
                <div className="leaderboard-sticky-me">{renderTableRow(myItem, 0, { sticky: true })}</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      {showFloatingNav !== false && (
        <ClubDetailNav clubName={clubName} isMember={isMember} />
      )}
    </div>
  );
};

export default ClubLeaderboard;
