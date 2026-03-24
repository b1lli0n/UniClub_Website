import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePassword } from '../../api/authApi';
import '../../styles/Login.css';
import '../../styles/ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('profile-body');
    return () => document.body.classList.remove('profile-body');
  }, []);

  const validatePassword = (value) => {
    if (!value) return 'Mật khẩu không được để trống';
    if (/\s/.test(value)) return 'Mật khẩu không được chứa khoảng trắng';
    if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    if (!hasLetter) return 'Mật khẩu phải chứa ít nhất một chữ cái';
    if (!hasNumber) return 'Mật khẩu phải chứa ít nhất một số';
    if (!hasSpecialChar) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    return '';
  };

  const validateConfirmPassword = (value, password) => {
    if (!value) return 'Xác nhận mật khẩu không được để trống';
    if (value !== password) return 'Mật khẩu xác nhận không khớp';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'newPassword' && formData.confirmPassword) {
      const err = validateConfirmPassword(formData.confirmPassword, value);
      setErrors((prev) => ({ ...prev, confirmPassword: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'currentPassword') {
      setErrors((prev) => ({ ...prev, currentPassword: value ? '' : 'Mật khẩu không được để trống' }));
    } else if (name === 'newPassword') {
      const err = validatePassword(value);
      setErrors((prev) => ({ ...prev, newPassword: err }));
      if (formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
        }));
      }
    } else if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.newPassword),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    const currentErr = currentPassword ? '' : 'Mật khẩu hiện tại không được để trống';
    const newErr = validatePassword(newPassword);
    const confirmErr = validateConfirmPassword(confirmPassword, newPassword);

    const newErrors = {
      currentPassword: currentErr,
      newPassword: newErr,
      confirmPassword: confirmErr,
    };
    setErrors(newErrors);

    if (currentErr || newErr || confirmErr) {
      toast.error(currentErr || newErr || confirmErr);
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      if (res?.success) {
        toast.success(res.message || 'Đổi mật khẩu thành công');
        navigate('/profile');
      } else {
        toast.error(res?.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      toast.error(err?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) =>
    show ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    );

  return (
    <div className="change-password-page">
      <div className="change-password-card glass-card">

        <div className="change-password-header">
          <h1 className="change-password-title">
            Đổi Mật Khẩu
          </h1>
          <p className="change-password-subtitle">Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Mật khẩu hiện tại
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`form-input ${errors.currentPassword ? 'form-input-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                disabled={loading}
                aria-label={showPassword.current ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                <EyeIcon show={showPassword.current} />
              </button>
            </div>
            {errors.currentPassword && (
              <span className="form-error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              Mật khẩu mới
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`form-input ${errors.newPassword ? 'form-input-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                disabled={loading}
                aria-label={showPassword.new ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                <EyeIcon show={showPassword.new} />
              </button>
            </div>
            {errors.newPassword && (
              <span className="form-error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu mới
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                disabled={loading}
                aria-label={showPassword.confirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                <EyeIcon show={showPassword.confirm} />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
          </button>
        </form>

        <div className="change-password-footer">
          <span className="change-password-footer-text">Quên mật khẩu?</span>{' '}
          <Link to="/forgot-password" className="change-password-footer-link">
            Khôi phục mật khẩu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
