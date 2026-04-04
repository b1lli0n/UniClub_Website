import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    /**
     * Initialize socket connection (only once)
     * @param {string} token - JWT token (optional)
     */
    connect(token) {
        const resolvedToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token');

        if (this.socket && this.socket.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        const options = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        };

        if (resolvedToken) {
            options.auth = { token: resolvedToken };
        }

        this.socket = io(SOCKET_URL, options);

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error?.message || error);
        });

        return this.socket;
    }

    /**
     * Join user notification room after login
     * @param {string} userId - User ID from auth state
     */
    joinUserNotifications(userId) {
        if (!this.socket || !this.socket.connected || !userId) {
            console.warn('Cannot join user_notifications: socket not connected or userId missing');
            return;
        }
        console.log('Joining notification room for user:', userId);
        this.socket.emit('join_user_notifications', userId);
    }

    /**
     * Join a specific event room (for event detail page)
     * @param {string} eventId - Event ID
     */
    joinEvent(eventId) {
        if (!this.socket || !this.socket.connected || !eventId) {
            console.warn('Cannot join event room: socket not connected or eventId missing');
            return;
        }
        console.log('Joining event room:', eventId);
        this.socket.emit('join_event', eventId);
    }

    /**
     * Leave a specific event room
     * @param {string} eventId - Event ID
     */
    leaveEvent(eventId) {
        if (!this.socket || !eventId) return;
        console.log('Leaving event room:', eventId);
        this.socket.emit('leave_event', eventId);
    }

    /**
     * Listen for a specific event (notification, event_cancelled, etc.)
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not initialized');
            return;
        }
        this.socket.on(event, callback);
    }

    /**
     * Remove a specific event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function (optional)
     */
    off(event, callback) {
        if (!this.socket) return;
        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }
    }

    /**
     * Disconnect socket (e.g., on logout)
     */
    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Get the underlying socket instance
     */
    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
let notificationCallback = null;
let internalNotificationHandler = null;

/**
 * Backward-compatible initializer used by legacy consumers.
 */
export const initSocket = (token) => {
    const socket = socketService.connect(token);
    if (!socket) return null;

    if (internalNotificationHandler) {
        socketService.off('notification_received', internalNotificationHandler);
    }

    internalNotificationHandler = (notification) => {
        console.log('New notification received:', notification);
        if (typeof notificationCallback === 'function') {
            notificationCallback(notification);
        }
    };

    socketService.on('notification_received', internalNotificationHandler);

    return socket;
};

/**
 * Đăng ký callback khi nhận notification mới
 * @param {Function} callback - Hàm callback(notification)
 */
export const onNotificationReceived = (callback) => {
    notificationCallback = typeof callback === 'function' ? callback : null;
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
    if (internalNotificationHandler) {
        socketService.off('notification_received', internalNotificationHandler);
        internalNotificationHandler = null;
    }
    notificationCallback = null;
    socketService.disconnect();
};

/**
 * Lấy instance socket hiện tại
 */
export const getSocket = () => socketService.getSocket();

export default socketService;