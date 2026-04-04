import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Users, Calendar, Tag, ImageIcon, ArrowRight, Crown, UserCircle2, ShieldCheck, FileBadge2, Wallet, ChevronLeft, ChevronRight  } from 'lucide-react';
import ClubDetailNav from '../../components/clubs/ClubDetailNav';
import { getClubById, getClubMembersList, getEventsByClub, requestToJoinClub, leaveClub } from '../../api/clubApi';
import { getMyClubStatuses } from '../../api/userApi';
import { getPollDetail, listPolls } from '../../api/pollApi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ClubDetail.css';
import { ASSET_BASE } from '../../api/api';
import ClubPollStrip from '../../components/ClubPollStrip';
import PollVoteModal from '../../components/PollVoteModal';
import { isPollVotingOpen } from '../../utils/pollVoting';

const buildImageSrc = (raw) => {
  const cleaned = (raw || '').trim().replace(/"/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('http')) return cleaned;
  return `${ASSET_BASE}${cleaned}`;
};

const pickEventShowcaseImage = (event) => {
  if (!event) return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
  const order = [
    event.banner_url,
    event.image_url,
    event.image,
    event.thumbnail_url,
    Array.isArray(event.media_urls) ? event.media_urls[0] : (event.media_urls || null),
  ];
  for (const raw of order) {
    const src = buildImageSrc(raw);
    if (src) return src;
  }
  // Return high-quality default if no images found
  return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
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

const normalizeStatusCode = (value, map = {}) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (s !== '' && !Number.isNaN(Number(s))) return Number(s);
    if (Object.prototype.hasOwnProperty.call(map, s)) return map[s];
  }
  return null;
};

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showFloatingNav } = useOutletContext() || {};
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [hasJoinRequest, setHasJoinRequest] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([]);
  const [heroImgError, setHeroImgError] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [pollItems, setPollItems] = useState([]);
  const [featuredPollDetail, setFeaturedPollDetail] = useState(null);
  const [pollModalId, setPollModalId] = useState('');
  const [activePollIndex, setActivePollIndex] = useState(0);
  const [pollSearchText, setPollSearchText] = useState('');
  const [pollFilterStatus, setPollFilterStatus] = useState('all');
  const [pollSortBy, setPollSortBy] = useState('ending_soon');
  const [membersPopupOpen, setMembersPopupOpen] = useState(false);
  const [membersPopupLoading, setMembersPopupLoading] = useState(false);
  const [membersPopupList, setMembersPopupList] = useState([]);


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
        // console.log('Fetching club detail for ID:', id);
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

  useEffect(() => {
    const fetchMyClubStatuses = async () => {
      if (!id || !user) {
        setHasJoinRequest(false);
        setJoinRequestLoading(false);
        return;
      }

      setJoinRequestLoading(true);
      try {
        // console.log('Fetching my club statuses for club ID:', id);
        const response = await getMyClubStatuses(id);
        const payload = response?.data && typeof response.data === 'object' ? response.data : response;

        const membershipStatus = normalizeStatusCode(payload?.membershipStatus, {
          active: 0,
          left: 1,
        });
        const requestStatus = normalizeStatusCode(payload?.requestStatus, {
          pending: 0,
          rejected: 2,
          canceled: 3,
          cancelled: 3,
        });

        // membership status is source of truth for Join/Leave UI
        if (membershipStatus === 0) {
          setIsMember(true);
          setIsJoined(true);
          setHasJoinRequest(false);
          return;
        }

        if (membershipStatus === 1) {
          setIsMember(false);
          setIsJoined(false);
        }

        if (requestStatus === 0) {
          setHasJoinRequest(true);
          return;
        }

        setHasJoinRequest(false);
      } catch (error) {
        console.error('Error fetching my club statuses:', error);
        setHasJoinRequest(false);
      } finally {
        setJoinRequestLoading(false);
      }
    };

    fetchMyClubStatuses();
  }, [id, user]);

  const handleJoin = async () => {
    if (!id || joinLoading || isJoined || hasJoinRequest) return;

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
      setHasJoinRequest(true);
      const successMessage = 'Gửi yêu cầu tham gia thành công! Hãy chờ phê duyệt từ ban quản trị.';
      toast.success(successMessage);
    } catch (error) {
      console.error('❌ Join club error:', error);

      // Check if error message indicates success
      const errorMsg = error?.message || error?.data?.message || error || '';
      if (errorMsg.toLowerCase().includes('success') || errorMsg.toLowerCase().includes('thành công')) {
        setIsJoined(true);
        setHasJoinRequest(true);
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
    if (!id || joinLoading) return;

    setJoinLoading(true);
    try {
      await toast.promise(leaveClub(id), {
        pending: 'Đang rời câu lạc bộ...',
        success: 'Bạn đã rời khỏi câu lạc bộ!',
        error: {
          render({ data }) {
            return data?.message || data?.data?.message || 'Không thể rời câu lạc bộ';
          },
        },
      });

      setIsMember(false);
      setIsJoined(false);
      setHasJoinRequest(false);
      setUserRole(null);
    } finally {
      setJoinLoading(false);
    }
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

  const openMembersPopup = async () => {
    if (!id) return;

    setMembersPopupOpen(true);
    setMembersPopupLoading(true);

    try {
      const response = await getClubMembersList(id);
      const rawMembers = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.members)
            ? response.members
            : Array.isArray(response?.data?.members)
              ? response.data.members
              : Array.isArray(response?.items)
                ? response.items
                : [];

      const normalized = rawMembers.map((member) => {
        const userInfo = member?.user_id || member?.user || member;
        const memberId =
          member?._id ||
          member?.membership_id ||
          userInfo?._id ||
          userInfo?.id;

        return {
          id: String(memberId || Math.random()),
          name: userInfo?.fullName || userInfo?.name || userInfo?.email || 'Thành viên',
          avatar: userInfo?.avatar_url || userInfo?.avatar || '',
          roleLabel: formatRoleLabel(member?.role ?? member?.membershipRole ?? member?.membership_role ?? 0),
        };
      });

      setMembersPopupList(normalized);
    } catch (error) {
      console.error('Error loading club members list:', error);
      toast.error(error?.message || 'Không thể tải danh sách thành viên');
      setMembersPopupList([]);
    } finally {
      setMembersPopupLoading(false);
    }
  };

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
  const shouldShowLeaveButton = isMember;
  const joinRequestLocked = hasJoinRequest && !isMember;
  const joinButtonClassName = `clubdetail-join-btn clubdetail-join-btn--primary${clubStatus === 2 ? ' clubdetail-join-btn--inactive' : ''}${joinRequestLocked || joinRequestLoading ? ' is-locked' : ''}`;
  const joinDisabledMessage =
    joinRequestLoading
      ? 'Đang kiểm tra yêu cầu...'
      :
    joinRequestLocked
      ? 'Bạn đã gửi yêu cầu rồi. Vui lòng chờ xử lý.'
      : clubStatus === 2
      ? 'Câu lạc bộ đang ngưng hoạt động.'
      : clubStatus === 3
        ? 'Câu lạc bộ không còn tiếp nhận thành viên.'
        : clubStatus === 0
          ? 'Câu lạc bộ đang chờ duyệt.'
          : '';

  const loadClubPolls = useCallback(async () => {
    if (!id || !isMember) {
      setPollItems([]);
      setFeaturedPollDetail(null);
      return;
    }
    try {
      const res = await listPolls(id, {
        sort: pollSortBy === 'all' ? undefined : pollSortBy,
        page: 1,
        limit: 20,
      });
      if (res?.success) {
        const items = Array.isArray(res.items) ? res.items : [];
        setPollItems(items);
        const openIndex = items.findIndex((p) => isPollVotingOpen(p));
        setActivePollIndex(openIndex >= 0 ? openIndex : 0);
      } else {
        setPollItems([]);
        setFeaturedPollDetail(null);
      }
    } catch (e) {
      if (e?.response?.status !== 403) {
        toast.error(e?.message || 'Không tải được danh sách bình chọn');
      }
      setPollItems([]);
      setFeaturedPollDetail(null);
    }
  }, [id, isMember, pollSortBy]);

  useEffect(() => {
    loadClubPolls();
  }, [loadClubPolls]);

  const visiblePollItems = useMemo(() => {
    const q = pollSearchText.trim().toLowerCase();
    const now = Date.now();
    let items = [...pollItems];

    if (q) {
      items = items.filter((p) => String(p?.title || '').toLowerCase().includes(q));
    }
    if (pollFilterStatus !== 'all') {
      items = items.filter((p) =>
        pollFilterStatus === 'open' ? isPollVotingOpen(p) : !isPollVotingOpen(p)
      );
    }

    const toMs = (v) => {
      const ms = new Date(v).getTime();
      return Number.isNaN(ms) ? 0 : ms;
    };
    const nearNowScore = (v) => {
      const ms = toMs(v);
      if (!ms) return Number.POSITIVE_INFINITY;
      return Math.abs(ms - now);
    };

    if (pollSortBy !== 'all') {
      items.sort((a, b) => {
        if (pollSortBy === 'newest') {
          return nearNowScore(a?.start_date) - nearNowScore(b?.start_date);
        }
        if (pollSortBy === 'ending_soon') {
          return nearNowScore(a?.end_date) - nearNowScore(b?.end_date);
        }
        return 0;
      });
    }

    return items;
  }, [pollItems, pollSearchText, pollFilterStatus, pollSortBy]);

  useEffect(() => {
    if (activePollIndex >= visiblePollItems.length) {
      setActivePollIndex(0);
    }
  }, [activePollIndex, visiblePollItems.length]);

  useEffect(() => {
    setActivePollIndex(0);
  }, [pollSearchText, pollFilterStatus, pollSortBy]);

  useEffect(() => {
    const loadActivePollDetail = async () => {
      if (!id || !isMember || visiblePollItems.length === 0) {
        setFeaturedPollDetail(null);
        return;
      }
      const safeIndex = Math.max(0, Math.min(activePollIndex, visiblePollItems.length - 1));
      if (safeIndex !== activePollIndex) {
        setActivePollIndex(safeIndex);
        return;
      }
      const poll = visiblePollItems[safeIndex];
      if (!poll?._id) {
        setFeaturedPollDetail(null);
        return;
      }
      try {
        const detailRes = await getPollDetail(id, poll._id);
        if (detailRes?.success && detailRes?.data) {
          setFeaturedPollDetail(detailRes.data);
        } else {
          setFeaturedPollDetail(null);
        }
      } catch {
        setFeaturedPollDetail(null);
      }
    };
    loadActivePollDetail();
  }, [id, isMember, visiblePollItems, activePollIndex]);

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
  const hasOpenPollInClub = pollItems.some((p) => isPollVotingOpen(p));
  const selectedPoll = visiblePollItems[activePollIndex] || null;
  const selectedPollData = featuredPollDetail?.poll || null;
  const canOpenSelectedPoll = isPollVotingOpen(selectedPollData);
  const userPointRaw = club?.my_points ?? club?.points ?? club?.member_points;
  const userPoints = userPointRaw != null && !Number.isNaN(Number(userPointRaw))
    ? Number(userPointRaw)
    : null;

  const pollToolbar = (
    <div className="clubdetail-poll-toolbar">
      <input
        className="clubdetail-poll-search"
        placeholder="Tìm bình chọn theo tiêu đề..."
        value={pollSearchText}
        onChange={(e) => setPollSearchText(e.target.value)}
      />
      <select
        className="clubdetail-poll-select"
        value={pollFilterStatus}
        onChange={(e) => setPollFilterStatus(e.target.value)}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="open">Đang mở</option>
        <option value="closed">Đã đóng</option>
      </select>
      <select
        className="clubdetail-poll-select"
        value={pollSortBy}
        onChange={(e) => setPollSortBy(e.target.value)}
      >
        <option value="all">Tất cả</option>
        <option value="ending_soon">Sắp hết hạn</option>
        <option value="newest">Mới nhất</option>
      </select>
    </div>
  );

  let pollSectionEl = null;
  if (isMember && visiblePollItems.length === 0) {
    pollSectionEl = (
      <div className="clubdetail-cell clubdetail-cell-polls">
        {pollToolbar}
        <div className="clubdetail-poll-empty-note">Không có bảng vote phù hợp.</div>
      </div>
    );
  } else if (isMember && visiblePollItems.length > 0 && selectedPoll && featuredPollDetail) {
    pollSectionEl = (
      <div className="clubdetail-cell clubdetail-cell-polls">
        {pollToolbar}
        <div className="clubdetail-poll-focus-wrap">
          <button
            type="button"
            className="clubdetail-poll-nav clubdetail-poll-nav--left"
            onClick={() => setActivePollIndex((prev) => Math.max(0, prev - 1))}
            disabled={activePollIndex <= 0}
            aria-label="Poll trước"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="clubdetail-poll-focus-card">
            <ClubPollStrip
              detail={featuredPollDetail}
              onOpen={canOpenSelectedPoll ? () => setPollModalId(selectedPoll._id) : undefined}
            />
          </div>
          <button
            type="button"
            className="clubdetail-poll-nav clubdetail-poll-nav--right"
            onClick={() =>
              setActivePollIndex((prev) => Math.min(visiblePollItems.length - 1, prev + 1))
            }
            disabled={activePollIndex >= visiblePollItems.length - 1}
            aria-label="Poll tiếp"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

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
                      {!shouldShowLeaveButton && (
                        <button
                          type="button"
                          className={joinButtonClassName}
                          onClick={handleJoin}
                          disabled={joinLoading || isJoined || !canRequestJoin || joinRequestLocked || joinRequestLoading}
                        >
                          <span>
                            {joinRequestLoading
                              ? 'Đang kiểm tra...'
                              : joinLoading
                              ? 'Đang gửi...'
                              : isJoined
                                ? 'Đang tham gia'
                                : joinRequestLocked
                                  ? 'Đang xử lý'
                                  : 'Tham gia ngay'}
                          </span>
                          <ArrowRight size={16} strokeWidth={2.6} aria-hidden />
                        </button>
                      )}

                      {!shouldShowLeaveButton && !joinRequestLoading && !joinRequestLocked && !canRequestJoin && clubStatus != null && (
                        <p className="clubdetail-join-hint">{joinDisabledMessage}</p>
                      )}

                      {!shouldShowLeaveButton && !joinRequestLoading && joinRequestLocked && (
                        <p className="clubdetail-join-hint">{joinDisabledMessage}</p>
                      )}

                      {shouldShowLeaveButton && (
                        <button
                          type="button"
                          className="clubdetail-leave-btn"
                          style={{ marginTop: 12, background: '#f44336', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
                          onClick={handleLeaveClub}
                          disabled={joinLoading}
                        >
                          {joinLoading ? 'Đang rời...' : 'Rời CLB'}
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

              {hasOpenPollInClub && pollSectionEl}

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
                                <img
                                  src={showcaseImg || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"}
                                  alt={event.name}
                                  className="clubdetail-event-showcase-card-img"
                                  loading="lazy"
                                  decoding="async"
                                  sizes="(max-width: 600px) 86vw, 280px"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';
                                  }}
                                />
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

              <div className="clubdetail-cell clubdetail-cell-admin">
                <div className="clubdetail-card clubdetail-card--members clubdetail-card--dash">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <h2 className="clubdetail-section-title clubdetail-section-title--in-card" style={{ marginBottom: 0 }}>Thành viên</h2>
                    <button
                      type="button"
                      className="clubdetail-members-open-btn"
                      onClick={openMembersPopup}
                    >
                      Xem tất cả thành viên
                    </button>
                  </div>
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

            {!hasOpenPollInClub && pollSectionEl && (
              <section className="clubdetail-polls-bottom" aria-label="Bình chọn">
                {pollSectionEl}
              </section>
            )}

            {showFloatingNav !== false && (
              <ClubDetailNav clubName={club?.name} isMember={isMember} />
            )}

            <PollVoteModal
              open={!!pollModalId}
              clubId={id}
              pollId={pollModalId}
              onClose={() => setPollModalId('')}
              onUpdated={loadClubPolls}
              userPoints={userPoints}
            />

            {membersPopupOpen && (
              <div className="clubdetail-members-popup-backdrop" onClick={() => setMembersPopupOpen(false)}>
                <div className="clubdetail-members-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="clubdetail-members-popup-head">
                    <h3>Danh sách thành viên</h3>
                    <button
                      type="button"
                      className="clubdetail-members-popup-close"
                      onClick={() => setMembersPopupOpen(false)}
                    >
                      Đóng
                    </button>
                  </div>

                  {membersPopupLoading ? (
                    <p className="clubdetail-members-popup-empty">Đang tải danh sách thành viên...</p>
                  ) : membersPopupList.length === 0 ? (
                    <p className="clubdetail-members-popup-empty">Chưa có dữ liệu thành viên.</p>
                  ) : (
                    <div className="clubdetail-members-popup-list">
                      {membersPopupList.map((member) => (
                        <div key={member.id} className="clubdetail-members-popup-item">
                          {member.avatar ? (
                            <img
                              src={member.avatar.startsWith('http') ? member.avatar : `${ASSET_BASE}${member.avatar}`}
                              alt={member.name}
                              className="clubdetail-members-popup-avatar"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/users/default.png';
                              }}
                            />
                          ) : (
                            <div className="clubdetail-members-popup-avatar-placeholder" aria-hidden>
                              <Users size={16} />
                            </div>
                          )}
                          <div className="clubdetail-members-popup-meta">
                            <span className="clubdetail-members-popup-name">{member.name}</span>
                            <span className="clubdetail-members-popup-role">{member.roleLabel || 'Thành viên'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default ClubDetail;
