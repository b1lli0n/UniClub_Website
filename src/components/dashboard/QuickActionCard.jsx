import '../../styles/QuickActionCard.css';

export function QuickActionCard({ title, subtitle, icon = '+', onClick }) {
    return (
        <div
            className={`quick-action-card ${onClick ? 'is-clickable' : ''}`}
            onClick={onClick}
        >
            <h3 className="quick-action-title">{title}</h3>
            <p className="quick-action-subtitle">{subtitle}</p>
            <div className="quick-action-icon">
                <span className="quick-action-icon-text">{icon}</span>
            </div>
        </div>
    );
}

export default QuickActionCard;
