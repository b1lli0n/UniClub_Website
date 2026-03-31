import api from './api';

const unwrap = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra';

/** Bỏ undefined / null / chuỗi rỗng để không gửi sort khi chọn "Tất cả". */
function cleanParams(raw) {
  const out = {};
  Object.entries(raw || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    out[k] = v;
  });
  return out;
}

/**
 * @param {string} clubId
 * @param {{ status?: ''|'open'|'closed', sort?: string|undefined, page?: number, limit?: number }} params
 */
export const listPolls = async (clubId, params = {}) => {
  try {
    const response = await api.get(`/clubs/${clubId}/polls`, { params: cleanParams(params) });
    return response.data;
  } catch (error) {
    console.error('listPolls', error);
    throw new Error(unwrap(error));
  }
};

export const getPollDetail = async (clubId, pollId) => {
  try {
    const response = await api.get(`/clubs/${clubId}/polls/${pollId}`);
    return response.data;
  } catch (error) {
    console.error('getPollDetail', error);
    throw new Error(unwrap(error));
  }
};

export const createPoll = async (clubId, body) => {
  try {
    const response = await api.post(`/clubs/${clubId}/polls`, body);
    return response.data;
  } catch (error) {
    console.error('createPoll', error);
    throw new Error(unwrap(error));
  }
};

export const updatePoll = async (clubId, pollId, body) => {
  try {
    const response = await api.patch(`/clubs/${clubId}/polls/${pollId}`, body);
    return response.data;
  } catch (error) {
    console.error('updatePoll', error);
    throw new Error(unwrap(error));
  }
};

export const closePoll = async (clubId, pollId) => {
  try {
    const response = await api.patch(`/clubs/${clubId}/polls/${pollId}/close`);
    return response.data;
  } catch (error) {
    console.error('closePoll', error);
    throw new Error(unwrap(error));
  }
};

export const votePoll = async (clubId, pollId, optionIds) => {
  try {
    const response = await api.post(`/clubs/${clubId}/polls/${pollId}/vote`, {
      option_ids: optionIds,
    });
    return response.data;
  } catch (error) {
    console.error('votePoll', error);
    throw new Error(unwrap(error));
  }
};
