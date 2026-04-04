import React, { useEffect, useState } from 'react';
import { getMemberContributions } from '../../api/clubApi';
import PointHistoryTable, { PointStatsRow } from '../PointHistoryTable';
import '../../styles/PointHistory.css';

/**
 * Modal for Leader to view a member's full point history.
 *
 * Props:
 *  - member: the member object from dashboard state
 *  - clubId: current club id
 *  - onClose: () => void
 *  - getMemberName: (member) => string   — reuse dashboard util
 *  - getMemberRoleLabel: (member) => string
 */
export default function MemberPointModal({ member, clubId, onClose, getMemberName, getMemberRoleLabel }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Get stable member ID
  const memberId =
    member?.user_id?._id ||
    member?.user_id?.id ||
    member?.user?._id ||
    member?.user?.id ||
    member?.userId ||
    member?._id ||
    member?.id;

  const displayName = getMemberName ? getMemberName(member) : (member?.fullName || 'Thành viên');
  const roleLabel = getMemberRoleLabel ? getMemberRoleLabel(member) : (member?.role || 'Member');

  const initial = (displayName || '?')[0]?.toUpperCase();

  useEffect(() => {
    if (!memberId || !clubId) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMemberContributions(clubId, memberId);
        setData(res?.data || res);
      } catch (err) {
        setError(err?.message || 'Không thể tải lịch sử điểm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, clubId]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="member-point-modal-overlay" onClick={onClose}>
      <div className="member-point-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="member-point-modal-header">
          <div className="member-point-modal-info">
            <div className="member-point-avatar">{initial}</div>
            <div>
              <p className="member-point-name">{displayName}</p>
              <p className="member-point-role">{roleLabel}</p>
            </div>
          </div>
          <button className="member-point-close-btn" onClick={onClose} title="Đóng">✕</button>
        </div>

        {/* Stats */}
        {!loading && !error && data && <PointStatsRow data={data} />}

        {/* Table */}
        <PointHistoryTable loading={loading} data={data} error={error} />
      </div>
    </div>
  );
}
