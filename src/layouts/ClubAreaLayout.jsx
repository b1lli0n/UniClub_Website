import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SidebarNav } from '../components/navbar/SidebarNav';
import { getClubById } from '../api/clubApi';
import { getUserClubs } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ClubAreaLayout.css';

/** Role mapping: Member (0), Leader (1), Sub Leader (2), Secretary (3), Treasurer (4). */
/** Ban quản lý chỉ gồm role 1..4. */
const isManagementRole = (role) =>
  typeof role === 'number' && role >= 1 && role <= 4;

const isMemberRole = (role) =>
  typeof role === 'number' && role >= 0 && role <= 4;

async function resolveManagementForClub(clubId, user) {
  const clubRes = await getClubById(clubId);
  const club = clubRes?.success ? clubRes.data : clubRes?.data;
  let role = club?.membershipRole ?? club?.role ?? club?.my_role;
  let isMember = false;

  const fromApiMember = club?.isMember ?? club?.is_member;
  if (typeof fromApiMember === 'boolean') {
    isMember = fromApiMember;
  }

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
          isMember = true;
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (!isMember && isMemberRole(role)) {
    isMember = true;
  }

  return {
    isLeader: isManagementRole(role),
    isMember,
  };
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
  const [clubAccess, setClubAccess] = useState({
    loading: true,
    isLeader: false,
    isMember: false,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!clubId) {
        setClubAccess({ loading: false, isLeader: false, isMember: false });
        return;
      }
      setClubAccess((prev) => ({ ...prev, loading: true }));
      try {
        const access = await resolveManagementForClub(clubId, user);
        if (!cancelled) {
          setClubAccess({
            loading: false,
            isLeader: access?.isLeader === true,
            isMember: access?.isMember === true,
          });
        }
      } catch {
        if (!cancelled) {
          setClubAccess({ loading: false, isLeader: false, isMember: false });
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [clubId, user]);

  const { loading, isLeader, isMember } = clubAccess;

  const outletContext = {
    showFloatingNav: isLeader !== true,
    clubAreaIsLeader: isLeader === true,
    clubAreaIsMember: isMember === true,
  };

  if (loading) {
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
