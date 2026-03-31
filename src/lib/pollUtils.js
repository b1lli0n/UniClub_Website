/** Poll đang mở theo API và còn trong cửa sổ thời gian (có thể bỏ phiếu nếu đủ điều kiện khác). */
export function canVoteOnPollRow(row) {
  if (!row) return false;
  const closed = row.status === 'closed' || row.status_code === 1;
  if (closed) return false;
  const now = Date.now();
  const start = row.start_date ? new Date(row.start_date).getTime() : 0;
  const end = row.end_date ? new Date(row.end_date).getTime() : 0;
  if (!start || !end) return false;
  return now >= start && now <= end;
}

export function statusLabelVi(status) {
  if (status === 'open' || status === 0 || status === '0') return 'Đang mở';
  return 'Đã đóng';
}

export function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
