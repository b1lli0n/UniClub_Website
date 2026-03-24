import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Star,
  MapPin,
  CalendarCheck,
  CalendarDays,
  Ticket,
  Users,
  Trophy,
  Gift,
  ClipboardList,
  Zap,
  Medal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getPointRules } from '../../api/pointsApi';
import ClubDetailNav from '../../components/ClubDetailNav';
import '../../styles/PointRules.css';

const ACTION_ICONS = {
  CHECKIN_EVENT: MapPin,
  CHECK_IN: MapPin,
  CHECKIN: MapPin,
  ATTEND_EVENT: CalendarCheck,
  ATTEND: CalendarCheck,
  ORGANIZE_EVENT: Users,
  ORGANIZE: Users,
  HOST_EVENT: Users,
  CONTRIBUTION: Trophy,
  BONUS: Gift,
  QUEST: ClipboardList,
  ACHIEVEMENT: Medal,
  SPECIAL: Zap,
  DEFAULT: Star,
};

const getActionIcon = (code) => {
  if (!code) return Star;
  const upper = String(code).toUpperCase().replace(/\s+/g, '_');
  return ACTION_ICONS[upper] || Star;
};

const RULES_PER_PAGE = 9;

const PointRules = () => {
  const { id: clubId } = useParams();
  const location = useLocation();
  const { showFloatingNav } = useOutletContext() || {};
  const clubName = location.state?.clubName;
  const isMember = location.state?.isMember ?? true;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  useEffect(() => {
    const fetchRules = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const res = await getPointRules(clubId);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.message || 'Không có dữ liệu quy tắc');
          setData(null);
        }
      } catch (error) {
        console.error('Fetch point rules error:', error);
        toast.error(error?.message || 'Không thể tải quy tắc tính điểm');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [clubId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [clubId]);

  const items = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(items.length / RULES_PER_PAGE));
  const paginatedItems = items.slice(
    (currentPage - 1) * RULES_PER_PAGE,
    currentPage * RULES_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 'dots', totalPages];
    if (currentPage >= totalPages - 2) {
      return [1, 'dots', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'dots', currentPage - 1, currentPage, currentPage + 1, 'dots-2', totalPages];
  };

  return (
    <div className="point-rules-page">
      <div className="point-rules-shell">
        <header className="point-rules-shell-header">
          <h1 className="point-rules-shell-title">Quy tắc tính điểm</h1>
          <p className="point-rules-shell-desc">
            Tìm hiểu cách tích lũy điểm thành tích và điểm thưởng tại câu lạc bộ.
          </p>
        </header>

        {loading && <p className="point-rules-state">Đang tải...</p>}

        {!loading && items.length === 0 && (
          <p className="point-rules-state">Chưa có quy tắc tính điểm nào.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="point-rules-grid">
            {paginatedItems.map((item) => {
              const action = item.action_type_id || {};
              const name = action.name || action.code || 'Quy tắc';
              const desc = action.description || '';
              const code = action.code || '';
              const achievement = item.achievement_point ?? 0;
              const reward = item.reward_point ?? 0;
              const limitEvent = item.limit_per_event;
              const limitDay = item.limit_per_day;
              const isActive = item.is_active !== false;
              const Icon = getActionIcon(code);

              return (
                <article key={item._id} className="point-rules-card">
                  <div className="point-rules-card-head">
                    <div className="point-rules-action-icon" aria-hidden>
                      <Icon className="point-rules-action-icon-svg" strokeWidth={2} />
                    </div>
                    <div className="point-rules-card-head-text">
                      <div className="point-rules-name-row">
                        <h2 className="point-rules-name">{name}</h2>
                        {code ? (
                          <span className="point-rules-code-badge">{code}</span>
                        ) : null}
                      </div>
                      {isActive ? (
                        <span className="point-rules-badge-active">Đang áp dụng</span>
                      ) : null}
                    </div>
                  </div>

                  <p className="point-rules-desc">
                    {desc || 'Thực hiện hành động để nhận điểm.'}
                  </p>

                  <div className="point-rules-points-row">
                    <div className="point-rules-point-item point-rules-point-item--achievement">
                      <span className="point-rules-point-kicker">Thành tích</span>
                      <span className="point-rules-point-value">+{achievement} điểm</span>
                    </div>
                    <div className="point-rules-point-item point-rules-point-item--reward">
                      <span className="point-rules-point-kicker">Thưởng</span>
                      <span className="point-rules-point-value">+{reward} thưởng</span>
                    </div>
                  </div>

                  <div className="point-rules-limit-info">
                    <div className="point-rules-limit-item">
                      <span className="point-rules-limit-item-label">
                        <Ticket size={15} aria-hidden />
                        Giới hạn / sự kiện
                      </span>
                      <b>
                        {limitEvent != null ? `${limitEvent} lần` : 'Không giới hạn'}
                      </b>
                    </div>
                    <div className="point-rules-limit-item">
                      <span className="point-rules-limit-item-label">
                        <CalendarDays size={15} aria-hidden />
                        Giới hạn / ngày
                      </span>
                      <b>
                        {limitDay != null ? `${limitDay} lần` : 'Không giới hạn'}
                      </b>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && items.length > 0 && totalPages > 1 && (
          <nav className="point-rules-pagination" aria-label="Phân trang quy tắc điểm">
            <button
              type="button"
              className="point-rules-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="point-rules-page-numbers">
              {getVisiblePages().map((item) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    className={`point-rules-page-btn ${currentPage === item ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="point-rules-page-dots" aria-hidden>
                    ...
                  </span>
                )
              )}
            </div>
            <button
              type="button"
              className="point-rules-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
      {showFloatingNav !== false && (
        <ClubDetailNav clubName={clubName} isMember={isMember} />
      )}
    </div>
  );
};

export default PointRules;
