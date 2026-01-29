import axios from "axios";

const BASE_URL = "http://localhost:5000/api/events";
const eventService = {
    // Lấy danh sách sự kiện
    getEvents: (params) => axios.get(`${BASE_URL}`, { params }),

    // Lấy sự kiện đã qua
    getPastEvents: (params) => axios.get(`${BASE_URL}/past`, { params }),

    // Lấy sự kiện theo club
    getEventsByClub: (clubId, params) => axios.get(`${BASE_URL}/club/${clubId}`, { params }),

    // Đăng ký tham gia sự kiện
    registerForEvent: (id, userId) => axios.post(`${BASE_URL}/${id}/register`, { userId }),

    // Hủy đăng ký sự kiện
    cancelRegistration: (id, userId) => axios.delete(`${BASE_URL}/${id}/register`, { data: { userId } }),

    // Check-in sự kiện
    checkInEvent: (id, email) => axios.post(`${BASE_URL}/${id}/check-in`, { email }),

    // Xem feedbacks của sự kiện
    getFeedbacks: (id, params) => axios.get(`${BASE_URL}/${id}/feedback`, { params }),

    // Xem chi tiết sự kiện
    getEventById: (id, userId) => axios.get(`${BASE_URL}/${id}`, { params: userId ? { userId } : undefined }),
};

export default eventService;