import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPollDetail, votePoll } from '../api/pollApi';
import { statusLabelVi } from '../lib/pollUtils';
import '../styles/PollVoteModal.css';

function optionIdStr(o) {
  return o?.option_id?.toString?.() || String(o.option_id);
}

function isPollWindowOpen(poll) {
  if (!poll) return false;
  const code = poll.status_code !== undefined ? poll.status_code : poll.status === 'closed' ? 1 : 0;
  if (code !== 0) return false;
  const now = Date.now();
  const start = new Date(poll.start_date).getTime();
  const end = new Date(poll.end_date).getTime();
  return now >= start && now <= end;
}

export default function PollVoteModal({ clubId, pollId, onClose, onVoteSuccess }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteSelection, setVoteSelection] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(() => {
    if (!clubId || !pollId) return;
    setLoading(true);
    getPollDetail(clubId, pollId)
      .then((res) => {
        if (res?.success && res.data) {
          setDetail(res.data);
          const mv = res.data.my_vote?.option_ids || [];
          setVoteSelection(mv.map((x) => (typeof x === 'string' ? x : x?.toString?.() || String(x))));
        }
      })
      .catch((e) => toast.error(e.message || 'Không tải được bình chọn'))
      .finally(() => setLoading(false));
  }, [clubId, pollId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const poll = detail?.poll;
  const windowOpen = poll && isPollWindowOpen(poll);
  const isClosed = poll?.status === 'closed' || poll?.status_code === 1;
  const hasVoted = !!detail?.my_vote;
  const allowChange = !!poll?.allow_change_vote;
  const typeSingle = (poll?.type ?? 0) === 0;

  let disableReason = '';
  if (isClosed) disableReason = 'Bình chọn đã đóng.';
  else if (!windowOpen) disableReason = 'Chưa đến giờ hoặc đã hết hạn bình chọn.';
  else if (hasVoted && !allowChange) disableReason = 'Bạn đã bỏ phiếu và không được đổi phiếu.';

  const canSubmit =
    windowOpen &&
    !isClosed &&
    (!hasVoted || allowChange) &&
    voteSelection.length > 0;

  const toggle = (oid, single) => {
    const sid = optionIdStr({ option_id: oid });
    if (single) setVoteSelection([sid]);
    else {
      setVoteSelection((prev) =>
        prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await votePoll(clubId, pollId, voteSelection);
      toast.success('Đã ghi nhận phiếu bầu');
      onVoteSuccess?.();
      reload();
    } catch (err) {
      toast.error(err.message || 'Không gửi được phiếu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pvm-overlay" onClick={onClose} role="presentation">
      <div
        className="pvm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pvm-title"
      >
        <button type="button" className="pvm-close" onClick={onClose} aria-label="Đóng">
          ×
        </button>
        {loading ? (
          <p className="pvm-muted">Đang tải...</p>
        ) : !detail?.poll ? (
          <p className="pvm-muted">Không có dữ liệu.</p>
        ) : (
          <>
            <h2 id="pvm-title" className="pvm-title">
              {poll.title}
            </h2>
            <p className="pvm-meta">
              <span className={`pvm-badge pvm-badge--${isClosed ? 'closed' : 'open'}`}>
                {statusLabelVi(isClosed ? 'closed' : 'open')}
              </span>
              · Loại: {typeSingle ? 'Chọn một' : 'Chọn nhiều'} · Tổng {detail.total_votes ?? 0} phiếu
            </p>
            {(detail.options || []).map((o) => (
              <div key={optionIdStr(o)} className="pvm-bar">
                <div className="pvm-bar-top">
                  <span>{o.label}</span>
                  <span>
                    {o.votes} phiếu ({o.percentage}%)
                  </span>
                </div>
                <div className="pvm-bar-track">
                  <div className="pvm-bar-fill" style={{ width: `${o.percentage}%` }} />
                </div>
              </div>
            ))}

            <form className="pvm-form" onSubmit={handleSubmit}>
              <p className="pvm-section-label">Chọn phiếu</p>
              {(detail.options || []).map((o) => {
                const oid = optionIdStr(o);
                return (
                  <label key={oid} className="pvm-opt">
                    <input
                      type={typeSingle ? 'radio' : 'checkbox'}
                      name={typeSingle ? 'pvm-opt' : undefined}
                      checked={typeSingle ? voteSelection[0] === oid : voteSelection.includes(oid)}
                      onChange={() => toggle(oid, typeSingle)}
                      disabled={!windowOpen || isClosed || (hasVoted && !allowChange)}
                    />
                    <span>{o.label}</span>
                  </label>
                );
              })}
              {disableReason ? <p className="pvm-warn">{disableReason}</p> : null}
              <button
                type="submit"
                className="pvm-submit"
                disabled={!canSubmit || submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi phiếu'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
