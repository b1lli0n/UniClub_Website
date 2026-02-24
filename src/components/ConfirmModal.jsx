import React from "react";
import { Modal, Button } from "react-bootstrap";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import "../styles/Event.css";

const ConfirmModal = ({
    show,
    onHide,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning", // warning, info, success, danger
    loading = false
}) => {
    const getIcon = () => {
        switch (type) {
            case "danger": return <XCircle className="text-danger" size={48} />;
            case "success": return <CheckCircle className="text-success" size={48} />;
            case "info": return <Info className="text-info" size={48} />;
            default: return <AlertTriangle className="text-warning" size={48} />;
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            className="confirm-modal-wrapper"
        >
            <div className="confirm-modal-content glass-panel">
                <Modal.Body className="text-center p-4">
                    <div className="confirm-modal-icon mb-3">
                        {getIcon()}
                    </div>
                    <h4 className="confirm-modal-title mb-2">{title}</h4>
                    <p className="confirm-modal-message mb-4">{message}</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button
                            variant="light"
                            className="confirm-modal-btn cancel-btn"
                            onClick={onHide}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={type === "danger" ? "danger" : "primary"}
                            className={`confirm-modal-btn confirm-btn ${type === "danger" ? "btn-danger" : "event-primaryBtn"}`}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
