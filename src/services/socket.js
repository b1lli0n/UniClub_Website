import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let notificationCallback = null;

/**
 * Khởi tạo kết nối socket
 */
export const initSocket = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    if (!token) {
        console.warn('No token found, socket connection skipped');
        return null;
    }

    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    // Lắng nghe sự kiện notification_received
    socket.on('notification_received', (notification) => {
        console.log('New notification received:', notification);
        if (notificationCallback) {
            notificationCallback(notification);
        }
    });

    return socket;
};

/**
 * Đăng ký callback khi nhận notification mới
 * @param {Function} callback - Hàm callback(notification)
 */
export const onNotificationReceived = (callback) => {
    notificationCallback = callback;
};

/**
 * Hủy đăng ký callback
 */
export const offNotificationReceived = () => {
    notificationCallback = null;
};

/**
 * Ngắt kết nối socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Lấy instance socket hiện tại
 */
export const getSocket = () => socket;

export default {
    initSocket,
    onNotificationReceived,
    offNotificationReceived,
    disconnectSocket,
    getSocket
};