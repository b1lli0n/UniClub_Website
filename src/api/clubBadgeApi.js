import axiosInstance from './adminapi';

export const createClubBadge = async (data) => {
    return axiosInstance.post('/club-badges', data);
};

export const updateClubBadge = async (id, data) => {
    return axiosInstance.put(`/club-badges/${id}`, data);
};

export const getClubBadges = async (clubId, params = {}) => {
    if (clubId) {
        return axiosInstance.get(`/badges/${clubId}`, { params });
    }
    return axiosInstance.get('/club-badges', { params });
};

export const getClubBadgeDetail = async (id) => {
    return axiosInstance.get(`/club-badges/${id}`);
};
