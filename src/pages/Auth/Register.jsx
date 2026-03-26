import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { register as registerService } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import logoUniclub from '../../assets/logo-uniclub.png';
import '../../styles/Register.css';

const Register = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
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

  const validateFullName = (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Họ và tên không được để trống';
    if (trimmedValue.length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
    const vietnameseNameRegex = /^[\p{L}\s]+$/u;
    if (!vietnameseNameRegex.test(trimmedValue)) return 'Họ và tên chỉ chứa chữ cái';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Mật khẩu không được để trống';
    if (value.length < 6) return 'Ít nhất 6 ký tự';
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    if (!hasLetter || !hasNumber || !hasSpecialChar) return 'Mật khẩu yếu (cần chữ, số, ký tự đặc biệt)';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmError = formData.password !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp' : '';

    if (fullNameError || emailError || passwordError || confirmError) {
      toast.error(fullNameError || emailError || passwordError || confirmError);
      return;
    }

    setLoading(true);
    try {
      const response = await registerService({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        if (response.data?.needVerify) {
          toast.success(response.message || 'Thành công! Hãy xác thực email.');
          navigate('/verify-otp', { state: { email: formData.email.trim() } });
        } else {
          if (response.data?.user) login(response.data.user);
          toast.success('Đăng ký thành công!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-auth-container">
        {/* Left Side: Visuals */}
        <div className="auth-visual-side">
          <img src={logoUniclub} alt="UniClub" className="auth-logo-top" />
          
          <div className="auth-illustration-center">
            <div className="illustration-blob-bg"></div>
            <div className="auth-main-icon">
              <Users size={180} strokeWidth={1} />
            </div>
            <div className="auth-visual-text">
              <h2>Gia nhập cộng đồng</h2>
              <p>Kết nối cùng hàng nghìn sinh viên ưu tú tại các câu lạc bộ hàng đầu</p>
            </div>
          </div>
          
          <div className="auth-footer-copyright">
            <p>© 2026 UniClub - Bản quyền đã trợ bảo lưu.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <div className="auth-form-content">
            <h1 className="auth-title">Đăng ký</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label">Họ và tên</label>
                <div className="auth-input-wrapper">
                  <i><User size={18} /></i>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <i><Mail size={18} /></i>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="uniclub@fpt.edu.vn"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Mật khẩu</label>
                <div className="auth-input-wrapper">
                  <i><Lock size={18} /></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem', paddingRight: '3.25rem' }}
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

              <div className="auth-input-group">
                <label className="auth-label">Xác nhận mật khẩu</label>
                <div className="auth-input-wrapper">
                  <i><Lock size={18} /></i>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="auth-input"
                    style={{ paddingLeft: '3.5rem', paddingRight: '3.25rem' }}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn-submit" disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'Tạo tài khoản UniClub'}
              </button>
            </form>

            <div className="auth-switch-text">
              Đã có tài khoản?
              <Link to="/login" className="auth-switch-link">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
