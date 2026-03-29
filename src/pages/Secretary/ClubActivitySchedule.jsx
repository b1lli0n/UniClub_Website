import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../../api/activityApi';
import '../../styles/ClubActivitySchedule.css';

const ClubActivitySchedule = () => {
    const { id: clubId } = useParams();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [activityToDelete, setActivityToDelete] = useState(null);
    const [filterType, setFilterType] = useState('Tất cả'); // <--- Trạng thái bộ lọc

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'Họp mặt'
    });

    const handleOpenModal = (mode, activity = null) => {
        setModalMode(mode);
        setSelectedActivity(activity);
        if (activity) {
            setFormData({
                title: activity.title,
                description: activity.description,
                date: activity.date,
                startTime: activity.startTime,
                endTime: activity.endTime,
                location: activity.location,
                type: activity.type
            });
        } else {
            setFormData({
                title: '',
                description: '',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                type: 'Họp mặt'
            });
        }
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format dates for BE
            const start_time = new Date(`${formData.date}T${formData.startTime}:00`);
            const end_time = new Date(`${formData.date}T${formData.endTime}:00`);

            if (end_time <= start_time) {
                toast.error('Thời gian kết thúc phải sau thời gian bắt đầu!');
                return;
            }

            // Xử lý type (Vì BE tạm thời không có field 'type' nên ta nối vào title hoặc dùng mặc định)
            const titleWithPrefix = formData.title.includes(formData.type)
                ? formData.title
                : `[${formData.type}] ${formData.title}`;

            const reqBody = {
                title: titleWithPrefix,
                description: formData.description,
                location: formData.location,
                start_time,
                end_time,
                status: 0, // 0: Coming soon
                progress_status: 1 // 1: Published
            };

            if (modalMode === 'create') {
                await createActivity(clubId, reqBody);
                toast.success('Đã tạo hoạt động mới!');
            } else {
                await updateActivity(clubId, selectedActivity.id, reqBody);
                toast.success('Đã cập nhật hoạt động!');
            }
            setShowModal(false);
            fetchActivitiesData(); // Refresh data
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const promptDelete = (id) => {
        setActivityToDelete(id);
    };

    const confirmDelete = async () => {
        if (activityToDelete) {
            try {
                await deleteActivity(clubId, activityToDelete);
                toast.success('Đã xóa hoạt động!');
                setActivityToDelete(null);
                fetchActivitiesData(); // Refresh data
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Lỗi khi xóa!');
            }
        }
    };

    const cancelDelete = () => {
        setActivityToDelete(null);
    };

    // Weekly view state
    const [weekStartDate, setWeekStartDate] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(d.setDate(diff));
    });

    const getDaysOfWeek = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const days = getDaysOfWeek(weekStartDate);

    const handlePrevWeek = () => {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() - 7);
        setWeekStartDate(d);
    };

    const handleNextWeek = () => {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + 7);
        setWeekStartDate(d);
    };

    const handleDateChange = (e) => {
        const d = new Date(e.target.value);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        setWeekStartDate(new Date(d.setDate(diff)));
    };

    const formatDateForHeader = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // ========= FETCH DATA TỪ BACKEND NHƯ TRONG YÊU CẦU =========
    const fetchActivitiesData = async () => {
        try {
            // Lấy T2 đến CN để filter start_date và end_date
            const start_date = new Date(weekStartDate);
            start_date.setHours(0, 0, 0, 0);

            const end_date = new Date(weekStartDate);
            end_date.setDate(end_date.getDate() + 6);
            end_date.setHours(23, 59, 59, 999);

            const filters = {
                start_date: start_date.toISOString(),
                end_date: end_date.toISOString()
            };

            // BE search theo tile (regex)
            if (filterType !== 'Tất cả') {
                filters.search = filterType;
            }

            const response = await getActivities(clubId, filters);
            const data = response.data;

            // Map dữ liệu từ Array của BE về Format của FE component
            const activitiesArray = Array.isArray(data) ? data : (data.activities || []);

            const mappedActivities = activitiesArray
                .filter(dbItem => dbItem.status !== 3) // Loại bỏ các hoạt động đã bị Hủy (status: 3)
                .map(dbItem => {
                    const sDate = new Date(dbItem.start_time);
                    const eDate = new Date(dbItem.end_time);

                    return {
                        id: dbItem._id,
                        title: dbItem.title,
                        description: dbItem.description,
                        location: dbItem.location,
                        date: formatDateForHeader(sDate),
                        startTime: `${String(sDate.getHours()).padStart(2, '0')}:${String(sDate.getMinutes()).padStart(2, '0')}`,
                        endTime: `${String(eDate.getHours()).padStart(2, '0')}:${String(eDate.getMinutes()).padStart(2, '0')}`,
                        type: filterType, // Khôi phục do DB thiếu field type
                        status: dbItem.status
                    };
                });
            setActivities(mappedActivities);
        } catch (error) {
            console.error('Fetch activities error:', error);
            toast.error(error?.response?.data?.message || 'Lỗi lấy dữ liệu');
        }
    };

    useEffect(() => {
        if (clubId) {
            fetchActivitiesData();
        }
    }, [clubId, weekStartDate, filterType]);

    const getActivitiesForDay = (date) => {
        const dateString = formatDateForHeader(date);
        return activities.filter(a => a.date === dateString);
    };

    const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    return (
        <>
            <div className="activity-schedule-container">
                <h1 className="schedule-main-title">Quản lý lịch sinh hoạt CLB</h1>

                <header className="schedule-header-new">
                    <div className="header-left">
                        <label>Loại hoạt động: </label>
                        <select className="room-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="Tất cả">Tất cả</option>
                            <option value="Họp mặt">Họp mặt</option>
                            <option value="Tập luyện">Tập luyện</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>

                    <div className="header-right">
                        <button className="create-activity-btn" onClick={() => handleOpenModal('create')}>
                            <Plus size={18} /> Thêm hoạt động mới
                        </button>
                    </div>
                </header>

                <div className="week-navigation-bar">
                    <button className="nav-week-btn" onClick={handlePrevWeek}>
                        <ChevronLeft size={16} /> Tuần trước
                    </button>
                    <div className="week-picker">
                        <span>Tuần bắt đầu từ: </span>
                        <input
                            type="date"
                            value={formatDateForHeader(weekStartDate)}
                            onChange={handleDateChange}
                        />
                    </div>
                    <button className="nav-week-btn" onClick={handleNextWeek}>
                        Tuần tiếp theo <ChevronRight size={16} />
                    </button>
                </div>

                <div className="schedule-divider"></div>

                <div className="weekly-schedule-grid">
                    {days.map((day, index) => {
                        const dayActivities = getActivitiesForDay(day);
                        const isToday = new Date().toDateString() === day.toDateString();

                        return (
                            <div key={index} className={`day-column ${isToday ? 'today' : ''}`}>
                                <div className="day-header">
                                    <div className="day-name">{dayNames[index]}</div>
                                    <div className="day-date">{day.getDate()}/{day.getMonth() + 1}</div>
                                </div>

                                <div className="day-content">
                                    {dayActivities.length > 0 ? (
                                        dayActivities.map(activity => (
                                            <div key={activity.id} className="activity-card-mini">
                                                <div className="activity-card-info" onClick={() => handleOpenModal('view', activity)}>
                                                    <div className="activity-meta">{activity.location}</div>
                                                    <div className="activity-title-mini">{activity.title}</div>
                                                    <div className="activity-time-mini">{activity.startTime} - {activity.endTime}</div>
                                                </div>
                                                <div className="activity-card-actions">
                                                    <button
                                                        className="edit-activity-btn"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', activity); }}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="delete-activity-btn"
                                                        onClick={(e) => { e.stopPropagation(); promptDelete(activity.id); }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>

                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-activity-text">Không có hoạt động</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal for Create/Edit/View */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header-colored">
                            <div className="modal-title-group">
                                <CalendarIcon size={18} />
                                <h2>
                                    {modalMode === 'create' ? 'Tạo hoạt động mới' :
                                        modalMode === 'edit' ? 'Chỉnh sửa hoạt động' : 'Chi tiết hoạt động'}
                                </h2>
                            </div>
                            <button className="close-modal-colored" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                    >
                                        <option value="Họp mặt">Họp mặt</option>
                                        <option value="Tập luyện">Tập luyện</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bắt đầu</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kết thúc</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Địa điểm</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    disabled={modalMode === 'view'}
                                ></textarea>
                            </div>

                            {modalMode !== 'view' && (
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="submit-btn">
                                        {modalMode === 'create' ? 'Tạo ngay' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Delete Confirmation */}
            {activityToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '400px' }}>
                        <div className="modal-header-colored" style={{ background: 'linear-gradient(90deg, #ffcde0, #c8e0ff)' }}>
                            <div className="modal-title-group">
                                <h2>Xác nhận xóa</h2>
                            </div>
                            <button className="close-modal-colored" onClick={cancelDelete}>&times;</button>
                        </div>
                        <div style={{ padding: '24px', textAlign: 'center', color: '#4a5568' }}>
                            <p style={{ fontSize: '15px', marginBottom: '24px', fontWeight: '500' }}>Bạn có chắc chắn muốn xóa hoạt động này không?</p>
                            <div className="form-actions" style={{ justifyContent: 'center', marginTop: 0 }}>
                                <button className="cancel-btn" onClick={cancelDelete}>Hủy</button>
                                <button className="submit-btn" onClick={confirmDelete}>Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClubActivitySchedule;

