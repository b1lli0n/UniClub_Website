import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { searchUsers, createNotification } from "../../api/notificationApi";
import "../../styles/CreateNotificationModal.css";

const CreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        display_sender_name: "",
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState("");

    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ title: "", body: "", display_sender_name: "" });
            setSelectedUsers([]);
            setSearchQuery("");
            setSearchResults([]);
            setError("");
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !searchRef.current?.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search users with debounce
    useEffect(() => {
        const searchUsersDebounced = async () => {
            if (!searchQuery.trim() || searchQuery.length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchUsers(searchQuery);
                const users = results?.data || results?.users || results || [];
                // Filter out already selected users
                const filtered = Array.isArray(users)
                    ? users.filter(
                        (user) =>
                            !selectedUsers.find(
                                (s) => (s._id || s.id) === (user._id || user.id)
                            )
                    )
                    : [];
                setSearchResults(filtered);
                setShowDropdown(filtered.length > 0);
            } catch (error) {
                console.error("Search users failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchUsersDebounced, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedUsers]);

    const handleAddUser = (user) => {
        setSelectedUsers((prev) => [...prev, user]);
        setSearchQuery("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.filter((u) => (u._id || u.id) !== userId)
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title?.trim()) {
            setError("Vui lòng nhập tiêu đề");
            return;
        }
        if (!formData.body?.trim()) {
            setError("Vui lòng nhập nội dung");
            return;
        }
        if (selectedUsers.length === 0) {
            setError("Vui lòng chọn người nhận");
            return;
        }

        setIsSending(true);
        setError("");

        try {
            const payload = {
                title: formData.title.trim(),
                body: formData.body.trim(),
                display_sender_name: formData.display_sender_name?.trim() || undefined,
                receiverIds: selectedUsers.map((u) => u._id || u.id),
            };

            console.log("Sending payload:", payload);

            await createNotification(payload);
            toast.success("Gửi thông báo thành công!");
            onSuccess?.();
        } catch (error) {
            console.error("Failed to create notification:", error);
            setError(error.message || "Gửi thông báo thất bại");
        } finally {
            setIsSending(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Tạo thông báo mới</h2>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-message">{error}</div>}

                    {/* Người nhận */}
                    <div className="form-group">
                        <label>NGƯỜI NHẬN *</label>
                        <div className="recipients-container">
                            {selectedUsers.map((user) => (
                                <span key={user._id || user.id} className="recipient-tag">
                                    {user.full_name || user.email?.split("@")[0] || "Người dùng"}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveUser(user._id || user.id)
                                        }
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <div className="search-input-container" ref={searchRef}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Thêm người nhận..."
                                    className="search-input"
                                />
                                {isSearching && (
                                    <span className="searching">Đang tìm...</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown kết quả tìm kiếm */}
                        {showDropdown && (
                            <div className="search-dropdown" ref={dropdownRef}>
                                {searchResults.map((user) => (
                                    <div
                                        key={user._id || user.id}
                                        className="dropdown-item"
                                        onClick={() => handleAddUser(user)}
                                    >
                                        <div className="user-avatar">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" />
                                            ) : (
                                                <span className="avatar-placeholder">
                                                    {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="user-info">
                                            <span className="user-name">
                                                {user.full_name || user.email?.split("@")[0] || "Người dùng"}
                                            </span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tên hiển thị người gửi */}
                    <div className="form-group">
                        <label>TÊN HIỂN THỊ NGƯỜI GỬI</label>
                        <input
                            type="text"
                            name="display_sender_name"
                            value={formData.display_sender_name}
                            onChange={handleInputChange}
                            placeholder="Tên hiển thị cho người nhận (để trống sẽ hiển thị tên của bạn)"
                        />
                    </div>

                    {/* Tiêu đề */}
                    <div className="form-group">
                        <label>TIÊU ĐỀ *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Nhập tiêu đề thông báo"
                            required
                        />
                    </div>

                    {/* Nội dung */}
                    <div className="form-group">
                        <label>NỘI DUNG *</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleInputChange}
                            placeholder="Nhập nội dung thông báo"
                            rows={5}
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSending}
                        >
                            {isSending ? "Đang gửi..." : "📤 Gửi thông báo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNotificationModal;