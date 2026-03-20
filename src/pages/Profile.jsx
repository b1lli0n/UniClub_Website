import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/userApi';
import { getMyContributions, getMyClubs, getClubs } from '../api/clubApi';
import PointHistoryTable, { PointStatsRow } from '../components/PointHistoryTable';
import '../styles/Profile.css';
import '../styles/PointHistory.css';

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
    '&:hover': { borderColor: '#FFAFCC' },
  }),
  valueContainer: (p) => ({ ...p, padding: '0 8px' }),
  placeholder: (p) => ({ ...p, color: 'rgba(74, 74, 106, 0.5)' }),
  menu: (p) => ({ ...p, borderRadius: '0.9rem', boxShadow: '0 12px 30px rgba(31, 42, 68, 0.18)', overflow: 'hidden' }),
  option: (p, s) => ({
    ...p, fontSize: '0.9rem', padding: '8px 12px',
    backgroundColor: s.isSelected ? 'rgba(255, 175, 204, 0.2)' : s.isFocused ? 'rgba(189, 224, 254, 0.35)' : 'white',
    color: '#4A4A6A',
  }),
  singleValue: (p) => ({ ...p, color: '#4A4A6A' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

const TABS = [
  { key: 'info', label: '👤 Thông tin cá nhân' },
  { key: 'points', label: '🏆 Lịch sử điểm' },
];

const Profile = () => {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const [profile, setProfile] = useState({
    fullName: '', email: '', phone: '', gender: 'other', dob: '', avatar: '',
  });
  const [loading, setLoading] = useState(true);

  // ── Point history state ──────────────────────────────────────────────────
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [pointData, setPointData] = useState(null);
  const [pointLoading, setPointLoading] = useState(false);
  const [pointError, setPointError] = useState('');
  const [clubsLoading, setClubsLoading] = useState(false);


  // Format date
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    document.body.classList.add('profile-body');
    return () => document.body.classList.remove('profile-body');
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          const ud = response.data;
          setProfile({
            fullName: ud.fullName || '',
            email: ud.email || '',
            phone: ud.phone || '',
            gender: ud.gender || 'other',
            dob: formatDateForInput(ud.dob),
            avatar: ud.avatar_url || '',
          });
        } else {
          toast.error(response.message || 'Không thể tải thông tin profile');
        }
      } catch (error) {
        toast.error(error?.message || 'Không thể tải thông tin profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch clubs user belongs to
  useEffect(() => {
    const fetchClubs = async () => {
      setClubsLoading(true);
      try {
        const response = await getMyClubs();
        // Xử lý dữ liệu linh hoạt: response.data hoặc response.clubs hoặc chính là response
        let clubList = response?.data || response?.clubs || response || [];

        // Nếu không có CLB nào tham gia, lấy danh sách tất cả CLB để xem (fallback)
        if (!Array.isArray(clubList) || clubList.length === 0) {
          const allClubsRes = await getClubs();
          clubList = allClubsRes?.data || allClubsRes?.clubs || allClubsRes || [];
        }

        // Lọc lại lần nữa để chắc chắn là mảng
        const finalClubs = Array.isArray(clubList) ? clubList : [];
        setClubs(finalClubs);

        // Tự động chọn CLB đầu tiên nếu chưa có cái nào được chọn
        if (finalClubs.length > 0 && !selectedClubId) {
          const firstClub = finalClubs[0];
          // Lấy ID linh hoạt (hỗ trợ nhiều kiểu tên field ID của Backend)
          const firstId = firstClub._id || firstClub.id || firstClub.clubId || firstClub.club?._id || firstClub.club?.id;
          if (firstId) setSelectedClubId(firstId);
        }
      } catch (error) {
        console.error("Failed to fetch user clubs:", error);
      } finally {
        setClubsLoading(false);
      }
    };
    if (isLoggedIn) fetchClubs();
  }, [isLoggedIn, selectedClubId]);

  const fetchPoints = async () => {
    if (!selectedClubId) return;
    setPointLoading(true);
    setPointError('');
    try {
      const res = await getMyContributions(selectedClubId);
      setPointData(res);
    } catch (err) {
      setPointError(err?.message || 'Không thể tải lịch sử điểm');
      setPointData(null);
    } finally {
      setPointLoading(false);
    }
  };

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

