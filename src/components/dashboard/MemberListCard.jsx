import '../../styles/MemberListCard.css';

export function MemberListCard({ title = 'Thành viên', members = [], onManage }) {
    return (
        <div className="glass-card member-list-card">
            <div className="member-list-header">
                <h3 className="member-list-title">{title}</h3>
                <button
                    onClick={onManage}
                    className="card-button member-list-add"
                >
                    +
                </button>
            </div>

            <div className="member-list-grid">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="member-list-item"
                    >
                        <div
                            className="member-list-avatar"
                        >
                            {member.name.charAt(0)}
                        </div>
                        <div className="member-list-info">
                            <p className="member-list-name">{member.name}</p>
                            <p className="member-list-role">{member.role}</p>
                        </div>
                    </div>
                ))}

                <button
                    onClick={onManage}
                    className="member-list-manage"
                >
                    Quản lý thành viên
                </button>
            </div>
        </div>
    );
}

export default MemberListCard;
