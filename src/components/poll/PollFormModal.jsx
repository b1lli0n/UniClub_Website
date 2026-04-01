import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createPoll, updatePoll } from '../../api/pollApi';
import { fromDatetimeLocal, toDatetimeLocal } from '../../lib/pollUtils';

function buildCreateInitial() {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    title: '',
    options: ['', ''],
    type: 0,
    start_date: toDatetimeLocal(start.toISOString()),
    end_date: toDatetimeLocal(end.toISOString()),
    min_points_required: '',
    allow_change_vote: false,
  };
}

export default function PollFormModal({
  mode,
  clubId,
  onClose,
  onSuccess,
  initialDetail,
}) {
  const [form, setForm] = useState(buildCreateInitial);
  const [snapshot, setSnapshot] = useState(null);
  const [saving, setSaving] = useState(false);

  const hasVotes =
    initialDetail &&
    ((initialDetail.total_votes ?? 0) > 0 ||
      (initialDetail.options || []).some((o) => (o.votes ?? 0) > 0));

  useEffect(() => {
    if (mode === 'create') {
      const init = buildCreateInitial();
      setForm(init);
      setSnapshot(JSON.stringify(init));
      return;
    }
    if (mode === 'edit' && initialDetail?.poll) {
      const p = initialDetail.poll;
      const next = {
        title: p.title || '',
        options: (initialDetail.options || []).map((o) => o.label),
        type: p.type ?? 0,
        start_date: toDatetimeLocal(p.start_date),
        end_date: toDatetimeLocal(p.end_date),
        min_points_required: p.min_points_required != null ? String(p.min_points_required) : '',
        allow_change_vote: !!p.allow_change_vote,
      };
      setForm(next);
      setSnapshot(JSON.stringify(next));
    }
  }, [mode, initialDetail]);

  const dirty = useMemo(() => snapshot != null && JSON.stringify(form) !== snapshot, [form, snapshot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dirty || saving) return;
    if (mode === 'create' && !String(form.title || '').trim()) {
      toast.error('Nhập tiêu đề');
      return;
    }
    const opts = (form.options || []).map((s) => String(s).trim()).filter(Boolean);
    if (!hasVotes && opts.length < 2) {
      toast.error('Cần ít nhất 2 lựa chọn');
      return;
    }
    if (hasVotes) {
      const endIso = fromDatetimeLocal(form.end_date);
      if (!endIso) return;
      setSaving(true);
      try {
        await updatePoll(clubId, initialDetail.poll._id, { end_date: endIso });
        onSuccess?.();
        onClose?.();
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
      return;
    }

    const startIso = fromDatetimeLocal(form.start_date);
    const endIso = fromDatetimeLocal(form.end_date);
    if (!startIso || !endIso) return;
    const body = {
      title: form.title.trim(),
      options: opts,
      type: Number(form.type),
      start_date: startIso,
      end_date: endIso,
      allow_change_vote: form.allow_change_vote,
    };
    if (form.min_points_required !== '' && form.min_points_required != null) {
      body.min_points_required = Number(form.min_points_required);
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        await createPoll(clubId, body);
        toast.success('Đã tạo bình chọn');
      } else {
        await updatePoll(clubId, initialDetail.poll._id, body);
        toast.success('Đã cập nhật');
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Không lưu được');
    } finally {
      setSaving(false);
    }
  };

  const titleText = mode === 'create' ? 'Tạo bình chọn mới' : 'Chỉnh sửa bình chọn';
  const submitLabel = mode === 'create' ? 'Tạo' : 'Lưu';

  return (
    <div className="poll-pm-modal-overlay" role="dialog" aria-modal="true">
      <div className="poll-pm-modal-card">
        <div className="poll-pm-modal-head">
          <h3 className="poll-pm-modal-title">{titleText}</h3>
          <button type="button" className="poll-pm-modal-x" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <form className="poll-pm-form-split" onSubmit={handleSubmit}>
          {hasVotes && (
            <p className="poll-pm-hint">
              Đã có phiếu: chỉ được sửa ngày kết thúc. Nút Lưu chỉ gửi ngày kết thúc.
            </p>
          )}
          <div className="poll-pm-form-cols">
            <div className="poll-pm-form-col">
              {!hasVotes && (
                <>
                  <label className="poll-pm-field">
                    <span className="poll-pm-field-label">Tiêu đề *</span>
                    <input
                      className="poll-pm-input"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="poll-pm-field">
                    <span className="poll-pm-field-label">Kiểu</span>
                    <select
                      className="poll-pm-select"
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: Number(e.target.value) }))}
                    >
                      <option value={0}>Chọn một</option>
                      <option value={1}>Chọn nhiều</option>
                    </select>
                  </label>
                  <div className="poll-pm-field">
                    <span className="poll-pm-field-label">Lựa chọn *</span>
                    {(form.options || []).map((opt, idx) => (
                      <div key={idx} className="poll-pm-opt-row">
                        <input
                          className="poll-pm-input"
                          value={opt}
                          onChange={(e) => {
                            const next = [...form.options];
                            next[idx] = e.target.value;
                            setForm((p) => ({ ...p, options: next }));
                          }}
                        />
                        {form.options.length > 2 && (
                          <button
                            type="button"
                            className="poll-pm-btn poll-pm-btn--soft"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                options: p.options.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="poll-pm-btn poll-pm-btn--ghost"
                      onClick={() => setForm((p) => ({ ...p, options: [...p.options, ''] }))}
                    >
                      + Thêm lựa chọn
                    </button>
                  </div>
                  <label className="poll-pm-field">
                    <span className="poll-pm-field-label">Bắt đầu *</span>
                    <input
                      type="datetime-local"
                      className="poll-pm-input"
                      value={form.start_date}
                      onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="poll-pm-field">
                    <span className="poll-pm-field-label">Điểm thành tích tối thiểu</span>
                    <input
                      type="number"
                      min="0"
                      className="poll-pm-input"
                      value={form.min_points_required}
                      onChange={(e) => setForm((p) => ({ ...p, min_points_required: e.target.value }))}
                    />
                  </label>
                  <label className="poll-pm-check">
                    <input
                      type="checkbox"
                      checked={form.allow_change_vote}
                      onChange={(e) => setForm((p) => ({ ...p, allow_change_vote: e.target.checked }))}
                    />
                    Cho phép đổi phiếu
                  </label>
                </>
              )}
              <label className="poll-pm-field">
                <span className="poll-pm-field-label">Kết thúc *</span>
                <input
                  type="datetime-local"
                  className="poll-pm-input"
                  value={form.end_date}
                  onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  required
                />
              </label>
            </div>
          </div>
          <div className="poll-pm-modal-actions">
            <button type="button" className="poll-pm-btn poll-pm-btn--soft" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="poll-pm-btn poll-pm-btn--gradient"
              disabled={!dirty || saving}
            >
              {saving ? 'Đang lưu...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
