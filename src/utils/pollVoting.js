/**
 * Trạng thái cho phép vote: chỉ true khi poll chưa đóng trên DB (status_code !== 1)
 * và thời gian hiện tại nằm trong [start_date, end_date] (cận biên inclusive).
 */
export function isPollVotingOpen(poll) {
  if (!poll) return false;
  const code = poll.status_code;
  if (code === 1 || code === '1') return false;
  const now = Date.now();
  const startMs = poll.start_date ? new Date(poll.start_date).getTime() : NaN;
  const endMs = poll.end_date ? new Date(poll.end_date).getTime() : NaN;
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false;
  return now >= startMs && now <= endMs;
}

export function getPollVotingStatus(poll) {
  return isPollVotingOpen(poll) ? 'open' : 'closed';
}

/** Poll vẫn có thể chỉnh sửa / đóng tay khi chưa bị đóng trên DB */
export function isPollOpenInDatabase(poll) {
  if (!poll) return false;
  const code = poll.status_code;
  return code !== 1 && code !== '1';
}
