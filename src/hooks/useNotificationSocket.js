import { useEffect } from 'react';
import { toast } from 'react-toastify';
import socketService from '../services/socket';

/**
 * Hook to setup realtime notification socket for the current user
 * Automatically joins user notification room and listens for `notification_received` event.
 * @param {Object} user - Current user object from auth context (must contain _id or id)
 */
export function useNotificationSocket(user) {
    useEffect(() => {
        if (!user) {
            // User not logged in, do nothing
            return;
        }

        const userId = user._id || user.id;
        if (!userId) {
            console.warn('useNotificationSocket: user object missing _id or id');
            return;
        }

        // Connect socket if not already connected
        const token = localStorage.getItem('accessToken');
        socketService.connect(token);

        // Join user notification room
        socketService.joinUserNotifications(userId);

        // Listen for real-time notifications
        const handleNotification = (notification) => {
            console.log('📬 Notification received:', notification);

            // Show toast notification based on type
            if (notification.type === 'event_canceled') {
                if (notification.audience === 'registered') {
                    // User was registered for this event
                    toast.warning(notification.body || notification.title, {
                        position: 'top-right',
                        autoClose: 9000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    // General notification for all users
                    toast.info(notification.body || notification.title, {
                        position: 'top-right',
                        autoClose: 7000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else {
                // Generic notification
                toast.info(notification.body || notification.title, {
                    position: 'top-right',
                    autoClose: 7000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }

            // Optional: trigger custom event or state update to refresh notification list
            // You can dispatch a custom event here if you want to auto-refresh notification list
            window.dispatchEvent(new CustomEvent('notification_received', { detail: notification }));
        };

        socketService.on('notification_received', handleNotification);

        // Cleanup on unmount or user change
        return () => {
            socketService.off('notification_received', handleNotification);
        };
    }, [user]);
}

export default useNotificationSocket;
