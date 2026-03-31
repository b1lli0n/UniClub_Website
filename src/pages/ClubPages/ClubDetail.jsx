import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Users, Calendar, Tag, ImageIcon, ArrowRight, Crown, UserCircle2, ShieldCheck, FileBadge2, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import ClubDetailNav from '../../components/ClubDetailNav';
import { getClubById, getEventsByClub, requestToJoinClub, leaveClub } from '../../api/clubApi';
import { getRewards } from '../../api/rewardApi';
import { getUserClubs } from '../../api/userApi';
import { listPolls } from '../../api/pollApi';
import ClubPollStrip from '../../components/ClubPollStrip';
import PollVoteModal from '../../components/PollVoteModal';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ClubDetail.css';
import { ASSET_BASE } from '../../api/api';

const buildImageSrc = (raw) => {
  const cleaned = (raw || '').trim().replace(/"/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('http')) return cleaned;
  return `${ASSET_BASE}${cleaned}`;
};

const pickEventShowcaseImage = (event) => {
  if (!event) return null;
  const order = [
    event.banner_url,
    event.image_url,
    event.image,
    event.thumbnail_url,
    Array.isArray(event.media_urls) ? event.media_urls[0] : null,
  ];
  for (const raw of order) {
    const src = buildImageSrc(raw);
    if (src) return src;
  }
  return null;
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
  return '';
};

const getRoleIcon = (role) => {
  const value = typeof role === 'string' ? role.trim() : role;
  const map = {
    0: UserCircle2,
    1: Crown,
    2: ShieldCheck,
    3: FileBadge2,
    4: Wallet,
  };

  if (typeof value === 'number' && map[value]) return map[value];
  if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value)) && map[Number(value)]) {
    return map[Number(value)];
  }
  return UserCircle2;
};

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showFloatingNav } = useOutletContext() || {};
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [heroImgError, setHeroImgError] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [pollItems, setPollItems] = useState([]);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollSearch, setPollSearch] = useState('');
  const [pollStatus, setPollStatus] = useState('');
  const [pollSort, setPollSort] = useState('all');
  const [pollCarouselIndex, setPollCarouselIndex] = useState(0);
  const [voteModalPollId, setVoteModalPollId] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add body class for styling

  useEffect(() => {
    document.body.classList.add('clubdetail-body');
    return () => {
      document.body.classList.remove('clubdetail-body');
    };
  }, []);

  useEffect(() => {
    setHeroImgError(false);
  }, [id, club?.logo_url]);

  useEffect(() => {
    const fetchClubDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const clubRes = await getClubById(id);
        if (clubRes.success) {
          const clubData = clubRes.data;
          setClub(clubData);
          setUserRole(clubData?.membershipRole ?? clubData?.my_role ?? clubData?.role ?? null);
          const fromApi = clubData?.isMember ?? clubData?.is_member;
          if (typeof fromApi === 'boolean') {
            setIsMember(fromApi);
            setIsJoined(fromApi);
          }
        } else {
          toast.error(clubRes.message || 'Không thể tải thông tin câu lạc bộ');
          setClub(null);
        }

        const eventRes = await getEventsByClub(id, { sortBy: 'nearest' });
        if (eventRes.success) {
          setEvents(eventRes.data || []);
        } else {
          setEvents([]);
        }

        const clubData = clubRes?.success ? clubRes.data : null;
        const fromApi = clubData?.isMember ?? clubData?.is_member;
        if (typeof fromApi !== 'boolean' && user) {
          const userId = user._id || user.id;
          if (userId) {
            try {
              const userClubsRes = await getUserClubs(userId);
              const memberships =
                userClubsRes?.data?.clubs ||
                userClubsRes?.data ||
                userClubsRes?.clubs ||
                userClubsRes ||
                [];
              const arr = Array.isArray(memberships) ? memberships : [];
              const joined = arr.some((m) => {
                const cid = m?.club_id?._id || m?.club_id?.id || m?.club?._id || m?.club?.id;
                return String(cid) === String(id);
              });
              const membership = arr.find((m) => {
                const cid = m?.club_id?._id || m?.club_id?.id || m?.club?._id || m?.club?.id;
                return String(cid) === String(id);
              });
              setIsMember(joined);
              setIsJoined(joined);
              if (membership) {
                setUserRole(membership.role ?? membership.membershipRole ?? membership.membership_role ?? null);
              }
            } catch {

            }
          }
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
  }, [id, user]);

  const handleJoin = async () => {
    if (!id || joinLoading || isJoined) return;

    const normalizeClubStatus = (c) => {
      const raw = c?.status ?? c?.club_status ?? c?.clubStatus;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string') {
        const s = raw.trim().toLowerCase();
        if (s === 'active' || s === 'approved' || s === '1') return 1;
        if (s === 'pending' || s === '0') return 0;
        if (s === 'pause' || s === 'paused' || s === 'inactive' || s === '2') return 2;
        if (s === 'reject' || s === 'rejected' || s === 'declined' || s === '3') return 3;
      }
      const isActive = c?.is_active ?? c?.isActive ?? c?.active;
      if (typeof isActive === 'boolean') return isActive ? 1 : 2;
      return null;
    };

    const clubStatus = normalizeClubStatus(club);
    if (clubStatus === 2) {
      toast.error('Câu lạc bộ đang ngưng hoạt động. Bạn không thể gửi yêu cầu tham gia.');
      return;
    }
    if (clubStatus === 3) {
      toast.error('Câu lạc bộ không còn tiếp nhận thành viên. Bạn không thể gửi yêu cầu tham gia.');
      return;
    }
    if (clubStatus === 0) {
      toast.info('Câu lạc bộ đang chờ duyệt. Vui lòng thử lại sau.');
      return;
    }

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      toast.info('Bạn cần đăng nhập để gửi yêu cầu tham gia.');
      navigate('/login');
      return;
    }
    
    setJoinLoading(true);
    try {
      const response = await requestToJoinClub(id);
      console.log('✅ Join response:', response);
      
      // Success response
      setIsJoined(true);
      const successMessage = 'Gửi yêu cầu tham gia thành công! Hãy chờ phê duyệt từ ban quản trị.';
      toast.success(successMessage);
    } catch (error) {
      console.error('❌ Join club error:', error);
      
      // Check if error message indicates success
      const errorMsg = error?.message || error?.data?.message || error || '';
      if (errorMsg.toLowerCase().includes('success') || errorMsg.toLowerCase().includes('thành công')) {
        setIsJoined(true);
        toast.success(errorMsg);
      } else {
        const errorMessage = error?.message || error?.data?.message || 'Không thể gửi yêu cầu tham gia';
        toast.error(errorMessage);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!id) return;
    if (!window.confirm('Bạn chắc chắn muốn rời khỏi câu lạc bộ này?')) return;
    try {
      await leaveClub(id);
      toast.success('Bạn đã rời khỏi câu lạc bộ!');
      setIsMember(false);
      setIsJoined(false);
      // Optionally: navigate('/clubs')
    } catch (error) {
      toast.error(error?.message || 'Không thể rời câu lạc bộ');
    }
  };

  const normalizeRewardStatus = (status) => {
    if (status === 1 || status === 'active' || status === 'approved') return 'active';
    if (status === 0 || status === 'pending') return 'pending';
    return 'inactive';
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

  const normalizeClubStatus = (c) => {
    const raw = c?.status ?? c?.club_status ?? c?.clubStatus;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const s = raw.trim().toLowerCase();
      if (s === 'active' || s === 'approved' || s === '1') return 1;
      if (s === 'pending' || s === '0') return 0;
      if (s === 'pause' || s === 'paused' || s === 'inactive' || s === '2') return 2;
      if (s === 'reject' || s === 'rejected' || s === 'declined' || s === '3') return 3;
    }
    const isActive = c?.is_active ?? c?.isActive ?? c?.active;
    if (typeof isActive === 'boolean') return isActive ? 1 : 2;
    return null;
  };

  const clubStatus = normalizeClubStatus(club);
  const canRequestJoin = clubStatus == null ? true : clubStatus === 1;
  const joinDisabledMessage =
    clubStatus === 2
      ? 'Câu lạc bộ đang ngưng hoạt động.'
      : clubStatus === 3
        ? 'Câu lạc bộ không còn tiếp nhận thành viên.'
        : clubStatus === 0
          ? 'Câu lạc bộ đang chờ duyệt.'
          : '';

  useEffect(() => {
    const fetchRewards = async () => {
      if (!id) return;
      setRewardsLoading(true);
      try {
        const payload = await getRewards(id);
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.rewards)
            ? payload.rewards
            : Array.isArray(payload?.data?.rewards)
              ? payload.data.rewards
              : Array.isArray(payload?.data)
                ? payload.data
                : [];
        setRewards(list);
      } catch (error) {
        setRewards([]);
      } finally {
        setRewardsLoading(false);
      }
    };

    fetchRewards();
  }, [id]);

  const fetchPollsForClub = useCallback(async () => {
    if (!id || !isMember) return;
    setPollLoading(true);
    try {
      const sortParam = pollSort === 'all' ? undefined : pollSort;
      const res = await listPolls(id, {
        status: pollStatus || undefined,
        sort: sortParam,
        limit: 100,
      });
      if (res?.success) setPollItems(res.items || []);
      else setPollItems([]);
    } catch {
      setPollItems([]);
    } finally {
      setPollLoading(false);
    }
  }, [id, isMember, pollStatus, pollSort]);

  useEffect(() => {
    if (!isMember) {
      setPollItems([]);
      setVoteModalPollId(null);
      return;
    }
    fetchPollsForClub();
  }, [isMember, fetchPollsForClub]);

  useEffect(() => {
    setPollCarouselIndex(0);
  }, [pollSearch, pollStatus, pollSort, pollItems]);

  const visiblePollItems = useMemo(() => {
    const q = pollSearch.trim().toLowerCase();
    if (!q) return pollItems;
    return pollItems.filter((p) => String(p.title || '').toLowerCase().includes(q));
  }, [pollItems, pollSearch]);

  const pollMaxIdx = Math.max(0, visiblePollItems.length - 1);
  const pollSafeIdx = Math.min(pollCarouselIndex, pollMaxIdx);
  const currentPoll = visiblePollItems.length ? visiblePollItems[pollSafeIdx] : null;

  // Chuẩn hoá dữ liệu thư viện ảnh từ BE
  // Hỗ trợ cả:
  // - club.libraryImages: [{ imageUrl, isLarge }, ...]
  // - club.libraryImages: ['/assets/a.jpg', '/assets/b.jpg']
  // - club.libraryImage: '/assets/a.jpg' hoặc ['...']
  const rawLibraryImages = club?.libraryImages || club?.libraryImage || [];

  const normalizedLibraryImages = (Array.isArray(rawLibraryImages)
    ? rawLibraryImages
    : rawLibraryImages ? [rawLibraryImages] : []
  )
    .map((img) => {
      if (!img) return null;
      if (typeof img === 'string') {
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

  const logoSrc = buildImageSrc(club?.logo_url);
  const heroIllustrationSrc = logoSrc || (safeLibraryImages[0] ? buildImageSrc(safeLibraryImages[0].imageUrl) : null);
  const userRoleLabel = formatRoleLabel(userRole ?? club?.membershipRole ?? club?.my_role ?? club?.role);
  const RoleIcon = getRoleIcon(userRole ?? club?.membershipRole ?? club?.my_role ?? club?.role);

  const librarySlots = [0, 1, 2, 3];

  const showcaseEvents = organizedEvents.slice(0, 5);

  return (
    <div className="clubdetail-container">
      <Container className="clubdetail-page-inner">
        {loading && (
          <section className="clubdetail-dash-section">
            <div className="clubdetail-card clubdetail-card--loading">
              <span className="clubdetail-label">Đang tải</span>
              <p className="clubdetail-desc-text">Đang tải thông tin câu lạc bộ...</p>
            </div>
          </section>
        )}

        {!loading && !club && (
          <section className="clubdetail-dash-section">
            <div className="clubdetail-card clubdetail-card--empty">
              <span className="clubdetail-label">Không tìm thấy</span>
              <p className="clubdetail-desc-text">
                Không tìm thấy thông tin câu lạc bộ. Vui lòng quay lại danh sách câu lạc bộ.
              </p>
            </div>
          </section>
        )}

        {!loading && club && (
          <>
            <div className="clubdetail-dashboard-grid">
              <div className="clubdetail-cell clubdetail-cell-hero-full">
                <div className="clubdetail-hero-landing">
                  <section className="clubdetail-hero-banner">
                    {heroIllustrationSrc && !heroImgError && (
                      <img
                        src={heroIllustrationSrc}
                        alt=""
                        className="clubdetail-hero-banner-bg"
                        onError={() => setHeroImgError(true)}
                      />
                    )}
                    <div
                      className={`clubdetail-hero-banner-fallback${!heroIllustrationSrc || heroImgError ? ' is-visible' : ''}`}
                      aria-hidden
                    >
                      <ImageIcon className="clubdetail-hero-banner-fallback-icon" strokeWidth={1.25} />
                    </div>
                    <div className="clubdetail-hero-overlay" aria-hidden />
                    {(club.category || userRoleLabel) && (
                      <div className="clubdetail-hero-ribbon-corner">
                        {club.category && (
                          <span className="clubdetail-hero-category clubdetail-hero-category--corner">{club.category}</span>
                        )}
                        {userRoleLabel && (
                          <span
                            className="clubdetail-hero-user-role"
                            title={userRoleLabel}
                            aria-label={userRoleLabel}
                          >
                            <span className="clubdetail-hero-user-role-icon-wrap" aria-hidden>
                              <RoleIcon size={22} strokeWidth={2.25} />
                            </span>
                            <span className="clubdetail-hero-user-role-text">{userRoleLabel}</span>
                          </span>
                        )}
                      </div>
                    )}
                    <div className="clubdetail-hero-banner-inner">
                      <div className="clubdetail-hero-intro">
                        <h1 className="clubdetail-hero-title">
                          {/* <span className="clubdetail-hero-title-kicker">Câu lạc bộ</span>{' '} */}
                          <span className="clubdetail-hero-title-name">{club.name}</span>
                        </h1>
                        <p className="clubdetail-hero-lead">{club.description}</p>
                      </div>
                      {!isMember && (
                        <button
                          type="button"
                          className={`clubdetail-join-btn clubdetail-join-btn--primary${clubStatus === 2 ? ' clubdetail-join-btn--inactive' : ''}`}
                          onClick={handleJoin}
                          disabled={joinLoading || isJoined || !canRequestJoin}
                        >
                          <span>{joinLoading ? 'Đang gửi...' : isJoined ? 'Đã gửi yêu cầu' : 'Tham gia ngay'}</span>
                          <ArrowRight size={16} strokeWidth={2.6} aria-hidden />
                        </button>
                      )}

                      {!isMember && !canRequestJoin && clubStatus != null && (
                        <p className="clubdetail-join-hint">{joinDisabledMessage}</p>
                      )}

                      {isMember && (
                        <button
                          type="button"
                          className="clubdetail-leave-btn"
                          style={{ marginTop: 12, background: '#f44336', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
                          onClick={handleLeaveClub}
                        >
                          Rời CLB
                        </button>
                      )}
                    </div>
                  </section>
                  <div className="clubdetail-hero-float-wrap">
                    <div className="clubdetail-float-card">
                      <div className="clubdetail-float-stats">
                        <div className="clubdetail-float-stat">
                          <span className="clubdetail-float-stat-icon" aria-hidden>
                            <Users size={22} strokeWidth={2} />
                          </span>
                          <span className="clubdetail-float-stat-label">Thành viên</span>
                          <span className="clubdetail-float-stat-value">
                            {club.member_total ?? club.members ?? 0}
                          </span>
                        </div>
                        <div className="clubdetail-float-stat">
                          <span className="clubdetail-float-stat-icon" aria-hidden>
                            <Calendar size={22} strokeWidth={2} />
                          </span>
                          <span className="clubdetail-float-stat-label">Sự kiện</span>
                          <span className="clubdetail-float-stat-value">
                            {club.event_total ?? club.events ?? 0}
                          </span>
                        </div>
                        <div className="clubdetail-float-stat">
                          <span className="clubdetail-float-stat-icon" aria-hidden>
                            <Tag size={22} strokeWidth={2} />
                          </span>
                          <span className="clubdetail-float-stat-label">Thể loại</span>
                          <span className="clubdetail-float-stat-value clubdetail-float-stat-value--muted">
                            {club.category || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="clubdetail-cell clubdetail-cell-events">
                <section className="clubdetail-events-showcase">
                  <div className="clubdetail-events-showcase-decor" aria-hidden />
                  <div className="clubdetail-events-showcase-inner">
                    <header className="clubdetail-events-showcase-head">
                      <div className="clubdetail-events-showcase-head-text">
                        <h2 className="clubdetail-events-showcase-title">Sự kiện</h2>
                        <p className="clubdetail-events-showcase-sub">Các hoạt động tại câu lạc bộ</p>
                      </div>
                      <button
                        type="button"
                        className="clubdetail-events-showcase-all"
                        onClick={() => navigate(`/club/${id}/events`)}
                      >
                        Xem tất cả →
                      </button>
                    </header>
                    {showcaseEvents.length > 0 ? (
                      <div
                        className="clubdetail-events-showcase-row"
                        data-count={showcaseEvents.length}
                      >
                        {showcaseEvents.map((event) => {
                          const showcaseImg = pickEventShowcaseImage(event);
                          return (
                            <article
                              key={event._id || event.id}
                              className="clubdetail-event-showcase-card"
                              tabIndex={0}
                              role="link"
                              onClick={() => navigate(`/club/${id}/events/${event._id || event.id}`)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  navigate(`/club/${id}/events/${event._id || event.id}`);
                                }
                              }}
                            >
                              <div className="clubdetail-event-showcase-card-visual">
                                {showcaseImg ? (
                                  <img
                                    src={showcaseImg}
                                    alt={event.name}
                                    className="clubdetail-event-showcase-card-img"
                                    loading="lazy"
                                    decoding="async"
                                    sizes="(max-width: 600px) 86vw, 280px"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = '/images/events/default.png';
                                    }}
                                  />
                                ) : (
                                  <div className="clubdetail-event-showcase-card-placeholder" aria-hidden />
                                )}
                                <span className="clubdetail-event-showcase-tag">
                                  {(event.category || 'Sự kiện').toUpperCase()}
                                </span>
                              </div>
                              <div className="clubdetail-event-showcase-card-body clubdetail-event-showcase-card-body--slant">
                                <h3 className="clubdetail-event-showcase-card-name">{event.name}</h3>
                                {event.description ? (
                                  <p className="clubdetail-event-showcase-card-desc clubdetail-event-showcase-card-desc--slant">
                                    {event.description}
                                  </p>
                                ) : null}
                                <div className="clubdetail-event-showcase-card-footer clubdetail-event-showcase-card-footer--slant">
                                  <div className="clubdetail-event-showcase-card-meta clubdetail-event-showcase-card-meta--slant">
                                    <Users className="clubdetail-event-showcase-meta-icon" size={14} strokeWidth={3} aria-hidden />
                                    <span>{event.participants || 0} người tham gia</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="clubdetail-event-showcase-arrow clubdetail-event-showcase-arrow--lime"
                                    aria-label="Xem chi tiết sự kiện"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/club/${id}/events/${event._id || event.id}`);
                                    }}
                                  >
                                    <ArrowRight size={18} strokeWidth={2.5} aria-hidden />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="clubdetail-events-showcase-empty">
                        <p className="clubdetail-events-showcase-empty-text">
                          Câu lạc bộ chưa có sự kiện nào được tổ chức.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {isMember && (
                <div className="clubdetail-cell clubdetail-cell-polls">
                  <section className="clubdetail-polls-section">
                    <header className="clubdetail-polls-head">
                      <div>
                        <h2 className="clubdetail-polls-title">Bình chọn</h2>
                        <p className="clubdetail-polls-sub">Bảng vote trong câu lạc bộ</p>
                      </div>
                    </header>
                    <div className="clubdetail-polls-toolbar">
                      <label className="clubdetail-polls-field">
                        <span>Tìm tiêu đề</span>
                        <input
                          type="search"
                          className="clubdetail-polls-input"
                          placeholder="Từ khóa..."
                          value={pollSearch}
                          onChange={(e) => setPollSearch(e.target.value)}
                        />
                      </label>
                      <label className="clubdetail-polls-field">
                        <span>Trạng thái</span>
                        <select
                          className="clubdetail-polls-select"
                          value={pollStatus}
                          onChange={(e) => setPollStatus(e.target.value)}
                        >
                          <option value="">Tất cả</option>
                          <option value="open">Đang mở</option>
                          <option value="closed">Đã đóng</option>
                        </select>
                      </label>
                      <label className="clubdetail-polls-field">
                        <span>Sắp xếp</span>
                        <select
                          className="clubdetail-polls-select"
                          value={pollSort}
                          onChange={(e) => setPollSort(e.target.value)}
                        >
                          <option value="all">Tất cả</option>
                          <option value="newest">Mới nhất</option>
                          <option value="ending_soon">Sắp kết thúc</option>
                        </select>
                      </label>
                    </div>
                    {pollLoading ? (
                      <p className="clubdetail-polls-empty">Đang tải...</p>
                    ) : visiblePollItems.length === 0 ? (
                      <p className="clubdetail-polls-empty">Không có bảng vote phù hợp.</p>
                    ) : (
                      <div className="clubdetail-polls-carousel">
                        <button
                          type="button"
                          className="clubdetail-polls-nav"
                          aria-label="Trước"
                          disabled={pollSafeIdx <= 0}
                          onClick={() => setPollCarouselIndex((i) => Math.max(0, i - 1))}
                        >
                          <ChevronLeft size={22} strokeWidth={2.25} />
                        </button>
                        <div className="clubdetail-polls-strip-wrap">
                          <ClubPollStrip
                            poll={currentPoll}
                            onOpenModal={() => currentPoll && setVoteModalPollId(currentPoll._id)}
                          />
                        </div>
                        <button
                          type="button"
                          className="clubdetail-polls-nav"
                          aria-label="Sau"
                          disabled={pollSafeIdx >= pollMaxIdx}
                          onClick={() =>
                            setPollCarouselIndex((i) =>
                              Math.min(visiblePollItems.length - 1, i + 1)
                            )
                          }
                        >
                          <ChevronRight size={22} strokeWidth={2.25} />
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              )}

              <div className="clubdetail-cell clubdetail-cell-admin">
                <div className="clubdetail-card clubdetail-card--members clubdetail-card--dash">
                  <h2 className="clubdetail-section-title clubdetail-section-title--in-card">Thành viên</h2>
                  {adminBoard.length > 0 ? (
                    <div
                      className={`clubdetail-member-grid${adminBoard.length < 3 ? ' clubdetail-member-grid--few' : ''}`}
                    >
                      {adminBoard.map((admin) => {
                        const rawAvatar = (admin.avatar || '').trim().replace(/"/g, '');
                        const avatarSrc = rawAvatar
                          ? rawAvatar.startsWith('http')
                            ? rawAvatar
                            : `${ASSET_BASE}${rawAvatar}`
                          : null;

                        return (
                          <article
                            key={admin._id || admin.id}
                            className="clubdetail-member-card"
                          >
                            <div className="clubdetail-member-card-media">
                              {avatarSrc ? (
                                <img
                                  src={avatarSrc}
                                  alt={admin.name}
                                  className="clubdetail-member-card-img"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/users/default.png';
                                  }}
                                />
                              ) : (
                                <div className="clubdetail-member-card-placeholder" aria-hidden />
                              )}
                              <div className="clubdetail-member-card-scrim" aria-hidden />
                              <div className="clubdetail-member-card-overlay">
                                <span className="clubdetail-member-card-name">{admin.name}</span>
                                <span className="clubdetail-member-card-role">{admin.role}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="clubdetail-member-empty">
                      <p className="clubdetail-member-empty-text">
                        Chưa cập nhật thông tin người dẫn dắt cho câu lạc bộ này.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="clubdetail-cell clubdetail-cell-gallery">
                <div className="clubdetail-card clubdetail-card--section clubdetail-card--dash">
                  <h2 className="clubdetail-section-title clubdetail-section-title--in-card">Hình ảnh</h2>
                  <div className="clubdetail-library-masonry">
                    {librarySlots.map((slotIndex) => {
                      const imgObj = safeLibraryImages[slotIndex] || null;
                      const src = imgObj && imgObj.imageUrl ? buildImageSrc(imgObj.imageUrl) : null;
                      const large = !!(imgObj && imgObj.isLarge);
                      return (
                        <div
                          key={slotIndex}
                          className={`clubdetail-library-cell${large ? ' clubdetail-library-cell--large' : ''}`}
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
              </div>

              <div className="clubdetail-cell clubdetail-cell-about">
                <div className="clubdetail-card clubdetail-card--sidebar clubdetail-card--dash">
                  <h2 className="clubdetail-about-title">Mô tả chi tiết</h2>
                  <p className="clubdetail-about-text">{club.description}</p>
                </div>
              </div>
            </div>

            {showFloatingNav !== false && (
              <ClubDetailNav clubName={club?.name} isMember={isMember} />
            )}

            {voteModalPollId && id && (
              <PollVoteModal
                clubId={id}
                pollId={voteModalPollId}
                onClose={() => setVoteModalPollId(null)}
                onVoteSuccess={fetchPollsForClub}
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default ClubDetail;
