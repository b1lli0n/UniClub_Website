import { useEffect, useMemo, useState } from 'react'
import {
    getAdminDashboardOverview,
    getAdminDashboardClubStatistics,
    getAdminDashboardMembershipStatistics,
    getAdminDashboardSystemActivity
} from '../../api/adminapi'

const numberFormat = new Intl.NumberFormat('vi-VN')

const formatCount = (value) => numberFormat.format(Number(value) || 0)

const formatActivityTime = (value) => {
    if (!value) return 'Khong ro thoi gian'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

const ACTIVITY_STATUS_LABEL = {
    0: 'Coming soon',
    1: 'Opening',
    2: 'Closed',
    3: 'Cancelled'
}

const pickArray = (data, candidateKeys) => {
    for (const key of candidateKeys) {
        const value = data?.[key]
        if (Array.isArray(value)) return value
    }

    if (Array.isArray(data)) return data
    return []
}

const pickFirstValue = (objectValue, keys, defaultValue = 0) => {
    for (const key of keys) {
        const numeric = Number(objectValue?.[key])
        if (!Number.isNaN(numeric) && numeric >= 0) {
            return numeric
        }
    }

    return defaultValue
}

const toActivity = (item, defaultType = 'system') => {
    const type = item?.type || item?.actionType || item?.event || defaultType
    const title =
        item?.title ||
        item?.name ||
        item?.description ||
        item?.message ||
        'Cap nhat he thong'
    const createdAt = item?.createdAt || item?.created_at || item?.updatedAt || item?.updated_at
    const statusCode = item?.status ?? item?.state ?? item?.result
    const statusLabel = Number.isInteger(Number(statusCode))
        ? ACTIVITY_STATUS_LABEL[Number(statusCode)] || String(statusCode)
        : statusCode == null
            ? 'N/A'
            : String(statusCode)

    return {
        id: item?._id || item?.id || `${type}-${title}-${createdAt || 'unknown'}`,
        type,
        title,
        description: item?.description || item?.message || '',
        clubName: item?.club?.name || item?.club_name || '',
        createdBy: item?.created_by?.fullName || item?.created_by?.name || '',
        createdAt,
        status: statusLabel
    }
}

const getPayload = (response) => response?.data || response || {}

const Dashboard = () => {
    const [loading, setLoading] = useState(true)
    const [activityLoading, setActivityLoading] = useState(false)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({
        totalClubs: 0,
        totalMembers: 0,
        totalTransactions: 0,
        pendingClubRequests: 0
    })
    const [clubCategoryStats, setClubCategoryStats] = useState([])
    const [membershipStats, setMembershipStats] = useState({ active: 0, left: 0 })
    const [activities, setActivities] = useState([])
    const [activityPage, setActivityPage] = useState(1)
    const [activityPagination, setActivityPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8
    })

    const activityLimit = 8

    useEffect(() => {
        let cancelled = false

        const loadDashboard = async () => {
            setLoading(true)
            setError('')

            try {
                const [
                    overviewResponse,
                    categoryStatsResponse,
                    membershipStatsResponse,
                    systemActivityResponse
                ] = await Promise.all([
                    getAdminDashboardOverview(),
                    getAdminDashboardClubStatistics(),
                    getAdminDashboardMembershipStatistics(),
                    getAdminDashboardSystemActivity({ page: 1, limit: activityLimit })
                ])

                if (cancelled) return

                const overview = getPayload(overviewResponse)
                const totalClubs = pickFirstValue(
                    overview,
                    ['total_clubs', 'totalClubs', 'clubs', 'clubCount'],
                    0
                )

                const totalMembers = pickFirstValue(
                    overview,
                    ['total_members', 'totalMembers', 'members', 'memberCount'],
                    0
                )

                const totalTransactions = pickFirstValue(
                    overview,
                    ['total_transactions', 'totalTransactions', 'transactions', 'paymentCount'],
                    0
                )

                const pendingClubRequests = pickFirstValue(
                    overview,
                    ['total_club_creation_requests', 'pendingClubRequests', 'pendingRequests', 'clubRequestsPending'],
                    0
                )

                setStats({
                    totalClubs,
                    totalMembers,
                    totalTransactions,
                    pendingClubRequests
                })

                const categoryStats = pickArray(getPayload(categoryStatsResponse), ['items', 'data'])
                setClubCategoryStats(
                    categoryStats.map((item) => ({
                        id: item?._id || item?.category || 'Khac',
                        label: item?._id || item?.category || 'Khac',
                        count: Number(item?.count) || 0
                    }))
                )

                const membership = getPayload(membershipStatsResponse)
                setMembershipStats({
                    active: Number(membership?.active) || 0,
                    left: Number(membership?.left) || 0
                })

                const systemActivityPayload = getPayload(systemActivityResponse)
                const activityItems = pickArray(systemActivityPayload, ['activities', 'items', 'data'])
                const recentFromOverview = pickArray(overview, ['recent_activities', 'recentActivities'])
                setActivities((activityItems.length > 0 ? activityItems : recentFromOverview).map((item) => toActivity(item)))

                const pagination = systemActivityPayload?.pagination || {}
                setActivityPagination({
                    currentPage: Number(pagination?.currentPage) || 1,
                    totalPages: Number(pagination?.totalPages) || 1,
                    totalItems: Number(pagination?.totalItems) || activityItems.length,
                    itemsPerPage: Number(pagination?.itemsPerPage) || activityLimit
                })
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError?.message || 'Khong the tai du lieu tong quan he thong.')
                    setStats({
                        totalClubs: 0,
                        totalMembers: 0,
                        totalTransactions: 0,
                        pendingClubRequests: 0
                    })
                    setClubCategoryStats([])
                    setMembershipStats({ active: 0, left: 0 })
                    setActivities([])
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadDashboard()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const loadSystemActivity = async () => {
            if (activityPage === 1) return

            try {
                setActivityLoading(true)
                const response = await getAdminDashboardSystemActivity({ page: activityPage, limit: activityLimit })
                if (cancelled) return

                const payload = getPayload(response)
                const activityItems = pickArray(payload, ['activities', 'items', 'data'])
                setActivities(activityItems.map((item) => toActivity(item)))

                const pagination = payload?.pagination || {}
                setActivityPagination({
                    currentPage: Number(pagination?.currentPage) || activityPage,
                    totalPages: Number(pagination?.totalPages) || 1,
                    totalItems: Number(pagination?.totalItems) || activityItems.length,
                    itemsPerPage: Number(pagination?.itemsPerPage) || activityLimit
                })
            } catch (activityError) {
                if (!cancelled) {
                    setError(activityError?.message || 'Khong the tai danh sach hoat dong he thong.')
                }
            } finally {
                if (!cancelled) {
                    setActivityLoading(false)
                }
            }
        }

        loadSystemActivity()

        return () => {
            cancelled = true
        }
    }, [activityPage])

    const statCards = useMemo(
        () => [
            {
                id: 'clubs',
                label: 'Tong so cau lac bo',
                value: formatCount(stats.totalClubs),
                icon: 'fa-sitemap',
                tone: 'clubs'
            },
            {
                id: 'members',
                label: 'Tong so thanh vien',
                value: formatCount(stats.totalMembers),
                icon: 'fa-users',
                tone: 'members'
            },
            {
                id: 'transactions',
                label: 'Tong so giao dich',
                value: formatCount(stats.totalTransactions),
                icon: 'fa-file-invoice-dollar',
                tone: 'transactions'
            },
            {
                id: 'pending',
                label: 'Yeu cau tao CLB cho duyet',
                value: formatCount(stats.pendingClubRequests),
                icon: 'fa-hourglass-half',
                tone: 'pending'
            }
        ],
        [stats]
    )

    const maxCategoryCount = useMemo(() => {
        if (clubCategoryStats.length === 0) return 0
        return Math.max(...clubCategoryStats.map((item) => item.count))
    }, [clubCategoryStats])

    const membershipTotal = membershipStats.active + membershipStats.left

    return (
        <div className="admin-dashboard">
            <header className="admin-dashboard-header">
                <div>
                    <h1 className="admin-dashboard-title">System Overview</h1>
                    <p className="admin-dashboard-subtitle">
                        Tong quan he thong cho System Admin: cau lac bo, thanh vien, giao dich va hoat dong.
                    </p>
                </div>
                <span className="admin-dashboard-refresh">
                    {loading ? 'Dang cap nhat du lieu...' : `Cap nhat luc ${formatActivityTime(new Date())}`}
                </span>
            </header>

            {error && <div className="admin-dashboard-error">{error}</div>}

            <section className="admin-stats-grid">
                {statCards.map((card) => (
                    <article key={card.id} className={`admin-stat-card tone-${card.tone}`}>
                        <div className="admin-stat-icon-wrap">
                            <i className={`fa-solid ${card.icon}`} />
                        </div>
                        <div className="admin-stat-content">
                            <span>{card.label}</span>
                            <strong>{loading ? '...' : card.value}</strong>
                        </div>
                    </article>
                ))}
            </section>

            <section className="admin-insight-grid">
                <article className="admin-insight-card">
                    <div className="admin-activity-header">
                        <h2>CLB theo danh muc</h2>
                        <span>{clubCategoryStats.length} danh muc</span>
                    </div>

                    {clubCategoryStats.length === 0 ? (
                        <p className="admin-activity-empty">Chua co du lieu danh muc CLB.</p>
                    ) : (
                        <div className="admin-category-list">
                            {clubCategoryStats.map((item) => {
                                const width = maxCategoryCount > 0 ? (item.count / maxCategoryCount) * 100 : 0
                                return (
                                    <div key={item.id} className="admin-category-item">
                                        <div className="admin-category-head">
                                            <span>{item.label}</span>
                                            <strong>{formatCount(item.count)}</strong>
                                        </div>
                                        <div className="admin-category-track">
                                            <div className="admin-category-fill" style={{ width: `${width}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </article>

                <article className="admin-insight-card">
                    <div className="admin-activity-header">
                        <h2>Trang thai thanh vien</h2>
                        <span>{formatCount(membershipTotal)} tong thanh vien</span>
                    </div>

                    <div className="admin-membership-grid">
                        <div className="admin-membership-box is-active">
                            <p>Dang hoat dong</p>
                            <strong>{loading ? '...' : formatCount(membershipStats.active)}</strong>
                        </div>
                        <div className="admin-membership-box is-left">
                            <p>Da roi CLB</p>
                            <strong>{loading ? '...' : formatCount(membershipStats.left)}</strong>
                        </div>
                    </div>
                </article>
            </section>

            <section className="admin-activity-card">
                <div className="admin-activity-header">
                    <h2>System Activity</h2>
                    <span>{formatCount(activityPagination.totalItems)} hoat dong</span>
                </div>

                {(loading || activityLoading) && <p className="admin-activity-empty">Dang tai hoat dong he thong...</p>}

                {!loading && !activityLoading && activities.length === 0 && (
                    <p className="admin-activity-empty">Chua co hoat dong he thong de hien thi.</p>
                )}

                {!loading && !activityLoading && activities.length > 0 && (
                    <div className="admin-activity-list">
                        {activities.map((activity) => (
                            <div key={activity.id} className="admin-activity-item">
                                <div className="admin-activity-dot" aria-hidden="true" />
                                <div className="admin-activity-main">
                                    <p className="admin-activity-title">{activity.title}</p>
                                    {activity.description ? (
                                        <p className="admin-activity-desc">{activity.description}</p>
                                    ) : null}
                                    <p className="admin-activity-meta">
                                        <span>{activity.type}</span>
                                        <span>{activity.status}</span>
                                        {activity.clubName ? <span>CLB: {activity.clubName}</span> : null}
                                        {activity.createdBy ? <span>By: {activity.createdBy}</span> : null}
                                        <span>{formatActivityTime(activity.createdAt)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="admin-activity-pagination">
                    <button
                        type="button"
                        className="admin-page-nav"
                        onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                        disabled={activityPagination.currentPage <= 1 || activityLoading}
                    >
                        <i className="fa-solid fa-chevron-left" />
                    </button>
                    <span>
                        Trang {activityPagination.currentPage}/{Math.max(1, activityPagination.totalPages)}
                    </span>
                    <button
                        type="button"
                        className="admin-page-nav"
                        onClick={() =>
                            setActivityPage((p) => Math.min(Math.max(1, activityPagination.totalPages), p + 1))
                        }
                        disabled={activityPagination.currentPage >= activityPagination.totalPages || activityLoading}
                    >
                        <i className="fa-solid fa-chevron-right" />
                    </button>
                </div>
            </section>
        </div>
    )
}

export default Dashboard