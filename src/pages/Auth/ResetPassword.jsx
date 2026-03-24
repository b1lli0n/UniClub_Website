import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../../api/authApi';
import '../../styles/Login.css';
import '../../styles/VerifyOtp.css';
import '../../styles/ResetPassword.css';

const OTP_LENGTH = 6;

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

const EyeIcon = ({ show }) =>
  show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [errors, setErrors] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Thiếu thông tin email. Vui lòng thực hiện quên mật khẩu trước.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const focusInput = (idx) => inputRefs.current[idx]?.focus();

  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);
    if (errors.otp) setErrors((e) => ({ ...e, otp: '' }));
    if (value && idx < OTP_LENGTH - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) focusInput(idx - 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'newPassword' && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setErrors((prev) => ({ ...prev, newPassword: validatePassword(value) }));
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
    const otpString = otp.join('');
    const newErr = validatePassword(formData.newPassword);
    const confirmErr = validateConfirmPassword(formData.confirmPassword, formData.newPassword);

    if (otpString.length !== OTP_LENGTH) {
      setErrors((prev) => ({ ...prev, otp: 'Vui lòng nhập đủ 6 số OTP' }));
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    if (newErr || confirmErr) {
      setErrors({ otp: '', newPassword: newErr, confirmPassword: confirmErr });
      toast.error(newErr || confirmErr);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(
        email,
        otpString,
        formData.newPassword,
        formData.confirmPassword
      );
      if (res?.success) {
        toast.success(res.message || 'Đặt lại mật khẩu thành công');
        console.log('Reset password success:', location);
        navigate('/login');
      } else {
        toast.error(res?.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      toast.error(err?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="reset-password-page">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="reset-password-card glass-card">
        <div className="reset-password-header">
          <h2>Đặt lại mật khẩu</h2>
          <p>
            Chúng tôi đã gửi mã OTP đến <strong>{email}</strong>. Nhập mã và mật khẩu mới.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label className="form-label">Mã OTP (6 số)</label>
            <div className="verify-otp-input-group" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  autoComplete="off"
                />
              ))}
            </div>
            {errors.otp && <span className="form-error-message">{errors.otp}</span>}
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
            {errors.newPassword && <span className="form-error-message">{errors.newPassword}</span>}
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
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;
