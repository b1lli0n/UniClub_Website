import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login as loginService } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import logoUniclub from '../../assets/logo-uniclub.png';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Email không được để trống';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) return 'Email không đúng định dạng';
    if (!trimmedValue.endsWith('@fpt.edu.vn')) return 'Email phải có đuôi @fpt.edu.vn';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Mật khẩu không được để trống';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailError = validateEmail(trimmedEmail);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      toast.error(emailError || passwordError);
      return;
    }

    setLoading(true);
    try {
      const response = await loginService({ email: trimmedEmail, password });
      if (response.success) {
        login(response.data.user);
        toast.success(response.message || 'Đăng nhập thành công!');
        navigate('/');
      } else {
        toast.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-auth-container">
        {/* Left Side: Illustration & Logo */}
        <div className="auth-visual-side">
          <img src={logoUniclub} alt="UniClub" className="auth-logo-top" />

          <div className="auth-illustration-center">
            <div className="illustration-blob-bg"></div>
            <div className="auth-main-icon">
              <Sparkles size={180} strokeWidth={1} />
            </div>
            <div className="auth-visual-text">
              <h2>Chào mừng bạn trở lại</h2>
              <p>Khám phá môi trường câu lạc bộ sôi động và chuyên nghiệp nhất</p>
            </div>
          </div>

          <div className="auth-footer-copyright">
            <p>© 2026 UniClub - Bản quyền đã được bảo lưu.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <div className="auth-form-content">
            <h1 className="auth-title">Đăng nhập</h1>

            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <i><Mail size={18} /></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group" style={{ marginBottom: '1rem' }}>
                <label className="auth-label">Mật khẩu</label>
                <div className="auth-input-wrapper">
                  <i><Lock size={18} /></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-link-row">
                <Link to="/forgot-password" size="sm" className="auth-link-sm">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="auth-btn-submit" disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'Đăng nhập vào UniClub'}
              </button>
            </form>

            <div className="auth-switch-text">
              Chưa có tài khoản?
              <Link to="/register" className="auth-switch-link">
                Đăng ký ngay
              </Link>
            </div>

            <div className="auth-footer-links">
              <a href="#">Điều khoản sử dụng</a>
              <a href="#">Bảo mật hệ thống</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
