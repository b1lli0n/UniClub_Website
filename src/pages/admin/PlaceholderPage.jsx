import React from 'react'

const PlaceholderPage = ({ title }) => {
    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">{title}</h2>
                    <p className="admin-subtitle">Tính năng đang trong quá trình hoàn thiện.</p>
                </div>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: 48, marginBottom: 16 }} />
                <p>Coming Soon</p>
            </div>
        </div>
    )
}

export default PlaceholderPage
