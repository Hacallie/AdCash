import { useState, useEffect, useCallback } from "react";

// ─── ADMIN IDs ────────────────────────────────────────────────────
const ADMIN_IDS = ["7952834563", "8768003798"];

// ─── MONETAG 50/50 RANDOM AD ─────────────────────────────────────
// Your zone:    10986697 → show_10986697()
// Client zone:  10986665 → show_10986665()
// On each click, randomly pick one (50/50)
// The .then() callback is where Monetag triggers the reward

const showRandomMonetag = (onReward) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryShow = () => {
      const useYourZone = Math.random() < 0.5;
      const primaryFn = useYourZone
        ? window.show_10986697
        : window.show_10986665;
      const fallbackFn = useYourZone
        ? window.show_10986665
        : window.show_10986697;

      if (typeof primaryFn === "function") {
        primaryFn()
          .then(() => {
            // This is where Monetag confirms ad was watched
            // Replace alert with our reward function
            onReward();
            resolve();
          })
          .catch((err) => reject(err));

      } else if (typeof fallbackFn === "function") {
        fallbackFn()
          .then(() => {
            onReward();
            resolve();
          })
          .catch((err) => reject(err));

      } else if (attempts < 10) {
        // SDK still loading — retry every 500ms
        attempts++;
        setTimeout(tryShow, 500);
      } else {
        reject(new Error("Monetag SDK not loaded. Please refresh."));
      }
    };

    tryShow();
  });
};

// ─── API ──────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "https://adcash-backend-z7o6.onrender.com";

function getInitData() {
  try { return window.Telegram?.WebApp?.initData || ""; } catch { return ""; }
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-init-data": getInitData(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

const apiInitUser = (ref = "") => api("/user/init", { method: "POST", body: JSON.stringify({ ref }) });
const apiWatchAd = () => api("/user/watch-ad", { method: "POST" });
const apiCompleteTask = (taskId) => api("/user/complete-task", { method: "POST", body: JSON.stringify({ taskId }) });
const apiGetMe = () => api("/user/me");
const apiRequestWithdrawal = (amount, method, details) => api("/withdraw/request", { method: "POST", body: JSON.stringify({ amount, method, details }) });
const apiGetWithdrawalHistory = () => api("/withdraw/history");
const apiGetAdminStats = () => api("/admin/stats");
const apiGetAdminUsers = () => api("/admin/users");
const apiGetAdminWithdrawals = (status = "all") => api(`/admin/withdrawals?status=${status}`);
const apiBlockUser = (id) => api(`/admin/users/${id}/block`, { method: "POST" });
const apiUnblockUser = (id) => api(`/admin/users/${id}/unblock`, { method: "POST" });
const apiFlagUser = (id) => api(`/admin/users/${id}/flag`, { method: "POST" });
const apiApproveWithdrawal = (id) => api(`/admin/withdrawals/${id}/approve`, { method: "POST" });
const apiRejectWithdrawal = (id, note) => api(`/admin/withdrawals/${id}/reject`, { method: "POST", body: JSON.stringify({ note }) });
const apiMarkPaid = (id) => api(`/admin/withdrawals/${id}/paid`, { method: "POST" });
const apiGetAdLinks = () => api("/admin/ad-links");
const apiAddAdLink = (url) => api("/admin/ad-links", { method: "POST", body: JSON.stringify({ url }) });
const apiDeleteAdLink = (id) => api(`/admin/ad-links/${id}`, { method: "DELETE" });
const apiGetSettings = () => api("/admin/settings");
const apiUpdateSetting = (key, value) => api("/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) });
const apiBroadcast = (message) => api("/admin/broadcast", { method: "POST", body: JSON.stringify({ message }) });

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  bg: "#F5F6FA", white: "#FFFFFF", surface: "#F0F2F8",
  card: "#FFFFFF", border: "#E4E8F0", borderDark: "#D0D6E4",
  black: "#0A0C10", blackSoft: "#1A1D26", blackMid: "#2E3240",
  text: "#0A0C10", textMuted: "#6B7280", textDim: "#9CA3AF",
  green: "#16A34A", greenBg: "#F0FDF4", red: "#DC2626", redBg: "#FEF2F2",
  blue: "#2563EB", blueBg: "#EFF6FF", yellow: "#D97706", yellowBg: "#FFFBEB",
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${C.bg}; color: ${C.text}; min-height: 100vh; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.borderDark}; border-radius: 4px; }
    .mono { font-family: 'DM Mono', monospace; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pop { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(10,12,16,0.15); } 70% { box-shadow: 0 0 0 10px rgba(10,12,16,0); } 100% { box-shadow: 0 0 0 0 rgba(10,12,16,0); } }
    .fade-up { animation: fadeUp 0.35s ease forwards; }
    .pop { animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .btn-black { background: ${C.black}; color: #fff; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.2s ease; }
    .btn-black:hover { background: ${C.blackMid}; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .btn-black:active { transform: translateY(0); }
    .btn-outline { background: transparent; color: ${C.text}; border: 1.5px solid ${C.border}; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s; }
    .btn-outline:hover { border-color: ${C.blackMid}; background: ${C.surface}; }
    .card { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 18px; }
    .progress-bar { height: 5px; background: ${C.surface}; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: ${C.black}; border-radius: 3px; transition: width 0.8s ease; }
    input, select, textarea { background: ${C.surface}; border: 1.5px solid ${C.border}; border-radius: 12px; color: ${C.text}; padding: 13px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    input:focus, select:focus { border-color: ${C.black}; box-shadow: 0 0 0 3px rgba(10,12,16,0.06); background: ${C.white}; }
    input::placeholder { color: ${C.textDim}; }
    .stat-mini { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; }
    .method-btn { background: ${C.white}; border: 1.5px solid ${C.border}; border-radius: 14px; padding: 14px 10px; cursor: pointer; text-align: center; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
    .method-btn:hover { border-color: ${C.blackMid}; background: ${C.surface}; }
    .method-btn.active { background: ${C.black}; border-color: ${C.black}; color: #fff; }
    .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .tag-pending { background: ${C.yellowBg}; color: ${C.yellow}; }
    .tag-approved { background: ${C.greenBg}; color: ${C.green}; }
    .tag-paid { background: ${C.blueBg}; color: ${C.blue}; }
    .tag-rejected { background: ${C.redBg}; color: ${C.red}; }
    .tag-active { background: ${C.greenBg}; color: ${C.green}; }
    .tag-blocked { background: ${C.redBg}; color: ${C.red}; }
    select option { background: #fff; color: ${C.text}; }
    .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px 12px; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; color: ${C.textDim}; transition: color 0.2s; letter-spacing: 0.02em; }
    .nav-btn.active { color: ${C.black}; }
    .admin-nav-btn { flex: 1; min-width: 72px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 12px 8px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; color: ${C.textMuted}; transition: all 0.2s; }
    .admin-nav-btn.active { color: ${C.black}; border-bottom-color: ${C.black}; }
    .row-action { padding: 8px 14px; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; border: 1.5px solid transparent; }
    .spinner { width: 22px; height: 22px; border: 2.5px solid ${C.borderDark}; border-top-color: ${C.black}; border-radius: 50%; animation: spin 0.7s linear infinite; }
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    play: <><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill={color} stroke="none"/></>,
    check: <polyline points="20,6 9,17 4,12"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    withdraw: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h.01M11 15h2"/></>,
    invite: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    task: <><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    trash: <><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── TAG ─────────────────────────────────────────────────────────
const Tag = ({ status }) => (
  <span className={`tag tag-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
);

// ─── TOP BAR ────────────────────────────────────────────────────
const TopBar = () => (
  <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: C.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>₳</span>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.03em", color: C.black }}>ADS CASH</div>
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Nigeria's #1 Earning Bot</div>
      </div>
    </div>
    <a href="https://t.me/eesha10" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: C.textMuted, textDecoration: "none", fontWeight: 600 }}>
      🎧 Support
    </a>
  </div>
);

// ─── BALANCE CARD ────────────────────────────────────────────────
const BalanceCard = ({ user }) => (
  <div style={{ background: C.black, borderRadius: 22, padding: "24px 22px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>TOTAL BALANCE</div>
        <div className="mono" style={{ fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1 }}>${(user.balance || 0).toFixed(3)}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Available to withdraw</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", marginLeft: "auto", marginBottom: 6 }}>
          {(user.name || "U")[0]}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{user.name || "User"}</div>
        <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>ID: {user.id}</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {[["📺", "Watch Ads"], ["✓", "Tasks"], ["👥", "Referrals"]].map(([em, label]) => (
        <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 14, marginBottom: 2 }}>{em}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── ADS TAB ────────────────────────────────────────────────────
const AdsTab = ({ user, onBalanceUpdate }) => {
  const [adState, setAdState] = useState("ready");
  const [adsToday, setAdsToday] = useState(user.adsToday || 0);
  const [totalWatched, setTotalWatched] = useState(user.totalWatched || 0);
  const [totalEarned, setTotalEarned] = useState(user.totalEarned || 0);
  const [errorMsg, setErrorMsg] = useState("");
  const MAX = 20;

  const watchAd = async () => {
    if (adsToday >= MAX || adState !== "ready") return;
    setAdState("loading");
    setErrorMsg("");
    try {
      // Show random Monetag ad (50/50 between your zone and client zone)
      // onReward callback fires when Monetag confirms ad was fully watched
      await showRandomMonetag(async () => {
        // This replaces alert('You have seen an ad!')
        // Credit reward via backend
        const result = await apiWatchAd();
        setAdsToday(result.adsToday);
        setTotalWatched(result.totalWatched);
        setTotalEarned(prev => +(prev + result.earned).toFixed(3));
        onBalanceUpdate(result.newBalance);
      });
      setAdState("complete");
      setTimeout(() => setAdState("ready"), 2500);
    } catch (err) {
      setAdState("error");
      setErrorMsg("Watch the full ad to earn your reward!");
      setTimeout(() => { setAdState("ready"); setErrorMsg(""); }, 3000);
    }
  };

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Watch Ads & Earn</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
          Earn <strong style={{ color: C.black }}>$0.016</strong> per ad · Up to {MAX} ads/day
        </div>

        <div onClick={watchAd} style={{
          border: `1.5px solid ${adState === "complete" ? C.green : adState === "error" ? C.red : C.border}`,
          borderRadius: 16, padding: 18,
          background: adState === "complete" ? C.greenBg : adState === "error" ? C.redBg : C.surface,
          cursor: adsToday >= MAX ? "not-allowed" : "pointer",
          transition: "all 0.3s", marginBottom: 14, userSelect: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: adState === "complete" ? C.green : adState === "error" ? C.red : C.black,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s",
              animation: adState === "ready" && adsToday < MAX ? "pulse-ring 2s infinite" : "none",
            }}>
              {adState === "loading" ? <div className="spinner" />
                : adState === "complete" ? <Icon name="check" size={24} color="#fff" />
                : adState === "error" ? <Icon name="x" size={24} color="#fff" />
                : <Icon name="play" size={24} color="#fff" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                {adState === "loading" ? "Opening Ad... Reward auto-claims in 5s"
                  : adState === "complete" ? "Reward Claimed! 🎉"
                  : adState === "error" ? "Try Again"
                  : "Watch Ad"}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {adState === "complete" ? "+$0.016 added to your balance"
                  : adState === "error" ? errorMsg
                  : adState === "loading" ? "Please watch the full ad to earn"
                  : "Tap to watch a short ad and earn instantly"}
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(adsToday / MAX) * 100}%` }} />
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>{adsToday} / {MAX} ads today</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.black, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 11px", flexShrink: 0 }}>+$0.016</div>
          </div>
        </div>

        {adsToday >= MAX && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: "#C2410C", display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <Icon name="alert" size={14} color="#C2410C" /> Daily limit reached — come back tomorrow!
          </div>
        )}

        <div style={{ marginTop: 4, padding: "10px 14px", background: "#FFF7ED", borderRadius: 12, border: "1px solid #FED7AA", fontSize: 12, color: "#92400E", display: "flex", gap: 8 }}>
          <Icon name="alert" size={13} color="#D97706" />
          <span><strong>Important:</strong> Watch at least 1 ad every 72 hours or your balance resets!</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["TOTAL WATCHED", `${totalWatched}`, "ads", "📺"], ["TOTAL EARNED", `$${totalEarned.toFixed(3)}`, "from ads", "💰"]].map(([label, val, sub, em]) => (
          <div key={label} className="stat-mini">
            <div style={{ fontSize: 20, marginBottom: 8 }}>{em}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: C.black }}>{val}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, marginTop: 6, letterSpacing: "0.08em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Adsterra Banner */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `atOptions = {'key':'8d565cfb819cc484c50e6d4aed5c2ba1','format':'iframe','height':60,'width':468,'params':{}};`
          }}
        />
        <script src="https://www.highperformanceformat.com/8d565cfb819cc484c50e6d4aed5c2ba1/invoke.js" />
      </div>
    </div>
  );
};

// ─── TASKS TAB ────────────────────────────────────────────────────
const TasksTab = ({ user, onBalanceUpdate }) => {
  const [tasks, setTasks] = useState([
    { id: "join_channel", icon: "📢", title: "Join @adscash00", desc: "Official channel", reward: 0.018, done: false, link: "https://t.me/adscash00" },
    { id: "start_bot", icon: "🤖", title: "Start @AdsCashNaijaBot", desc: "Auto-claimed on join", reward: 0.018, done: false, link: "https://t.me/AdsCashNaijaBot" },
    { id: "join_community", icon: "👥", title: "Join Community", desc: "Telegram community group", reward: 0.030, done: false, link: "https://t.me/adscash00" },
  ]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // Mark start_bot as done automatically since user is already using the bot
    setTasks(prev => prev.map(t => t.id === "start_bot" ? { ...t, done: true } : t));
    // Sync with backend task completions
    if (user.completedTasks) {
      setTasks(prev => prev.map(t => ({ ...t, done: user.completedTasks.includes(t.id) })));
    }
  }, [user]);

  const claimTask = async (task) => {
    if (task.done || loading) return;
    setLoading(task.id);
    window.open(task.link, "_blank");

    // Auto-claim after 3 seconds
    setTimeout(async () => {
      try {
        const result = await apiCompleteTask(task.id);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: true } : t));
        onBalanceUpdate(result.newBalance);
      } catch (err) {
        // Task already completed or error
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: true } : t));
      }
      setLoading(null);
    }, 3000);
  };

  return (
    <div className="fade-up">
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Complete Tasks</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 18 }}>One-time bonus rewards — auto-claimed on completion</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ background: t.done ? C.greenBg : C.surface, border: `1px solid ${t.done ? "#BBF7D0" : C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: t.done ? 0 : 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: t.done ? C.green : C.white, border: `1px solid ${t.done ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {t.done ? <Icon name="check" size={18} color="#fff" /> : loading === t.id ? <div className="spinner" style={{ width: 18, height: 18 }} /> : t.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{t.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.done ? C.green : C.black }}>+${t.reward.toFixed(3)}</div>
                  {!t.done && (
                    <div onClick={() => claimTask(t)} style={{ marginTop: 4, padding: "4px 12px", borderRadius: 20, background: C.black, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                      {loading === t.id ? "Opening..." : "Claim"}
                    </div>
                  )}
                  {t.done && <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 4 }}>✓ Done</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── INVITE TAB ────────────────────────────────────────────────────
const InviteTab = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = user.referralCode || `AC${user.id}`;
  const link = `https://t.me/AdsCashNaijaBot?start=${referralCode}`;

  const copy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: 15, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="invite" size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Invite & Earn</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>Earn <strong style={{ color: C.black }}>$0.018</strong> after your friend watches 10 ads</div>
          </div>
        </div>

        <div style={{ background: C.yellowBg, border: "1px solid #FED7AA", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#92400E", marginBottom: 16, display: "flex", gap: 8 }}>
          <Icon name="alert" size={13} color="#D97706" />
          <span>You must watch at least <strong>15 ads</strong> before your referrals are counted</span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.textDim, marginBottom: 8 }}>YOUR INVITE LINK</div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div className="mono" style={{ fontSize: 11, color: C.blue, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</div>
          <button className="btn-black" onClick={copy} style={{ borderRadius: 9, padding: "8px 16px", fontSize: 12, display: "flex", gap: 6, alignItems: "center", whiteSpace: "nowrap", flexShrink: 0 }}>
            <Icon name="copy" size={13} color="#fff" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button className="btn-outline" onClick={() => {
          if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join ADS CASH and earn real money watching ads! 🤑")}`);
          } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join ADS CASH and earn real money watching ads! 🤑")}`, "_blank");
          }
        }} style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          <Icon name="share" size={16} color={C.black} /> Share with Friends
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["FRIENDS INVITED", user.totalReferrals || 0, "👥"], ["INVITE EARNINGS", `$${((user.totalReferrals || 0) * 0.018).toFixed(3)}`, "💸"]].map(([label, val, em]) => (
          <div key={label} className="stat-mini" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{em}</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: C.black }}>{val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, marginTop: 6, letterSpacing: "0.08em" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>How Referrals Work</div>
        {[
          ["1", "You must watch 15+ ads first"],
          ["2", "Share your unique invite link"],
          ["3", "Friend joins via your link"],
          ["4", "After they watch 10 ads → you earn $0.018"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: n !== "4" ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── WITHDRAW TAB ────────────────────────────────────────────────
const WithdrawTab = ({ user, onBalanceUpdate }) => {
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    apiGetWithdrawalHistory().then(r => setHistory(r.history || [])).catch(() => {});
  }, [submitted]);

  const methods = [
    { id: "bank", label: "Bank Transfer", icon: "🏦" },
    { id: "airtime", label: "Airtime/Data", icon: "📱" },
    { id: "btc", label: "Bitcoin", icon: "₿" },
    { id: "usdt", label: "USDT TRC20", icon: "💎" },
  ];

  const handleSubmit = async () => {
    setError("");
    if (!amount || parseFloat(amount) < 5) { setError("Minimum withdrawal is $5.00"); return; }
    if (parseFloat(amount) > (user.balance || 0)) { setError("Insufficient balance"); return; }
    setLoading(true);
    try {
      await apiRequestWithdrawal(parseFloat(amount), method, details);
      setSubmitted(true);
      onBalanceUpdate((user.balance || 0) - parseFloat(amount));
    } catch (err) {
      setError(err.message || "Failed to submit withdrawal");
    }
    setLoading(false);
  };

  if (submitted) return (
    <div className="fade-up card pop" style={{ padding: 40, textAlign: "center", marginTop: 20 }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.greenBg, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Icon name="check" size={30} color={C.green} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Request Submitted!</div>
      <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 28 }}>Admin will process within 24–48 hours. You'll get a Telegram notification when done.</div>
      <button className="btn-outline" onClick={() => { setSubmitted(false); setAmount(""); setDetails({}); }} style={{ padding: "12px 28px", borderRadius: 12, fontFamily: "DM Sans", fontSize: 14 }}>New Request</button>
    </div>
  );

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Withdraw Earnings</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>PAYMENT METHOD</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {methods.map(m => (
            <button key={m.id} className={`method-btn${method === m.id ? " active" : ""}`} onClick={() => setMethod(m.id)}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 8 }}>AMOUNT (USD)</div>
          <input type="number" placeholder="Min $5.00" value={amount} onChange={e => setAmount(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginTop: 6 }}>
            <span>Balance: <strong className="mono">${(user.balance || 0).toFixed(3)}</strong></span>
            <span>Min: $5.00</span>
          </div>
        </div>

        {method === "bank" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
            {[["BANK NAME", "bank_name", "e.g. GTBank, Access Bank"], ["ACCOUNT NUMBER", "account_number", "10-digit account number"], ["ACCOUNT NAME", "account_name", "Full name on account"]].map(([label, key, placeholder]) => (
              <div key={key}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                <input placeholder={placeholder} onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}
        {method === "airtime" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>NETWORK</div>
              <select onChange={e => setDetails(d => ({ ...d, network: e.target.value }))}>
                <option>MTN</option><option>Airtel</option><option>Glo</option><option>9mobile</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>PHONE NUMBER</div>
              <input placeholder="e.g. 08012345678" onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} />
            </div>
          </div>
        )}
        {(method === "btc" || method === "usdt") && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>WALLET ADDRESS</div>
            <input placeholder={method === "btc" ? "bc1q…" : "TXyz… (TRC20 only)"} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} />
          </div>
        )}

        {error && <div style={{ background: C.redBg, border: `1px solid #FECACA`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.red, marginTop: 10 }}>{error}</div>}

        <div style={{ height: 16 }} />
        <button className="btn-black" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 15, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
          {loading ? <div className="spinner" /> : <><Icon name="send" size={16} color="#fff" /> Submit Withdrawal Request</>}
        </button>
      </div>

      {history.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Withdrawal History</div>
          {history.slice(0, 5).map(w => (
            <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.method.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{new Date(w.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>${w.amount.toFixed(2)}</div>
                <Tag status={w.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>📋 Requirements</div>
        {[["Minimum amount", "$5.00"], ["Processing time", "24–48 hours"], ["Activity rule", "1 ad per 72 hours"], ["Max daily ads", "20 ads/day"]].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>{k}</span>
            <span style={{ fontWeight: 600, color: C.black }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── USER APP ────────────────────────────────────────────────────
const UserApp = ({ user: initialUser, isAdmin, onGoAdmin }) => {
  const [tab, setTab] = useState("ads");
  const [user, setUser] = useState(initialUser);

  const onBalanceUpdate = (newBalance) => {
    setUser(u => ({ ...u, balance: newBalance }));
  };

  const navItems = [
    { id: "ads", label: "Ads", icon: "play" },
    { id: "tasks", label: "Tasks", icon: "task" },
    { id: "invite", label: "Invite", icon: "invite" },
    { id: "withdraw", label: "Withdraw", icon: "withdraw" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ flex: 1, padding: "16px 16px 90px", overflowY: "auto" }}>
        <BalanceCard user={user} />
        {tab === "ads" && <AdsTab user={user} onBalanceUpdate={onBalanceUpdate} />}
        {tab === "tasks" && <TasksTab user={user} onBalanceUpdate={onBalanceUpdate} />}
        {tab === "invite" && <InviteTab user={user} />}
        {tab === "withdraw" && <WithdrawTab user={user} onBalanceUpdate={onBalanceUpdate} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex" }}>
        {navItems.map(n => (
          <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            <Icon name={n.icon} size={20} color={tab === n.id ? C.black : C.textDim} />
            {n.label}
          </button>
        ))}
        {isAdmin && (
          <button onClick={onGoAdmin} className="nav-btn" style={{ color: C.red }}>
            <Icon name="shield" size={20} color={C.red} />
            Admin
          </button>
        )}
      </div>
    </div>
  );
};

// ─── ADMIN OVERVIEW ──────────────────────────────────────────────
const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [broadcast, setBroadcast] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    apiGetAdminStats().then(setStats).catch(() => {});
  }, []);

  const handleBroadcast = async () => {
    if (!broadcast.trim()) return;
    setSending(true);
    try {
      await apiBroadcast(broadcast);
      setSent(true);
      setBroadcast("");
      setTimeout(() => setSent(false), 3000);
    } catch (e) {}
    setSending(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["TOTAL USERS", stats?.totalUsers || 0, "users", C.blue],
          ["TOTAL PAID", `$${(stats?.totalPaid || 0).toFixed(2)}`, "", C.green],
          ["PENDING", `$${(stats?.totalPending || 0).toFixed(2)}`, "", C.yellow],
          ["ADS WATCHED", stats?.totalWatched || 0, "total", C.black],
        ].map(([label, val, sub, color]) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
            {sub && <div style={{ fontSize: 11, color: C.textMuted }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📢 Broadcast Message</div>
        <textarea placeholder="Type message to send to all users..." value={broadcast} onChange={e => setBroadcast(e.target.value)} style={{ height: 80, resize: "none", marginBottom: 10 }} />
        <button className="btn-black" onClick={handleBroadcast} disabled={sending} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontFamily: "DM Sans" }}>
          {sent ? "✅ Sent!" : sending ? "Sending..." : "Send Broadcast"}
        </button>
      </div>
    </div>
  );
};

// ─── ADMIN WITHDRAWALS ───────────────────────────────────────────
const AdminWithdrawals = () => {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGetAdminWithdrawals(filter).then(r => { setList(r.withdrawals || []); setLoading(false); }).catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const update = async (id, action, note) => {
    try {
      if (action === "approve") await apiApproveWithdrawal(id);
      else if (action === "reject") await apiRejectWithdrawal(id, note);
      else if (action === "paid") await apiMarkPaid(id);
      load();
    } catch (e) {}
  };

  const mi = { bank: "🏦", usdt: "💎", btc: "₿", airtime: "📱" };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {["all", "pending", "approved", "paid", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans", whiteSpace: "nowrap", background: filter === f ? C.black : C.white, color: filter === f ? "#fff" : C.textMuted, border: `1px solid ${filter === f ? C.black : C.border}` }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(w => {
            let details = {};
            try { details = JSON.parse(w.details); } catch {}
            return (
              <div key={w.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{w.first_name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>@{w.username || "no_username"} · {new Date(w.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>${w.amount.toFixed(2)}</div>
                    <Tag status={w.status} />
                  </div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{mi[w.method]} {w.method.toUpperCase()} · Payment Details</div>
                  {w.method === "bank" && <div style={{ fontSize: 12 }}><strong>{details.bank_name}</strong> · {details.account_number} · {details.account_name}</div>}
                  {w.method === "airtime" && <div style={{ fontSize: 12 }}><strong>{details.network}</strong> · {details.phone}</div>}
                  {(w.method === "btc" || w.method === "usdt") && <div className="mono" style={{ fontSize: 11, wordBreak: "break-all" }}>{details.address}</div>}
                </div>
                {w.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="row-action" onClick={() => update(w.id, "approve")} style={{ flex: 1, background: C.greenBg, color: C.green, border: `1px solid #BBF7D0` }}>✓ Approve</button>
                    <button className="row-action" onClick={() => update(w.id, "reject")} style={{ flex: 1, background: C.redBg, color: C.red, border: `1px solid #FECACA` }}>✗ Reject</button>
                  </div>
                )}
                {w.status === "approved" && (
                  <button className="row-action" onClick={() => update(w.id, "paid")} style={{ width: "100%", background: C.blueBg, color: C.blue, border: `1px solid #BFDBFE` }}>💳 Mark as Paid</button>
                )}
              </div>
            );
          })}
          {list.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>No {filter} withdrawals</div>}
        </div>
      )}
    </div>
  );
};

// ─── ADMIN USERS ─────────────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAdminUsers().then(r => { setUsers(r.users || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleBlock = async (u) => {
    try {
      if (u.is_blocked) await apiUnblockUser(u.id);
      else await apiBlockUser(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_blocked: !x.is_blocked } : x));
    } catch {}
  };

  const toggleFlag = async (u) => {
    try {
      await apiFlagUser(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_flagged: !x.is_flagged } : x));
    } catch {}
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {users.map(u => (
        <div key={u.id} className="card" style={{ padding: 16, border: `1px solid ${u.is_flagged ? "#FECACA" : C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{(u.first_name || "U")[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.first_name} {u.is_flagged ? "🚩" : ""}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>@{u.username || "no_username"} · ID: {u.id}</div>
              </div>
            </div>
            <Tag status={u.is_blocked ? "blocked" : "active"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["Balance", `$${(u.balance || 0).toFixed(2)}`], ["Referrals", u.total_referrals || 0], ["Ads", u.total_watched || 0]].map(([k, v]) => (
              <div key={k} style={{ background: C.surface, borderRadius: 10, padding: "9px", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="row-action" onClick={() => toggleBlock(u)} style={{ flex: 1, background: u.is_blocked ? C.greenBg : C.redBg, color: u.is_blocked ? C.green : C.red, border: `1px solid ${u.is_blocked ? "#BBF7D0" : "#FECACA"}` }}>
              {u.is_blocked ? "Unblock" : "Block"}
            </button>
            <button className="row-action" onClick={() => toggleFlag(u)} style={{ flex: 1, background: C.surface, color: u.is_flagged ? C.textMuted : C.yellow, border: `1px solid ${C.border}` }}>
              {u.is_flagged ? "Unflag" : "🚩 Flag"}
            </button>
          </div>
        </div>
      ))}
      {users.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>No users yet</div>}
    </div>
  );
};

// ─── ADMIN AD LINKS ──────────────────────────────────────────────
const AdminAdLinks = () => {
  const [links, setLinks] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    apiGetAdLinks().then(r => setLinks(r.links || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newUrl.trim()) return;
    setLoading(true);
    try {
      await apiAddAdLink(newUrl.trim());
      setNewUrl("");
      load();
    } catch {}
    setLoading(false);
  };

  const remove = async (id) => {
    try { await apiDeleteAdLink(id); load(); } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>➕ Add New Ad Link</div>
        <input placeholder="https://adsterra-link.com/..." value={newUrl} onChange={e => setNewUrl(e.target.value)} style={{ marginBottom: 10 }} />
        <button className="btn-black" onClick={add} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontFamily: "DM Sans" }}>
          {loading ? "Adding..." : "Add Link"}
        </button>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>Links are randomly shown to users. Add multiple for variety.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l, i) => (
          <div key={l.id || i} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="link" size={14} color={C.textMuted} />
            </div>
            <div className="mono" style={{ fontSize: 11, color: C.blue, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</div>
            <button onClick={() => remove(l.id)} style={{ background: C.redBg, border: `1px solid #FECACA`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
              <Icon name="trash" size={14} color={C.red} />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: C.textMuted, fontSize: 13 }}>
            No custom ad links yet. Default Adsterra links will be used.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ADMIN SETTINGS ──────────────────────────────────────────────
const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    apiGetSettings().then(s => setSettings(s)).catch(() => {});
  }, []);

  const save = async (key, value) => {
    setSaving(key);
    try {
      await apiUpdateSetting(key, value);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {}
    setSaving(null);
  };

  const fields = [
    { key: "reward_per_ad", label: "Reward Per Ad ($)", type: "number" },
    { key: "reward_per_referral", label: "Reward Per Referral ($)", type: "number" },
    { key: "max_ads_per_day", label: "Max Ads Per Day", type: "number" },
    { key: "min_withdrawal", label: "Min Withdrawal ($)", type: "number" },
    { key: "inactivity_hours", label: "Inactivity Reset (hours)", type: "number" },
    { key: "referral_min_ads_inviter", label: "Min Ads Inviter Must Watch", type: "number" },
    { key: "referral_min_ads_referred", label: "Min Ads Referred Must Watch", type: "number" },
    { key: "withdrawals_frozen", label: "Freeze Withdrawals (1=yes, 0=no)", type: "number" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {fields.map(f => (
        <div key={f.key} className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>{f.label}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input type={f.type} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} style={{ flex: 1 }} />
            <button className="btn-black" onClick={() => save(f.key, settings[f.key])} style={{ borderRadius: 10, padding: "0 16px", fontSize: 13, whiteSpace: "nowrap" }}>
              {saving === f.key ? "..." : saved === f.key ? "✅" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── ADMIN PANEL ─────────────────────────────────────────────────
const AdminPanel = ({ onGoUser }) => {
  const [tab, setTab] = useState("overview");
  const adminNav = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "withdrawals", label: "Payouts", icon: "withdraw" },
    { id: "users", label: "Users", icon: "users" },
    { id: "adlinks", label: "Ad Links", icon: "link" },
    { id: "settings", label: "Settings", icon: "chart" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: C.black, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>ADS CASH</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.12em" }}>ADMIN PANEL</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Live</span>
          </div>
          <button onClick={onGoUser} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 600 }}>
            ← User View
          </button>
        </div>
      </div>

      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", overflowX: "auto" }}>
        {adminNav.map(n => (
          <button key={n.id} className={`admin-nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            <Icon name={n.icon} size={16} color={tab === n.id ? C.black : C.textDim} />
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, paddingBottom: 40 }}>
        {tab === "overview" && <AdminOverview />}
        {tab === "withdrawals" && <AdminWithdrawals />}
        {tab === "users" && <AdminUsers />}
        {tab === "adlinks" && <AdminAdLinks />}
        {tab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
};

// ─── ROOT APP ────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("loading");
  const [telegramUser, setTelegramUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let tgUser = null;
    try {
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        tgUser = tg.initDataUnsafe.user;
        tg.ready();
        tg.expand();
      }
    } catch (_) {}

    // Fallback ONLY for browser preview — NOT in Telegram
    if (!tgUser) {
      tgUser = { id: 0, first_name: "User", username: "user" };
    }

    const userId = String(tgUser.id);
    const admin = ADMIN_IDS.includes(userId);
    setTelegramUser(tgUser);
    setIsAdmin(admin);

    // Get referral code from Telegram start param
    let ref = "";
    try {
      ref = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
    } catch {}

    // Initialize user with backend
    apiInitUser(ref)
      .then(res => {
        setUserData({
          name: res.user.firstName,
          id: String(res.user.id),
          balance: res.user.balance,
          adsToday: res.user.adsToday,
          totalWatched: res.user.totalWatched,
          totalEarned: res.user.totalEarned,
          referralCode: res.user.referralCode,
          totalReferrals: res.user.totalReferrals,
          completedTasks: res.user.completedTasks || [],
        });
        setView(admin ? "admin" : "user");
      })
      .catch(() => {
        // Backend error — still show app with basic data
        setUserData({
          name: tgUser.first_name || "User",
          id: userId,
          balance: 0,
          adsToday: 0,
          totalWatched: 0,
          totalEarned: 0,
          referralCode: `AC${userId}`,
          totalReferrals: 0,
          completedTasks: [],
        });
        setView(admin ? "admin" : "user");
      });

  }, []);

  if (view === "loading") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <GlobalStyles />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: C.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>₳</span>
      </div>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative" }}>
      <GlobalStyles />
      {view === "user"
        ? <UserApp user={userData} isAdmin={isAdmin} onGoAdmin={() => setView("admin")} />
        : <AdminPanel onGoUser={() => setView("user")} />}
    </div>
  );
}
