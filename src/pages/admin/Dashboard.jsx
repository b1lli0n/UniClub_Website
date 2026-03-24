import { useEffect, useMemo, useState } from 'react'
import adminApi, { getClubCreationRequests, getClubs, getDashboardSummary } from '../../api/adminapi'

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

const pickArray = (data, candidateKeys) => {
    for (const key of candidateKeys) {
        const value = data?.[key]
        if (Array.isArray(value)) return value
    }

    if (Array.isArray(data)) return data
    return []
}

const pickTotal = (data, fallbackArray = []) => {
    const keys = ['total', 'totalItems', 'totalCount', 'count', 'total_records', 'recordsTotal']

    for (const key of keys) {
        const value = Number(data?.[key])
        if (!Number.isNaN(value) && value >= 0) return value
    }

    return fallbackArray.length
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
    const status = item?.status ?? item?.state ?? item?.result

    return {
        id: item?._id || item?.id || `${type}-${title}-${createdAt || 'unknown'}`,
        type,
        title,
        createdAt,
        status: status == null ? 'N/A' : String(status)
    }
}

const Dashboard = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({
        totalClubs: 0,
        totalMembers: 0,
        totalTransactions: 0,
        pendingClubRequests: 0
    })
    const [activities, setActivities] = useState([])

    useEffect(() => {
        let cancelled = false

        const fetchJson = async (paths, fallback = null) => {
            for (const path of paths) {
                try {
                    const response = await adminApi.get(path)
                    return response
                } catch {
                    // try next path
                }
            }

            return fallback
        }

        const loadDashboard = async () => {
            setLoading(true)
            setError('')

            try {
                const [
                    dashboardSummary,
                    clubsResponse,
                    usersResponse,
                    transactionsResponse,
                    activitiesResponse,
                    clubRequestsResponse
                ] = await Promise.all([
                    getDashboardSummary(),
                    getClubs({ page: 1, limit: 1 }),
                    fetchJson(['/users', '/users/list', '/members']),
                    fetchJson(['/transactions', '/payments', '/membership-fees']),
                    fetchJson(['/dashboard/activities', '/activities', '/audit-logs']),
                    getClubCreationRequests({ page: 1, limit: 5 })
                ])

                if (cancelled) return

                const clubsList = pickArray(clubsResponse, ['clubs', 'items', 'data'])
                const usersList = pickArray(usersResponse, ['users', 'members', 'items', 'data'])
                const transactionList = pickArray(transactionsResponse, ['transactions', 'payments', 'items', 'data'])

                const dashboardStatsSource =
                    dashboardSummary?.stats || dashboardSummary?.data || dashboardSummary || {}

                const totalClubs = pickFirstValue(
                    dashboardStatsSource,
                    ['totalClubs', 'clubs', 'clubCount'],
                    pickTotal(clubsResponse, clubsList)
                )

                const totalMembers = pickFirstValue(
                    dashboardStatsSource,
                    ['totalMembers', 'members', 'memberCount', 'users', 'totalUsers'],
                    pickTotal(usersResponse, usersList)
                )

                const totalTransactions = pickFirstValue(
                    dashboardStatsSource,
                    ['totalTransactions', 'transactions', 'paymentCount', 'totalPayments'],
                    pickTotal(transactionsResponse, transactionList)
                )

                const pendingClubRequests = pickFirstValue(
                    dashboardStatsSource,
                    ['pendingClubRequests', 'pendingRequests', 'clubRequestsPending'],
                    pickTotal(clubRequestsResponse, pickArray(clubRequestsResponse, ['items', 'requests', 'clubs']))
                )

                setStats({
                    totalClubs,
                    totalMembers,
                    totalTransactions,
                    pendingClubRequests
                })

                const activityItemsFromSummary = pickArray(dashboardSummary, ['activities', 'logs'])
                const activityItemsFromApi = pickArray(activitiesResponse, ['activities', 'logs', 'items', 'data'])
                const activityItems = activityItemsFromSummary.length > 0 ? activityItemsFromSummary : activityItemsFromApi
                if (activityItems.length > 0) {
                    setActivities(activityItems.slice(0, 8).map((item) => toActivity(item)))
                    return
                }

                const fallbackActivities = pickArray(clubRequestsResponse, ['items', 'requests', 'clubs'])
                    .slice(0, 8)
                    .map((item) =>
                        toActivity(
                            {
                                ...item,
                                title: item?.club_name || item?.name || 'Yeu cau CLB moi',
                                createdAt: item?.createdAt || item?.created_at,
                                type: 'club-request'
                            },
                            'club-request'
                        )
                    )

                setActivities(fallbackActivities)
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError?.message || 'Khong the tai du lieu tong quan he thong.')
                    setStats({
                        totalClubs: 0,
                        totalMembers: 0,
                        totalTransactions: 0,
                        pendingClubRequests: 0
                    })
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

            <section className="admin-activity-card">
                <div className="admin-activity-header">
                    <h2>System Activity</h2>
                    <span>{activities.length} hoat dong gan day</span>
                </div>

                {loading && <p className="admin-activity-empty">Dang tai hoat dong he thong...</p>}

                {!loading && activities.length === 0 && (
                    <p className="admin-activity-empty">Chua co hoat dong he thong de hien thi.</p>
                )}

                {!loading && activities.length > 0 && (
                    <div className="admin-activity-list">
                        {activities.map((activity) => (
                            <div key={activity.id} className="admin-activity-item">
                                <div className="admin-activity-dot" aria-hidden="true" />
                                <div className="admin-activity-main">
                                    <p className="admin-activity-title">{activity.title}</p>
                                    <p className="admin-activity-meta">
                                        <span>{activity.type}</span>
                                        <span>{activity.status}</span>
                                        <span>{formatActivityTime(activity.createdAt)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Dashboard