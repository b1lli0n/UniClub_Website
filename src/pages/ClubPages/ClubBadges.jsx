import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyBadges } from '../../api/pointsApi';
import ClubDetailNav from '../../components/ClubDetailNav';
import '../../styles/ClubBadges.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

const buildImageSrc = (raw) => {
  const cleaned = (raw || '').trim().replace(/"/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('http')) return cleaned;
  return `${ASSET_BASE}${cleaned}`;
};

const formatEarnedDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const BADGES_PER_PAGE = 12;

const ClubBadges = () => {
  const { showFloatingNav } = useOutletContext() || {};
  const { id: clubId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const clubName = location.state?.clubName || 'Câu lạc bộ';

  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const res = await getMyBadges(clubId);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.message || 'Không có dữ liệu huy hiệu');
          setData(null);
        }
      } catch (error) {
        console.error('Fetch my badges error:', error);
        toast.error(error?.message || 'Không thể tải huy hiệu của bạn');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [clubId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [clubId]);

  const items = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(items.length / BADGES_PER_PAGE));
  const paginatedItems = items.slice(
    (currentPage - 1) * BADGES_PER_PAGE,
    currentPage * BADGES_PER_PAGE
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
  const totalBadges = data?.totalBadges ?? items.length;

  const isMember = true;

  return (
    <div className="club-badges-page">
      <div className="club-badges-shell">
        <header className="club-badges-shell-head">
          <div className="club-badges-shell-head-text">
            <h1 className="club-badges-shell-title">Huy hiệu của tôi</h1>
            <p className="club-badges-shell-sub">Thành tích cá nhân tại {clubName}</p>
          </div>
          {!loading && (
            <div className="club-badges-shell-total">
              <span className="club-badges-shell-total-label">Tổng huy hiệu</span>
              <span className="club-badges-shell-total-value">{totalBadges}</span>
            </div>
          )}
        </header>

        {loading && <p className="club-badges-state">Đang tải...</p>}

        {!loading && items.length === 0 && (
          <p className="club-badges-state">Bạn chưa có huy hiệu nào trong câu lạc bộ này.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="club-badges-grid">
            {paginatedItems.map((item) => {
              const template = item.badge_id?.badge_template_id || {};
              const name = template.name || 'Huy hiệu';
              const desc = template.description || 'Đã đạt được huy hiệu này trong câu lạc bộ.';
              const iconUrl = buildImageSrc(template.icon_url);
              const pts = item.badge_id?.points_required ?? 0;
              const earned = formatEarnedDate(item.earned_at);

              return (
                <article key={item._id} className="club-badges-card">
                  <div className="club-badges-card-hex-wrap">
                    <div className="club-badges-card-hex" aria-hidden>
                      {iconUrl ? (
                        <>
                          <img
                            src={iconUrl}
                            className="club-badges-card-hex-icon"
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.nextElementSibling;
                              if (fb) fb.classList.add('club-badges-card-hex-fallback--show');
                            }}
                          />
                          <span className="club-badges-card-hex-fallback" aria-hidden>
                            🏅
                          </span>
                        </>
                      ) : (
                        <span
                          className="club-badges-card-hex-fallback club-badges-card-hex-fallback--show"
                          aria-hidden
                        >
                          🏅
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="club-badges-card-panel">
                    <div className="club-badges-card-value">{pts.toLocaleString('vi-VN')}</div>
                    <h2 className="club-badges-card-name">{name}</h2>
                    <p className="club-badges-card-desc">{desc}</p>
                    {earned ? <p className="club-badges-card-meta">{earned}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && items.length > 0 && totalPages > 1 && (
          <nav className="club-badges-pagination" aria-label="Phân trang huy hiệu">
            <button
              type="button"
              className="club-badges-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="club-badges-page-numbers">
              {getVisiblePages().map((item) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    className={`club-badges-page-btn ${currentPage === item ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="club-badges-page-dots" aria-hidden>
                    ...
                  </span>
                )
              )}
            </div>
            <button
              type="button"
              className="club-badges-page-btn"
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

export default ClubBadges;
