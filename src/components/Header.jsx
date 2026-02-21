import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

// Backend base URL để build full URL cho avatar nếu dùng đường dẫn từ BE
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
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
            className={`header-link ${location.pathname.startsWith('/clubs') ? 'is-active' : ''}`}
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
                            : `${ASSET_BASE}${user.avatar}`
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