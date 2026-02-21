import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMonthlyLeaderboard } from '../../api/pointsApi';
import '../../styles/Leaderboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

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
  return `Tháng ${m}/${y}`;
};


const ClubLeaderboard = () => {
  const { id: clubId } = useParams();
  const location = useLocation();
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const clubName = location.state?.clubName || 'C�u l?c b?';

  useEffect(() => {
    document.body.classList.add('leaderboard-body');
    return () => document.body.classList.remove('leaderboard-body');
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
          toast.error(res.message || 'Kh�ng c� d? li?u b?ng x?p h?ng');
          setData(null);
        }
      } catch (error) {
        console.error('Fetch leaderboard error:', error);
        toast.error(error?.message || 'Kh�ng th? t?i b?ng x?p h?ng');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [clubId, month]);

  const items = data?.items || [];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const renderPodiumCard = (item, rank) => {
    if (!item) {
      return (
        <div className="leaderboard-podium-card">
          <div className="leaderboard-avatar" />
          <div className="leaderboard-user-name">?</div>
        </div>
      );
    }
    const initials = (item.fullName || '')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase())
      .join('');

    const name = item.name || 'Thành viên';
    const achievements = item.totalAchievement ?? 0;
    const badge = item.badge ?? 0;
    const avatar = item.avatar_url || item.avatar || '';
    const tagStyle =
      rank === 1
        ? { background: 'var(--leaderboard-gold)' }
        : rank === 2
          ? { background: 'var(--leaderboard-silver)' }
          : { background: 'var(--leaderboard-bronze)' };

    return (
      <div
        className={
          rank === 1
            ? 'leaderboard-podium-card leaderboard-first'
            : 'leaderboard-podium-card'
        }
      >
        <span className="leaderboard-rank-tag" style={tagStyle}>
          #{String(rank).padStart(2, '0')}
        </span>
        <div className="leaderboard-avatar">
          {/* {item.avatar_url ? (
            <img src={item.avatar_url} alt={name} />
          ) : (
            getInitials(name)
          )} */}
          {avatar ? (
            <img
              src={
                avatar.startsWith('http')
                  ? avatar
                  : `${ASSET_BASE}${avatar}`
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
        <div className="leaderboard-user-name">{name}</div>
        <div className="leaderboard-stat-badge" style={{ marginTop: 10 }}>
          <span className="val">{achievements}</span>
          <span className="lbl">Cống hiến</span>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>
            {/* CLB <span>{clubName}</span> */}
            {clubName}
          </h1>
          <div className="leaderboard-month-display">
            Bảng xếp hạng {formatMonthLabel(data?.month || month)}
          </div>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Đang tải...</p>
        )}

        {!loading && (
          <>
            <div className="leaderboard-podium">
              {renderPodiumCard(top3[1], 2)}
              {renderPodiumCard(top3[0], 1)}
              {renderPodiumCard(top3[2], 3)}
            </div>

            <div className="leaderboard-list">
              <div className="leaderboard-list-item leaderboard-list-header">
                <span>Hạng</span>
                <span />
                <span>Thành viên</span>
                <span style={{ textAlign: 'center' }}>Thành tích</span>
                <span style={{ textAlign: 'center' }}>Cống hiến</span>
              </div>

              {items.map((item, idx) => {
                const rank = item.rank ?? idx + 1;
                const name = item.name || 'Thành viên';
                const achievements = item.totalAchievement ?? 0;
                const badge = item.badge ?? 0;
                const rankClass =
                  rank === 1
                    ? 'leaderboard-rank-1'
                    : rank === 2
                      ? 'leaderboard-rank-2'
                      : rank === 3
                        ? 'leaderboard-rank-3'
                        : '';

                return (
                  <div
                    key={item._id ?? item.user?._id ?? rank}
                    className="leaderboard-list-item"
                  >
                    <span className={`leaderboard-rank-num ${rankClass}`}>
                      {String(rank).padStart(2, '0')}
                    </span>
                    <div
                      className="leaderboard-avatar"
                      style={{ width: 35, height: 35, margin: 0 }}
                    >
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
                    <div className="leaderboard-user-name">{name}</div>
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
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubLeaderboard;

