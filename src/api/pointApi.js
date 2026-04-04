import api from './api';

// Lấy lịch sử điểm và tổng điểm thưởng của user trong club
export const getPointHistory = async (clubId) => {
    const response = await api.get(`/points/history`, { params: { clubId } });
    return response.data;
};
