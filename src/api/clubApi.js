import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/clubs";
const API_ROOT = "http://localhost:5000/api";

// Tạo instance axios
const clubAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm token vào mỗi request (FIX: đọc từ 'accessToken' thay vì 'token')
clubAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== CLUB CRUD =====

// Tạo club mới
export const createClub = async (clubData) => {
  try {
    const response = await clubAPI.post("/", clubData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy danh sách clubs
export const getClubs = async () => {
  try {
    const response = await clubAPI.get("/");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy chi tiết club
export const getClubDetail = async (clubId) => {
  try {
    const response = await clubAPI.get(`/${clubId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật club (BE chưa có route)
export const updateClub = async (clubId, clubData) => {
  try {
    const response = await clubAPI.put(`/${clubId}`, clubData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa club (BE chưa có route)
export const deleteClub = async (clubId) => {
  try {
    const response = await clubAPI.delete(`/${clubId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== MEMBER MANAGEMENT (Active Members) =====

// Xem danh sách thành viên active của club
export const getClubMembers = async (clubId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/members`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Thêm thành viên vào club (BE chưa có route)
export const addMemberToClub = async (clubId, memberId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/members`, { memberId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== JOIN REQUEST (User) =====

// Gửi yêu cầu tham gia club (BE chưa có route)
export const requestToJoinClub = async (clubId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/join-requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xem danh sách yêu cầu của user hiện tại (BE chưa có route)
export const getMyJoinRequests = async () => {
  try {
    const response = await clubAPI.get("/join-requests/my-requests");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== MEMBERSHIP REQUEST (Leader/Sub-leader) =====

// Xem danh sách yêu cầu tham gia (pending requests)
export const getJoinRequests = async (clubId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/members/requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xem chi tiết yêu cầu tham gia
export const getJoinRequestDetail = async (clubId, requestId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/memberships/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Duyệt yêu cầu tham gia (approve)
export const approveJoinRequest = async (clubId, requestId) => {
  try {
    const response = await clubAPI.post(
      `/${clubId}/memberships/${requestId}/approve`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Từ chối yêu cầu tham gia (reject)
export const rejectJoinRequest = async (clubId, requestId) => {
  try {
    const response = await clubAPI.post(
      `/${clubId}/memberships/${requestId}/reject`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Hủy yêu cầu tham gia (BE chưa có route)
export const cancelJoinRequest = async (clubId, requestId) => {
  try {
    const response = await clubAPI.delete(
      `/${clubId}/join-requests/${requestId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== LEAVE CLUB =====

// Rời khỏi club (BE chưa có route)
export const leaveClub = async (clubId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== EVENTS =====

// Lấy sự kiện theo club (dùng cho MyClub page)
export const getEventsByClub = async (clubId, params) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_ROOT}/events/club/${clubId}`, {
      params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy sự kiện user đã đăng ký (dùng cho My Events page)
export const getMyEvents = async (params) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_ROOT}/events/my-events`, {
      params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== Aliases để tương thích import cũ =====
export const getAllClubs = getClubs;
export const getClubById = getClubDetail;

export default clubAPI;