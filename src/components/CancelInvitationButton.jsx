import axios from 'axios';

function CancelInvitationButton({ invitationId, clubId, onSuccess, disabled }) {
    const handleCancel = async () => {
        if (!window.confirm('Bạn chắc chắn muốn hủy lời mời này?')) return;
        try {
            await axios.patch(`/api/invitations/${invitationId}/cancel`, { clubId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            alert('Đã hủy lời mời thành công!');
            if (onSuccess) onSuccess();
        } catch (err) {
            alert('Hủy lời mời thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <button onClick={handleCancel} style={{ color: 'red' }} disabled={disabled}>
            Hủy lời mời
        </button>
    );
}

export default CancelInvitationButton;
