import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isValidPhoneNumber(phone) {
  const normalized = String(phone || '').trim();
  if (!normalized) return true;
  return /^(0)(3|5|7|8|9)[0-9]{8}$/.test(normalized);
}

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

export const POLL_DATETIME_GAP_MS = 60 * 1000;

export function formatDateAsDatetimeLocal(d) {
  if (!d || Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function earliestPollStartMsAfterGap(nowMs = Date.now()) {
  const minAllowed = nowMs + POLL_DATETIME_GAP_MS;
  const d = new Date(minAllowed);
  d.setSeconds(0, 0);
  d.setMilliseconds(0);
  if (d.getTime() < minAllowed) {
    d.setMinutes(d.getMinutes() + 1);
  }
  return d.getTime();
}

export function minPollStartLocalAfterNow() {
  return formatDateAsDatetimeLocal(new Date(earliestPollStartMsAfterGap()));
}

export function minPollEndLocalAfterStart(startLocal) {
  if (!startLocal) return '';
  const d = new Date(startLocal);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() + 1);
  return formatDateAsDatetimeLocal(d);
}

function isTrivialSequentialDigits(s) {
  if (!/^\d{5,}$/.test(s)) return false;
  let inc = true;
  let dec = true;
  for (let i = 1; i < s.length; i++) {
    const cur = s.charCodeAt(i) - 48;
    const prev = s.charCodeAt(i - 1) - 48;
    if (cur !== prev + 1) inc = false;
    if (cur !== prev - 1) dec = false;
    if (!inc && !dec) return false;
  }
  return inc || dec;
}


export function validatePollTitle(raw) {
  const title = String(raw ?? '').trim();
  if (!title) {
    return 'Tiêu đề bình chọn không được để trống';
  }
  if (title.length < 5 || title.length > 150) {
    return 'Tiêu đề cần từ 5 đến 150 ký tự ';
  }
  if (!/[\p{L}\p{N}]/u.test(title)) {
    return 'Tiêu đề không được chỉ gồm ký tự đặc biệt hoặc khoảng trắng';
  }
  if (/^(.)\1{4,}$/u.test(title)) {
    return 'Tiêu đề không được là một ký tự lặp lại';
  }
  if (/^\d+$/.test(title)) {
    return 'Tiêu đề không được chỉ gồm chữ số';
  }
  if (isTrivialSequentialDigits(title)) {
    return 'Tiêu đề không được là dãy số liên tiếp đơn giản (ví dụ 12345)';
  }
  return '';
}
