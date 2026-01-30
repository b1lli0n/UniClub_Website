import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/userApi';
import '../styles/Profile.css';

// Backend base URL để build full URL cho avatar nếu BE trả về đường dẫn tương đối
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

const genderOptions = [
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
  { value: 'other', label: 'Khác' },
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.9rem',
    borderColor: state.isFocused ? '#FFAFCC' : 'rgba(255, 255, 255, 0.9)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(255, 175, 204, 0.45)' : '0 4px 10px rgba(31, 42, 68, 0.04)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '0 2px',
    '&:hover': {
      borderColor: '#FFAFCC',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(74, 74, 106, 0.5)',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.9rem',
    boxShadow: '0 12px 30px rgba(31, 42, 68, 0.18)',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.9rem',
    padding: '8px 12px',
    backgroundColor: state.isSelected
      ? 'rgba(255, 175, 204, 0.2)'
      : state.isFocused
        ? 'rgba(189, 224, 254, 0.35)'
        : 'white',
    color: '#4A4A6A',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#4A4A6A',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
};

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'other',
    dob: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(true);

  // Format date từ Date object sang string YYYY-MM-DD cho input date
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Add body class for styling
  useEffect(() => {
    document.body.classList.add('profile-body');
    return () => {
      document.body.classList.remove('profile-body');
    };
  }, []);

  // Fetch profile từ backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          const userData = response.data;
          setProfile({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || 'other',
            dob: formatDateForInput(userData.dob),

            avatar: userData.avatar_url || '',
          });
        } else {
          toast.error(response.message || 'Không thể tải thông tin profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        const message =
          error?.message ||
          'Không thể tải thông tin profile. Vui lòng thử lại sau.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const initials = (profile.fullName || '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  if (loading) {
    return (
      <div className="profile-page">
        <Container className="py-4">
          <div className="profile-card glass-card">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Đang tải thông tin profile...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Container className="py-4">
        {/* Title Section */}
        <div className="profile-title-section">
          <h1 className="profile-page-title">Thông tin cá nhân</h1>
          <p className="profile-page-subtitle">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card glass-card">
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              {profile.avatar ? (
                <img
                  src={
                    profile.avatar.startsWith('http')
                      ? profile.avatar
                      : `${ASSET_BASE}${profile.avatar}`
                  }
                  alt={profile.fullName || 'Avatar'}
                  className="profile-avatar-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/default-avatar.png';
                  }}
                />
              ) : (
                <div className="profile-avatar">{initials || 'UC'}</div>
              )}
              <button type="button" className="profile-avatar-edit">
                Đổi ảnh
              </button>
            </div>
            <div className="profile-head-text">
              <h1 className="profile-name">{profile.fullName || 'Chưa cập nhật'}</h1>
              <p className="profile-role">Thành viên UniClub</p>
            </div>
          </div>

          <Container className="profile-body">
            <div className="profile-section">
              <h2 className="profile-section-title">Thông tin cá nhân</h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="profile-input"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="Họ và tên"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="profile-input"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="profile-input profile-input--readonly"
                    value={profile.email}
                    readOnly
                  />
                  <p className="profile-hint">Email dùng để đăng nhập hệ thống.</p>
                </div>
                <div className="profile-field profile-field-inline">
                  <div className="profile-field-half">
                    <label className="profile-label" htmlFor="gender">
                      Giới tính
                    </label>
                    <Select
                      inputId="gender"
                      classNamePrefix="profile-select"
                      styles={selectStyles}
                      options={genderOptions}
                      value={genderOptions.find((opt) => opt.value === profile.gender) || genderOptions[0]}
                      onChange={(option) => setProfile((prev) => ({ ...prev, gender: option?.value || prev.gender }))}
                      isSearchable={false}
                    />
                  </div>
                  <div className="profile-field-half">
                    <label className="profile-label" htmlFor="dob">
                      Ngày sinh
                    </label>
                    <div className="profile-date-wrapper">
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        className="profile-input profile-date-input"
                        value={profile.dob}
                        onChange={handleChange}
                      />
                      <span className="profile-date-icon" aria-hidden="true">

                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section profile-section--actions">
              <button type="button" className="profile-save-btn">
                Lưu thay đổi
              </button>
            </div>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default Profile;

