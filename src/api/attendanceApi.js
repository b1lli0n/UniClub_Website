import api from './api';

const attendanceApi = {
    /**
     * Xem danh sách đăng ký và đã điểm danh cho một sự kiện
     * GET /api/attendance/:eventId
     * Yêu cầu: Leader hoặc SubLeader của câu lạc bộ
     */
    getAttendanceList: (eventId) =>
        api.get(`/attendance/${eventId}`),

    /**
     * Manual Check-in thủ công cho SubLeader/Leader
     * POST /api/attendance/manual-checkin
     * Body: { eventId, userId }
     */
    manualCheckIn: (eventId, userId) =>
        api.post('/attendance/manual-checkin', { eventId, userId }),

    /**
     * Mở hoặc Đóng phiên điểm danh
     * PATCH /api/attendance/:eventId/checkin-status
     * Body: { status: 1 (mở) | 2 (đóng) }
     */
    setCheckInStatus: (eventId, status) =>
        api.patch(`/attendance/${eventId}/checkin-status`, { status }),

    /**
     * Duyệt / Từ chối điểm danh của member
     * POST /api/attendance/approve-checkin
     * Body: { eventId, userId, approve: true | false }
     */
    approveCheckIn: (eventId, userId, approve) =>
        api.post('/attendance/approve-checkin', { eventId, userId, approve }),

    /**
     * Lấy danh sách đăng ký đang CHỜ DUYỆT cho sự kiện
     * GET /api/attendance/:eventId/pending-registrations
     */
    getPendingRegistrations: (eventId) =>
        api.get(`/attendance/${eventId}/pending-registrations`),

    /**
     * Duyệt hoặc Từ chối một đăng ký sự kiện
     * POST /api/attendance/:eventId/approve-registration
     * Body: { userId: String, approve: Boolean }
     */
    approveRegistration: (eventId, userId, approve) =>
        api.post(`/attendance/${eventId}/approve-registration`, { userId, approve }),
};

export default attendanceApi;
