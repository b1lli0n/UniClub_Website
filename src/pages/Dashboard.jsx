import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { EventListCard } from '../components/dashboard/EventListCard';
import { MemberListCard } from '../components/dashboard/MemberListCard';
import { getEvents } from '../services/api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // TODO: Replace with actual user from Auth Context
    // Example: const { user } = useAuth();
    const currentUser = null;

    // TODO: Get from auth/context
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Fetch events
                const eventsData = await getEvents(clubId, token);
                setEvents(eventsData.slice(0, 3) || []);
                // TODO: Fetch members when API is ready
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (clubId && clubId !== 'YOUR_CLUB_ID_HERE') {
            loadData();
        } else {
            setLoading(false);
        }
    }, [clubId, token]);

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header">
                    <h1 className="myclub-title">Dashboard</h1>
                </header>

                <div className="myclub-hero glass-card" style={{ marginBottom: '24px' }}>
                    <div className="myclub-hero-content">
                        <h2>
                            Chào mừng{currentUser?.name ? `, ${currentUser.name}` : ''}
                        </h2>
                        <p>Quản lý câu lạc bộ của bạn</p>
                    </div>
                    <button className="myclub-add">Tạm dừng hoạt động câu lạc bộ</button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <QuickActionCard
                        title="Bổ sung thông tin"
                        subtitle="Thông tin cơ bản câu lạc bộ"
                        onClick={() => navigate('/dashboard')}
                    />
                    <QuickActionCard
                        title="Tạo trang đại diện"
                        subtitle="Trang đại diện công khai của câu lạc bộ"
                        onClick={() => navigate('/dashboard')}
                    />
                    <QuickActionCard
                        title="Thêm thành viên"
                        subtitle="Duyệt thành viên vào nhóm"
                        onClick={() => navigate('/memberships')}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <EventListCard
                        events={events}
                        clubName={currentUser?.clubName || 'Câu lạc bộ'}
                        onCreate={() => navigate('/events/create')}
                        onView={(id) => navigate(`/events/${id}`)}
                        onEdit={(id) => navigate(`/events/${id}/edit`)}
                        onSeeAll={() => navigate('/events')}
                        loading={loading}
                    />

                    <MemberListCard
                        members={members}
                        onManage={() => navigate('/join-requests')}
                    />
                </div>
            </div>
        </div>
    );
}
