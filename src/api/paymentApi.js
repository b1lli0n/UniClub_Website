import api from './api';

const paymentAPI = api;

export const createPaymentUrl = async (payload = {}) => {
  try {
    const response = await paymentAPI.post('/payment/create-payment-url', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: error?.message || 'Khong the tao duong dan thanh toan'
    };
  }
};


export default paymentAPI;
