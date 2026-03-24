import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Gift, Trophy, TrendingUp, Building2, Calendar } from 'lucide-react';
import { getPointsHistory } from '../../api/pointsApi';
import { ASSET_BASE } from '../../api/api';
import ClubDetailNav from '../../components/ClubDetailNav';
import '../../styles/PointsHistory.css';

const formatDateBox = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day} TH ${String(month).padStart(2, '0')}`;
};

const formatJoinDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getCurrentMonthKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const toAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${ASSET_BASE}${normalized}`;
};

const getHistoryImageUrl = (item) => {
  const event = item?.event_id || {};
  const actionType = item?.action_type_id || {};

  const candidates = [
    event.image_url,
    event.banner_url,
    event.thumbnail_url,
    Array.isArray(event.media_urls) ? event.media_urls[0] : null,
    actionType.image_url,
    actionType.icon_url,
  ];

  const first = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return toAssetUrl(first);
};

const formatRoleLabel = (role) => {
  const value = typeof role === 'string' ? role.trim() : role;
  const map = {
    0: 'Thành viên',
    1: 'Leader',
    2: 'Sub Leader',
    3: 'Secretary',
    4: 'Treasurer',
  };

  if (typeof value === 'number' && map[value]) return map[value];
  if (typeof value === 'string') {
    if (value !== '' && !Number.isNaN(Number(value)) && map[Number(value)]) return map[Number(value)];
    return value;
  }
  return 'Thành viên';
};

const PointsHistory = () => {
  const { id: clubId } = useParams();
  const location = useLocation();
  const { showFloatingNav } = useOutletContext() || {};
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const res = await getPointsHistory(clubId, month || undefined);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.message || 'Không có dữ liệu lịch sử điểm');
          setData(null);
        }
      } catch (error) {
        console.error('Fetch points history error:', error);
        toast.error(error?.message || 'Không thể tải lịch sử điểm thành tích');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [clubId, month]);

  const months = (() => {
    const list = [{ value: '', label: 'Tất cả' }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      list.push({ value: `${y}-${m}`, label: `${m}/${y}` });
    }
    return list;
  })();


  const contributionsScore = data?.contributions_score ?? 0;
  const achievementScore = data?.totalAchievement ?? 0;

  const clubName = data?.clubName || location.state?.clubName;
  const isMember = true;

  return (
    <div className="points-history-page">
      <div className="points-history-container points-history-shell">
        <header className="points-history-top">
          <h1 className="points-history-top-title">Lịch sử điểm</h1>
          <p className="points-history-top-desc">Theo dõi điểm thành tích và đóng góp tại câu lạc bộ.</p>
        </header>

        {loading && (
          <div className="points-history-card points-history-loading-card">
            <p className="points-history-loading">Đang tải...</p>
          </div>
        )}

        {!loading && (
          <div className="points-history-dashboard">
            <aside className="points-history-sidebar">
              <div className="points-history-card points-history-stat-card points-history-stat-card--club">
                <span className="points-history-stat-label">Câu lạc bộ</span>
                <div className="points-history-club-name-wrap">
                  <Building2 className="points-history-stat-icon" aria-hidden />
                  <h2 className="points-history-club-name">{data?.clubName || '—'}</h2>
                </div>
                <span className="points-history-join-date">
                  Thành viên từ: {formatJoinDate(data?.joined_at) || '—'}
                </span>
                <span className="points-history-role-badge">{formatRoleLabel(data?.role)}</span>
              </div>

              <div className="points-history-card points-history-contrib-card">
                <span className="points-history-stat-label">Điểm đóng góp</span>
                <div className="points-history-contrib-row">
                  <TrendingUp className="points-history-contrib-icon" aria-hidden />
                  <span className="points-history-contrib-value">
                    {achievementScore.toLocaleString()}
                    <span className="points-history-contrib-unit"> điểm</span>
                  </span>
                </div>
                <div className="points-history-progress-track">
                  <div
                    className="points-history-progress-fill"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="points-history-card points-history-reward-card">
                <span className="points-history-stat-label points-history-reward-label">Điểm thưởng</span>
                <div className="points-history-reward-row">
                  <Gift className="points-history-reward-icon" aria-hidden />
                  <span className="points-history-reward-value">
                    {(data?.totalReward ?? 0).toLocaleString()}
                    <span className="points-history-reward-unit"> điểm</span>
                  </span>
                </div>
                <button type="button" className="points-history-btn-redeem">
                  Đổi quà ngay
                </button>
              </div>

              <div className="points-history-card points-history-badges-card">
                <span className="points-history-stat-label points-history-badges-label">Thành tích</span>
                <div className="points-history-badges-value">
                  <Trophy className="points-history-badges-icon" aria-hidden />
                  <span>{(data?.totalBadges ?? data?.totalAchievement ?? 0)} Huy hiệu</span>
                </div>
              </div>
            </aside>

            <div className="points-history-main">
              <div className="points-history-card points-history-history-card">
              <div className="points-history-history-header">
                <h3 className="points-history-history-title">Chi tiết lịch sử điểm</h3>
                <div className="points-history-filter">
                  <Calendar size={16} aria-hidden />
                  <select
                    className="points-history-month-select"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    aria-label="Chọn tháng"
                  >
                    {months.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="points-history-list">
                {!data ? (
                  <p className="points-history-empty">Không tải được dữ liệu. Vui lòng thử lại hoặc chọn tháng khác.</p>
                ) : data.items && data.items.length > 0 ? (
                  data.items.map((item, idx) => {
                    const imageUrl = getHistoryImageUrl(item);

                    return (
                      <div
                        key={item._id ?? item.event_id?.id ?? idx}
                        className="points-history-row"
                      >
                        <div className="points-history-date-box">
                          {formatDateBox(item.created_at)}
                        </div>
                        <div className="points-history-row-main">
                          {imageUrl && (
                            <div className="points-history-thumb">
                              <img
                                src={imageUrl}
                                alt={item.event_id?.title ?? item.action_type_id?.name ?? 'Lịch sử điểm'}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/default-avatar.png';
                                }}
                              />
                            </div>
                          )}

                          <div className="points-history-row-text">
                            <h4 className="points-history-row-title">
                              {item.event_id?.title ?? item.action_type_id?.name ?? '—'}
                            </h4>
                            <p className="points-history-row-sub">
                              {item.action_type_id?.name ?? item.action_type_id?.code ?? 'Đóng góp'} • Điểm cộng
                            </p>
                          </div>
                        </div>
                        <div className="points-history-points-box">
                          +{item.achievement_point ?? 0} Điểm
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="points-history-empty">Chưa có bản ghi nào trong tháng này.</p>
                )}
              </div>
            </div>
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

export default PointsHistory;
