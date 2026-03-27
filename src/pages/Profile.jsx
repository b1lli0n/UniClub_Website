import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadProfileAvatar } from '../api/userApi';
import '../styles/Profile.css';
import { ASSET_BASE } from '../api/api';

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

const FULLNAME_REGEX = /^[\p{L}\s]+$/u;

const formatDateForInput = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validateDob = (dobStr) => {
  if (!dobStr || !String(dobStr).trim()) return { ok: true };
  const parts = String(dobStr).slice(0, 10).split('-');
  if (parts.length !== 3) return { ok: false, message: 'Ngày sinh không hợp lệ' };
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dob = new Date(y, m, day);
  if (
    dob.getFullYear() !== y ||
    dob.getMonth() !== m ||
    dob.getDate() !== day
  ) {
    return { ok: false, message: 'Ngày sinh không hợp lệ' };
  }
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  if (d > t) {
    return { ok: false, message: 'Ngày sinh phải là ngày trong quá khứ' };
  }
  const oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  if (d < oldest) {
    return { ok: false, message: 'Ngày sinh không hợp lệ' };
  }
  const twelfth = new Date(d.getFullYear() + 12, d.getMonth(), d.getDate());
  if (twelfth > t) {
    return { ok: false, message: 'Bạn phải đủ ít nhất 12 tuổi' };
  }
  return { ok: true };
};

const normalizeAssetPath = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'other',
    dob: '',
    avatar: '',
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);

  const maxDobStr = useMemo(() => {
    const t = new Date();
    t.setFullYear(t.getFullYear() - 12);
    return formatDateForInput(t);
  }, []);

  const minDobStr = useMemo(() => {
    const t = new Date();
    t.setFullYear(t.getFullYear() - 120);
    return formatDateForInput(t);
  }, []);

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
          const next = {
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone_number ?? userData.phone ?? '',
            gender: userData.gender || 'other',
            dob: formatDateForInput(userData.date_of_birth ?? userData.dob),
            avatar: normalizeAssetPath(userData.avatar_url || userData.avatar || ''),
          };
          setProfile(next);
          setOriginalProfile(next);
          setIsEditing(false);
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
    if (!isEditing) return;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const beginEdit = () => {
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (originalProfile) setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!isEditing) return;
    const nameTrim = (profile.fullName || '').trim();
    if (nameTrim.length < 2 || nameTrim.length > 70) {
      toast.error('Họ và tên phải từ 2 đến 70 ký tự');
      return;
    }
    if (!FULLNAME_REGEX.test(nameTrim)) {
      toast.error('Họ và tên chỉ được chứa chữ cái và khoảng trắng');
      return;
    }

    const phoneTrim = (profile.phone || '').trim();
    if (phoneTrim && !/^0\d{9}$/.test(phoneTrim)) {
      toast.error('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
      return;
    }

    const dobCheck = validateDob(profile.dob);
    if (!dobCheck.ok) {
      toast.error(dobCheck.message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: nameTrim,
        phone_number: phoneTrim,
        gender: profile.gender || 'other',
      };

      if (profile.dob) {
        payload.date_of_birth = profile.dob;
      }

      const avatarVal = (profile.avatar || '').trim();
      if (avatarVal) {
        payload.avatar_url = normalizeAssetPath(avatarVal);
      }

      const res = await updateProfile(payload);
      if (!res || !res.success) {
        toast.error(res?.message || 'Không thể cập nhật profile');
        return;
      }
      if (!res.data) {
        toast.error('Phản hồi từ server không hợp lệ');
        return;
      }
      toast.success(res.message || 'Cập nhật profile thành công');
      const u = res.data;
      const next = {
        fullName: u.fullName || '',
        email: u.email || '',
        phone: u.phone_number ?? u.phone ?? '',
        gender: u.gender || 'other',
        dob: formatDateForInput(u.date_of_birth ?? u.dob),
        avatar: normalizeAssetPath(u.avatar_url || u.avatar || ''),
      };
      setProfile(next);
      setOriginalProfile(next);
      setIsEditing(false);
      if (user && typeof updateUser === 'function') {
        const av = normalizeAssetPath(u.avatar_url ?? u.avatar ?? '');
        updateUser({
          ...user,
          fullName: u.fullName,
          email: u.email,
          avatar: av,
          avatar_url: av,
          ...(u.phone_number !== undefined && { phone_number: u.phone_number }),
        });
      }
    } catch (err) {
      const msg =
        (err && typeof err === 'object' && err.message) ||
        'Không thể cập nhật thông tin profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarButtonClick = () => {
    if (!isEditing) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isEditing) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh tối đa 2MB');
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      toast.error('Chỉ chấp nhận JPG, PNG, WebP hoặc GIF');
      return;
    }
    setUploadingAvatar(true);
    try {
      const res = await uploadProfileAvatar(file);
      if (!res?.success || !res.data) {
        toast.error(res?.message || 'Cập nhật ảnh thất bại');
        return;
      }
      toast.success(res.message || 'Đã cập nhật ảnh đại diện');
      const u = res.data;
      const av = normalizeAssetPath(u.avatar_url || u.avatar || '');
      setProfile((prev) => ({ ...prev, avatar: av }));
      setOriginalProfile((prev) => (prev ? { ...prev, avatar: av } : prev));
      if (user && typeof updateUser === 'function') {
        updateUser({
          ...user,
          fullName: u.fullName ?? user.fullName,
          email: u.email ?? user.email,
          avatar: av,
          avatar_url: av,
        });
      }
    } catch (err) {
      const msg =
        (err && typeof err === 'object' && err.message) ||
        'Không thể tải ảnh lên';
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
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
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="profile-avatar-file-input"
                onChange={handleAvatarFileChange}
              />
              <button
                type="button"
                className="profile-avatar-edit"
                onClick={handleAvatarButtonClick}
                        disabled={!isEditing || uploadingAvatar || saving}
              >
                {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
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
                    disabled={!isEditing || saving}
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
                    placeholder="Nhập số điện thoại"
                    disabled={!isEditing || saving}
                  />
                </div>
                <div className="profile-field-group profile-field-group--left">
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
                  </div>
                  <div className="profile-field profile-field--password">
                    <label className="profile-label" htmlFor="password">
                      Mật khẩu
                    </label>
                    <div className="profile-password-row">
                      <input
                        id="password"
                        type="text"
                        className="profile-input profile-input--readonly"
                        value="••••••••"
                        readOnly
                        aria-readonly="true"
                      />
                      <button
                        type="button"
                        className="profile-change-pass-btn"
                        onClick={() => navigate('/profile/change-password')}
                        disabled={!isEditing}
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
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
                      isDisabled={!isEditing || saving}
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
                        min={minDobStr}
                        max={maxDobStr}
                        disabled={!isEditing || saving}
                      />
                      <span className="profile-date-icon" aria-hidden="true">

                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section profile-section--actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={beginEdit}
                  disabled={saving || uploadingAvatar}
                >
                  Cập nhật
                </button>
              ) : (
                <div className="profile-action-row">
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={cancelEdit}
                    disabled={saving || uploadingAvatar}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="profile-save-btn"
                    onClick={handleSave}
                    disabled={saving || uploadingAvatar}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default Profile;

