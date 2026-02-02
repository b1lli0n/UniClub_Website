import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getClubById, getEventsByClub } from '../api/clubApi';
import '../styles/ClubDetail.css';

// Backend base URL để build full URL cho logo_url / imageUrl nếu BE trả về đường dẫn tương đối
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

// Helper: build full image URL từ đường dẫn trong DB (/assets/..., /uploads/..., hoặc absolute URL)
const buildImageSrc = (raw) => {
  const cleaned = (raw || '').trim().replace(/"/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('http')) return cleaned;
  return `${ASSET_BASE}${cleaned}`;
};

const ClubDetail = () => {
  const { id } = useParams();
  const [isJoined, setIsJoined] = useState(false);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Add body class for styling
  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  // Fetch club detail + events from API
  useEffect(() => {
    const fetchClubDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Lấy thông tin club
        const clubRes = await getClubById(id);
        if (clubRes.success) {
          setClub(clubRes.data);
        } else {
          toast.error(clubRes.message || 'Không thể tải thông tin câu lạc bộ');
          setClub(null);
        }

        // 2. Lấy danh sách sự kiện của club
        const eventRes = await getEventsByClub(id, { sortBy: 'nearest' });
        if (eventRes.success) {
          setEvents(eventRes.data || []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching club detail:', error);
        const message =
          error?.message ||
          error?.response?.data?.message ||
          'Không thể tải thông tin câu lạc bộ';
        toast.error(message);
        setClub(null);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetail();
  }, [id]);

  const handleJoin = () => {
    setIsJoined(!isJoined);
  };

  // Derived data từ club
  // Map events từ BE sang shape FE đang dùng
  const organizedEvents = (events || []).map((ev) => {
    const image = buildImageSrc(ev.media_urls && ev.media_urls[0]);
    return {
      _id: ev._id,
      id: ev._id,
      category: ev.category || 'Sự kiện',
      name: ev.title,
      description: ev.description,
      participants: ev.participants_count ?? 0,
      image,
    };
  });
  const adminBoard = club?.adminBoard || [];

  // Chuẩn hoá dữ liệu thư viện ảnh từ BE
  // Hỗ trợ cả:
  // - club.libraryImages: [{ imageUrl, isLarge }, ...]
  // - club.libraryImages: ['/assets/a.jpg', '/assets/b.jpg']
  // - club.libraryImage: '/assets/a.jpg' hoặc ['...']
  const rawLibraryImages = club?.libraryImages || club?.libraryImage || [];

  // Debug: Log raw data từ BE
  // console.log('[FE DEBUG] Raw libraryImages from API:', rawLibraryImages);
  // console.log('[FE DEBUG] Type:', typeof rawLibraryImages, 'isArray:', Array.isArray(rawLibraryImages));

  const normalizedLibraryImages = (Array.isArray(rawLibraryImages)
    ? rawLibraryImages
    : rawLibraryImages ? [rawLibraryImages] : []
  )
    .map((img) => {
      if (!img) return null;
      if (typeof img === 'string') {
        // Loại bỏ dấu ngoặc kép và khoảng trắng thừa, trailing slash
        const cleaned = img.trim().replace(/^["']|["']$/g, '').replace(/\/$/, '');
        return cleaned ? { imageUrl: cleaned, isLarge: false } : null;
      }
      if (typeof img === 'object' && img !== null) {
        const imageUrl = (img.imageUrl || img.url || img.path || '').trim().replace(/^["']|["']$/g, '').replace(/\/$/, '');
        return imageUrl ? {
          imageUrl: imageUrl,
          isLarge: !!img.isLarge,
        } : null;
      }
      return null;
    })
    .filter((img) => img && img.imageUrl);

  // Debug: Log sau khi normalize
  // console.log('[FE DEBUG] Normalized libraryImages:', normalizedLibraryImages);
  // console.log('[FE DEBUG] Normalized count:', normalizedLibraryImages.length);
  
  // Đảm bảo normalizedLibraryImages luôn là array
  const safeLibraryImages = Array.isArray(normalizedLibraryImages) ? normalizedLibraryImages : [];

  // Build logo URL giống với ListOfClubs (ưu tiên logo_url, chỉ xử lý 1 chỗ)
  const logoSrc = buildImageSrc(club?.logo_url);

  // 4 slot thư viện ảnh đều nhau (2x2)
  const librarySlots = [0, 1, 2, 3];

  return (
    <div className="clubdetail-container">
      <Container className="py-4">
        {/* Loading / Error state */}
        {loading && (
          <section className="clubdetail-section">
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span className="clubdetail-label">Đang tải</span>
              <p className="clubdetail-desc-text">Đang tải thông tin câu lạc bộ...</p>
            </div>
          </section>
        )}

        {!loading && !club && (
          <section className="clubdetail-section">
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span className="clubdetail-label">Không tìm thấy</span>
              <p className="clubdetail-desc-text">
                Không tìm thấy thông tin câu lạc bộ. Vui lòng quay lại danh sách câu lạc bộ.
              </p>
            </div>
          </section>
        )}

        {!loading && club && (
          <>
        {/* Club Information Section */}
        <section className="clubdetail-info glass-panel">
          <div className="clubdetail-info-grid">
            {/* Logo */}
            <div className="clubdetail-logo">
              {logoSrc ? (
                <div className="clubdetail-logo-wrapper">
                  <img
                    src={logoSrc}
                    alt={club.name}
                    className="clubdetail-logo-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/clubs/default.png';
                    }}
                  />
                </div>
              ) : (
                <div className="clubdetail-logo-placeholder">
                  <span>Logo</span>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="clubdetail-main">
              <div className="clubdetail-name-section">
                <span className="clubdetail-label">Tên câu lạc bộ</span>
                <h1 className="clubdetail-name">{club.name}</h1>
              </div>

              <div className="clubdetail-stats">
                <div className="clubdetail-stat">
                  <span className="clubdetail-label">Số lượng thành viên</span>
                  <span className="clubdetail-stat-value">
                    {club.member_total ?? club.members ?? 0}
                  </span>
                </div>
                <div className="clubdetail-stat">
                  <span className="clubdetail-label">Sự kiện</span>
                  <span className="clubdetail-stat-value">
                    {club.event_total ?? club.events ?? 0}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`clubdetail-join-btn ${isJoined ? 'is-joined' : ''}`}
                onClick={handleJoin}
              >
                {isJoined ? 'Đã tham gia ✓' : 'Tham gia ngay'}
              </button>
            </div>

            {/* Description */}
            <div className="clubdetail-desc">
              <span className="clubdetail-label">Mô tả</span>
              <p className="clubdetail-desc-text">{club.description}</p>
            </div>
          </div>
        </section>

        {/* Organized Events Section */}
        <section className="clubdetail-section">
          <h2 className="clubdetail-section-title">Sự kiện đã tổ chức</h2>
          <div className="clubdetail-events-grid">
            {organizedEvents.length > 0 ? (
              organizedEvents.map((event) => (
                <div
                  key={event._id || event.id}
                  className="clubdetail-event-card glass-panel"
                >
                  <div className="clubdetail-event-image">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.name}
                        className="clubdetail-event-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/events/default.png';
                        }}
                      />
                    ) : (
                      <div className="clubdetail-image-placeholder">
                        <span>Image</span>
                      </div>
                    )}
                  </div>
                  <div className="clubdetail-event-body">
                    <div className="clubdetail-event-row">
                      <span className="clubdetail-label">Thể loại</span>
                      <span className="clubdetail-event-category">{event.category}</span>
                    </div>
                    <div className="clubdetail-event-row">
                      <span className="clubdetail-label">Tên sự kiện</span>
                      <h3 className="clubdetail-event-name">{event.name}</h3>
                    </div>
                    <div className="clubdetail-event-row">
                      <span className="clubdetail-label">Mô tả</span>
                      <p className="clubdetail-event-desc">{event.description}</p>
                    </div>
                    <div className="clubdetail-event-row">
                      <span className="clubdetail-label">Số lượng tham gia</span>
                      <span className="clubdetail-event-participants">
                        {event.participants || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="clubdetail-event-card glass-panel">
                <div className="clubdetail-event-body">
                  <p className="clubdetail-event-desc">
                    Câu lạc bộ chưa có sự kiện nào được tổ chức.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Admin Board Section */}
        <section className="clubdetail-section">
          <h2 className="clubdetail-section-title">Ban quản trị</h2>
          <div className="clubdetail-admin-grid">
            {adminBoard.length > 0 ? (
              adminBoard.map((admin) => {
                const rawAvatar = (admin.avatar || '').trim().replace(/"/g, '');
                const avatarSrc = rawAvatar
                  ? rawAvatar.startsWith('http')
                    ? rawAvatar
                    : `${ASSET_BASE}${rawAvatar}`
                  : null;

                return (
                  <div
                    key={admin._id || admin.id}
                    className="clubdetail-admin-card glass-panel"
                  >
                    <div className="clubdetail-admin-avatar">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={admin.name}
                          className="clubdetail-admin-avatar-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/users/default.png';
                          }}
                        />
                      ) : (
                        <div className="clubdetail-avatar-placeholder">
                          <span>Image</span>
                        </div>
                      )}
                    </div>
                    <div className="clubdetail-admin-info">
                      <span className="clubdetail-admin-name">{admin.name}</span>
                      <span className="clubdetail-admin-role">{admin.role}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="clubdetail-admin-card glass-panel">
                <div className="clubdetail-admin-info">
                  <span className="clubdetail-admin-name">
                    Chưa cập nhật ban quản trị cho câu lạc bộ này.
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Club Library Section */}
        <section className="clubdetail-section">
          <h2 className="clubdetail-section-title">Thư viện CLB</h2>
          {/* Nền kính chung cho cả 4 khung ảnh */}
          <div className="clubdetail-library-wrapper glass-panel">
            <div className="clubdetail-library-grid">
              {librarySlots.map((slotIndex) => {
                const imgObj = safeLibraryImages[slotIndex] || null;
                const src = imgObj && imgObj.imageUrl ? buildImageSrc(imgObj.imageUrl) : null;
                return (
                  <div
                    key={slotIndex}
                    className="clubdetail-library-item"
                  >
                    <div className="clubdetail-library-frame">
                      {src ? (
                        <img
                          src={src}
                          alt={club.name}
                          className="clubdetail-library-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/clubs/default-library.png';
                          }}
                        />
                      ) : (
                        <div className="clubdetail-image-placeholder">
                          <span>Chưa có hình ảnh thư viện</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
          </>
        )}
      </Container>
    </div>
  );
};

export default ClubDetail;
