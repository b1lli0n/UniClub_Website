const PROFILE_KEY = "uniclub_profile";
const REG_KEY = "uniclub_event_registrations";
const FEEDBACK_KEY = "uniclub_event_feedback";
const CHECKIN_KEY = "uniclub_event_checkins";

const DEFAULT_PROFILE = {
  fullName: "Nguyễn Văn A",
  phone: "0123456789",
  email: "example@gmail.com",
};

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getProfile() {
  const parsed = safeParse(localStorage.getItem(PROFILE_KEY), null);
  return {
    fullName: parsed?.fullName ?? DEFAULT_PROFILE.fullName,
    phone: parsed?.phone ?? DEFAULT_PROFILE.phone,
    email: parsed?.email ?? DEFAULT_PROFILE.email,
  };
}

export function setProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getRegistrationsMap() {
  return safeParse(localStorage.getItem(REG_KEY), {});
}

export function isRegistered(eventId) {
  if (!eventId) return false;
  const regs = getRegistrationsMap();
  return Boolean(regs?.[eventId]);
}

export function registerEvent(eventId) {
  if (!eventId) return;
  const regs = getRegistrationsMap();
  regs[eventId] = { registeredAt: new Date().toISOString() };
  localStorage.setItem(REG_KEY, JSON.stringify(regs));
}

export function cancelRegistration(eventId) {
  if (!eventId) return;
  const regs = getRegistrationsMap();
  if (regs?.[eventId]) delete regs[eventId];
  localStorage.setItem(REG_KEY, JSON.stringify(regs));
}

export function getFeedbackMap() {
  return safeParse(localStorage.getItem(FEEDBACK_KEY), {});
}

export function getFeedbackList(eventId) {
  const map = getFeedbackMap();
  const list = map?.[eventId];
  return Array.isArray(list) ? list : [];
}

export function addFeedback(eventId, feedback) {
  if (!eventId) return;
  const map = getFeedbackMap();
  const list = Array.isArray(map[eventId]) ? map[eventId] : [];
  list.unshift(feedback);
  map[eventId] = list;
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
}

export function getCheckinMap() {
  return safeParse(localStorage.getItem(CHECKIN_KEY), {});
}

export function isCheckedIn(eventId) {
  if (!eventId) return false;
  const checkins = getCheckinMap();
  return Boolean(checkins?.[eventId]);
}

export function getCheckinTime(eventId) {
  if (!eventId) return null;
  const checkins = getCheckinMap();
  return checkins?.[eventId]?.checkedInAt || null;
}

export function checkInEvent(eventId) {
  if (!eventId) return;
  const checkins = getCheckinMap();
  checkins[eventId] = { checkedInAt: new Date().toISOString() };
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins));
}

