import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getClubMembersWithRoles,
  searchClubMembers,
  removeMember,
} from '../../api/clubApi';
import '../../styles/ClubMemberManagement.css';

const ROLE_LABELS = {
  0: 'Member',
  1: 'Leader',
  2: 'Sub Leader',
  3: 'Secretary',
  4: 'Treasurer',
};

const ROLE_CLASS = {
  0: 'role-member',
  1: 'role-leader',
  2: 'role-subleader',
  3: 'role-secretary',
  4: 'role-treasurer',
};

const ROLE_ICON = {
  0: '👤',
  1: '👑',
  2: '⭐',
  3: '📋',
  4: '💰',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ClubMemberManagement() {
  const navigate = useNavigate();
  const { id: clubId } = useParams();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null); // membership object to remove
  const [removing, setRemoving] = useState(false);

  const searchTimer = useRef(null);

  // ── Load all members on mount ──
  const loadMembers = useCallback(async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getClubMembersWithRoles(clubId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setMembers(list);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // ── Debounced search ──
  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setKeyword(val);

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchClubMembers(clubId, val.trim() || undefined);
        const list = Array.isArray(data) ? data : data?.data || [];
        setMembers(list);
      } catch (err) {
        toast.error(err?.message || 'Tìm kiếm thất bại');
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleClearSearch = async () => {
    setKeyword('');
    clearTimeout(searchTimer.current);
    await loadMembers();
  };

  // ── Remove member ──
  const handleRemoveConfirm = async () => {
    if (!confirmTarget || removing) return;
    const { _id: membershipId, user_id } = confirmTarget;
    const name = user_id?.fullName || user_id?.email || 'thành viên này';

    try {
      setRemoving(true);
      await removeMember(clubId, membershipId);
      toast.success(`Đã xóa ${name} khỏi club`);
      setMembers((prev) => prev.filter((m) => m._id !== membershipId));
      setConfirmTarget(null);
    } catch (err) {
      const msg = err?.message || 'Xóa thành viên thất bại';
      if (msg.includes('Cannot remove')) {
        toast.error('Không thể xóa Leader của club');
      } else if (msg.includes('not found')) {
        toast.error('Không tìm thấy thành viên');
      } else {
        toast.error(msg);
      }
    } finally {
      setRemoving(false);
    }
  };

  // ── Render helpers ──
  const renderAvatar = (user) => {
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt={user.fullName} />;
    }
    return getInitials(user?.fullName || user?.email);
  };

  const getMemberName = (user) =>
    user?.fullName ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Thành viên';

  // ── Loading state ──
  if (loading) {
    return (
      <div className="cmm-page">
        <div className="cmm-container">
          <div className="cmm-state-box">
            <div className="cmm-spinner" />
            <h3>Đang tải...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="cmm-page">
        <div className="cmm-container">
          <div className="cmm-state-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3>Không thể tải dữ liệu</h3>
            <p>{error}</p>
            <button className="cmm-retry-btn" onClick={loadMembers}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cmm-page">
      <div className="cmm-container">

        {/* ── Header ── */}
        <div className="cmm-header">
          <button
            className="cmm-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
          <div className="cmm-header-text">
            <h1>Quản lý thành viên</h1>
            <p>Xem, tìm kiếm và xóa thành viên khỏi câu lạc bộ</p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="cmm-search-bar">
          <span className="cmm-search-icon">
            {searching ? '⏳' : '🔍'}
          </span>
          <input
            className="cmm-search-input"
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={keyword}
            onChange={handleKeywordChange}
          />
          {keyword && (
            <button className="cmm-search-clear" onClick={handleClearSearch}>
              ✕
            </button>
          )}
        </div>

        {/* ── Count ── */}
        <div className="cmm-count-badge">
          👥 {members.length} thành viên{keyword ? ' (kết quả tìm kiếm)' : ''}
        </div>

        {/* ── List ── */}
        {members.length === 0 ? (
          <div className="cmm-state-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3>Không có kết quả</h3>
            <p>
              {keyword
                ? `Không tìm thấy thành viên với từ khóa "${keyword}"`
                : 'Câu lạc bộ chưa có thành viên nào'}
            </p>
            {keyword && (
              <button className="cmm-retry-btn" onClick={handleClearSearch}>
                Xem tất cả
              </button>
            )}
          </div>
        ) : (
          <div className="cmm-list">
            {members.map((membership) => {
              const user = membership.user_id || {};
              const role = membership.role ?? 0;
              const isLeader = role === 1;
              const name = getMemberName(user);

              return (
                <div key={membership._id} className="cmm-card">
                  {/* Avatar */}
                  <div className="cmm-avatar">
                    {renderAvatar(user)}
                  </div>

                  {/* Info */}
                  <div className="cmm-info">
                    <p className="cmm-name">{name}</p>
                    <p className="cmm-email">{user.email || '—'}</p>
                    <div className="cmm-meta">
                      <span className={`cmm-role-badge ${ROLE_CLASS[role] || 'role-member'}`}>
                        {ROLE_ICON[role]} {ROLE_LABELS[role] || 'Member'}
                      </span>
                      <span className="cmm-joined-at">
                        Tham gia: {formatDate(membership.joined_at)}
                      </span>
                    </div>
                  </div>

                  {/* Remove button — hidden for leader */}
                  {isLeader ? (
                    <span className="cmm-leader-tag">👑 Leader</span>
                  ) : (
                    <button
                      className="cmm-remove-btn"
                      onClick={() => setConfirmTarget(membership)}
                    >
                      🗑 Xóa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm Remove Modal ── */}
      {confirmTarget && (
        <div
          className="cmm-modal-overlay"
          onClick={() => !removing && setConfirmTarget(null)}
        >
          <div className="cmm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cmm-modal-icon">🗑️</div>
            <h3>Xóa thành viên?</h3>
            <p>
              Bạn có chắc muốn xóa{' '}
              <strong>
                {getMemberName(confirmTarget.user_id || {})}
              </strong>{' '}
              khỏi câu lạc bộ? Hành động này không thể hoàn tác.
            </p>
            <div className="cmm-modal-actions">
              <button
                className="cmm-modal-cancel"
                onClick={() => setConfirmTarget(null)}
                disabled={removing}
              >
                Hủy
              </button>
              <button
                className="cmm-modal-confirm"
                onClick={handleRemoveConfirm}
                disabled={removing}
              >
                {removing ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
