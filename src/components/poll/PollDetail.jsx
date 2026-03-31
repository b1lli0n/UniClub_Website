import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPollDetail } from '../../api/pollApi';
import { statusLabelVi } from '../../lib/pollUtils';
import PollVoteModal from '../PollVoteModal';

export default function PollDetail({
  clubId,
  pollId,
  refreshNonce = 0,
  isLeader,
  onRefreshList,
  onRequestEdit,
  onRequestClose,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);

  useEffect(() => {
    if (!clubId || !pollId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPollDetail(clubId, pollId)
      .then((res) => {
        if (!cancelled && res?.success && res.data) setDetail(res.data);
      })
      .catch((e) => {
        if (!cancelled) {
          setDetail(null);
          toast.error(e?.message || 'Không tải được chi tiết');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clubId, pollId, refreshNonce]);

  const handleVoteSuccess = () => {
    if (!clubId || !pollId) return;
    getPollDetail(clubId, pollId).then((res) => {
      if (res?.success && res.data) setDetail(res.data);
    });
    onRefreshList?.();
  };

  if (!pollId) {
    return <div className="poll-pm-detail-placeholder">Chọn một bình chọn trong danh sách.</div>;
  }

  if (loading) {
    return <div className="poll-pm-loading">Đang tải chi tiết...</div>;
  }

  if (!detail?.poll) {
    return <div className="poll-pm-empty">Không tải được chi tiết.</div>;
  }

  const p = detail.poll;
  const isClosed = p.status === 'closed' || p.status_code === 1;

  return (
    <div className="poll-pm-detail">
      <div className="poll-pm-detail-head">
        <h2 className="poll-pm-detail-title">{p.title}</h2>
        <span className={`poll-pm-badge poll-pm-badge--${isClosed ? 'closed' : 'open'}`}>
          {statusLabelVi(isClosed ? 'closed' : 'open')}
        </span>
      </div>
      <p className="poll-pm-detail-meta">
        Tổng {detail.total_votes ?? 0} phiếu
        {detail.my_vote ? ' · Bạn đã bình chọn' : ''}
      </p>

      {(detail.options || []).map((o) => (
        <div key={o.option_id?.toString?.() || o.option_id} className="poll-pm-bar">
          <div className="poll-pm-bar-label">
            <span>
              {o.label}
              {o.is_leading && (detail.total_votes ?? 0) > 0 ? ' ★' : ''}
            </span>
            <span>
              {o.votes} ({o.percentage}%)
            </span>
          </div>
          <div className="poll-pm-bar-track">
            <div className="poll-pm-bar-fill" style={{ width: `${o.percentage}%` }} />
          </div>
        </div>
      ))}

      <div className="poll-pm-detail-actions">
        <button type="button" className="poll-pm-btn poll-pm-btn--gradient" onClick={() => setVoteOpen(true)}>
          Bình chọn / Chi tiết
        </button>
        {isLeader && !isClosed && (
          <>
            <button
              type="button"
              className="poll-pm-btn poll-pm-btn--soft"
              onClick={() => onRequestEdit?.(detail)}
            >
              Chỉnh sửa
            </button>
            <button type="button" className="poll-pm-btn poll-pm-btn--danger" onClick={() => onRequestClose?.()}>
              Đóng bình chọn
            </button>
          </>
        )}
      </div>

      {voteOpen && (
        <PollVoteModal
          clubId={clubId}
          pollId={pollId}
          onClose={() => setVoteOpen(false)}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
