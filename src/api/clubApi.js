import api from './api';

const clubAPI = api;

export const getAllClubs = async (params = {}) => {
  try {
    const response = await clubAPI.get('/clubs', { params });
    return response.data;
  } catch (error) {
    console.error('Get all clubs error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách câu lạc bộ' };
  }
};

// Lấy thông tin chi tiết một club
export const getClubById = async (id) => {
  try {
    const response = await clubAPI.get(`/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get club by id error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy thông tin câu lạc bộ' };
  }
};

// Lấy danh sách sự kiện của một club
export const getEventsByClub = async (clubId, params = {}) => {
  try {
    const response = await clubAPI.get(`/clubs/${clubId}/events`, { params });
    return response.data;
  } catch (error) {
    console.error('Get events by club error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách sự kiện của câu lạc bộ' };
  }
};

// Tạo club mới
export const createClub = async (clubData) => {
  try {
    const response = await clubAPI.post('/create', clubData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy danh sách clubs
export const getClubs = async () => {
  try {
    const response = await clubAPI.get('/');
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

// Cập nhật club
export const updateClub = async (clubId, clubData) => {
  try {
    const response = await clubAPI.put(`/${clubId}`, clubData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa club
export const deleteClub = async (clubId) => {
  try {
    const response = await clubAPI.delete(`/${clubId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Thêm thành viên vào club
export const addMemberToClub = async (clubId, memberId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/members`, { memberId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== MEMBER REQUEST APIS =====

// Gửi yêu cầu tham gia club
export const requestToJoinClub = async (clubId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/join-requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xem danh sách yêu cầu tham gia (của club hiện tại - dành cho leader/admin)
export const getJoinRequests = async (clubId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/join-requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xem danh sách yêu cầu của user hiện tại
export const getMyJoinRequests = async () => {
  try {
    const response = await clubAPI.get('/join-requests/my-requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xem chi tiết yêu cầu tham gia
export const getJoinRequestDetail = async (clubId, requestId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/join-requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Hủy yêu cầu tham gia club
export const cancelJoinRequest = async (clubId, requestId) => {
  try {
    const response = await clubAPI.delete(`/${clubId}/join-requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== MEMBER MANAGEMENT APIS =====

// Xem danh sách thành viên của club
export const getClubMembers = async (clubId) => {
  try {
    const response = await clubAPI.get(`/${clubId}/members`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Rời khỏi club
export const leaveClub = async (clubId) => {
  try {
    const response = await clubAPI.post(`/${clubId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ===== LEADER MEMBER MANAGEMENT APIS =====

// 1. Lấy danh sách thành viên với roles (dành cho leader)
export const getClubMembersWithRoles = async (clubId) => {
  try {
    const response = await clubAPI.get(`/clubs/${clubId}/memberships/leader/members`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Failed to fetch club members' };
  }
};

// 2. Tìm kiếm thành viên (dành cho leader)
export const searchClubMembers = async (clubId, keyword) => {
  try {
    const params = keyword ? { keyword } : {};
    const response = await clubAPI.get(`/clubs/${clubId}/memberships/leader/members/search`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Failed to search club members' };
  }
};

// 3. Xóa thành viên khỏi club (dành cho leader)
export const removeMember = async (clubId, membershipId) => {
  try {
    const response = await clubAPI.delete(`/clubs/${clubId}/memberships/leader/members/${membershipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Failed to remove member' };
  }
};

export default clubAPI;