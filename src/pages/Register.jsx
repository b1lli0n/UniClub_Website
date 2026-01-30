import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register as registerService } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import logoImage from '../image/logo.png';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Validation function for fullName
  const validateFullName = (value) => {
    const trimmedValue = value.trim();

    // Không được rỗng
    if (!trimmedValue) {
      return 'Họ và tên không được để trống';
    }

    // Lớn hơn hoặc bằng 2 ký tự
    if (trimmedValue.length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Ít hơn hoặc bằng 70 ký tự
    if (trimmedValue.length > 70) {
      return 'Họ và tên không được vượt quá 70 ký tự';
    }

    // Regex: chỉ chữ cái tiếng Việt có dấu và khoảng trắng
    const vietnameseNameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;

    if (!vietnameseNameRegex.test(trimmedValue)) {
      return 'Họ và tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng';
    }

    return '';
  };

  // Validation function for email
  const validateEmail = (value) => {
    const trimmedValue = value.trim();

    // Không được rỗng
    if (!trimmedValue) {
      return 'Email không được để trống';
    }

    // Kiểm tra format email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      return 'Email không đúng định dạng';
    }

    // Bắt buộc đuôi @fpt.edu.vn
    if (!trimmedValue.endsWith('@fpt.edu.vn')) {
      return 'Email phải có đuôi @fpt.edu.vn';
    }

    return '';
  };

  // Validation function for password
  const validatePassword = (value) => {
    // Không được rỗng
    if (!value) {
      return 'Mật khẩu không được để trống';
    }

    // Không được chứa khoảng trắng
    if (/\s/.test(value)) {
      return 'Mật khẩu không được chứa khoảng trắng';
    }

    // Lớn hơn hoặc bằng 6 ký tự
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Phải có chữ cái, số và ký tự đặc biệt
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    if (!hasLetter) {
      return 'Mật khẩu phải chứa ít nhất một chữ cái';
    }

    if (!hasNumber) {
      return 'Mật khẩu phải chứa ít nhất một số';
    }

    if (!hasSpecialChar) {
      return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    }

    return '';
  };

  // Validation function for confirmPassword
  const validateConfirmPassword = (value, password) => {
    // Không được rỗng
    if (!value) {
      return 'Xác nhận mật khẩu không được để trống';
    }

    // Phải trùng với password
    if (value !== password) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Nếu đang nhập password và có confirmPassword, validate lại confirmPassword
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'fullName') {
      // Trim khoảng trắng đầu cuối
      const trimmedValue = value.trim();
      setFormData({
        ...formData,
        fullName: trimmedValue,
      });

      // Validate
      const error = validateFullName(trimmedValue);
      setErrors({
        ...errors,
        fullName: error,
      });
    } else if (name === 'email') {
      // Trim khoảng trắng đầu cuối
      const trimmedValue = value.trim();
      setFormData({
        ...formData,
        email: trimmedValue,
      });

      // Validate
      const error = validateEmail(trimmedValue);
      setErrors({
        ...errors,
        email: error,
      });
    } else if (name === 'password') {
      // Validate password
      const error = validatePassword(value);
      setErrors({
        ...errors,
        password: error,
      });

      // Nếu có confirmPassword, validate lại confirmPassword
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, value);
        setErrors(prev => ({
          ...prev,
          confirmPassword: confirmError,
        }));
      }
    } else if (name === 'confirmPassword') {
      // Validate confirmPassword
      const error = validateConfirmPassword(value, formData.password);
      setErrors({
        ...errors,
        confirmPassword: error,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim và validate fullName
    const trimmedFullName = formData.fullName.trim();
    const fullNameError = validateFullName(trimmedFullName);

    // Trim và validate email
    const trimmedEmail = formData.email.trim();
    const emailError = validateEmail(trimmedEmail);

    // Validate password
    const passwordError = validatePassword(formData.password);

    // Validate confirmPassword
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    // Set all errors
    const newErrors = {
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      const firstError = fullNameError || emailError || passwordError || confirmPasswordError;
      toast.error(firstError);
      return;
    }

    // Update formData with trimmed values
    const finalFormData = {
      ...formData,
      fullName: trimmedFullName,
      email: trimmedEmail,
    };

    setLoading(true);

    try {
      const response = await registerService(finalFormData);

      if (response.success) {
        // Cập nhật auth context
        login(response.data.user);

        toast.success(response.message || 'Đăng ký thành công!');

        // Chuyển hướng về trang chủ
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Animated Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Register Card */}
      <div className="register-card glass-card">
        {/* Logo */}
        <div className="form-logo-container">
          <img src={logoImage} alt="UniClub Logo" className="form-logo" />
        </div>

        <div className="register-header">
          <h1 className="register-title">
            Đăng<span className="title-accent"> Ký</span>
          </h1>
          <p className="register-subtitle">Đăng ký để được tham gia các câu lạc bộ độc đáo nào!!</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mai An Tiêm"
              className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
              required
              disabled={loading}
            />
            {errors.fullName && (
              <span className="form-error-message">{errors.fullName}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="uniclub@fpt.edu.vn"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              required
              disabled={loading}
            />
            {errors.email && (
              <span className="form-error-message">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="form-error-message">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="register-submit-button"
            disabled={loading}
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          <span className="login-text">Đã có tài khoản?</span>{' '}
          <Link to="/login" className="login-link-text">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
