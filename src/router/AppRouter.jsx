import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
import LeaderLayout from '../layouts/LeaderLayout'
import ClubAreaLayout from '../layouts/ClubAreaLayout'

import Register from '../pages/Auth/Register'
import VerifyOtp from '../pages/Auth/VerifyOtp'
import Login from '../pages/Auth/Login'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import ResetPassword from '../pages/Auth/ResetPassword'


import ListOfClubs from '../pages/ClubPages/ListOfClubs'
import ClubDetail from '../pages/ClubPages/ClubDetail'
import PointsHistory from '../pages/ClubPages/PointsHistory'
import ClubLeaderboard from '../pages/ClubPages/ClubLeaderboard'
import ClubBadges from '../pages/ClubPages/ClubBadges'
import PointRules from '../pages/ClubPages/PointRules'
import ListOfMyClubs from '../pages/ClubPages/ListOfMyClubs'
import DashboardLeaderClub from '../pages/DashboardLeaderClub'
import EventAttendanceList from '../pages/leader/EventAttendanceList'
import CreateClub from '../pages/ClubPages/CreateClub'
import ClubTransactions from '../pages/ClubPages/ClubTransactions'

import Event from '../pages/EventPages/EventInClub'
import EventPublic from '../pages/EventPages/EventPublic'
import MyEvent from '../pages/EventPages/MyEvent';
import EventDetail from '../pages/EventPages/EventDetail'
import NotificationCenter from "../pages/NotificationCenter";

import Profile from '../pages/Profile'
import ChangePassword from '../pages/Auth/ChangePassword'

// import ViewJoinRequests from '../pages/ViewJoinRequests'
import NotFound from '../pages/NotFound'

//Admin Pages
import ClubRequests from '../pages/admin/ClubRequests'
import ClubRequestDetail from '../pages/admin/ClubRequestDetail'
import ClubList from '../pages/admin/ClubList'
import ClubDetailAdmin from '../pages/admin/ClubDetail'
import ClubMembers from '../pages/admin/ClubMembers'
import PlaceholderPage from '../pages/admin/PlaceholderPage'
import AdminDashboard from '../pages/admin/Dashboard'
import RewardsAdmin from '../pages/admin/Rewards'
import RewardDetailAdmin from '../pages/admin/RewardDetail'
import RedemptionHistoryAdmin from '../pages/admin/RedemptionHistory'
import BadgesAdmin from '../pages/admin/Badges'
import BadgeDetailAdmin from '../pages/admin/BadgeDetail'
import RewardPointLogs from '../pages/admin/RewardPointLogs'
import AdminNotifications from '../pages/admin/Notifications'
import FinancialDashboard from '../pages/FinancialDashboard'
import MembershipsPage from '../pages/Memberships';
import EventsPage from '../pages/Events';
import EventDetailPage from '../pages/EventDetail';
import CreateEventPage from '../pages/CreateEvent';
import UpdateEventPage from '../pages/UpdateEvent';
import NotificationsPage from '../pages/Notifications';
import Home from '../pages/Home';
import ViewRewards from '../pages/RewardPages/ViewRewards';
import ViewRewardDetail from '../pages/RewardPages/ViewRewardDetail';
import ViewRedemptionHistory from '../pages/RewardPages/ViewRedemptionHistory';
import RedeemReward from '../pages/RewardPages/RedeemReward';
import RewardRequestsLeader from '../pages/RewardPages/RewardRequestsLeader';

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth Routes (no layout) */}
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* User Routes with Layout */}
      <Route element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="/clubs" element={<ListOfClubs />} />
        <Route path="/clubs/create" element={<CreateClub />} />
        <Route path="/events" element={<EventPublic />} />
        <Route path="/my-clubs" element={<ListOfMyClubs />} />
        <Route path="/club/:clubId/events" element={<Event />} />
        <Route path="/club/:clubId/events/:eventId" element={<EventDetail />} />
        <Route path="/my-notifications" element={<NotificationCenter />} />
        <Route path="/club/:clubId/rewards" element={<ViewRewards />} />
        <Route path="/club/:clubId/rewards/:rewardId" element={<ViewRewardDetail />} />
        <Route
          path="/club/:clubId/rewards/history"
          element={
            <ProtectedRoute>
              <ViewRedemptionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/:clubId/rewards/:rewardId/redeem"
          element={
            <ProtectedRoute>
              <RedeemReward />
            </ProtectedRoute>
          }
        />

        <Route path="/my-events" element={<MyEvent />} />
        {/* <Route path="/my-requests" element={<ViewJoinRequests />} /> */}

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
      </Route>

      {/* Trang CLB: leader có sidebar + ẩn nav nổi; thành viên chỉ nav nổi */}
      <Route element={<ClubAreaLayout />}>
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/clubs/:id/points-history" element={<PointsHistory />} />
        <Route path="/clubs/:id/leaderboard" element={<ClubLeaderboard />} />
        <Route path="/clubs/:id/badges" element={<ClubBadges />} />
        <Route path="/clubs/:id/point-rules" element={<PointRules />} />
      </Route>

      {/* Dashboard/Club Routes with MainLayout (includes Sidebar) */}
      <Route element={<LeaderLayout />}>
        <Route path="/clubs/:id/dashboard" element={<DashboardLeaderClub />} />
        <Route path="/clubs/:id/transactions" element={<ClubTransactions />} />
        <Route path="/dashboard/:clubId" element={<DashboardLeaderClub />} />
        <Route path="/clubs/:id/events/:eventId/attendance" element={<EventAttendanceList />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/events/:eventId/update" element={<UpdateEventPage />} />

        <Route path="/clubs/:clubId/rewards/requests" element={<RewardRequestsLeader />} />

        <Route path="/clubEvent" element={<EventsPage />} />
        <Route path="/clubEvent/create" element={<CreateEventPage />} />
        <Route path="/clubEvent/:eventId" element={<EventDetailPage />} />
        <Route path="/clubEvent/:eventId/update" element={<UpdateEventPage />} />

        <Route path="/events" element={<Navigate to="/clubEvent" replace />} />

        <Route path="/memberships" element={<MembershipsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/clubs/:clubId/finance"
          element={
            <ProtectedRoute>
              <FinancialDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes with ProtectedRoute */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="clubs-request" element={<ClubRequests />} />
        <Route path="club-request-detail/:id" element={<ClubRequestDetail />} />
        <Route path="list-clubs" element={<ClubList />} />
        <Route path="club-detail/:id" element={<ClubDetailAdmin />} />
        <Route path="club-members/:id" element={<ClubMembers />} />
        <Route path="rewards" element={<RewardsAdmin />} />
        <Route path="rewards/:rewardId" element={<RewardDetailAdmin />} />
        <Route path="reward-history" element={<RedemptionHistoryAdmin />} />
        <Route path="reward-point-logs" element={<RewardPointLogs />} />
        <Route path="badges" element={<BadgesAdmin />} />
        <Route path="badges/:badgeId" element={<BadgeDetailAdmin />} />
        <Route path="announcements" element={<AdminNotifications />} />
        <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
