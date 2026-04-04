import axiosInstance from './adminapi';

export const createClubBadge = async (data) => {
    return axiosInstance.post('/club-badges', data);
};

export const updateClubBadge = async (id, data) => {
    return axiosInstance.put(`/club-badges/${id}`, data);
};

export const getClubBadges = async (clubId, params = {}) => {
    const query = { ...params };
    if (clubId) {
        query.club_id = clubId;
    }
    return axiosInstance.get('/club-badges', { params: query });
};

export const getClubBadgeDetail = async (id) => {
    return axiosInstance.get(`/club-badges/${id}`);
};
