import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import attendanceApi from '../../api/attendanceApi';
import eventApi from '../../api/eventApi';
import '../../styles/EventAttendanceList.css';

// Import Google Font - Outfit
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// ── Trạng thái check-in của sự kiện ──────────────────────────────────────────
const CHECK_IN_STATUS = { NOT_OPEN: 0, OPEN: 1, CLOSED: 2 };

// 1 = đã duyệt đăng ký (approved), 2 = đã từ chối (rejected), 3 = đã điểm danh (attended)
const REG_STATUS_LABEL = {
    0: 'Chờ duyệt',
    1: 'Đã duyệt',
    2: 'Bị từ chối',
    3: 'Đã điểm danh',
};

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EventAttendanceList() {
    const navigate = useNavigate();
    const { id: clubId, eventId } = useParams(); // /clubs/:id/events/:eventId/attendance

    const [attendanceList, setAttendanceList] = useState([]);
    const [pendingList, setPendingList] = useState([]); // Danh sách chờ duyệt
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter/Tabs: 'attendance' (đã duyệt & đã điểm danh) | 'approval' (chờ duyệt)
    const [activeTab, setActiveTab] = useState('attendance');

    // Check-in status toggle
    const [checkInStatus, setCheckInStatus] = useState(CHECK_IN_STATUS.NOT_OPEN);
    const [togglingStatus, setTogglingStatus] = useState(false);

    // Action loading (for approval)
    const [actionLoading, setActionLoading] = useState(null); // id of user being processed

    // Manual check-in
    const [selectedUserId, setSelectedUserId] = useState('');
    const [manualLoading, setManualLoading] = useState(false);

    // Search / filter
    const [searchTerm, setSearchTerm] = useState('');

    // ── Fetch attendance list ─────────────────────────────────────────────────
    // ── Fetch attendance list (status 1 & 3) ──────────────────────────────────
    const fetchAttendance = useCallback(async () => {
        try {
            const res = await attendanceApi.getAttendanceList(eventId);
            const data = res.data?.data ?? [];
            setAttendanceList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        }
    }, [eventId]);

    // ── Fetch pending registrations (status 0) ───────────────────────────────
    const fetchPending = useCallback(async () => {
        try {
            const res = await attendanceApi.getPendingRegistrations(eventId);
            const data = res.data?.data ?? [];
            setPendingList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching pending:', err);
        }
    }, [eventId]);

    // ── Fetch event info (để lấy check_in_status và tên sự kiện) ─────────────
    const fetchEvent = useCallback(async () => {
        try {
            const res = await eventApi.getEventById(clubId, eventId);
            const ev = res.data?.data ?? res.data;
            setEvent(ev);
            setCheckInStatus(ev?.check_in_status ?? CHECK_IN_STATUS.NOT_OPEN);
        } catch (err) {
            // không có event info thì chỉ thử báo lỗi nhẹ
            console.warn('Không lấy được event info:', err.message);
        }
    }, [clubId, eventId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([fetchEvent(), fetchAttendance(), fetchPending()]);
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu.');
            }
            setLoading(false);
        };
        init();
    }, [fetchEvent, fetchAttendance, fetchPending]);

    // ── Mở / Đóng check-in ───────────────────────────────────────────────────
    const handleToggleCheckIn = async (targetStatus) => {
        setTogglingStatus(true);
        try {
            await attendanceApi.setCheckInStatus(eventId, targetStatus);
            setCheckInStatus(targetStatus);
            toast.success(
                targetStatus === CHECK_IN_STATUS.OPEN
                    ? '✅ Đã mở check-in cho sự kiện!'
                    : '🔒 Đã đóng check-in cho sự kiện!'
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể thay đổi trạng thái check-in.');
        }
        setTogglingStatus(false);
    };

    // ── Manual Check-in ───────────────────────────────────────────────────────
    const handleManualCheckIn = async () => {
        if (!selectedUserId) {
            toast.warning('Vui lòng chọn thành viên cần điểm danh.');
            return;
        }
        setManualLoading(true);
        try {
            await attendanceApi.manualCheckIn(eventId, selectedUserId);
            toast.success('✅ Điểm danh thủ công thành công!');
            setSelectedUserId('');
            await fetchAttendance(); // refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Điểm danh thủ công thất bại.');
        }
        setManualLoading(false);
    };

    // ── Quick row check-in (nút điểm danh trong bảng) ─────────────────────────
    // ── Quick row check-in (nút điểm danh trong bảng) ─────────────────────────
    const handleRowCheckIn = async (userId) => {
        try {
            await attendanceApi.manualCheckIn(eventId, userId);
            toast.success('✅ Đã điểm danh!');
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Điểm danh thất bại.');
        }
    };

    // ── Duyệt / Từ chối đăng ký ───────────────────────────────────────────────
    const handleApproveRegistration = async (userId, approve) => {
        setActionLoading(userId);
        try {
            await attendanceApi.approveRegistration(eventId, userId, approve);
            toast.success(approve ? '✅ Đã duyệt đăng ký thành công!' : '❌ Đã từ chối đăng ký.');
            await Promise.all([fetchAttendance(), fetchPending()]); // Refresh both
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thao tác thất bại.');
        }
        setActionLoading(null);
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    // ── Filtered list base on tab ─────────────────────────────────────────────
    const currentData = activeTab === 'attendance' ? attendanceList : pendingList;

    const filtered = currentData.filter((item) => {
        const name = item.user?.fullName ?? item.user?.name ?? '';
        const email = item.user?.email ?? '';
        const q = searchTerm.toLowerCase();
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });

    // Only registered (status 1) – for dropdown (Attendance Tab)
    const registeredOnly = attendanceList.filter((item) => item.status === 1);

    // Stats
    const totalRegistered = attendanceList.length + pendingList.length;
    const totalPending = pendingList.length;
    const totalAttended = attendanceList.filter((i) => i.status === 3).length;

    // ── Loaders / errors ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="attendance-page">
                <div className="attendance-loading">
                    <span style={{ fontSize: 48 }}>🌀</span>
                    <span>Hệ thống đang chuẩn bị dữ liệu...</span>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const checkInStatusInfo = {
        [CHECK_IN_STATUS.NOT_OPEN]: { label: 'Chưa mở', className: 'not-open', icon: '🔕' },
        [CHECK_IN_STATUS.OPEN]: { label: 'Đang mở', className: 'open', icon: '🟢' },
        [CHECK_IN_STATUS.CLOSED]: { label: 'Đã đóng', className: 'closed', icon: '🔴' },
    };
    const statusInfo = checkInStatusInfo[checkInStatus] ?? checkInStatusInfo[0];

    return (
        <div className="attendance-page">
            {/* ── Back + Title ── */}
            <div className="attendance-header">
                <div className="attendance-title-area">
                    <button
                        className="attendance-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <span>←</span> Quay lại dashboard
                    </button>
                    <h1 className="attendance-title">
                        Quản lý tham gia & điểm danh
                    </h1>
                    <p className="attendance-subtitle">
                        {event?.title ?? `Sự kiện ID: ${eventId}`}
                    </p>
                </div>
            </div>

            {/* ── Main Content Wrapper (Glass Effect) ── */}
            <div className="attendance-glass-container">

                {/* ── Error Banner ── */}
                {error && (
                    <div className="att-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* ── Check-in Toggle Panel ── */}
                <div className="attendance-checkin-panel">
                    <div className="attendance-checkin-info">
                        <div className={`attendance-checkin-icon ${statusInfo.className}`}>
                            {statusInfo.icon}
                        </div>
                        <div>
                            <p className="attendance-checkin-label">Trạng thái check-in</p>
                            <p className={`attendance-checkin-status ${statusInfo.className}`}>
                                {statusInfo.label}
                            </p>
                        </div>
                    </div>

                    <div className="attendance-checkin-actions">
                        {checkInStatus !== CHECK_IN_STATUS.OPEN ? (
                            <button
                                className="btn-checkin-open"
                                onClick={() => handleToggleCheckIn(CHECK_IN_STATUS.OPEN)}
                                disabled={togglingStatus}
                            >
                                {togglingStatus ? '⏳' : '🟢'} Mở check-in
                            </button>
                        ) : (
                            <button
                                className="btn-checkin-close"
                                onClick={() => handleToggleCheckIn(CHECK_IN_STATUS.CLOSED)}
                                disabled={togglingStatus}
                            >
                                {togglingStatus ? '⏳' : '🔴'} Đóng check-in
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Tabs Toggle ── */}
                <div className="attendance-tabs">
                    <button
                        className={`att-tab ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        📝 Điểm danh ({attendanceList.length})
                    </button>
                    <button
                        className={`att-tab ${activeTab === 'approval' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approval')}
                    >
                        👤 Duyệt đăng ký {totalPending > 0 && <span className="att-tab-badge">{totalPending}</span>}
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="attendance-stats">
                    <div className="attendance-stat-card">
                        <div className="attendance-stat-number">{totalRegistered}</div>
                        <div className="attendance-stat-label">Tổng đăng ký</div>
                    </div>
                    <div className="attendance-stat-card">
                        <div className="attendance-stat-number" style={{ color: '#e67e22' }}>
                            {totalPending}
                        </div>
                        <div className="attendance-stat-label">Đang chờ duyệt</div>
                    </div>
                    <div className="attendance-stat-card">
                        <div className="attendance-stat-number" style={{ color: '#1bb76e' }}>
                            {totalAttended}
                        </div>
                        <div className="attendance-stat-label">Đã tham gia</div>
                    </div>
                </div>

                {/* ── Attendance View (Tab: attendance) ── */}
                {activeTab === 'attendance' && (
                    <>
                        {/* ── Manual Check-in ── */}
                        <div className="attendance-manual-panel">
                            <h3 className="attendance-manual-title">✍️ Điểm danh thủ công</h3>
                            <div className="attendance-manual-form">
                                <select
                                    className="attendance-manual-select"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                    <option value="">— Chọn thành viên chưa điểm danh —</option>
                                    {registeredOnly.map((item) => {
                                        const userId = item.user?._id ?? item.user?.id;
                                        const name = item.user?.fullName ?? item.user?.name ?? 'Ẩn danh';
                                        const email = item.user?.email ?? '';
                                        return (
                                            <option key={userId} value={userId}>
                                                {name} {email ? `(${email})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button
                                    className="btn-manual-checkin"
                                    onClick={handleManualCheckIn}
                                    disabled={manualLoading || !selectedUserId}
                                >
                                    {manualLoading ? '⏳ Đang xử lý...' : '✅ Điểm danh'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Attendance Table ── */}
                <div className="attendance-table-panel">
                    <div className="attendance-table-header">
                        <h3 className="attendance-table-title">
                            Danh sách tham dự ({filtered.length})
                        </h3>
                        <input
                            className="attendance-search"
                            type="text"
                            placeholder="🔍 Tìm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="attendance-table-wrap">
                        {filtered.length === 0 ? (
                            <div className="att-empty">
                                <div className="att-empty-icon">📭</div>
                                {attendanceList.length === 0
                                    ? 'Chưa có ai đăng ký sự kiện này.'
                                    : 'Không tìm thấy kết quả phù hợp.'}
                            </div>
                        ) : (
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Thành viên</th>
                                        <th>Trạng thái</th>
                                        {activeTab === 'attendance' ? (
                                            <>
                                                <th>Giờ điểm danh</th>
                                                <th>Đăng ký lúc</th>
                                            </>
                                        ) : (
                                            <th>Thời gian đăng ký</th>
                                        )}
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item, idx) => {
                                        const userId = item.user?._id ?? item.user?.id;
                                        const name = item.user?.fullName ?? item.user?.name ?? 'Ẩn danh';
                                        const email = item.user?.email ?? '';
                                        const isAttended = item.status === 3;
                                        const isPending = item.status === 0;

                                        return (
                                            <tr key={userId ?? idx}>
                                                <td style={{ color: '#aaa', fontWeight: 500 }}>{idx + 1}</td>
                                                <td>
                                                    <div className="att-user-cell">
                                                        <div className="att-avatar">
                                                            {name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="att-user-name">{name}</p>
                                                            <p className="att-user-email">{email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`att-badge ${isAttended ? 'att-badge-attended' : isPending ? 'att-badge-pending' : 'att-badge-registered'
                                                            }`}
                                                    >
                                                        {isAttended ? '✅' : isPending ? '⏳' : '📝'}{' '}
                                                        {REG_STATUS_LABEL[item.status] ?? 'Không xác định'}
                                                    </span>
                                                </td>
                                                {activeTab === 'attendance' ? (
                                                    <>
                                                        <td style={{ fontSize: 13, color: '#666' }}>
                                                            {formatDateTime(item.check_in_time)}
                                                        </td>
                                                        <td style={{ fontSize: 13, color: '#666' }}>
                                                            {formatDateTime(item.registered_at)}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td style={{ fontSize: 13, color: '#666' }}>
                                                        {formatDateTime(item.registered_at)}
                                                    </td>
                                                )}
                                                <td>
                                                    {activeTab === 'attendance' ? (
                                                        !isAttended && checkInStatus === CHECK_IN_STATUS.OPEN ? (
                                                            <button
                                                                className="btn-row-checkin"
                                                                onClick={() => handleRowCheckIn(userId)}
                                                            >
                                                                Điểm danh
                                                            </button>
                                                        ) : isAttended ? (
                                                            <span style={{ color: '#1bb76e', fontSize: 13, fontWeight: 600 }}>
                                                                ✓ Hoàn thành
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#ccc', fontSize: 13 }}>
                                                                Chưa mở check-in
                                                            </span>
                                                        )
                                                    ) : (
                                                        <div className="att-approval-actions">
                                                            <button
                                                                className="btn-approve"
                                                                onClick={() => handleApproveRegistration(userId, true)}
                                                                disabled={actionLoading === userId}
                                                            >
                                                                {actionLoading === userId ? '...' : 'Đồng ý'}
                                                            </button>
                                                            <button
                                                                className="btn-reject"
                                                                onClick={() => handleApproveRegistration(userId, false)}
                                                                disabled={actionLoading === userId}
                                                            >
                                                                {actionLoading === userId ? '...' : 'Từ chối'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
