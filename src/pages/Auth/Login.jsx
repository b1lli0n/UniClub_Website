import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginService } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../image/logo.png';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Clear general error and all input errors when user starts typing
    if (generalError) {
      setGeneralError('');
      setErrors({
        email: '',
        password: '',
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      // Trim khoảng trắng đầu cuối
      const trimmedValue = value.trim();
      setEmail(trimmedValue);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim và validate email
    const trimmedEmail = email.trim();
    const emailError = validateEmail(trimmedEmail);
    const passwordError = validatePassword(password);

    // Set errors
    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (emailError || passwordError) {
      const firstError = emailError || passwordError;
      toast.error(firstError);
      return;
    }

    setLoading(true);

    try {
      const response = await loginService({ email: trimmedEmail, password });

      if (response.success) {
        // Cập nhật auth context
        login(response.data.user);
        
        toast.success(response.message || 'Đăng nhập thành công!');
        // Chuyển hướng về trang chủ
        navigate('/');
      } else {
        // Nếu response không success nhưng không throw error
        const errorMessage = response.message || 'Đăng nhập thất bại';
        toast.error(errorMessage);

        // Hiển thị lỗi dưới input nếu có thể xác định field nào
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('mật khẩu')) {
          setErrors(prev => ({ ...prev, password: errorMessage }));
        }
      }
    } catch (error) {
      // Xử lý lỗi từ backend
      console.log('Login error caught:', error);

      let errorMessage = 'Đăng nhập thất bại';

      // Lấy message từ error object - ưu tiên các nguồn khác nhau
      if (error.response?.data?.message) {
        // Lỗi từ axios response
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Lỗi từ error object được throw
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.log('Error message to display:', errorMessage);

      // Hiển thị toast với thông báo lỗi
      toast.error(errorMessage);

      // Kiểm tra nếu là lỗi "Nhập sai password hoặc email"
      const lowerMessage = errorMessage.toLowerCase();
      const isLoginError = lowerMessage.includes('sai') && (lowerMessage.includes('password') || lowerMessage.includes('email') || lowerMessage.includes('mật khẩu'));

      if (isLoginError) {
        // Lỗi đăng nhập: hiển thị ở giữa form và đánh dấu cả 2 input
        setGeneralError(errorMessage);
        setErrors({
          email: errorMessage,
          password: errorMessage,
        });
      } else if (lowerMessage.includes('email') && !lowerMessage.includes('password') && !lowerMessage.includes('sai')) {
        // Lỗi liên quan đến email
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (lowerMessage.includes('password') || lowerMessage.includes('mật khẩu')) {
        // Lỗi liên quan đến password
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        // Lỗi chung, hiển thị ở password field
        setErrors(prev => ({
          ...prev,
          password: errorMessage
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Login Card */}
      <div className="login-card glass-card">
        {/* Logo */}
        <div className="form-logo-container">
          <img src={logoImage} alt="UniClub Logo" className="form-logo" />
        </div>

        <div className="login-header">
          <h1 className="login-title">
            Đăng<span className="title-accent"> Nhập</span>
          </h1>
          <p className="login-subtitle">Đăng nhập để khám phá các câu lạc bộ nào!!</p>
        </div>

        {/* General Error Message - Hiển thị ở giữa form */}
        {generalError && (
          <div className="login-general-error">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="uniclub@fpt.edu.vn"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              required
              disabled={loading}
            />
            {/* Không hiển thị error message dưới input nếu có general error */}
            {errors.email && !generalError && (
              <span className="form-error-message">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
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
            {/* Không hiển thị error message dưới input nếu có general error */}
            {errors.password && !generalError && (
              <span className="form-error-message">{errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? 'ĐANG XỬ LÝ...' : "ĐĂNG NHẬP"}
          </button>
        </form>

        {/* Registration Link */}
        <div className="register-link">
          <span className="register-text">Bạn là người mới?</span>{' '}
          <Link to="/register" className="register-link-text">
            Tạo tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
