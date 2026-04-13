import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockCustomers = [
  { id: 1, name: "Marcus J. Webb",  email: "m.webb@email.com",       phone: "+1 555 201 4891", joined: "12 Jan 2024", avatar: "MW", type: "old" },
  { id: 2, name: "Priya Anand",     email: "priya.anand@email.com",  phone: "+1 555 308 7723", joined: "03 Feb 2024", avatar: "PA", type: "new" },
  { id: 3, name: "David Okafor",    email: "d.okafor@email.com",     phone: "+1 555 419 5541", joined: "18 Mar 2024", avatar: "DO", type: "old" },
  { id: 4, name: "Sofia Reyes",     email: "sofia.r@email.com",      phone: "+1 555 527 8834", joined: "01 Apr 2024", avatar: "SR", type: "new" },
  { id: 5, name: "Ethan Blackwell", email: "e.blackwell@email.com",  phone: "+1 555 634 2210", joined: "22 Apr 2024", avatar: "EB", type: "old" },
  { id: 6, name: "Nadia Fontaine",  email: "n.fontaine@email.com",   phone: "+1 555 741 9963", joined: "15 May 2024", avatar: "NF", type: "new" },
];

const mockLoans = [
  { id: "LN-0041", customerId: 1, customer: "Marcus J. Webb",  amount: 12500, repaid: 8750,  issued: "14 Jan 2024", due: "14 Jan 2025", status: "pending", purpose: "Business Expansion", overdueDays: 12, callCount: 4,  caseStatus: "prioritized" },
  { id: "LN-0042", customerId: 2, customer: "Priya Anand",     amount:  5000, repaid: 5000,  issued: "05 Feb 2024", due: "05 Aug 2024", status: "paid",    purpose: "Equipment Purchase", overdueDays: 0,  callCount: 1,  caseStatus: "processed"   },
  { id: "LN-0043", customerId: 3, customer: "David Okafor",    amount: 20000, repaid: 4000,  issued: "20 Mar 2024", due: "20 Mar 2025", status: "default", purpose: "Real Estate",         overdueDays: 45, callCount: 28, caseStatus: "unfinished"  },
  { id: "LN-0044", customerId: 4, customer: "Sofia Reyes",     amount:  7500, repaid: 7500,  issued: "02 Apr 2024", due: "02 Oct 2024", status: "paid",    purpose: "Personal",             overdueDays: 0,  callCount: 2,  caseStatus: "processed"   },
  { id: "LN-0045", customerId: 5, customer: "Ethan Blackwell", amount: 15000, repaid: 9000,  issued: "24 Apr 2024", due: "24 Apr 2025", status: "pending", purpose: "Inventory",            overdueDays: 8,  callCount: 5,  caseStatus: "ptp"         },
  { id: "LN-0046", customerId: 6, customer: "Nadia Fontaine",  amount:  3000, repaid: 1000,  issued: "17 May 2024", due: "17 Nov 2024", status: "default", purpose: "Education",            overdueDays: 33, callCount: 11, caseStatus: "unfinished"  },
  { id: "LN-0047", customerId: 1, customer: "Marcus J. Webb",  amount:  8000, repaid: 8000,  issued: "01 Jun 2024", due: "01 Dec 2024", status: "paid",    purpose: "Vehicle",              overdueDays: 0,  callCount: 3,  caseStatus: "processed"   },
  { id: "LN-0048", customerId: 3, customer: "David Okafor",    amount: 11000, repaid: 2200,  issued: "18 Jun 2024", due: "18 Jun 2025", status: "pending", purpose: "Renovation",           overdueDays: 5,  callCount: 7,  caseStatus: "pending"     },
];

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: "#f7f6f3", surface: "#ffffff", surfaceAlt: "#f0efe9",
    border: "#e5e3dc",
    text: "#1a1916", textSub: "#6b6860", textMuted: "#a09e96",
    accent: "#1a1916", accentText: "#f7f6f3",
    paid: "#2d7a4f", paidBg: "#edf7f1",
    pending: "#a06120", pendingBg: "#fdf4e7",
    def: "#b13030", defBg: "#fdf0f0",
    overdue: "#b13030",
  },
  dark: {
    bg: "#111110", surface: "#1c1c1a", surfaceAlt: "#242422",
    border: "#2e2e2b",
    text: "#e8e6e1", textSub: "#8a8880", textMuted: "#5a5a56",
    accent: "#e8e6e1", accentText: "#111110",
    paid: "#4caf7d", paidBg: "rgba(76,175,125,0.1)",
    pending: "#d4924a", pendingBg: "rgba(212,146,74,0.1)",
    def: "#d46060", defBg: "rgba(212,96,96,0.1)",
    overdue: "#d46060",
  },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  dash:    "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  cust:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  loan:    "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  collect: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  plus:    "M12 5v14M5 12h14",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
  del:     "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  srch:    "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  x:       "M18 6L6 18M6 6l12 12",
  chev:    "M9 18l6-6-6-6",
  phone:   "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  clock:   "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  trend:   "M22 7l-8.5 8.5-5-5L1 17",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pill = (status, t) => {
  const m = {
    paid:    [t.paid,    t.paidBg,    "Paid"],
    pending: [t.pending, t.pendingBg, "Pending"],
    default: [t.def,     t.defBg,     "Default"],
  };
  const [color, bg, label] = m[status] || [t.textMuted, t.surfaceAlt, status];
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 3, whiteSpace: "nowrap" }}>{label}</span>;
};

const casePill = (cs, t) => {
  const m = {
    unfinished:  ["#e05c5c", "rgba(224,92,92,0.12)",   "Unfinished"],
    prioritized: ["#d4924a", "rgba(212,146,74,0.12)",  "Prioritized"],
    ptp:         ["#7b6cf6", "rgba(123,108,246,0.12)", "PTP"],
    pending:     [t.textMuted, t.surfaceAlt,            "Pending"],
    processed:   [t.paid,    t.paidBg,                 "Processed"],
  };
  const [color, bg, label] = m[cs] || [t.textMuted, t.surfaceAlt, cs];
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap" }}>{label}</span>;
};

const typeBadge = (type, t) => (
  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.06em", textTransform: "uppercase", background: type === "new" ? t.paidBg : t.surfaceAlt, color: type === "new" ? t.paid : t.textMuted, border: `1px solid ${t.border}` }}>
    {type === "new" ? "New" : "Old"}
  </span>
);

const progBar = (pct, t) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, height: 3, background: t.border, borderRadius: 2 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? t.paid : t.textSub, borderRadius: 2 }} />
    </div>
    <span style={{ fontSize: 11, color: t.textMuted, minWidth: 28 }}>{pct}%</span>
  </div>
);

const inputSt = t => ({ width: "100%", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "10px 12px", color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none" });
const ibtn = (t, danger = false) => ({ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 6, padding: "6px 8px", color: danger ? t.def : t.textMuted, cursor: "pointer", display: "flex", alignItems: "center" });

// days until / since due
const daysFrom = (dateStr) => {
  const due = new Date(dateStr.split(" ").reverse().join(" "));
  const now = new Date();
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const HamburgerIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
  </svg>
);

function Modal({ title, onClose, t, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 24px 48px rgba(0,0,0,0.15)", animation: "su .18s ease", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", display: "flex" }}><Ico d={I.x} size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", opts, t }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>{label}</label>
      {opts ? <select value={value} onChange={e => onChange(e.target.value)} style={inputSt(t)}>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
            : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputSt(t)} />}
    </div>
  );
}

function ModalBtns({ onCancel, onSave, label, t }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.textSub }}>Cancel</button>
      <button onClick={onSave} style={{ flex: 1, padding: 11, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", background: t.accent, border: "none", color: t.accentText }}>{label}</button>
    </div>
  );
}

function Th({ children, t }) {
  return <th style={{ textAlign: "left", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, paddingBottom: 12, borderBottom: `1px solid ${t.border}`, paddingRight: 16, whiteSpace: "nowrap" }}>{children}</th>;
}

function StatCard({ label, value, sub, t, accent, icon }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted }}>{label}</div>
        {icon && <div style={{ color: accent || t.textMuted, opacity: 0.5 }}><Ico d={icon} size={14} /></div>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent || t.text, letterSpacing: "-0.03em", marginBottom: 6, fontFamily: "'DM Serif Display',Georgia,serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: t.textMuted }}>{sub}</div>
    </div>
  );
}

// Scrollable table wrapper for mobile
const ScrollTable = ({ children }) => (
  <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
      {children}
    </table>
  </div>
);

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function Dashboard({ loans, customers, t, isMobile }) {
  const total      = loans.reduce((s, l) => s + l.amount, 0);
  const repaid     = loans.reduce((s, l) => s + l.repaid, 0);
  const outstanding = total - repaid;
  const atRisk     = loans.filter(l => l.status === "default").reduce((s, l) => s + (l.amount - l.repaid), 0);
  const overdueLoans = loans.filter(l => l.overdueDays > 0);
  const totalCalls = loans.reduce((s, l) => s + l.callCount, 0);
  const avgOverdue = overdueLoans.length ? Math.round(overdueLoans.reduce((s, l) => s + l.overdueDays, 0) / overdueLoans.length) : 0;
  const recent     = [...loans].reverse().slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", fontFamily: "'DM Serif Display',Georgia,serif" }}>Overview</h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>{loans.length} loans · {customers.length} customers</p>
      </div>

      {/* Row 1: Portfolio stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 10 }}>
        <StatCard label="Portfolio"   value={`$${(total/1000).toFixed(1)}k`}       sub="Total disbursed"                                      t={t} icon={I.loan} />
        <StatCard label="Recovered"   value={`$${(repaid/1000).toFixed(1)}k`}      sub={`${Math.round(repaid/total*100)}% recovery rate`}     t={t} accent={t.paid}    icon={I.trend} />
        <StatCard label="Outstanding" value={`$${(outstanding/1000).toFixed(1)}k`} sub={`${loans.filter(l=>l.status==="pending").length} open`} t={t} accent={t.pending} icon={I.clock} />
        <StatCard label="At Risk"     value={`$${(atRisk/1000).toFixed(1)}k`}      sub={`${loans.filter(l=>l.status==="default").length} defaults`} t={t} accent={t.def} icon={I.alert} />
      </div>

      {/* Row 2: Collection stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Overdue Cases"   value={overdueLoans.length}               sub={`Avg ${avgOverdue} days overdue`}           t={t} accent={t.def}     icon={I.alert} />
        <StatCard label="Total Calls"     value={totalCalls}                        sub={`Across ${loans.length} cases`}             t={t} icon={I.phone} />
        <StatCard label="Prioritized"     value={loans.filter(l=>l.caseStatus==="prioritized").length} sub="Need immediate action"   t={t} accent={t.pending} icon={I.collect} />
        <StatCard label="PTP Cases"       value={loans.filter(l=>l.caseStatus==="ptp").length}         sub="Promise to pay"          t={t} accent="#7b6cf6"   icon={I.collect} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 260px", gap: 12 }}>
        {/* Recent activity */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 16 }}>Recent Activity</div>
          <ScrollTable>
            <thead><tr><Th t={t}>ID</Th><Th t={t}>Customer</Th><Th t={t}>Amount</Th><Th t={t}>Overdue</Th><Th t={t}>Status</Th></tr></thead>
            <tbody>
              {recent.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 11, color: t.textMuted, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{l.id}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 13, color: t.text, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{l.customer}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 13, fontWeight: 600, color: t.text, borderBottom: `1px solid ${t.border}` }}>${l.amount.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 12, color: l.overdueDays > 0 ? t.def : t.paid, fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>
                    {l.overdueDays > 0 ? `${l.overdueDays}d` : "—"}
                  </td>
                  <td style={{ padding: "12px 0", borderBottom: `1px solid ${t.border}` }}>{pill(l.status, t)}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        </div>

        {/* Health */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 18 }}>Portfolio Health</div>
          {[
            { key: "paid",    label: "Paid",    color: t.paid },
            { key: "pending", label: "Pending", color: t.pending },
            { key: "default", label: "Default", color: t.def },
          ].map(s => {
            const n = loans.filter(l => l.status === s.key).length;
            const p = Math.round(n / loans.length * 100);
            return (
              <div key={s.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: t.textSub }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{n} / {p}%</span>
                </div>
                <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${p}%`, background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}

          {/* Case status breakdown */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 12 }}>Case Status</div>
            {["unfinished","prioritized","ptp","pending","processed"].map(cs => {
              const n = loans.filter(l => l.caseStatus === cs).length;
              if (!n) return null;
              return (
                <div key={cs} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  {casePill(cs, t)}
                  <span style={{ fontSize: 12, color: t.textMuted }}>{n} case{n > 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTIONS PAGE (inspired by real app) ─────────────────────────────────
function Collections({ loans, setLoans, customers, t, isMobile }) {
  const [tab, setTab]   = useState("all");
  const [q, setQ]       = useState("");

  const tabs = ["all","unfinished","prioritized","ptp","pending","processed"];

  const list = loans.filter(l => {
    const ms = l.customer.toLowerCase().includes(q.toLowerCase()) || l.id.toLowerCase().includes(q.toLowerCase());
    return ms && (tab === "all" || l.caseStatus === tab);
  }).filter(l => l.status !== "paid"); // collections = only active/problem loans

  const updateCaseStatus = (id, caseStatus) => {
    setLoans(p => p.map(l => l.id === id ? { ...l, caseStatus } : l));
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", fontFamily: "'DM Serif Display',Georgia,serif" }}>Collections</h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>{list.length} active cases</p>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: isMobile ? 16 : 22 }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {tabs.map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: "7px 14px", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer", borderRadius: 6,
              background: tab === tb ? t.accent : "transparent",
              color: tab === tb ? t.accentText : t.textMuted,
              whiteSpace: "nowrap", fontFamily: "inherit", textTransform: "capitalize", transition: "all 0.15s",
            }}>{tb === "all" ? "All" : tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted }}><Ico d={I.srch} size={14} /></div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search cases…" style={{ ...inputSt(t), paddingLeft: 36 }} />
        </div>

        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 14 }}>{list.length} case{list.length !== 1 ? "s" : ""}</div>

        {/* Case cards — mobile-friendly card layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((l, idx) => {
            const cust = customers.find(c => c.id === l.customerId);
            return (
              <div key={l.id} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 8, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, minWidth: 20 }}>{idx + 1}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{l.customer}</span>
                        {cust && typeBadge(cust.type, t)}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{l.id} · {l.purpose}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {casePill(l.caseStatus, t)}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                  <div style={{ background: t.surface, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>${l.amount.toLocaleString()}</div>
                  </div>
                  <div style={{ background: t.surface, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Overdue</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: l.overdueDays > 0 ? t.def : t.paid }}>
                      {l.overdueDays > 0 ? `${l.overdueDays} days` : "None"}
                    </div>
                  </div>
                  <div style={{ background: t.surface, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Calls</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{l.callCount} times</div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.textMuted, marginBottom: 5 }}>
                    <span>Repaid ${l.repaid.toLocaleString()}</span>
                    <span>{Math.round(l.repaid / l.amount * 100)}%</span>
                  </div>
                  {progBar(Math.round(l.repaid / l.amount * 100), t)}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["unfinished","prioritized","ptp","processed"].map(cs => (
                    <button key={cs} onClick={() => updateCaseStatus(l.id, cs)}
                      style={{ fontSize: 10, fontWeight: 600, padding: "5px 10px", borderRadius: 5, border: `1px solid ${t.border}`, cursor: "pointer", background: l.caseStatus === cs ? t.accent : "transparent", color: l.caseStatus === cs ? t.accentText : t.textMuted, fontFamily: "inherit", textTransform: "capitalize", transition: "all 0.15s" }}>
                      {cs}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {!list.length && <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: t.textMuted }}>No cases found.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMERS PAGE ───────────────────────────────────────────────────────────
function Customers({ customers, setCustomers, loans, t }) {
  const [q, setQ]       = useState("");
  const [modal, setM]   = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "new" });
  const upd = v => setForm(p => ({ ...p, ...v }));

  const list = customers.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.email.toLowerCase().includes(q.toLowerCase())
  );

  const save = () => {
    if (!form.name.trim()) return;
    if (modal.mode === "add") {
      const av = form.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      setCustomers(p => [...p, { id: Date.now(), ...form, avatar: av, joined: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }]);
    } else {
      setCustomers(p => p.map(c => c.id === modal.data.id ? { ...c, ...form } : c));
    }
    setM(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", fontFamily: "'DM Serif Display',Georgia,serif" }}>Customers</h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>{customers.length} registered</p>
        </div>
        <button onClick={() => { setForm({ name: "", email: "", phone: "", type: "new" }); setM({ mode: "add" }); }}
          style={{ display: "flex", alignItems: "center", gap: 7, background: t.accent, color: t.accentText, border: "none", borderRadius: 7, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Ico d={I.plus} size={13} /> Add
        </button>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 22 }}>
        <div style={{ position: "relative", marginBottom: 18 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted }}><Ico d={I.srch} size={14} /></div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers…" style={{ ...inputSt(t), paddingLeft: 36 }} />
        </div>

        <ScrollTable>
          <thead>
            <tr><Th t={t}>Name</Th><Th t={t}>Type</Th><Th t={t}>Email</Th><Th t={t}>Phone</Th><Th t={t}>Joined</Th><Th t={t}>Loans</Th><Th t={t}></Th></tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = t.surfaceAlt}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "13px 16px 13px 0", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.surfaceAlt, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: t.textSub, flexShrink: 0 }}>{c.avatar}</div>
                    <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 16px 13px 0", borderBottom: `1px solid ${t.border}` }}>{typeBadge(c.type || "old", t)}</td>
                <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>{c.email}</td>
                <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: t.textMuted, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{c.phone}</td>
                <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: t.textMuted, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{c.joined}</td>
                <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: t.text, fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{loans.filter(l => l.customerId === c.id).length}</td>
                <td style={{ padding: "13px 0", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={ibtn(t)} onClick={() => { setForm({ name: c.name, email: c.email, phone: c.phone, type: c.type || "old" }); setM({ mode: "edit", data: c }); }}><Ico d={I.edit} size={13} /></button>
                    <button style={ibtn(t, true)} onClick={() => { if (confirm("Delete customer?")) setCustomers(p => p.filter(x => x.id !== c.id)); }}><Ico d={I.del} size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </ScrollTable>
        {!list.length && <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: t.textMuted }}>No results.</div>}
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "New Customer" : "Edit Customer"} onClose={() => setM(null)} t={t}>
          <Field label="Full Name"   value={form.name}  onChange={v => upd({ name: v })}  t={t} />
          <Field label="Email"       value={form.email} onChange={v => upd({ email: v })} type="email" t={t} />
          <Field label="Phone"       value={form.phone} onChange={v => upd({ phone: v })} t={t} />
          <Field label="Borrower Type" value={form.type} onChange={v => upd({ type: v })} opts={[{ v: "new", l: "New Borrower" }, { v: "old", l: "Returning Borrower" }]} t={t} />
          <ModalBtns onCancel={() => setM(null)} onSave={save} label={modal.mode === "add" ? "Add Customer" : "Save"} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── LOANS PAGE ───────────────────────────────────────────────────────────────
function Loans({ loans, setLoans, customers, t }) {
  const [q, setQ]       = useState("");
  const [filter, setF]  = useState("all");
  const [modal, setM]   = useState(null);
  const [form, setForm] = useState({ customerId: "", amount: "", purpose: "", status: "pending", due: "", overdueDays: 0, caseStatus: "pending" });
  const upd = v => setForm(p => ({ ...p, ...v }));

  const list = loans.filter(l => {
    const ms = l.customer.toLowerCase().includes(q.toLowerCase()) || l.id.toLowerCase().includes(q.toLowerCase());
    return ms && (filter === "all" || l.status === filter);
  });

  const save = () => {
    const cust = customers.find(c => c.id === Number(form.customerId) || c.id === form.customerId);
    if (!cust || !form.amount) return;
    if (modal.mode === "add") {
      setLoans(p => [...p, { id: `LN-${String(p.length + 41).padStart(4, "0")}`, customerId: cust.id, customer: cust.name, amount: Number(form.amount), repaid: 0, issued: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), due: form.due, status: form.status, purpose: form.purpose, overdueDays: Number(form.overdueDays) || 0, callCount: 0, caseStatus: form.caseStatus }]);
    } else {
      setLoans(p => p.map(l => l.id === modal.data.id ? { ...l, status: form.status, purpose: form.purpose, due: form.due, overdueDays: Number(form.overdueDays) || 0, caseStatus: form.caseStatus } : l));
    }
    setM(null);
  };

  const tabs = ["all", "paid", "pending", "default"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", fontFamily: "'DM Serif Display',Georgia,serif" }}>Loans</h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>{loans.length} records</p>
        </div>
        <button onClick={() => { setForm({ customerId: customers[0]?.id || "", amount: "", purpose: "", status: "pending", due: "", overdueDays: 0, caseStatus: "pending" }); setM({ mode: "add" }); }}
          style={{ display: "flex", alignItems: "center", gap: 7, background: t.accent, color: t.accentText, border: "none", borderRadius: 7, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Ico d={I.plus} size={13} /> New Loan
        </button>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 22 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted }}><Ico d={I.srch} size={14} /></div>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ ...inputSt(t), paddingLeft: 36 }} />
          </div>
          <div style={{ display: "flex", border: `1px solid ${t.border}`, borderRadius: 7, overflow: "hidden" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setF(tab)} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer", background: filter === tab ? t.surfaceAlt : "transparent", color: filter === tab ? t.text : t.textMuted, borderRight: `1px solid ${t.border}`, textTransform: "capitalize", transition: "all 0.15s", fontFamily: "inherit" }}>{tab}</button>
            ))}
          </div>
        </div>

        <ScrollTable>
          <thead>
            <tr><Th t={t}>ID</Th><Th t={t}>Customer</Th><Th t={t}>Amount</Th><Th t={t}>Repaid</Th><Th t={t}>Progress</Th><Th t={t}>Overdue</Th><Th t={t}>Calls</Th><Th t={t}>Status</Th><Th t={t}>Case</Th><Th t={t}></Th></tr>
          </thead>
          <tbody>
            {list.map(l => {
              const pct = Math.round(l.repaid / l.amount * 100);
              return (
                <tr key={l.id}
                  onMouseEnter={e => e.currentTarget.style.background = t.surfaceAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 11, color: t.textMuted, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{l.id}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 13, color: t.text, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{l.customer}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 13, fontWeight: 600, color: t.text, borderBottom: `1px solid ${t.border}` }}>${l.amount.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 13, color: t.paid, borderBottom: `1px solid ${t.border}` }}>${l.repaid.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px 12px 0", minWidth: 90, borderBottom: `1px solid ${t.border}` }}>{progBar(pct, t)}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 12, fontWeight: 600, color: l.overdueDays > 0 ? t.def : t.textMuted, borderBottom: `1px solid ${t.border}` }}>
                    {l.overdueDays > 0 ? `${l.overdueDays}d` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px 12px 0", fontSize: 12, color: t.textSub, borderBottom: `1px solid ${t.border}` }}>{l.callCount}×</td>
                  <td style={{ padding: "12px 16px 12px 0", borderBottom: `1px solid ${t.border}` }}>{pill(l.status, t)}</td>
                  <td style={{ padding: "12px 16px 12px 0", borderBottom: `1px solid ${t.border}` }}>{casePill(l.caseStatus, t)}</td>
                  <td style={{ padding: "12px 0", borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={ibtn(t)} onClick={() => { setForm({ customerId: l.customerId, amount: l.amount, purpose: l.purpose, status: l.status, due: l.due, overdueDays: l.overdueDays, caseStatus: l.caseStatus }); setM({ mode: "edit", data: l }); }}><Ico d={I.edit} size={13} /></button>
                      <button style={ibtn(t, true)} onClick={() => { if (confirm("Delete loan?")) setLoans(p => p.filter(x => x.id !== l.id)); }}><Ico d={I.del} size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ScrollTable>
        {!list.length && <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: t.textMuted }}>No loans found.</div>}
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Issue Loan" : "Edit Loan"} onClose={() => setM(null)} t={t}>
          {modal.mode === "add" && <>
            <Field label="Customer" value={form.customerId} onChange={v => upd({ customerId: v })} opts={customers.map(c => ({ v: c.id, l: c.name }))} t={t} />
            <Field label="Amount ($)" value={form.amount} onChange={v => upd({ amount: v })} type="number" t={t} />
          </>}
          <Field label="Purpose" value={form.purpose} onChange={v => upd({ purpose: v })} t={t} />
          <Field label="Due Date" value={form.due} onChange={v => upd({ due: v })} t={t} />
          <Field label="Overdue Days" value={form.overdueDays} onChange={v => upd({ overdueDays: v })} type="number" t={t} />
          <Field label="Loan Status" value={form.status} onChange={v => upd({ status: v })} opts={[{ v: "pending", l: "Pending" }, { v: "paid", l: "Paid" }, { v: "default", l: "Default" }]} t={t} />
          <Field label="Case Status" value={form.caseStatus} onChange={v => upd({ caseStatus: v })} opts={[{ v: "pending", l: "Pending" }, { v: "unfinished", l: "Unfinished" }, { v: "prioritized", l: "Prioritized" }, { v: "ptp", l: "PTP" }, { v: "processed", l: "Processed" }]} t={t} />
          <ModalBtns onCancel={() => setM(null)} onSave={save} label={modal.mode === "add" ? "Issue Loan" : "Save"} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── SIDEBAR CONTENT ─────────────────────────────────────────────────────────
function SidebarContent({ t, page, setPage, nav, handleLogoClick, onNavClick }) {
  return (
    <>
      <div onClick={handleLogoClick} style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${t.border}`, cursor: "default", userSelect: "none", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 5, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.accentText} strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: "-0.02em", fontFamily: "'DM Serif Display',Georgia,serif" }}>LendFlow</div>
            <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Finance OS</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.textMuted, padding: "0 10px 10px" }}>Menu</div>
        {nav.map(item => {
          const active = page === item.key;
          return (
            <button key={item.key} onClick={() => { setPage(item.key); onNavClick?.(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 10px", background: active ? t.surfaceAlt : "transparent", borderRadius: 7, border: "none", cursor: "pointer", color: active ? t.text : t.textSub, fontWeight: active ? 500 : 400, fontSize: 13, textAlign: "left", marginBottom: 2, transition: "all 0.15s", fontFamily: "inherit" }}>
              <Ico d={item.icon} size={15} sw={active ? 2 : 1.5} />
              {item.label}
              {active && <span style={{ marginLeft: "auto", opacity: 0.3 }}><Ico d={I.chev} size={12} /></span>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "14px 20px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: t.surfaceAlt, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: t.textSub }}>AD</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Admin</div>
            <div style={{ fontSize: 10, color: t.textMuted }}>Super User</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]           = useState(false);
  const [page, setPage]           = useState("dashboard");
  const [customers, setCustomers] = useState(mockCustomers);
  const [loans, setLoans]         = useState(mockLoans);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => { const m = window.innerWidth < 768; setIsMobile(m); if (!m) setMenuOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const handleLogoClick = () => {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) { setDark(d => !d); clickCount.current = 0; }
    else clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 600);
  };

  const t = dark ? themes.dark : themes.light;

  const nav = [
    { key: "dashboard",   label: "Dashboard",   icon: I.dash    },
    { key: "collections", label: "Collections", icon: I.collect },
    { key: "customers",   label: "Customers",   icon: I.cust    },
    { key: "loans",       label: "Loans",       icon: I.loan    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::selection { background: ${t.accent}22; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
        select option { background: ${t.surface}; color: ${t.text}; }
        input::placeholder { color: ${t.textMuted}; }
        @keyframes su     { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, transition: "background 0.25s, color 0.25s", position: "relative" }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 210, minHeight: "100vh", background: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "background 0.25s, border-color 0.25s" }}>
            <SidebarContent t={t} page={page} setPage={setPage} nav={nav} handleLogoClick={handleLogoClick} />
          </aside>
        )}

        {/* Mobile backdrop */}
        {isMobile && menuOpen && (
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, animation: "fadeIn 0.2s ease" }} />
        )}

        {/* Mobile sidebar */}
        {isMobile && (
          <aside style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: 240, background: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", zIndex: 300, transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", boxShadow: menuOpen ? "4px 0 24px rgba(0,0,0,0.18)" : "none" }}>
            <SidebarContent t={t} page={page} setPage={setPage} nav={nav} handleLogoClick={handleLogoClick} onNavClick={() => setMenuOpen(false)} />
          </aside>
        )}

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: isMobile ? "13px 16px" : "13px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, transition: "background 0.25s, border-color 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isMobile && (
                <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub, display: "flex", alignItems: "center", padding: 4 }}>
                  <HamburgerIcon open={menuOpen} />
                </button>
              )}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted }}>
                {nav.find(n => n.key === page)?.label}
              </span>
            </div>
            <span style={{ fontSize: 11, color: t.textMuted }}>
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </header>

          <main style={{ flex: 1, padding: isMobile ? "20px 14px" : "32px 40px", overflowY: "auto" }}>
            {page === "dashboard"   && <Dashboard   loans={loans} customers={customers} t={t} isMobile={isMobile} />}
            {page === "collections" && <Collections loans={loans} setLoans={setLoans} customers={customers} t={t} isMobile={isMobile} />}
            {page === "customers"   && <Customers   customers={customers} setCustomers={setCustomers} loans={loans} t={t} />}
            {page === "loans"       && <Loans       loans={loans} setLoans={setLoans} customers={customers} t={t} />}
          </main>
        </div>
      </div>
    </>
  );
}