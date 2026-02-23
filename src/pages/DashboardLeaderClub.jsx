import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { EventListCard } from '../components/dashboard/EventListCard';
import { MemberListCard } from '../components/dashboard/MemberListCard';
import { getClubById, getEventsByClub, getClubMembers } from '../api/clubApi';
import '../styles/DashboardClubLeader.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { id: clubId } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const { user } = useAuth();

  const previewMembers = useMemo(() => members.slice(0, 5), [members]);
  const previewEvents = useMemo(() => events.slice(0, 3), [events]);

  const ROLE_PRIORITY = {
    1: 0, // Leader
    2: 1, // Sub Leader
    3: 2, // Secretary
    4: 3, // Treasurer
    0: 4  // Member
  };

  const ROLE_LABELS = {
    0: 'Member',
    1: 'Leader',
    2: 'Sub Leader',
    3: 'Secretary',
    4: 'Treasurer'
  };

  const formatNameFromEmail = (email) => {
    if (!email) return null;
    const raw = email.split('@')[0] || '';
    if (!raw) return null;
    return raw
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getMemberName = (member) => (
    member?.fullName ||
    member?.fullname ||
    member?.name ||
    member?.full_name ||
    member?.user_id?.fullName ||
    member?.user_id?.fullname ||
    member?.user_id?.full_name ||
    member?.user_id?.name ||
    member?.user?.fullName ||
    member?.user?.fullname ||
    member?.user?.full_name ||
    member?.user?.name ||
    formatNameFromEmail(member?.user_id?.email || member?.user?.email || member?.email) ||
    'Member'
  );

  const getMemberRoleLabel = (member) => {
    if (typeof member?.role === 'number') return ROLE_LABELS[member.role] || 'Member';
    return member?.role || 'Member';
  };

  const normalizeMembersResponse = (response) => {
    if (Array.isArray(response)) {
      return { items: response, pagination: null };
    }

    const pagination = response?.pagination || response?.data?.pagination || null;
    const items =
      response?.members ||
      response?.data?.members ||
      response?.memberships ||
      response?.data?.memberships ||
      response?.data ||
      [];

    return { items: Array.isArray(items) ? items : [], pagination };
  };

  const fetchAllMembers = async (clubIdValue) => {
    const allMembers = [];
    let page = 1;
    let totalPages = 1;

    do {
      const membersResponse = await getClubMembers(clubIdValue, { page, limit: 100 });
      const { items, pagination } = normalizeMembersResponse(membersResponse);
      console.log(`📄 Page ${page}:`, { itemsCount: items.length, pagination, items });
      allMembers.push(...items);

      totalPages = pagination?.totalPages || pagination?.total_pages || totalPages || 1;
      console.log(`🔄 totalPages:`, totalPages, `allMembers so far:`, allMembers.length);
      page += 1;
    } while (page <= totalPages);

    console.log('✅ Final all members:', allMembers.length, allMembers);
    return allMembers;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading data for clubId:', clubId);

        // Fetch club details
        const clubData = await getClubById(clubId);
        console.log('✅ Club data:', clubData);
        setClub(clubData);

        // Fetch events (including drafts for leaders)
        const eventsResponse = await getEventsByClub(clubId);
        console.log('✅ Events response:', eventsResponse);
        const eventsData = eventsResponse?.data || eventsResponse?.events || eventsResponse || [];
        console.log('✅ Events data:', eventsData);
        // Sort events: upcoming first, then by start date
        const sortedEvents = [...eventsData].sort((a, b) => {
          const dateA = new Date(a.start_time || a.startAt || a.start_at);
          const dateB = new Date(b.start_time || b.startAt || b.start_at);
          return dateA - dateB;
        });
        setEvents(sortedEvents);

        // Fetch members
        try {
          const membersResponse = await fetchAllMembers(clubId);
          console.log('✅ Members response:', membersResponse);
          const membersData = Array.isArray(membersResponse) ? membersResponse : [];
          console.log('✅ Members data:', membersData);
          const sortedMembers = [...membersData].sort((a, b) => {
            const aRank = ROLE_PRIORITY[a?.role] ?? 99;
            const bRank = ROLE_PRIORITY[b?.role] ?? 99;
            if (aRank !== bRank) return aRank - bRank;
            return getMemberName(a).localeCompare(getMemberName(b));
          });
          console.log('✅ Members sorted:', sortedMembers);
          setMembers(sortedMembers);
        } catch (memberErr) {
          console.error('❌ Failed to load members:', memberErr);
          setMembers([]);
        }
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      loadData();
    } else {
      console.log('❌ No clubId found');
      setLoading(false);
    }
  }, [clubId]);

  return (
    <div className="home-page">
      <div className="home-overlay" />
      <div className="myclub-container">
        <div className="myclub-hero glass-card dashboard-hero">
          <div className="myclub-hero-content">
            <h2>
              Chào mừng{user?.fullName ? `, ${user.fullName}` : ''}
            </h2>
            <p>Quản lý câu lạc bộ của bạn</p>
          </div>
          <button className="myclub-add">Tạm dừng hoạt động câu lạc bộ</button>
        </div>

        <div className="dashboard-quick-actions">
          <QuickActionCard
            title="Bổ sung thông tin"
            subtitle="Thông tin cơ bản câu lạc bộ"
            onClick={() => navigate(clubId ? `/clubs/${clubId}/dashboard` : '/clubs')}
          />
          <QuickActionCard
            title="Tạo trang đại diện"
            subtitle="Trang đại diện công khai của câu lạc bộ"
            onClick={() => navigate(clubId ? `/clubs/${clubId}/dashboard` : '/clubs')}
          />
          <QuickActionCard
            title="Thêm thành viên"
            subtitle="Duyệt thành viên vào nhóm"
            onClick={() => navigate('/memberships')}
          />
        </div>

        <div className="dashboard-main-grid">
          <EventListCard
            events={previewEvents}
            clubName={club?.name || 'Câu lạc bộ'}
            onCreate={() => navigate('/events/create')}
            onView={(id) => navigate(`/events/${id}`)}
            onEdit={(id) => navigate(`/events/${id}/update`)}
            onSeeAll={() => {
              localStorage.setItem('clubId', clubId);
              navigate('/events');
            }}
            loading={loading}
          />

          <MemberListCard
            members={previewMembers}
            onManage={() => setShowMembersModal(true)}
          />
        </div>
      </div>

      {showMembersModal && (
        <div className="members-modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="members-modal" onClick={(e) => e.stopPropagation()}>
            <div className="members-modal-header">
              <div>
                <h3 className="members-modal-title">Tất cả thành viên</h3>
                <p className="members-modal-count">{members.length} thành viên</p>
              </div>
              <button className="members-modal-close" onClick={() => setShowMembersModal(false)}>
                ✕
              </button>
            </div>
            <div className="members-modal-body">
              <div className="members-modal-list">
                {members.map((member, index) => {
                  const displayName = getMemberName(member);
                  const roleLabel = getMemberRoleLabel(member);
                  const keyValue =
                    member?.id ||
                    member?._id ||
                    member?.membershipId ||
                    member?.user_id?._id ||
                    member?.user?._id ||
                    index;

                  return (
                    <div key={keyValue} className="member-list-item">
                      <div className="member-list-avatar">
                        {displayName?.charAt(0) || '?'}
                      </div>
                      <div className="member-list-info">
                        <p className="member-list-name">{displayName}</p>
                        <p className="member-list-role">{roleLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

