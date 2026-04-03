import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMemberActivities, getMemberActivityDetail } from '../../api/activityApi';
import '../../styles/WeeklyActivitySchedule.css';

const DAY_NAMES = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

const toWeekStart = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDayLabel = (date) => `${date.getDate()}/${date.getMonth() + 1}`;

const formatTimeRange = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${hhmm(s)} - ${hhmm(e)}`;
};

const normalizeDetailResponse = (res) => {
  const payload = res?.data;
  return payload?.activity || payload?.data || payload || null;
};

const WeeklyActivitySchedule = () => {
  const { id: clubId } = useParams();
  const [weekStartDate, setWeekStartDate] = useState(() => toWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      return d;
    });
  }, [weekStartDate]);

  const weekEndDate = useMemo(() => {
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [weekStartDate]);

  useEffect(() => {
    const fetchWeeklyActivities = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const res = await getMemberActivities(clubId, {
          start_date: weekStartDate.toISOString(),
          end_date: weekEndDate.toISOString(),
        });

        const payload = res?.data;
        const items = Array.isArray(payload) ? payload : payload?.activities || [];
        const normalized = items
          .filter((item) => item?.status !== 3)
          .map((item) => ({
            id: item?._id,
            title: item?.title || 'Hoạt động',
            description: item?.description || '',
            location: item?.location || 'Chưa cập nhật',
            start_time: item?.start_time,
            end_time: item?.end_time,
            dateKey: formatDateKey(new Date(item?.start_time)),
          }));

        setActivities(normalized);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Không tải được lịch hoạt động tuần này');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyActivities();
  }, [clubId, weekStartDate, weekEndDate]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  };

  const handleDatePick = (e) => {
    const value = e.target.value;
    if (!value) return;
    const picked = new Date(`${value}T00:00:00`);
    setSelectedDate(value);
    setWeekStartDate(toWeekStart(picked));
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(formatDateKey(today));
    setWeekStartDate(toWeekStart(today));
  };

  const getActivitiesByDay = (date) => {
    const key = formatDateKey(date);
    return activities
      .filter((item) => item.dateKey === key)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  const openActivityDetail = async (activityId) => {
    if (!clubId || !activityId) return;
    setDetailLoading(true);
    try {
      const res = await getMemberActivityDetail(clubId, activityId);
      const detail = normalizeDetailResponse(res);
      if (!detail) {
        toast.error('Không có dữ liệu chi tiết hoạt động');
        return;
      }
      setDetailItem(detail);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tải được chi tiết hoạt động');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeActivityDetail = () => {
    setDetailItem(null);
  };

  return (
    <div className="weekly-activity-page">
      <div className="weekly-activity-shell">
        <div className="weekly-activity-head">
          <h1>Lịch hoạt động theo tuần</h1>
          <div className="weekly-activity-nav">
            <button type="button" onClick={handlePrevWeek} className="week-nav-btn">
              <ChevronLeft size={16} /> Tuần trước
            </button>
            <div className="week-center-tools">
              <span className="week-range-label">
                {formatDateKey(weekStartDate)} - {formatDateKey(weekEndDate)}
              </span>
              <div className="week-date-picker-wrap">
                <label htmlFor="week-date-picker">Chọn ngày</label>
                <input
                  id="week-date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={handleDatePick}
                />
                <button type="button" className="week-today-btn" onClick={jumpToToday}>
                  Hôm nay
                </button>
              </div>
            </div>
            <button type="button" onClick={handleNextWeek} className="week-nav-btn">
              Tuần sau <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="weekly-loading">Đang tải hoạt động...</div>
        ) : (
          <div className="weekly-grid">
            {weekDays.map((day, idx) => {
              const dayActivities = getActivitiesByDay(day);
              const isSelectedDay = formatDateKey(day) === selectedDate;
              return (
                <section className={`weekly-day${isSelectedDay ? ' weekly-day--selected' : ''}`} key={formatDateKey(day)}>
                  <header className="weekly-day-head">
                    <h3>{DAY_NAMES[idx]}</h3>
                    <span>{formatDayLabel(day)}</span>
                  </header>

                  <div className="weekly-day-body">
                    {dayActivities.length === 0 ? (
                      <p className="weekly-empty">Không có hoạt động</p>
                    ) : (
                      dayActivities.map((activity) => (
                        <article
                          className="weekly-card"
                          key={activity.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openActivityDetail(activity.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openActivityDetail(activity.id);
                            }
                          }}
                        >
                          <h4>{activity.title}</h4>
                          <p>{activity.description || 'Không có mô tả.'}</p>
                          <div className="weekly-meta">
                            <span>
                              <Clock3 size={14} /> {formatTimeRange(activity.start_time, activity.end_time)}
                            </span>
                            <span>
                              <MapPin size={14} /> {activity.location}
                            </span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {detailLoading && (
        <div className="weekly-detail-overlay" onClick={closeActivityDetail}>
          <div className="weekly-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="weekly-detail-loading">Đang tải chi tiết...</div>
          </div>
        </div>
      )}

      {detailItem && !detailLoading && (
        <div className="weekly-detail-overlay" onClick={closeActivityDetail}>
          <div className="weekly-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="weekly-detail-head">
              <h3>Chi tiết hoạt động</h3>
              <button type="button" className="weekly-detail-close" onClick={closeActivityDetail}>
                ×
              </button>
            </div>

            <div className="weekly-detail-body">
              <h4>{detailItem?.title || 'Hoạt động'}</h4>
              <p>{detailItem?.description || 'Không có mô tả.'}</p>
              <div className="weekly-detail-meta">
                <div>
                  <span>Thời gian:</span>
                  <strong>
                    {detailItem?.start_time && detailItem?.end_time
                      ? formatTimeRange(detailItem.start_time, detailItem.end_time)
                      : 'Chưa cập nhật'}
                  </strong>
                </div>
                <div>
                  <span>Địa điểm:</span>
                  <strong>{detailItem?.location || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span>Người tạo:</span>
                  <strong>
                    {detailItem?.created_by?.fullName || detailItem?.created_by?.name || 'Chưa cập nhật'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyActivitySchedule;
