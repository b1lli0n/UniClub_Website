import React from 'react';
import '../styles/PointHistory.css';

// ─── helpers ────────────────────────────────────────────────────────────────

const ACTION_LABELS = {
  attend: 'Tham dự',
  attended: 'Tham dự',
  absent: 'Vắng mặt',
  contribution: 'Đóng góp',
  bonus: 'Thưởng',
  penalty: 'Phạt',
};

const ACTION_CLASSES = {
  attend: 'attend',
  attended: 'attend',
  absent: 'absent',
  contribution: 'contribution',
  bonus: 'bonus',
  penalty: 'penalty',
};

function getBadgeClass(action) {
  const key = (action || '').toLowerCase();
  return ACTION_CLASSES[key] || 'default';
}

function getBadgeLabel(action) {
  const key = (action || '').toLowerCase();
  return ACTION_LABELS[key] || action || '—';
}

function formatDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Stats row ───────────────────────────────────────────────────────────────

export function PointStatsRow({ data }) {
  const totalAchievement = data?.total_achievement_point ?? data?.totalAchievementPoint ?? '—';
  const totalReward = data?.total_reward_point ?? data?.totalRewardPoint ?? '—';
  const totalEntries = Array.isArray(data?.contributions) ? data.contributions.length : '—';

  return (
    <div className="point-stats-row">
      <div className="point-stat-card">
        <div className="point-stat-icon achievement">🏆</div>
        <div className="point-stat-body">
          <div className="point-stat-number">{totalAchievement}</div>
          <div className="point-stat-label">Điểm thành tích</div>
        </div>
      </div>
      <div className="point-stat-card">
        <div className="point-stat-icon reward">🎁</div>
        <div className="point-stat-body">
          <div className="point-stat-number">{totalReward}</div>
          <div className="point-stat-label">Điểm đổi quà</div>
        </div>
      </div>
      <div className="point-stat-card">
        <div className="point-stat-icon total">📋</div>
        <div className="point-stat-body">
          <div className="point-stat-number">{totalEntries}</div>
          <div className="point-stat-label">Số lần ghi nhận</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main table ──────────────────────────────────────────────────────────────

export default function PointHistoryTable({ loading, data, error }) {
  // Robustly find the contributions array
  let contributions = [];
  if (Array.isArray(data)) {
    contributions = data;
  } else if (data) {
    const rawData = data.data || data;
    contributions = rawData.contributions || rawData.history || rawData.items || (Array.isArray(rawData) ? rawData : []);
  }

  if (loading) {
    return (
      <div className="point-loading">
        <div className="point-spinner" />
        <p>Đang tải lịch sử điểm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="point-empty">
        <span className="point-empty-icon">⚠️</span>
        <h3>Không thể tải dữ liệu</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!Array.isArray(contributions) || contributions.length === 0) {
    return (
      <div className="point-empty">
        <span className="point-empty-icon">📭</span>
        <h3>Chưa có lịch sử điểm</h3>
        <p>Các lần ghi nhận điểm sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="point-table-wrapper">
      <table className="point-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên sự kiện</th>
            <th>Loại hành động</th>
            <th>Điểm thành tích</th>
            <th>Điểm đổi quà</th>
            <th>Ngày nhận</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((item, idx) => {
            const eventName =
              item?.event_title ||
              item?.eventTitle ||
              item?.event?.title ||
              item?.event_name ||
              '—';
            const action = item?.action_type || item?.actionType || item?.action || '';
            const achPoint =
              item?.achievement_point ?? item?.achievementPoint ?? item?.points ?? 0;
            const rewPoint =
              item?.reward_point ?? item?.rewardPoint ?? 0;
            const date =
              item?.created_at || item?.createdAt || item?.date || null;

            return (
              <tr key={item._id || item.id || idx}>
                <td style={{ color: 'rgba(31,42,68,0.35)', fontWeight: 700 }}>
                  {idx + 1}
                </td>
                <td style={{ fontWeight: 700 }}>{eventName}</td>
                <td>
                  <span className={`action-badge ${getBadgeClass(action)}`}>
                    {getBadgeLabel(action)}
                  </span>
                </td>
                <td>
                  <span className={`point-chip ${achPoint > 0 ? 'positive' : 'zero'}`}>
                    {achPoint > 0 ? `+${achPoint}` : achPoint}
                  </span>
                </td>
                <td>
                  <span className={`point-chip ${rewPoint > 0 ? 'positive' : 'zero'}`}>
                    {rewPoint > 0 ? `+${rewPoint}` : rewPoint}
                  </span>
                </td>
                <td style={{ color: 'rgba(31,42,68,0.55)' }}>{formatDate(date)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
