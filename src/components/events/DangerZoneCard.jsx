import '../../styles/DangerZoneCard.css';

export function DangerZoneCard({ registrationsCount, onOpenDialog }) {
    return (
        <div className="glass-card danger-zone">
            <h3 className="danger-zone-title">
                ⚠️ Danger Zone
            </h3>
            <p className="danger-zone-text">
                Hủy sự kiện sẽ gửi thông báo đến tất cả {registrationsCount} người đã đăng ký.
                Hành động này không thể hoàn tác.
            </p>
            <button
                onClick={onOpenDialog}
                className="danger-zone-button"
            >
                Hủy sự kiện
            </button>
        </div>
    );
}

export default DangerZoneCard;
