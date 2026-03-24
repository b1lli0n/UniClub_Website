import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SidebarNav } from '../components/navbar/SidebarNav';
import { getClubById } from '../api/clubApi';
import { getUserClubs } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ClubAreaLayout.css';

/** Ban quản lý: Leader (1), Sub Leader (2), Secretary (3), Treasurer (4) — giống ClubDetailCard */
const isManagementRole = (role) =>
  typeof role === 'number' && role > 0 && role <= 4;

async function resolveManagementForClub(clubId, user) {
  const clubRes = await getClubById(clubId);
  const club = clubRes?.success ? clubRes.data : clubRes?.data;
  let role = club?.membershipRole ?? club?.role ?? club?.my_role;

  if (typeof role !== 'number' && user) {
    const userId = user._id || user.id;
    if (userId) {
      try {
        const userClubsRes = await getUserClubs(userId);
        const memberships =
          userClubsRes?.data?.clubs ||
          userClubsRes?.data ||
          userClubsRes?.clubs ||
          userClubsRes ||
          [];
        const arr = Array.isArray(memberships) ? memberships : [];
        const m = arr.find((mem) => {
          const cid =
            mem?.club_id?._id ||
            mem?.club_id?.id ||
            mem?.club?._id ||
            mem?.club?.id;
          return String(cid) === String(clubId);
        });
        if (m) {
          role = m.role ?? m.membershipRole ?? m.membership_role;
        }
      } catch {
        /* ignore */
      }
    }
  }

  return isManagementRole(role);
}

/**
 * Layout cho các trang trong phạm vi CLB (chi tiết, BXH, quy tắc, …).
 * - Ban quản lý: sidebar trái + ẩn floating ClubDetailNav.
 * - Thành viên / khách: giống UserLayout + chỉ hiện floating nav.
 */
const ClubAreaLayout = () => {
  const params = useParams();
  const location = useLocation();
  const clubId =
    params.id ??
    params.clubId ??
    (location.pathname.match(/^\/clubs\/([^/]+)/)?.[1] ?? null);
  const { user } = useAuth();
  const [isLeader, setIsLeader] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!clubId) {
        setIsLeader(false);
        return;
      }
      setIsLeader(null);
      try {
        const leader = await resolveManagementForClub(clubId, user);
        if (!cancelled) setIsLeader(leader);
      } catch {
        if (!cancelled) setIsLeader(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [clubId, user]);

  const outletContext = {
    showFloatingNav: isLeader !== true,
    clubAreaIsLeader: isLeader === true,
  };

  if (isLeader === null) {
    return (
      <>
        <Header />
        <main className="club-area-loading-main main-layout-with-header">
          <div className="club-area-loading-inner">Đang tải...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (isLeader) {
    return (
      <div className="main-layout main-layout-with-header">
        <Header />
        <div className="main-layout-body">
          <SidebarNav />
          <main className="main-layout-content">
            <Outlet context={outletContext} />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

    return (
      <>
        <Header />
        <main className="main-layout-with-header">
          <Outlet context={outletContext} />
        </main>
        <Footer />
      </>
    );
};

export default ClubAreaLayout;
