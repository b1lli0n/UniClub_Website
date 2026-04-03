import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    getDashboard,
    getTransactions,
    createTransaction,
    approveTransaction,
    rejectTransaction,
    sendPaymentReminder,
    sendTransactionNotification,
    exportTransactionsBlob,
    exportTransactionsJson,
} from '../api/financeApi'
import { getClubDetail, getClubMembers } from '../api/clubApi'
import '../styles/finance.css'

const TYPE_OPTIONS = [
    { value: '', label: 'Tất cả loại' },
    { value: '0', label: 'Thu nhập' },
    { value: '1', label: 'Chi phí' },
]

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: '0', label: 'Chờ duyệt' },
    { value: '1', label: 'Đã duyệt' },
    { value: '2', label: 'Từ chối' },
]

const EMPTY_FORM = {
    type: '0',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().slice(0, 16),
    status: '0',
}

const EMPTY_REMINDER_FORM = {
    title: 'Nhắc nhở đóng phí',
    body: '',
    memberIds: [],
}

const EMPTY_NOTIFICATION_FORM = {
    title: '',
    body: '',
    memberIds: [],
}

const fmtVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0)

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—')
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

const formatNameFromEmail = (email) => {
    if (!email) return null
    const raw = email.split('@')[0] || ''
    return raw
        .replace(/[._-]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

const getCategoryName = (categoryItem) =>
    categoryItem?.category || categoryItem?._id || categoryItem?.name || '—'

const getCategoryTotal = (categoryItem) => {
    const rawTotal =
        categoryItem?.total ??
        categoryItem?.amount ??
        categoryItem?.totalAmount ??
        categoryItem?.value ??
        categoryItem?.sum ??
        0

    const normalized = Number(rawTotal)
    return Number.isFinite(normalized) ? normalized : 0
}

const getCategoryPercent = (categoryTotal, overallTotal) => {
    if (!overallTotal) return 0
    return (categoryTotal / overallTotal) * 100
}

const getTrendAmount = (trendItem) => {
    const rawAmount =
        trendItem?.amount ??
        trendItem?.total ??
        trendItem?.totalAmount ??
        trendItem?.value ??
        trendItem?.sum ??
        0

    const normalized = Number(rawAmount)
    return Number.isFinite(normalized) ? normalized : 0
}

const getTrendMonth = (trendItem, fallbackIndex) => {
    const monthFromId = typeof trendItem?._id === 'object'
        ? (trendItem?._id?.month ?? trendItem?._id?.m)
        : trendItem?._id

    return trendItem?.month ?? monthFromId ?? fallbackIndex + 1
}

const normalizeMonthlyTrend = (rawTrend) => {
    const trendList = Array.isArray(rawTrend) ? rawTrend : []
    if (trendList.length === 0) return []

    const alreadyAggregated = trendList.some((item) => item?.income !== undefined || item?.expense !== undefined)
    if (alreadyAggregated) {
        return trendList.map((item, index) => ({
            month: getTrendMonth(item, index),
            income: Number(item?.income ?? 0) || 0,
            expense: Number(item?.expense ?? 0) || 0,
        }))
    }

    // Backend may return one row per (month, type), so we merge to one row per month.
    const monthMap = new Map()

    trendList.forEach((item, index) => {
        const month = getTrendMonth(item, index)
        const monthKey = String(month)
        const amount = getTrendAmount(item)
        const rawType = item?.type ?? item?._id?.type ?? item?.transactionType
        const typeText = String(rawType ?? '').toLowerCase()
        const isExpense = rawType === 1 || rawType === '1' || typeText === 'expense' || typeText === 'chi'

        if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, { month, income: 0, expense: 0 })
        }

        const bucket = monthMap.get(monthKey)
        if (isExpense) {
            bucket.expense += amount
        } else {
            bucket.income += amount
        }
    })

    return Array.from(monthMap.values()).sort((a, b) => Number(a.month) - Number(b.month))
}

const getReminderMemberInfo = (member) => {
    const membershipId = member?.membershipId || member?.membership_id || member?._id || member?.id || ''
    const userId = member?.userId || member?.user_id || member?.user?._id || member?.user?.id || member?._id || member?.id
    const email = member?.email || member?.user?.email || member?.user_id?.email || ''
    const name =
        member?.fullName ||
        member?.fullname ||
        member?.name ||
        member?.full_name ||
        member?.user?.fullName ||
        member?.user?.fullname ||
        member?.user?.full_name ||
        member?.user?.name ||
        member?.user_id?.fullName ||
        member?.user_id?.fullname ||
        member?.user_id?.full_name ||
        member?.user_id?.name ||
        formatNameFromEmail(email) ||
        'Thành viên'

    return {
        membershipId: membershipId ? String(membershipId) : '',
        userId: userId ? String(userId) : '',
        name,
        email,
    }
}

const normalizeReminderMembers = (response) => {
    const rawMembers =
        response?.members ||
        response?.data?.members ||
        response?.data ||
        response ||
        []

    const members = Array.isArray(rawMembers) ? rawMembers : []
    const seen = new Set()

    return members
        .map(getReminderMemberInfo)
        .filter((member) => {
            const targetId = member.membershipId || member.userId
            return targetId && !seen.has(targetId) && seen.add(targetId)
        })
}

const getReminderTargetId = (member) => member?.membershipId || member?.userId || ''

const buildNotificationDefaults = (transaction) => {
    const amountText = fmtVND(transaction?.amount)
    const dateText = transaction?.transaction_date ? fmtDate(transaction.transaction_date) : 'hôm nay'
    const statusLabel = transaction?.status === 1 ? 'đã được xác nhận' : transaction?.status === 2 ? 'đã bị từ chối' : 'đã được ghi nhận'

    return {
        title: transaction?.status === 1 ? 'Xác nhận đã đóng phí' : 'Cập nhật giao dịch',
        body: `Khoản ${transaction?.type === 0 ? 'thu' : 'chi'} ${amountText} ngày ${dateText} ${statusLabel}.`,
        memberIds: [],
    }
}

const buildDateRangeParams = ({ from, to }) => {
    const normalizedFrom = (from || '').trim()
    const normalizedTo = (to || '').trim()

    if (normalizedFrom && !DATE_ONLY_REGEX.test(normalizedFrom)) {
        throw new Error('Invalid from date')
    }
    if (normalizedTo && !DATE_ONLY_REGEX.test(normalizedTo)) {
        throw new Error('Invalid to date')
    }
    if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
        throw new Error('from date must be earlier than or equal to to date')
    }

    const params = {}
    if (normalizedFrom) params.from = normalizedFrom
    if (normalizedTo) params.to = normalizedTo
    return params
}

const extractErrorMessage = async (err, fallbackMessage) => {
    const responseData = err?.response?.data

    if (responseData instanceof Blob) {
        try {
            const text = await responseData.text()
            const parsed = JSON.parse(text)
            return parsed?.message || parsed?.error || fallbackMessage
        } catch {
            return fallbackMessage
        }
    }

    return err?.response?.data?.message || err?.message || fallbackMessage
}

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
}

const getClubNameFromResponse = (response) => {
    const payload = response?.data?.club || response?.club || response?.data || response || {}
    return payload?.name || payload?.club_name || ''
}

const FinancialDashboard = () => {
    const { clubId: routeClubId, id } = useParams()
    const clubId = routeClubId || id
    const navigate = useNavigate()
    const clubRole = Number(localStorage.getItem('clubRole'))
    const [isTreasurer, setIsTreasurer] = useState(clubRole === 1 || clubRole === 4)
    const deniedOnceRef = React.useRef(false)

    const [tab, setTab] = useState('overview')

    // ── Dashboard overview ──────────────────────────────────────
    const [summary, setSummary] = useState(null)
    const [byCategory, setByCategory] = useState([])
    const [monthlyTrend, setMonthlyTrend] = useState([])
    const [clubName, setClubName] = useState('')
    const [dashLoading, setDashLoading] = useState(true)
    const [rangeFrom, setRangeFrom] = useState('')
    const [rangeTo, setRangeTo] = useState('')

    // ── Transaction list ────────────────────────────────────────
    const [transactions, setTransactions] = useState([])
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [txnLoading, setTxnLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [filterType, setFilterType] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [txnFrom, setTxnFrom] = useState('')
    const [txnTo, setTxnTo] = useState('')

    // ── Create modal ────────────────────────────────────────────
    const [showCreate, setShowCreate] = useState(false)
    const [createForm, setCreateForm] = useState(EMPTY_FORM)
    const [creating, setCreating] = useState(false)

    // ── Approve / Reject modal ──────────────────────────────────
    const [noteModal, setNoteModal] = useState(null) // { action, txnId, desc }
    const [noteText, setNoteText] = useState('')
    const [acting, setActing] = useState({})

    // ── Export ──────────────────────────────────────────────────
    const [exporting, setExporting] = useState(false)

    // ── Payment reminder ───────────────────────────────────────
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [reminderForm, setReminderForm] = useState(EMPTY_REMINDER_FORM)
    const [reminderMembers, setReminderMembers] = useState([])
    const [membersLoading, setMembersLoading] = useState(false)
    const [sendingReminder, setSendingReminder] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [notificationForm, setNotificationForm] = useState(EMPTY_NOTIFICATION_FORM)
    const [notificationTxn, setNotificationTxn] = useState(null)
    const [sendingNotification, setSendingNotification] = useState(false)

    // ── Fetch dashboard ─────────────────────────────────────────
    const fetchDashboard = useCallback(async () => {
        try {
            setDashLoading(true)
            const params = buildDateRangeParams({ from: rangeFrom, to: rangeTo })
            const res = await getDashboard(clubId, params)
            const d = res.data?.data ?? {}
            setSummary(d.summary ?? {})
            setByCategory(d.byCategory ?? [])
            setMonthlyTrend(normalizeMonthlyTrend(d.monthlyTrend))
        } catch (err) {
            if (err?.response?.status === 403) {
                if (!deniedOnceRef.current) {
                    deniedOnceRef.current = true
                    toast.error(err?.response?.data?.message || 'Chỉ Leader hoặc Treasurer mới có quyền truy cập mục Financial')
                }
                navigate(-1)
                return
            }
            toast.error(err?.response?.data?.message || 'Không thể tải dữ liệu tổng quan')
        } finally {
            setDashLoading(false)
        }
    }, [clubId, rangeFrom, rangeTo, navigate])

    // ── Fetch transactions ──────────────────────────────────────
    const fetchTransactions = useCallback(async () => {
        try {
            setTxnLoading(true)
            const params = {
                page,
                limit: 10,
                ...buildDateRangeParams({ from: txnFrom, to: txnTo }),
            }
            if (filterType !== '') params.type = Number(filterType)
            if (filterStatus !== '') params.status = Number(filterStatus)
            if (filterCategory) params.category = filterCategory
            const res = await getTransactions(clubId, params)
            setTransactions(Array.isArray(res.data?.data) ? res.data.data : [])
            const pg = res.data?.pagination ?? {}
            setPagination({ page: pg.page ?? 1, pages: pg.pages ?? 1, total: pg.total ?? 0 })
        } catch (err) {
            if (err?.response?.status === 403) {
                if (!deniedOnceRef.current) {
                    deniedOnceRef.current = true
                    toast.error(err?.response?.data?.message || 'Chỉ Leader hoặc Treasurer mới có quyền truy cập mục Financial')
                }
                navigate(-1)
                return
            }
            toast.error(err?.response?.data?.message || 'Không thể tải danh sách giao dịch')
        } finally {
            setTxnLoading(false)
        }
    }, [clubId, page, filterType, filterStatus, filterCategory, txnFrom, txnTo, navigate])

    const extractRoleFromClub = (response) => {
        const payload = response?.data?.club || response?.club || response?.data || response || {}
        const rawRole =
            payload?.membershipRole ??
            payload?.role ??
            payload?.currentUserRole ??
            payload?.membership?.role
        const roleNum = Number(rawRole)
        return Number.isFinite(roleNum) ? roleNum : null
    }

    useEffect(() => {
        let cancelled = false
        const verifyRoleAndLoad = async () => {
            try {
                const res = await getClubDetail(clubId)
                if (cancelled) return
                const roleNum = extractRoleFromClub(res)
                const isTr = roleNum === 1 || roleNum === 4 || Number(localStorage.getItem('clubRole')) === 1 || Number(localStorage.getItem('clubRole')) === 4
                setIsTreasurer(isTr)
                if (!isTr) {
                    if (!deniedOnceRef.current) {
                        deniedOnceRef.current = true
                        toast.error('Chỉ Leader hoặc Treasurer mới có quyền truy cập mục Financial')
                    }
                    navigate(-1)
                    return
                }
                await fetchDashboard()
            } catch {
                // Nếu lấy chi tiết club lỗi, fallback vào check backend khi gọi dashboard
                await fetchDashboard()
            }
        }
        verifyRoleAndLoad()
        return () => { cancelled = true }
    }, [clubId, fetchDashboard, navigate])

    useEffect(() => {
        const loadClubName = async () => {
            try {
                const response = await getClubDetail(clubId)
                setClubName(getClubNameFromResponse(response))
            } catch {
                setClubName('')
            }
        }

        if (clubId) loadClubName()
    }, [clubId])

    useEffect(() => {
        if (!isTreasurer) return
        if (tab === 'transactions') fetchTransactions()
    }, [tab, fetchTransactions, isTreasurer])

    // ── Create transaction ──────────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault()
        if (!createForm.category.trim()) { toast.error('Vui lòng nhập danh mục'); return }
        if (!createForm.description.trim()) { toast.error('Vui lòng nhập mô tả'); return }
        if (Number(createForm.amount) <= 0) { toast.error('Số tiền phải lớn hơn 0'); return }
        if (!createForm.transaction_date) { toast.error('Vui lòng chọn ngày giao dịch'); return }
        try {
            setCreating(true)
            await createTransaction(clubId, {
                type: Number(createForm.type),
                category: createForm.category.trim(),
                amount: Number(createForm.amount),
                description: createForm.description.trim(),
                transaction_date: new Date(createForm.transaction_date).toISOString(),
                status: Number(createForm.status),
            })
            toast.success('Tạo giao dịch thành công!')
            setShowCreate(false)
            setCreateForm(EMPTY_FORM)
            fetchTransactions()
            fetchDashboard()
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Tạo giao dịch thất bại')
        } finally {
            setCreating(false)
        }
    }

    // ── Approve / Reject ────────────────────────────────────────
    const openNoteModal = (action, txnId, desc) => {
        setNoteModal({ action, txnId, desc })
        setNoteText('')
    }

    const handleAction = async () => {
        if (!noteModal) return
        const { action, txnId } = noteModal
        try {
            setActing((prev) => ({ ...prev, [txnId]: true }))
            if (action === 'approve') {
                await approveTransaction(clubId, txnId, noteText)
                toast.success('Đã duyệt giao dịch')
            } else {
                await rejectTransaction(clubId, txnId, noteText)
                toast.success('Đã từ chối giao dịch')
            }
            setNoteModal(null)
            setNoteText('')
            fetchTransactions()
            fetchDashboard()
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Thao tác thất bại')
        } finally {
            setActing((prev) => ({ ...prev, [txnId]: false }))
        }
    }

    // ── Export ──────────────────────────────────────────────────
    const handleExport = async (format) => {
        try {
            setExporting(true)
            const params = buildDateRangeParams({ from: txnFrom, to: txnTo })
            if (filterType !== '') params.type = filterType
            if (filterStatus !== '') params.status = filterStatus
            if (filterCategory.trim()) params.category = filterCategory.trim()

            let blob
            let filename
            if (format === 'json') {
                const res = await exportTransactionsJson(clubId, params)
                const exportData = res.data?.data ?? res.data
                blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                filename = `finance-${clubId}.json`
            } else {
                const res = await exportTransactionsBlob(clubId, { ...params, format })
                const normalizedFormat = format === 'excel' ? 'xlsx' : format
                const mime = normalizedFormat === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'text/csv;charset=utf-8'
                blob = new Blob([res.data], { type: mime })
                filename = `finance-${clubId}.${normalizedFormat}`
            }

            downloadBlob(blob, filename)
            toast.success('Xuất báo cáo thành công!')
        } catch (err) {
            toast.error(await extractErrorMessage(err, 'Không thể xuất báo cáo'))
        } finally {
            setExporting(false)
        }
    }

    const loadReminderMembers = useCallback(async () => {
        try {
            setMembersLoading(true)
            const response = await getClubMembers(clubId)
            setReminderMembers(normalizeReminderMembers(response))
        } catch (err) {
            toast.error(await extractErrorMessage(err, 'Không thể tải danh sách thành viên'))
            setReminderMembers([])
        } finally {
            setMembersLoading(false)
        }
    }, [clubId])

    const openReminderModal = async () => {
        setShowReminderModal(true)
        setReminderForm(EMPTY_REMINDER_FORM)
        await loadReminderMembers()
    }

    const openTransactionNotificationModal = async (transaction) => {
        setNotificationTxn(transaction)
        setNotificationForm(buildNotificationDefaults(transaction))
        setShowNotificationModal(true)
        if (reminderMembers.length === 0) {
            await loadReminderMembers()
        }
    }

    const toggleReminderMember = (memberId) => {
        if (!memberId) return
        setReminderForm((prev) => ({
            ...prev,
            memberIds: prev.memberIds.includes(memberId)
                ? prev.memberIds.filter((id) => id !== memberId)
                : [...prev.memberIds, memberId],
        }))
    }

    const handleSendReminder = async (e) => {
        e.preventDefault()

        if (!reminderForm.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề thông báo')
            return
        }
        if (!reminderForm.body.trim()) {
            toast.error('Vui lòng nhập nội dung thông báo')
            return
        }

        try {
            setSendingReminder(true)
            const payload = {
                title: reminderForm.title.trim(),
                body: reminderForm.body.trim(),
            }
            if (reminderForm.memberIds.length > 0) {
                payload.memberIds = reminderForm.memberIds
            }

            const res = await sendPaymentReminder(clubId, payload)
            const sentCount = res.data?.sent
            toast.success(res.data?.message || `Đã gửi nhắc đóng phí${sentCount ? ` cho ${sentCount} thành viên` : ''}`)
            setShowReminderModal(false)
            setReminderForm(EMPTY_REMINDER_FORM)
        } catch (err) {
            toast.error(await extractErrorMessage(err, 'Không thể gửi nhắc đóng phí'))
        } finally {
            setSendingReminder(false)
        }
    }

    const toggleNotificationMember = (membershipId) => {
        setNotificationForm((prev) => ({
            ...prev,
            memberIds: prev.memberIds.includes(membershipId)
                ? prev.memberIds.filter((id) => id !== membershipId)
                : [...prev.memberIds, membershipId],
        }))
    }

    const handleSendTransactionNotification = async (e) => {
        e.preventDefault()

        if (!notificationTxn) return
        if (!notificationForm.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề thông báo')
            return
        }
        if (!notificationForm.body.trim()) {
            toast.error('Vui lòng nhập nội dung thông báo')
            return
        }

        try {
            setSendingNotification(true)
            const payload = {
                title: notificationForm.title.trim(),
                body: notificationForm.body.trim(),
                transactionId: notificationTxn._id,
                transactionType: notificationTxn.type,
                status: notificationTxn.status,
                amount: notificationTxn.amount,
                transactionDate: notificationTxn.transaction_date,
            }
            if (notificationForm.memberIds.length > 0) {
                payload.memberIds = notificationForm.memberIds
            }

            const res = await sendTransactionNotification(clubId, payload)
            const sentCount = res.data?.sent
            toast.success(res.data?.message || `Đã gửi thông báo giao dịch${sentCount ? ` cho ${sentCount} thành viên` : ''}`)
            setShowNotificationModal(false)
            setNotificationTxn(null)
            setNotificationForm(EMPTY_NOTIFICATION_FORM)
        } catch (err) {
            toast.error(await extractErrorMessage(err, 'Không thể gửi thông báo giao dịch'))
        } finally {
            setSendingNotification(false)
        }
    }

    // ── Derived values for charts ────────────────────────────────
    const maxTrend = Math.max(...monthlyTrend.map((m) => Math.max(m.income ?? 0, m.expense ?? 0)), 1)
    const totalCategoryAmount = byCategory.reduce((sum, c) => sum + getCategoryTotal(c), 0)

    // ── JSX ─────────────────────────────────────────────────────
    return (
        <div className="admin-panel admin-panel--animate">

            {/* Header */}
            <div className="admin-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        className="admin-status-btn"
                        onClick={() => navigate(-1)}
                        title="Quay lại"
                        style={{ width: 32, height: 32 }}
                    >
                        <i className="fa-solid fa-arrow-left" />
                    </button>
                    <div>
                        <h2 className="admin-title">
                            <i className="fa-solid fa-coins" style={{ marginRight: 8, color: '#d97706' }} />
                            Financial Dashboard
                        </h2>
                        <p className="admin-subtitle">Quản lý tài chính – Club: {clubName || 'Đang tải...'}</p>
                    </div>
                </div>

                {tab === 'overview' && (
                    <div className="finance-range">
                        <input
                            type="date"
                            className="finance-input-sm"
                            value={rangeFrom}
                            onChange={(e) => setRangeFrom(e.target.value)}
                            title="Từ ngày"
                        />
                        <span style={{ color: '#9ca3af', fontSize: 13 }}>–</span>
                        <input
                            type="date"
                            className="finance-input-sm"
                            value={rangeTo}
                            onChange={(e) => setRangeTo(e.target.value)}
                            title="Đến ngày"
                        />
                        <button
                            type="button"
                            className="finance-btn-icon"
                            onClick={fetchDashboard}
                            title="Áp dụng bộ lọc"
                        >
                            <i className="fa-solid fa-filter" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="finance-tabs">
                {[
                    { key: 'overview', label: 'Tổng quan', icon: 'fa-chart-line' },
                    { key: 'transactions', label: 'Giao dịch', icon: 'fa-list' },
                ].map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={`finance-tab${tab === t.key ? ' finance-tab--active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        <i className={`fa-solid ${t.icon}`} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ──────────────────────────────────────── */}
            {tab === 'overview' && (
                dashLoading ? (
                    <div className="finance-center">
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: '#3b82f6' }} />
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="finance-cards">
                            <div className="finance-card finance-card--income">
                                <div className="finance-card-icon">
                                    <i className="fa-solid fa-arrow-trend-up" />
                                </div>
                                <div className="finance-card-body">
                                    <div className="finance-card-label">Tổng thu</div>
                                    <div className="finance-card-value">{fmtVND(summary?.totalIncome)}</div>
                                </div>
                            </div>

                            <div className="finance-card finance-card--expense">
                                <div className="finance-card-icon">
                                    <i className="fa-solid fa-arrow-trend-down" />
                                </div>
                                <div className="finance-card-body">
                                    <div className="finance-card-label">Tổng chi</div>
                                    <div className="finance-card-value">{fmtVND(summary?.totalExpense)}</div>
                                </div>
                            </div>

                            <div className={`finance-card ${(summary?.netBalance ?? 0) >= 0 ? 'finance-card--balance-pos' : 'finance-card--balance-neg'}`}>
                                <div className="finance-card-icon">
                                    <i className="fa-solid fa-scale-balanced" />
                                </div>
                                <div className="finance-card-body">
                                    <div className="finance-card-label">Số dư</div>
                                    <div className="finance-card-value">{fmtVND(summary?.netBalance)}</div>
                                </div>
                            </div>

                            <div className="finance-card finance-card--pending">
                                <div className="finance-card-icon">
                                    <i className="fa-solid fa-clock" />
                                </div>
                                <div className="finance-card-body">
                                    <div className="finance-card-label">Chờ duyệt</div>
                                    <div className="finance-card-value">{summary?.pendingCount ?? 0} giao dịch</div>
                                </div>
                            </div>
                        </div>

                        {/* Category + Monthly Trend */}
                        <div className="finance-two-col">
                            <div className="finance-section">
                                <h3 className="finance-section-title">
                                    <i className="fa-solid fa-tags" style={{ marginRight: 6 }} />
                                    Theo danh mục
                                </h3>
                                {byCategory.length === 0 ? (
                                    <p className="finance-empty">Không có dữ liệu</p>
                                ) : (
                                    <div className="finance-cat-list">
                                        {byCategory.map((c, i) => (
                                            <div key={i} className="finance-cat-row">
                                                <div className="finance-cat-name">{getCategoryName(c)}</div>
                                                <div className="finance-cat-bar-wrap">
                                                    {(() => {
                                                        const total = getCategoryTotal(c)
                                                        const pct = getCategoryPercent(total, totalCategoryAmount)
                                                        return (
                                                            <>
                                                                <div
                                                                    className="finance-cat-bar"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                                <span className="finance-cat-pct">{pct.toFixed(1)}%</span>
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                                <div className="finance-cat-amt">{fmtVND(getCategoryTotal(c))}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="finance-section">
                                <h3 className="finance-section-title">
                                    <i className="fa-solid fa-chart-bar" style={{ marginRight: 6 }} />
                                    Xu hướng theo tháng
                                </h3>
                                {monthlyTrend.length === 0 ? (
                                    <p className="finance-empty">Không có dữ liệu</p>
                                ) : (
                                    <div className="finance-trend-list">
                                        {monthlyTrend.map((m, i) => (
                                            <div key={i} className="finance-trend-row">
                                                <div className="finance-trend-month">
                                                    {m.month ?? m._id ?? `Tháng ${i + 1}`}
                                                </div>
                                                <div className="finance-trend-bars">
                                                    <div className="finance-trend-bar-row">
                                                        <span className="finance-trend-label finance-trend-label--inc">Thu</span>
                                                        <div className="finance-trend-bar-wrap">
                                                            <div
                                                                className="finance-trend-bar finance-trend-bar--inc"
                                                                style={{ width: `${((m.income ?? 0) / maxTrend) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="finance-trend-amt">{fmtVND(m.income)}</span>
                                                    </div>
                                                    <div className="finance-trend-bar-row">
                                                        <span className="finance-trend-label finance-trend-label--exp">Chi</span>
                                                        <div className="finance-trend-bar-wrap">
                                                            <div
                                                                className="finance-trend-bar finance-trend-bar--exp"
                                                                style={{ width: `${((m.expense ?? 0) / maxTrend) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="finance-trend-amt">{fmtVND(m.expense)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )
            )}

            {/* ── Transactions Tab ──────────────────────────────────── */}
            {tab === 'transactions' && (
                <>
                    {/* Toolbar */}
                    <div className="finance-toolbar">
                        <div className="finance-filters">
                            <select
                                className="admin-role-select"
                                value={filterType}
                                onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
                            >
                                {TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            <select
                                className="admin-role-select"
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                className="finance-input-sm"
                                placeholder="Danh mục..."
                                value={filterCategory}
                                onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
                            />

                            <input
                                type="date"
                                className="finance-input-sm"
                                value={txnFrom}
                                onChange={(e) => { setTxnFrom(e.target.value); setPage(1) }}
                                title="Từ ngày"
                            />

                            <input
                                type="date"
                                className="finance-input-sm"
                                value={txnTo}
                                onChange={(e) => { setTxnTo(e.target.value); setPage(1) }}
                                title="Đến ngày"
                            />
                        </div>

                        <div className="finance-actions">
                            <div className="finance-export-group">
                                <span className="finance-export-label">Xuất:</span>
                                {['csv', 'xlsx', 'json'].map((fmt) => (
                                    <button
                                        key={fmt}
                                        type="button"
                                        className="finance-export-btn"
                                        onClick={() => handleExport(fmt)}
                                        disabled={exporting}
                                        title={`Xuất ${fmt.toUpperCase()}`}
                                    >
                                        {fmt.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="finance-reminder-btn"
                                onClick={openReminderModal}
                                title="Gửi nhắc đóng phí"
                            >
                                <i className="fa-solid fa-envelope-circle-check" />
                                Nhắc đóng phí
                            </button>

                            <button
                                type="button"
                                className="finance-create-btn"
                                onClick={() => { setShowCreate(true); setCreateForm(EMPTY_FORM) }}
                            >
                                <i className="fa-solid fa-plus" />
                                Tạo giao dịch
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="admin-table">
                        <div className="admin-table-head">
                            <div className="admin-col" style={{ flex: 1.8 }}>Mô tả</div>
                            <div className="admin-col" style={{ flex: 0.7 }}>Loại</div>
                            <div className="admin-col" style={{ flex: 1 }}>Danh mục</div>
                            <div className="admin-col" style={{ flex: 1 }}>Số tiền</div>
                            <div className="admin-col" style={{ flex: 0.8 }}>Ngày</div>
                            <div className="admin-col" style={{ flex: 0.8 }}>Trạng thái</div>
                            <div className="admin-col" style={{ flex: 0.7 }}>Thao tác</div>
                        </div>

                        <div className="admin-table-body">
                            {txnLoading ? (
                                <div className="finance-center">
                                    <i className="fa-solid fa-spinner fa-spin" style={{ color: '#3b82f6' }} />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="finance-center">
                                    <span className="finance-empty">Không có giao dịch nào</span>
                                </div>
                            ) : (
                                transactions.map((txn) => (
                                    <div key={txn._id} className="admin-row">
                                        <div className="admin-col" style={{ flex: 1.8 }}>
                                            <span style={{ fontWeight: 500 }}>{txn.description}</span>
                                        </div>

                                        <div className="admin-col" style={{ flex: 0.7 }}>
                                            <span
                                                className="finance-type-badge"
                                                style={{
                                                    color: txn.type === 0 ? '#16a34a' : '#dc2626',
                                                    background: txn.type === 0 ? '#dcfce7' : '#fee2e2',
                                                }}
                                            >
                                                {txn.type === 0 ? '▲ Thu' : '▼ Chi'}
                                            </span>
                                        </div>

                                        <div className="admin-col" style={{ flex: 1, color: '#6b7280' }}>
                                            {txn.category}
                                        </div>

                                        <div
                                            className="admin-col"
                                            style={{ flex: 1, fontWeight: 600, color: txn.type === 0 ? '#16a34a' : '#dc2626' }}
                                        >
                                            {fmtVND(txn.amount)}
                                        </div>

                                        <div className="admin-col" style={{ flex: 0.8, color: '#6b7280', fontSize: 12 }}>
                                            {fmtDate(txn.transaction_date)}
                                        </div>

                                        <div className="admin-col" style={{ flex: 0.8 }}>
                                            <span className={`finance-status-badge ${txn.status === 0 ? 'finance-status-badge--pending' :
                                                txn.status === 1 ? 'finance-status-badge--approved' :
                                                    'finance-status-badge--rejected'
                                                }`}>
                                                {txn.status === 0 ? 'Chờ duyệt' : txn.status === 1 ? 'Đã duyệt' : 'Từ chối'}
                                            </span>
                                        </div>

                                        <div className="admin-col" style={{ flex: 0.7 }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    type="button"
                                                    className="admin-status-btn finance-notification-btn"
                                                    onClick={() => openTransactionNotificationModal(txn)}
                                                    title="Gửi thông báo giao dịch"
                                                >
                                                    <i className="fa-solid fa-paper-plane" />
                                                </button>
                                                {txn.status === 0 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="admin-status-btn admin-status-btn--approve"
                                                            onClick={() => openNoteModal('approve', txn._id, txn.description)}
                                                            disabled={!!acting[txn._id]}
                                                            title="Duyệt giao dịch"
                                                        >
                                                            <i className="fa-solid fa-check" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-status-btn admin-status-btn--reject"
                                                            onClick={() => openNoteModal('reject', txn._id, txn.description)}
                                                            disabled={!!acting[txn._id]}
                                                            title="Từ chối giao dịch"
                                                        >
                                                            <i className="fa-solid fa-xmark" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="admin-pagination" style={{ marginTop: 12 }}>
                            <button
                                className="admin-status-btn"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <i className="fa-solid fa-chevron-left" />
                            </button>
                            <span style={{ margin: '0 14px', fontSize: 13, color: '#6b7280' }}>
                                Trang {page} / {pagination.pages} ({pagination.total} giao dịch)
                            </span>
                            <button
                                className="admin-status-btn"
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                            >
                                <i className="fa-solid fa-chevron-right" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── Create Transaction Modal ───────────────────────────── */}
            {showCreate && (
                <div className="finance-modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="finance-modal-header">
                            <h3>
                                <i className="fa-solid fa-plus-circle" style={{ marginRight: 8, color: '#2563eb' }} />
                                Tạo giao dịch mới
                            </h3>
                            <button type="button" className="finance-modal-close" onClick={() => setShowCreate(false)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="finance-form">
                            <div className="finance-form-row">
                                <div className="finance-form-group">
                                    <label>Loại <span className="finance-required">*</span></label>
                                    <select
                                        value={createForm.type}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value }))}
                                        className="finance-select"
                                    >
                                        <option value="0">Thu nhập</option>
                                        <option value="1">Chi phí</option>
                                    </select>
                                </div>
                                <div className="finance-form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        value={createForm.status}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
                                        className="finance-select"
                                    >
                                        <option value="0">Chờ duyệt</option>
                                        <option value="1">Đã duyệt</option>
                                    </select>
                                </div>
                            </div>

                            <div className="finance-form-group">
                                <label>Danh mục <span className="finance-required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="VD: Membership Fee"
                                    value={createForm.category}
                                    onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                                />
                            </div>

                            <div className="finance-form-group">
                                <label>Mô tả <span className="finance-required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="VD: Thu phí tháng 3"
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <div className="finance-form-row">
                                <div className="finance-form-group">
                                    <label>Số tiền (VNĐ) <span className="finance-required">*</span></label>
                                    <input
                                        type="number"
                                        placeholder="50000"
                                        min={1}
                                        value={createForm.amount}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
                                    />
                                </div>
                                <div className="finance-form-group">
                                    <label>Ngày giao dịch <span className="finance-required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.transaction_date}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, transaction_date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="finance-form-actions">
                                <button type="button" className="finance-btn-cancel" onClick={() => setShowCreate(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="finance-btn-submit" disabled={creating}>
                                    {creating
                                        ? <><i className="fa-solid fa-spinner fa-spin" /> Đang tạo...</>
                                        : <><i className="fa-solid fa-check" /> Tạo giao dịch</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReminderModal && (
                <div className="finance-modal-overlay" onClick={() => setShowReminderModal(false)}>
                    <div className="finance-modal finance-modal--lg" onClick={(e) => e.stopPropagation()}>
                        <div className="finance-modal-header">
                            <h3>
                                <i className="fa-solid fa-bell" style={{ marginRight: 8, color: '#d97706' }} />
                                Gửi nhắc đóng phí
                            </h3>
                            <button type="button" className="finance-modal-close" onClick={() => setShowReminderModal(false)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleSendReminder} className="finance-form">
                            <div className="finance-form-group">
                                <label>Tiêu đề <span className="finance-required">*</span></label>
                                <input
                                    type="text"
                                    value={reminderForm.title}
                                    onChange={(e) => setReminderForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="VD: Nhắc nhở đóng phí"
                                />
                            </div>

                            <div className="finance-form-group">
                                <label>Nội dung <span className="finance-required">*</span></label>
                                <textarea
                                    rows={4}
                                    value={reminderForm.body}
                                    onChange={(e) => setReminderForm((prev) => ({ ...prev, body: e.target.value }))}
                                    placeholder="VD: Bạn vui lòng đóng phí thành viên trước ngày 20/03/2026."
                                />
                            </div>

                            <div className="finance-reminder-note">
                                Không chọn thành viên nào thì hệ thống sẽ gửi cho toàn bộ thành viên đang hoạt động của CLB.
                            </div>

                            <div className="finance-reminder-toolbar">
                                <span className="finance-reminder-count">
                                    Đã chọn {reminderForm.memberIds.length}/{reminderMembers.length} thành viên
                                </span>
                                <div className="finance-reminder-actions-inline">
                                    <button
                                        type="button"
                                        className="finance-link-btn"
                                        onClick={() => setReminderForm((prev) => ({
                                            ...prev,
                                            memberIds: reminderMembers
                                                .map((member) => getReminderTargetId(member))
                                                .filter(Boolean),
                                        }))}
                                        disabled={membersLoading || reminderMembers.length === 0}
                                    >
                                        Chọn tất cả
                                    </button>
                                    <button
                                        type="button"
                                        className="finance-link-btn"
                                        onClick={() => setReminderForm((prev) => ({ ...prev, memberIds: [] }))}
                                        disabled={membersLoading || reminderForm.memberIds.length === 0}
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            </div>

                            <div className="finance-member-picker">
                                {membersLoading ? (
                                    <div className="finance-center">
                                        <i className="fa-solid fa-spinner fa-spin" style={{ color: '#3b82f6' }} />
                                    </div>
                                ) : reminderMembers.length === 0 ? (
                                    <p className="finance-empty">Không có thành viên để chọn</p>
                                ) : (
                                    reminderMembers.map((member) => {
                                        const targetId = getReminderTargetId(member)
                                        if (!targetId) return null
                                        return (
                                            <label key={targetId} className="finance-member-option">
                                                <input
                                                    type="checkbox"
                                                    checked={reminderForm.memberIds.includes(targetId)}
                                                    onChange={() => toggleReminderMember(targetId)}
                                                />
                                                <div>
                                                    <div className="finance-member-name">{member.name}</div>
                                                    <div className="finance-member-email">{member.email || 'Không có email'}</div>
                                                </div>
                                            </label>
                                        )
                                    })
                                )}
                            </div>

                            <div className="finance-form-actions">
                                <button type="button" className="finance-btn-cancel" onClick={() => setShowReminderModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="finance-btn-submit finance-reminder-submit" disabled={sendingReminder || membersLoading}>
                                    {sendingReminder
                                        ? <><i className="fa-solid fa-spinner fa-spin" /> Đang gửi...</>
                                        : <><i className="fa-solid fa-paper-plane" /> Gửi nhắc đóng phí</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showNotificationModal && (
                <div className="finance-modal-overlay" onClick={() => setShowNotificationModal(false)}>
                    <div className="finance-modal finance-modal--lg" onClick={(e) => e.stopPropagation()}>
                        <div className="finance-modal-header">
                            <h3>
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: 8, color: '#2563eb' }} />
                                Gửi thông báo giao dịch
                            </h3>
                            <button type="button" className="finance-modal-close" onClick={() => setShowNotificationModal(false)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleSendTransactionNotification} className="finance-form">
                            <div className="finance-transaction-meta">
                                <span><strong>Mô tả:</strong> {notificationTxn?.description}</span>
                                <span><strong>Số tiền:</strong> {fmtVND(notificationTxn?.amount)}</span>
                                <span><strong>Ngày:</strong> {fmtDate(notificationTxn?.transaction_date)}</span>
                            </div>

                            <div className="finance-form-group">
                                <label>Tiêu đề <span className="finance-required">*</span></label>
                                <input
                                    type="text"
                                    value={notificationForm.title}
                                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="VD: Xác nhận đã đóng phí"
                                />
                            </div>

                            <div className="finance-form-group">
                                <label>Nội dung <span className="finance-required">*</span></label>
                                <textarea
                                    rows={4}
                                    value={notificationForm.body}
                                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, body: e.target.value }))}
                                    placeholder="VD: Khoản phí của bạn đã được xác nhận thành công."
                                />
                            </div>

                            <div className="finance-reminder-note">
                                Không chọn ai thì hệ thống sẽ gửi cho toàn bộ thành viên active của club. Danh sách chọn ở đây dùng membership ID theo đúng API transaction notification.
                            </div>

                            <div className="finance-reminder-toolbar">
                                <span className="finance-reminder-count">
                                    Đã chọn {notificationForm.memberIds.length}/{reminderMembers.filter((member) => member.membershipId).length} thành viên
                                </span>
                                <div className="finance-reminder-actions-inline">
                                    <button
                                        type="button"
                                        className="finance-link-btn"
                                        onClick={() => setNotificationForm((prev) => ({
                                            ...prev,
                                            memberIds: reminderMembers
                                                .filter((member) => member.membershipId)
                                                .map((member) => member.membershipId),
                                        }))}
                                        disabled={membersLoading || reminderMembers.every((member) => !member.membershipId)}
                                    >
                                        Chọn tất cả
                                    </button>
                                    <button
                                        type="button"
                                        className="finance-link-btn"
                                        onClick={() => setNotificationForm((prev) => ({ ...prev, memberIds: [] }))}
                                        disabled={membersLoading || notificationForm.memberIds.length === 0}
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            </div>

                            <div className="finance-member-picker">
                                {membersLoading ? (
                                    <div className="finance-center">
                                        <i className="fa-solid fa-spinner fa-spin" style={{ color: '#3b82f6' }} />
                                    </div>
                                ) : reminderMembers.filter((member) => member.membershipId).length === 0 ? (
                                    <p className="finance-empty">Không có membership nào để chọn</p>
                                ) : (
                                    reminderMembers
                                        .filter((member) => member.membershipId)
                                        .map((member) => (
                                            <label key={member.membershipId} className="finance-member-option">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationForm.memberIds.includes(member.membershipId)}
                                                    onChange={() => toggleNotificationMember(member.membershipId)}
                                                />
                                                <div>
                                                    <div className="finance-member-name">{member.name}</div>
                                                    <div className="finance-member-email">{member.email || 'Không có email'}</div>
                                                </div>
                                            </label>
                                        ))
                                )}
                            </div>

                            <div className="finance-form-actions">
                                <button type="button" className="finance-btn-cancel" onClick={() => setShowNotificationModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="finance-btn-submit" disabled={sendingNotification || membersLoading}>
                                    {sendingNotification
                                        ? <><i className="fa-solid fa-spinner fa-spin" /> Đang gửi...</>
                                        : <><i className="fa-solid fa-paper-plane" /> Gửi thông báo</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Approve / Reject Modal ─────────────────────────────── */}
            {noteModal && (
                <div className="finance-modal-overlay" onClick={() => setNoteModal(null)}>
                    <div className="finance-modal finance-modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="finance-modal-header">
                            <h3 style={{ color: noteModal.action === 'approve' ? '#16a34a' : '#dc2626' }}>
                                <i
                                    className={`fa-solid ${noteModal.action === 'approve' ? 'fa-circle-check' : 'fa-circle-xmark'}`}
                                    style={{ marginRight: 8 }}
                                />
                                {noteModal.action === 'approve' ? 'Duyệt giao dịch' : 'Từ chối giao dịch'}
                            </h3>
                            <button type="button" className="finance-modal-close" onClick={() => setNoteModal(null)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div className="finance-form">
                            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px 0' }}>
                                <strong>Giao dịch:</strong> {noteModal.desc}
                            </p>

                            <div className="finance-form-group">
                                <label>Ghi chú (tùy chọn)</label>
                                <textarea
                                    rows={3}
                                    placeholder={noteModal.action === 'approve' ? 'VD: Đã kiểm tra chứng từ' : 'VD: Thiếu hóa đơn'}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                            </div>

                            <div className="finance-form-actions">
                                <button type="button" className="finance-btn-cancel" onClick={() => setNoteModal(null)}>
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className={`finance-btn-submit${noteModal.action === 'reject' ? ' finance-btn-reject' : ''}`}
                                    onClick={handleAction}
                                    disabled={!!acting[noteModal.txnId]}
                                >
                                    {acting[noteModal.txnId]
                                        ? <i className="fa-solid fa-spinner fa-spin" />
                                        : noteModal.action === 'approve'
                                            ? <><i className="fa-solid fa-check" /> Duyệt</>
                                            : <><i className="fa-solid fa-xmark" /> Từ chối</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FinancialDashboard
