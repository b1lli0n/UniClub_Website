import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { verifyOtp, resendOtp } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/VerifyOtp.css';

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const initialCooldown = location.state?.resendCooldownSeconds ?? 60;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(initialCooldown);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Thiếu thông tin email. Vui lòng đăng ký lại.');
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const focusInput = (idx) => {
    inputRefs.current[idx]?.focus();
  };

  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);
    if (value && idx < OTP_LENGTH - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      focusInput(idx - 1);
    }
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

  const otpString = otp.join('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpString.length !== OTP_LENGTH) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, otpString);
      if (res.success) {
        if (res.data?.user) {
          login(res.data.user);
        }
        setSuccess(true);
        toast.success(res.message || 'Xác thực thành công!');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      } else {
        toast.error(res.message || 'Xác thực thất bại');
      }
    } catch (error) {
      toast.error(error?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await resendOtp(email);
      if (res.success) {
        toast.success(res.message || 'Đã gửi lại mã OTP');
        setResendCooldown(res.data?.resendCooldownSeconds ?? 60);
      } else {
        const seconds = res.secondsLeft ?? res.data?.secondsLeft;
        if (seconds != null) {
          toast.error(res.message || `Vui lòng đợi ${seconds} giây trước khi gửi lại`);
          setResendCooldown(seconds);
        } else {
          toast.error(res.message || 'Gửi lại mã thất bại');
        }
      }
    } catch (error) {
      const seconds = error?.secondsLeft ?? error?.data?.secondsLeft;
      if (seconds != null) {
        toast.error(error?.message || `Vui lòng đợi ${seconds} giây`);
        setResendCooldown(seconds);
      } else {
        toast.error(error?.message || 'Gửi lại mã thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  if (success) {
    return (
      <div className="verify-otp-page">
        <div className="verify-otp-card">
          <div className="verify-otp-success">
            <div className="verify-otp-success-icon">✓</div>
            <h2>Xác thực thành công!</h2>
            <p>
              Chào mừng bạn đến với <b>UniClub</b>. Đang chuyển hướng về trang chủ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <h2>Xác thực mã OTP</h2>
          <p>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <strong>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify}>
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

          <button
            type="submit"
            className="verify-otp-btn"
            disabled={loading || otpString.length !== OTP_LENGTH}
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'Xác nhận mã OTP'}
          </button>
        </form>

        <p className="verify-otp-resend">
          Chưa nhận được mã?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
          >
            {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
