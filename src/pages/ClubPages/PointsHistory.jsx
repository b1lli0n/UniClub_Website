import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Gift, Trophy, TrendingUp, Building2 } from 'lucide-react';
import { getPointsHistory } from '../../api/pointsApi';
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

const PointsHistory = () => {
  const { id: clubId } = useParams();
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('points-history-body');
    return () => document.body.classList.remove('points-history-body');
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
  const achievementScore = data?.achievement ?? 0;
  const progressPercent = 100;

  return (
    <div className="points-history-page">
      <div className="points-history-container">
        <div className="points-history-hero">
          <h1 className="points-history-hero-title">
            LỊCH SỬ <span className="points-history-hero-accent">ĐÓNG GÓP</span>
          </h1>
        </div>

        {loading && (
          <div className="points-history-glass points-history-card points-history-loading-card">
            <p className="points-history-loading">Đang tải...</p>
          </div>
        )}

        {!loading && (
          <div className="points-history-dashboard">
            <aside className="points-history-sidebar">
              <div className="points-history-glass points-history-card points-history-club-card">
                <span className="points-history-role-badge">{data?.role || 'Thành viên'}</span>
                <span className="points-history-club-label">Câu lạc bộ</span>
                <div className="points-history-club-name-wrap">
                  <Building2 className="points-history-club-icon" aria-hidden />
                  <h2 className="points-history-club-name">{data?.clubName || '—'}</h2>
                </div>
                <span className="points-history-join-date">
                  Thành viên từ: <b>{formatJoinDate(data?.joined_at) || '—'}</b>
                </span>
              </div>

              <div className="points-history-glass points-history-card points-history-contrib-card">
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
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="points-history-glass points-history-card points-history-reward-card">
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

              <div className="points-history-glass points-history-card points-history-badges-card">
                <span className="points-history-stat-label points-history-badges-label">Thành tích</span>
                <div className="points-history-badges-value">
                  <Trophy className="points-history-badges-icon" aria-hidden />
                  <span>{(data?.totalBadges ?? data?.totalAchievement ?? 0)} Huy hiệu</span>
                </div>
              </div>
            </aside>

            <div className="points-history-main">
              <div className="points-history-glass points-history-card points-history-history-card">
                <div className="points-history-history-header">
                  <h3 className="points-history-history-title">Chi tiết lịch sử điểm</h3>
                  <div className="points-history-filter">
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
                    data.items.map((item, idx) => (
                      <div
                        key={item._id ?? item.event_id?.id ?? idx}
                        className="points-history-row"
                      >
                        <div className="points-history-date-box">
                          {formatDateBox(item.created_at)}
                        </div>
                        <div className="points-history-row-content">
                          <h4 className="points-history-row-title">
                            {item.event_id?.title ?? item.action_type_id?.name ?? '—'}
                          </h4>
                          <p className="points-history-row-sub">
                            {item.action_type_id?.name ?? item.action_type_id?.code ?? 'Đóng góp'} • Điểm cộng
                          </p>
                        </div>
                        <div className="points-history-points-box">
                          +{item.achievement_point ?? 0} ACV
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="points-history-empty">Chưa có bản ghi nào trong tháng này.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsHistory;
