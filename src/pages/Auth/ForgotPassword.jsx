import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../api/authApi';
import '../../styles/Login.css';
import '../../styles/ForgotPassword.css';

const validateEmail = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Email không được để trống';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Email không đúng định dạng';
  if (!trimmed.endsWith('@fpt.edu.vn')) return 'Email phải có đuôi @fpt.edu.vn';
  return '';
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ email: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ email: '' });
  };

  const handleBlur = () => {
    const trimmed = email.trim();
    setEmail(trimmed);
    setErrors({ email: validateEmail(trimmed) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailErr = validateEmail(trimmed);
    setErrors({ email: emailErr });
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(trimmed);
      if (res?.success) {
        toast.success(res.message || 'Đã gửi mã OTP đặt lại mật khẩu đến email của bạn');
        navigate('/reset-password', {
          state: {
            email: trimmed,
            resendCooldownSeconds: res.data?.resendCooldownSeconds ?? 60,
          },
        });
      } else {
        toast.error(res?.message || 'Gửi mã OTP thất bại');
      }
    } catch (err) {
      toast.error(err?.message || 'Gửi mã OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="forgot-password-card glass-card">
        <div className="forgot-password-icon-box">🔐</div>
        <h2 className="forgot-password-title">Quên mật khẩu?</h2>
        <p className="forgot-password-subtitle">
          Đừng lo lắng! Hãy nhập email liên kết với tài khoản của bạn để nhận mã khôi phục.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Địa chỉ Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="uniclub@fpt.edu.vn"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              disabled={loading}
            />
            {errors.email && <span className="form-error-message">{errors.email}</span>}
          </div>

          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'Gửi mã xác thực'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <span className="forgot-password-footer-text">Bạn đã nhớ mật khẩu?</span>{' '}
          <Link to="/login" className="forgot-password-footer-link">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
