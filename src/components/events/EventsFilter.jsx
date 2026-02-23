import '../../styles/EventsFilter.css';

const EventsFilter = ({ statusFilter, onFilterChange }) => {
    return (
        <div className="glass-card events-filter">
            <span className="events-filter-label">
                Lọc theo trạng thái:
            </span>
            <select
                value={statusFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="events-filter-select"
            >
                <option value="all">Tất cả</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
            </select>
        </div>
    );
};

export default EventsFilter;
