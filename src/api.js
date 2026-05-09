// api.js — Drop this in your frontend /src/api.js
// Handles all communication between the React mini app and the backend

const BASE_URL = import.meta.env.VITE_API_URL || "https://your-backend.railway.app";

/**
 * Gets the Telegram initData string for auth headers.
 * In production this comes from Telegram.WebApp.initData
 */
function getInitData() {
  try {
    return window.Telegram?.WebApp?.initData || "";
  } catch {
    return "";
  }
}

/**
 * Base fetch wrapper — attaches Telegram auth header automatically
 */
async function apiFetch(path, options = {}) {
  const initData = getInitData();
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-init-data": initData,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── USER ────────────────────────────────────────────────────────

/**
 * Called on app open — registers or fetches user, handles referral
 * @param {string} ref - referral code from Telegram start param
 */
export const initUser = (ref = "") =>
  apiFetch("/user/init", { method: "POST", body: JSON.stringify({ ref }) });

/** Get fresh profile + balance */
export const getMe = () => apiFetch("/user/me");

/** Get referral history */
export const getReferrals = () => apiFetch("/user/referrals");

// ─── ADS ────────────────────────────────────────────────────────

/**
 * Call this AFTER AdsGram confirms ad completion on the frontend.
 * The backend credits the reward server-side.
 */
export const submitAdWatch = () =>
  apiFetch("/user/watch-ad", { method: "POST" });

// ─── WITHDRAWALS ────────────────────────────────────────────────

/**
 * Submit withdrawal request
 * @param {number} amount
 * @param {string} method - "bank" | "airtime" | "btc" | "usdt"
 * @param {object} details - payment info object
 *
 * Bank details:    { bank_name, account_number, account_name }
 * Airtime details: { network, phone }
 * Crypto details:  { address }
 */
export const requestWithdrawal = (amount, method, details) =>
  apiFetch("/withdraw/request", {
    method: "POST",
    body: JSON.stringify({ amount, method, details }),
  });

/** Get withdrawal history for current user */
export const getWithdrawalHistory = () => apiFetch("/withdraw/history");

// ─── ADMIN ──────────────────────────────────────────────────────

export const getAdminStats       = () => apiFetch("/admin/stats");
export const getAdminUsers       = () => apiFetch("/admin/users");
export const getAdminWithdrawals = (status = "all") => apiFetch(`/admin/withdrawals?status=${status}`);
export const getAdminSettings    = () => apiFetch("/admin/settings");

export const blockUser     = (id) => apiFetch(`/admin/users/${id}/block`,    { method: "POST" });
export const unblockUser   = (id) => apiFetch(`/admin/users/${id}/unblock`,  { method: "POST" });
export const flagUser      = (id) => apiFetch(`/admin/users/${id}/flag`,     { method: "POST" });

export const approveWithdrawal = (id)        => apiFetch(`/admin/withdrawals/${id}/approve`, { method: "POST" });
export const rejectWithdrawal  = (id, note)  => apiFetch(`/admin/withdrawals/${id}/reject`,  { method: "POST", body: JSON.stringify({ note }) });
export const markPaid          = (id)        => apiFetch(`/admin/withdrawals/${id}/paid`,    { method: "POST" });

export const updateSetting = (key, value) =>
  apiFetch("/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) });

export const broadcastMessage = (message) =>
  apiFetch("/admin/broadcast", { method: "POST", body: JSON.stringify({ message }) });
