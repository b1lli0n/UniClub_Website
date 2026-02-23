import '../../styles/MemberListCard.css';

const ROLE_LABELS = {
    0: 'Member',
    1: 'Leader',
    2: 'Sub Leader',
    3: 'Secretary',
    4: 'Treasurer'
};

const formatNameFromEmail = (email) => {
    if (!email) return null;
    const raw = email.split('@')[0] || '';
    if (!raw) return null;
    return raw
        .replace(/[._-]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const getMemberName = (member) => {
    return (
        member?.fullName ||
        member?.fullname ||
        member?.name ||
        member?.full_name ||
        member?.user_id?.fullName ||
        member?.user_id?.fullname ||
        member?.user_id?.full_name ||
        member?.user_id?.name ||
        member?.user?.fullName ||
        member?.user?.fullname ||
        member?.user?.full_name ||
        member?.user?.name ||
        formatNameFromEmail(member?.user_id?.email || member?.user?.email || member?.email) ||
        'Member'
    );
};

const getMemberRoleLabel = (member) => {
    if (typeof member?.role === 'number') return ROLE_LABELS[member.role] || 'Member';
    return member?.role || 'Member';
};

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
                {members.map((member, index) => {
                    const displayName = getMemberName(member);
                    const roleLabel = getMemberRoleLabel(member);
                    const keyValue =
                        member?.id ||
                        member?._id ||
                        member?.membershipId ||
                        member?.user_id ||
                        member?.user?._id ||
                        index;

                    return (
                        <div
                            key={keyValue}
                            className="member-list-item"
                        >
                            <div
                                className="member-list-avatar"
                            >
                                {displayName?.charAt(0) || '?'}
                            </div>
                            <div className="member-list-info">
                                <p className="member-list-name">{displayName}</p>
                                <p className="member-list-role">{roleLabel}</p>
                            </div>
                        </div>
                    );
                })}

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
