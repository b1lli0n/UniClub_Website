import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../api/notificationApi";
import {
  initSocket,
  onNotificationReceived,
  offNotificationReceived,
  disconnectSocket,
} from "../services/socket";

// Backend base URL để build full URL cho avatar nếu dùng đường dẫn từ BE
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');
import { ASSET_BASE } from '../api/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Notification states
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread count, notifications, and init socket khi login
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      fetchNotifications(); // Fetch once on mount to get accurate unread count in case API fails
      initSocket();

      // Đăng ký callback cho socket
      onNotificationReceived((notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      offNotificationReceived();
    };
  }, [isLoggedIn]);

  // Fetch notifications lại khi mở dropdown để luôn có dữ liệu mới nhất
  useEffect(() => {
    if (notificationOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [notificationOpen, isLoggedIn]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      // Handles different backend response formats: { count: 3 }, { unreadCount: 3 }, { data: 3 }, etc.
      let count = 0;
      if (typeof response === 'number') {
        count = response;
      } else if (response) {
        count = response.count ?? response.unreadCount ?? response.data?.count ?? response.data ?? 0;
      }
      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    try {
      const response = await getNotifications({ limit: 10 });

      // ✅ FIX: Handle nhiều response structures khác nhau
      let notificationsList = [];
      if (Array.isArray(response)) {
        notificationsList = response;
      } else if (Array.isArray(response?.items)) {
        notificationsList = response.items;
      } else if (Array.isArray(response?.data?.items)) {
        notificationsList = response.data.items;
      } else if (Array.isArray(response?.data)) {
        notificationsList = response.data;
      } else if (Array.isArray(response?.notifications)) {
        notificationsList = response.notifications;
      }

      // ✅ Lấy bù unreadCount nếu endpoint unreadCount bị lỗi hoặc trả về 0 sai
      const localUnreadCount = notificationsList.filter(n => !isNotificationRead(n)).length;
      setUnreadCount(prev => Math.max(prev, localUnreadCount));

      setNotifications(notificationsList);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Không reset mảng khi reload dropndown để tránh flicker
      if (notifications.length === 0) setNotifications([]); 
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const notificationId = notification._id || notification.id;
      if (!notification.isRead && !notification.is_read) {
        await markAsRead(notificationId);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            (n._id || n.id) === notificationId
              ? { ...n, isRead: true, is_read: true }
              : n
          )
        );
      }
      setNotificationOpen(false);
      navigate(`/my-notifications?id=${notificationId}`);
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationOpen(false);
    navigate("/my-notifications");
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "EVENT":
        return "📅";
      case "CLUB":
        return "👥";
      case "SYSTEM":
        return "🔔";
      default:
        return "📧";
    }
  };

  // Helper functions to match NotificationCenter.jsx
  const getNotificationData = (item) => item?.notification || item;

  const getTitle = (item) => getNotificationData(item)?.title || "Không có tiêu đề";

  const getNotificationContent = (item) => {
    const data = getNotificationData(item);
    return data?.description || data?.content || data?.body || "Không có nội dung";
  };

  const isNotificationRead = (item) => item?.isRead || item?.is_read || false;

  const getCreatedAt = (item) => {
    const data = getNotificationData(item);
    return data?.createdAt || data?.created_at || item?.createdAt || item?.created_at || null;
  };

  const getType = (item) => getNotificationData(item)?.type || "general";
  
  const getSenderName = (item) => {
    const data = getNotificationData(item);
    return data?.display_sender_name || data?.displayName || data?.senderName || "Hệ thống";
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Ngắt kết nối socket khi logout
      disconnectSocket();

      // Gọi logout trước để xóa tokens và user data
      await logout();

      // Kiểm tra trang hiện tại để quyết định có navigate hay không
      const currentPath = location.pathname;

      // Nếu ở trang profile thì redirect về login
      if (currentPath === '/profile') {
        navigate('/login');
      }
      // Nếu ở home, clubs, hoặc club detail thì ở lại trang đó (không navigate)
      // Các trang khác cũng ở lại
    } catch (error) {
      console.error('Logout error:', error);
      // Nếu có lỗi và đang ở profile thì vẫn redirect về login
      if (location.pathname === '/profile') {
        navigate('/login');
      }
    }
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const initials = (user?.fullName || '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <nav className="header-nav glass-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <img
            src="/src/image/logo.png"
            alt="UniClub Logo"
            className="logo-image"
          />
          <div className="logo-text-wrapper">
            <span className="logo-text">UniClub</span>
            <span className="logo-subtext">
              {location.pathname.startsWith('/events') ? 'Events' :
                location.pathname.startsWith('/clubs') ? 'Clubs' :
                  location.pathname.startsWith('/profile') ? 'Profile' : 'Community'}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="header-links">
          <button
            type="button"
            className={`header-link ${/^\/clubs\/?$/.test(location.pathname) ? 'is-active' : ''}`}
            onClick={() => handleNavClick('/clubs')}
          >
            Clubs
          </button>
          <button
            type="button"
            className={`header-link ${location.pathname.startsWith('/events') ? 'is-active' : ''}`}
            onClick={() => handleNavClick('/events')}
          >
            Events
          </button>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <div className="notification-wrapper" ref={notificationRef}>
                <button
                  className="notification-bell-btn"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  type="button"
                >
                  <span className="bell-icon">🔔</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="notification-dropdown-menu">
                    {/* Header */}
                    <div className="notification-dropdown-header">
                      <span className="notification-dropdown-title">Thông báo</span>
                      {unreadCount > 0 && (
                        <button
                          className="mark-all-read-btn"
                          onClick={handleMarkAllAsRead}
                          type="button"
                        >
                          ✓ Đánh dấu tất cả đã đọc
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="notification-dropdown-list">
                      {notificationLoading ? (
                        <div className="notification-loading">
                          <div className="spinner"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                          <span className="empty-icon">🔔</span>
                          <p>Không có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id || notification.id}
                            className={`notification-item ${!isNotificationRead(notification) ? "unread" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {!isNotificationRead(notification) && <div className="unread-dot"></div>}
                            <div className="notification-icon">
                              {getNotificationIcon(getType(notification))}
                            </div>
                            <div className="notification-content">
                              <div className="notification-header-top">
                                <h4 className="notification-title">{getTitle(notification)}</h4>
                                <span className="notification-time">
                                  {formatTimeAgo(getCreatedAt(notification))}
                                </span>
                              </div>
                              <p className="notification-text">
                                {getNotificationContent(notification)}
                              </p>
                              <div className="notification-sender">
                                <span>👤</span> {getSenderName(notification)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="notification-dropdown-footer">
                      <button onClick={handleViewAllNotifications} type="button">
                        Xem tất cả thông báo →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User chip với avatar + name + role */}
              <div className="header-user-wrapper" ref={dropdownRef}>
                <div
                  className="header-user-chip"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="header-avatar">
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith('http')
                            ? user.avatar
                            : `${ASSET_BASE}${user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}`
                        }
                        alt={user?.fullName || 'Avatar'}
                        className="profile-avatar-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="profile-avatar">{initials || 'UC'}</div>
                    )}
                  </div>
                  <div className="header-user-text">
                    <div className="header-user-name">{user?.fullName || 'User'}</div>
                  </div>
                  <span className={`header-dropdown-arrow ${isDropdownOpen ? 'is-open' : ''}`}>
                    ▼
                  </span>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="header-dropdown-menu">
                    <button
                      className="header-dropdown-item"
                      onClick={() => handleMenuClick('/profile')}
                    >
                      <span className="dropdown-icon"></span>
                      My Profile
                    </button>
                    <button
                      className="header-dropdown-item"
                      onClick={() => handleMenuClick('/my-clubs')}
                    >
                      <span className="dropdown-icon"></span>
                      My Club
                    </button>
                    <button
                      className="header-dropdown-item"
                      onClick={() => handleMenuClick('/my-events')}
                    >
                      <span className="dropdown-icon"></span>
                      My Event
                    </button>
                    <button
                      className="header-dropdown-item"
                      onClick={() => handleMenuClick('/my-notifications')}
                    >
                      <span className="dropdown-icon">🔔</span>
                      My Notifications
                    </button>
                    <button
                      className="header-dropdown-item"
                      onClick={() => handleMenuClick('/my-requests')}
                    >
                      <span className="dropdown-icon"></span>
                      My Requests
                    </button>
                    <div className="header-dropdown-divider"></div>
                    <button
                      className="header-dropdown-item logout-item"
                      onClick={handleLogoutClick}
                    >
                      <span className="dropdown-icon"></span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="header-login-btn"
                type="button"
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
              <button
                className="header-register-btn"
                type="button"
                onClick={() => navigate('/register')}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleLogoutCancel}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <h3 className="logout-modal-title">Xác nhận đăng xuất</h3>
            </div>
            <div className="logout-modal-body">
              <p className="logout-modal-message">Bạn có chắc muốn đăng xuất?</p>
            </div>
            <div className="logout-modal-footer">
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn-cancel"
                onClick={handleLogoutCancel}
              >
                Hủy
              </button>
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn-confirm"
                onClick={handleLogoutConfirm}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;