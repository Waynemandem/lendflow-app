import { useState, useRef, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: "#f5f4f0", surface: "#ffffff", surfaceAlt: "#f0efe9",
    border: "#e8e6df", borderStrong: "#d0cdc4",
    text: "#1a1916", textSub: "#6b6860", textMuted: "#a8a69e",
    accent: "#1a1916", accentText: "#ffffff",
    blue: "#2563eb", blueLight: "#eff6ff",
    red: "#dc2626", redLight: "#fef2f2",
    green: "#16a34a", greenLight: "#f0fdf4",
    orange: "#ea580c", orangeLight: "#fff7ed",
    purple: "#7c3aed", purpleLight: "#f5f3ff",
  },
  dark: {
    bg: "#0f0f0e", surface: "#1a1a18", surfaceAlt: "#222220",
    border: "#2e2e2b", borderStrong: "#3e3e3a",
    text: "#e8e6e1", textSub: "#8a8880", textMuted: "#555450",
    accent: "#e8e6e1", accentText: "#0f0f0e",
    blue: "#3b82f6", blueLight: "rgba(59,130,246,0.1)",
    red: "#ef4444", redLight: "rgba(239,68,68,0.1)",
    green: "#22c55e", greenLight: "rgba(34,197,94,0.1)",
    orange: "#f97316", orangeLight: "rgba(249,115,22,0.1)",
    purple: "#a78bfa", purpleLight: "rgba(167,139,250,0.1)",
  },
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const PRODUCTS = ["glowcredit", "loanglide", "quickfund", "swiftcash"];
const mockCases = [
  {
    id: 1, product: "glowcredit", borrowerType: "Old", caseStatus: "unfinished",
    callCount: 4, overdueDays: 12, overdueAmount: 725.35,
    customer: {
      name: "Ahmed Zakaria", gender: "M", age: 36, maritalStatus: "M",
      phone1: "+233 24 456 7890", phone1Network: "Lending.MTN",
      phone2: "+233 20 123 4567", phone2Network: "Vodafone",
      address: "14 Accra New Town, Greater Accra",
      emergencyContacts: [
        { label: "Brothers or sisters", name: "Fatawu Zakaria", phone: "+233 24 987 6543" },
        { label: "Father or mother",    name: "Amina Zakaria",  phone: "+233 27 555 1234" },
      ],
    },
    loan: {
      loanId: "9565384679456116824", product: "glowcredit", termType: "7D3T",
      loanAmount: 1700, loanDate: "2026-03-24", loanTerms: 3,
      overdueDays: 12, overdueAmount: 725.35, amountAfterExemption: 725.35,
      paidAmount: 1400.66, recTotalAmount: 715.36,
      dueDate: "2026-04-14", currency: "GHS",
    },
    actions: [
      { no: 1, time: "2026-04-13 09:18:56", contactName: "Ahmed Zakaria", contactType: "SF", collector: "ENIOLA BALOGUN", contactPhone: "Phone 2", actionCode: "Customer Self", subCode: "PTP", description: "Ptp around 5pm" },
      { no: 2, time: "2026-04-12 14:32:10", contactName: "Fatawu Zakaria", contactType: "EC", collector: "ENIOLA BALOGUN", contactPhone: "Phone 1", actionCode: "Contact",       subCode: "Promise to Pass On", description: "Brother said will remind him" },
    ],
    deductions: [
      { date: "2026-03-28", amount: 800.00, txId: "TXN884729201", channel: "Mobile Money" },
      { date: "2026-03-15", amount: 600.66, txId: "TXN772819300", channel: "Bank Transfer" },
    ],
  },
  {
    id: 2, product: "loanglide", borrowerType: "Old", caseStatus: "ptp",
    callCount: 7, overdueDays: 3, overdueAmount: 480.53,
    customer: {
      name: "Mourh Ruth", gender: "F", age: 29, maritalStatus: "S",
      phone1: "+233 55 234 5678", phone1Network: "MTN",
      phone2: "+233 24 876 5432", phone2Network: "AirtelTigo",
      address: "7 Kumasi Central, Ashanti Region",
      emergencyContacts: [
        { label: "Spouse", name: "Daniel Ruth", phone: "+233 20 444 9988" },
      ],
    },
    loan: {
      loanId: "7712938475610023847", product: "loanglide", termType: "14D2T",
      loanAmount: 1200, loanDate: "2026-03-20", loanTerms: 2,
      overdueDays: 3, overdueAmount: 480.53, amountAfterExemption: 480.53,
      paidAmount: 719.47, recTotalAmount: 480.53,
      dueDate: "2026-04-10", currency: "GHS",
    },
    actions: [
      { no: 1, time: "2026-04-13 11:02:44", contactName: "Mourh Ruth", contactType: "SF", collector: "ENIOLA BALOGUN", contactPhone: "Phone 1", actionCode: "Customer Self", subCode: "PTP", description: "Will pay by end of day" },
    ],
    deductions: [
      { date: "2026-04-01", amount: 719.47, txId: "TXN991827364", channel: "Mobile Money" },
    ],
  },
  {
    id: 3, product: "glowcredit", borrowerType: "Old", caseStatus: "unfinished",
    callCount: 0, overdueDays: 1, overdueAmount: 369.15,
    customer: {
      name: "Alice Whajah", gender: "F", age: 44, maritalStatus: "M",
      phone1: "+233 27 321 0987", phone1Network: "Vodafone",
      phone2: "+233 55 678 3421", phone2Network: "MTN",
      address: "22 Tema Community 5, Greater Accra",
      emergencyContacts: [
        { label: "Brothers or sisters", name: "Kofi Whajah",   phone: "+233 24 111 2233" },
        { label: "Father or mother",    name: "Grace Mensah",  phone: "+233 20 344 5566" },
        { label: "Spouse",              name: "James Whajah",  phone: "+233 27 788 9900" },
      ],
    },
    loan: {
      loanId: "3348291764500187263", product: "glowcredit", termType: "7D3T",
      loanAmount: 900, loanDate: "2026-04-05", loanTerms: 3,
      overdueDays: 1, overdueAmount: 369.15, amountAfterExemption: 369.15,
      paidAmount: 530.85, recTotalAmount: 369.15,
      dueDate: "2026-04-13", currency: "GHS",
    },
    actions: [],
    deductions: [
      { date: "2026-04-10", amount: 300.00, txId: "TXN556611223", channel: "Mobile Money" },
      { date: "2026-04-07", amount: 230.85, txId: "TXN443322110", channel: "Bank Transfer" },
    ],
  },
  {
    id: 4, product: "glowcredit", borrowerType: "Old", caseStatus: "prioritized",
    callCount: 5, overdueDays: 1, overdueAmount: 255.90,
    customer: {
      name: "Christopher Tetteh Gamah", gender: "M", age: 51, maritalStatus: "M",
      phone1: "+233 24 909 8877", phone1Network: "MTN",
      phone2: "+233 20 566 7788", phone2Network: "Vodafone",
      address: "3 Dansoman Estate, Accra",
      emergencyContacts: [
        { label: "Spouse", name: "Abena Gamah", phone: "+233 27 443 2211" },
      ],
    },
    loan: {
      loanId: "5521837465029381746", product: "glowcredit", termType: "30D1T",
      loanAmount: 2000, loanDate: "2026-03-14", loanTerms: 1,
      overdueDays: 1, overdueAmount: 255.90, amountAfterExemption: 255.90,
      paidAmount: 1744.10, recTotalAmount: 255.90,
      dueDate: "2026-04-13", currency: "GHS",
    },
    actions: [
      { no: 1, time: "2026-04-12 08:45:30", contactName: "Christopher Tetteh Gamah", contactType: "SF", collector: "ENIOLA BALOGUN", contactPhone: "Phone 1", actionCode: "Customer Self", subCode: "Postpone", description: "Says he will pay next week" },
    ],
    deductions: [
      { date: "2026-03-30", amount: 1000.00, txId: "TXN667788990", channel: "Mobile Money" },
      { date: "2026-03-20", amount: 744.10,  txId: "TXN554433221", channel: "Bank Transfer" },
    ],
  },
  {
    id: 5, product: "quickfund", borrowerType: "New", caseStatus: "pending",
    callCount: 2, overdueDays: 5, overdueAmount: 1120.00,
    customer: {
      name: "Efua Mensah", gender: "F", age: 33, maritalStatus: "S",
      phone1: "+233 55 112 3344", phone1Network: "AirtelTigo",
      phone2: "+233 24 556 7788", phone2Network: "MTN",
      address: "9 Osu Oxford St, Accra",
      emergencyContacts: [
        { label: "Father or mother", name: "Kwame Mensah", phone: "+233 20 998 7766" },
      ],
    },
    loan: {
      loanId: "8890123456781234567", product: "quickfund", termType: "14D2T",
      loanAmount: 3000, loanDate: "2026-03-28", loanTerms: 2,
      overdueDays: 5, overdueAmount: 1120.00, amountAfterExemption: 1120.00,
      paidAmount: 1880.00, recTotalAmount: 1120.00,
      dueDate: "2026-04-09", currency: "GHS",
    },
    actions: [],
    deductions: [
      { date: "2026-04-05", amount: 1880.00, txId: "TXN112233445", channel: "Mobile Money" },
    ],
  },
];

const ACTION_CODES = {
  "Customer Self": ["PTP","Postpone","Refuse to Pay","Denied Loan","Switched Off","Voicemail","No Number Available","No Answer","Others","Suspected Fraud"],
  "Contact":       ["PTP","Promise to Pass On","Unwilling to Pass On","Unknown CM","Switched Off","Voicemail","No Number","No One Answered","Others"],
  "Complaint":     ["Repayment Issues","Customer Service Question","App Issues","Internet Issues","Amount Problem","Other Complaint","Client Death"],
};

const CASE_TABS = ["All","Unfinished","Prioritized","PTP","Pending","Processed"];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, sw = 1.6, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const PhoneIcon = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="0">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);
const I = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  search:  "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  sms:     "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
  copy:    "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2M8 4h8",
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18M6 6l12 12",
  upload:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  receipt: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  money:   "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  sun:     "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  person:  "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  dash:    "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const caseStatusColor = (cs, t) => {
  const m = { unfinished: [t.red, t.redLight], prioritized: [t.orange, t.orangeLight], ptp: [t.purple, t.purpleLight], pending: [t.textMuted, t.surfaceAlt], processed: [t.green, t.greenLight] };
  return m[cs] || [t.textMuted, t.surfaceAlt];
};

const CasePill = ({ status, t }) => {
  const [color, bg] = caseStatusColor(status, t);
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 3, textTransform: "capitalize", letterSpacing: "0.04em" }}>{status}</span>;
};

const inputSt = t => ({ width: "100%", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 8, padding: "11px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none" });

const Label = ({ children, t }) => (
  <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginBottom: 4, letterSpacing: "0.03em" }}>{children}</div>
);

const Value = ({ children, t, color }) => (
  <div style={{ fontSize: 15, color: color || t.text, fontWeight: 500, marginBottom: 14 }}>{children}</div>
);

const Row = ({ label, value, t, valueColor }) => (
  <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
    <div style={{ flex: 1 }}>
      <Label t={t}>{label}</Label>
      <div style={{ fontSize: 15, color: valueColor || t.text, fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

const TwoCol = ({ left, right, t }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
    <div><Label t={t}>{left.label}</Label><div style={{ fontSize: 15, color: left.color || t.text, fontWeight: 500 }}>{left.value}</div></div>
    <div><Label t={t}>{right.label}</Label><div style={{ fontSize: 15, color: right.color || t.text, fontWeight: 500 }}>{right.value}</div></div>
  </div>
);

const Divider = ({ t }) => <div style={{ height: 1, background: t.border, margin: "16px 0" }} />;

// ─── RECORD MODAL ─────────────────────────────────────────────────────────────
function RecordModal({ t, onClose, onSubmit, customerName }) {
  const [category, setCategory] = useState(null);
  const [subCode, setSubCode]   = useState(null);
  const [remark, setRemark]     = useState("");

  const cats = Object.keys(ACTION_CODES);

  const submit = () => {
    if (!category || !subCode) return;
    onSubmit({ actionCode: category, subCode, description: remark, contactName: customerName, time: new Date().toISOString().replace("T", " ").slice(0, 19) });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: t.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>Record Action</span>
          <button onClick={onClose} style={{ background: t.surfaceAlt, border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSub }}><Ico d={I.x} size={15} /></button>
        </div>

        {/* Step 1 — Category */}
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 10 }}>Action Code</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {cats.map(c => (
            <button key={c} onClick={() => { setCategory(c); setSubCode(null); }}
              style={{ flex: 1, padding: "10px 6px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1.5px solid ${category === c ? t.blue : t.border}`, background: category === c ? t.blueLight : t.surfaceAlt, color: category === c ? t.blue : t.textSub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Step 2 — Sub options */}
        {category && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 10 }}>Result</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {ACTION_CODES[category].map(opt => (
                <button key={opt} onClick={() => setSubCode(opt)}
                  style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, borderRadius: 20, border: `1.5px solid ${subCode === opt ? t.blue : t.border}`, background: subCode === opt ? t.blueLight : "transparent", color: subCode === opt ? t.blue : t.textSub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3 — Remark */}
        {subCode && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 10 }}>Action Remark</div>
            <textarea value={remark} onChange={e => setRemark(e.target.value)}
              placeholder="Describe the interaction with the customer…"
              style={{ ...inputSt(t), minHeight: 90, resize: "vertical", lineHeight: 1.5 }} />
            <button onClick={submit}
              style={{ width: "100%", marginTop: 16, padding: "14px", background: t.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Submit Record
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SMS MODAL ────────────────────────────────────────────────────────────────
function SmsModal({ t, onClose, customerName, phone1, phone2 }) {
  const template = `Dear ${customerName}, your loan repayment is overdue. Please make payment immediately to avoid further charges. Click here to repay: https://pay.lendflow.app/repay — LendFlow Finance`;
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard?.writeText(template); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ position: "fixed", inset: 0, background: t.bg, zIndex: 500, display: "flex", flexDirection: "column" }}>
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.text, display: "flex" }}><Ico d={I.back} size={20} sw={2} /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>Send SMS</span>
      </div>
      <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 12 }}>Message Template</div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, fontSize: 14, color: t.text, lineHeight: 1.7, marginBottom: 20 }}>{template}</div>

        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, marginBottom: 12 }}>Send To</div>
        {[{ label: "Phone 1", number: phone1 }, { label: "Phone 2", number: phone2 }].map(p => (
          <div key={p.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 3 }}>{p.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{p.number}</div>
            </div>
            <a href={`sms:${p.number}?body=${encodeURIComponent(template)}`}
              style={{ background: t.green, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <Ico d={I.sms} size={14} /> Send
            </a>
          </div>
        ))}

        <button onClick={copy} style={{ width: "100%", marginTop: 8, padding: "13px", background: copied ? t.greenLight : t.surfaceAlt, color: copied ? t.green : t.textSub, border: `1px solid ${copied ? t.green : t.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
          <Ico d={copied ? I.check : I.copy} size={15} /> {copied ? "Copied!" : "Copy Message"}
        </button>
      </div>
    </div>
  );
}

// ─── RECONCILIATION MODAL ─────────────────────────────────────────────────────
function ReconciliationModal({ t, onClose }) {
  const [form, setForm] = useState({ issueType: "", amount: "", repaymentDate: "", trueNumber: "", repaymentNumber: "", channel: "", txId: "", remark: "" });
  const upd = v => setForm(p => ({ ...p, ...v }));
  const issueTypes = ["Payment Not Reflected","Wrong Amount","Duplicate Payment","Reversal Request","Other"];
  const channels   = ["Mobile Money","Bank Transfer","Cash","POS","Other"];

  return (
    <div style={{ position: "fixed", inset: 0, background: t.bg, zIndex: 500, display: "flex", flexDirection: "column" }}>
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.text, display: "flex" }}><Ico d={I.back} size={20} sw={2} /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>Reconciliation</span>
      </div>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div style={{ marginBottom: 14 }}>
          <Label t={t}>Issue Type</Label>
          <select value={form.issueType} onChange={e => upd({ issueType: e.target.value })} style={inputSt(t)}>
            <option value="">Select issue type</option>
            {issueTypes.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}><Label t={t}>Amount</Label><input type="number" value={form.amount} onChange={e => upd({ amount: e.target.value })} placeholder="0.00" style={inputSt(t)} /></div>
        <div style={{ marginBottom: 14 }}><Label t={t}>Repayment Date</Label><input type="date" value={form.repaymentDate} onChange={e => upd({ repaymentDate: e.target.value })} style={inputSt(t)} /></div>

        {/* Picture upload */}
        <div style={{ marginBottom: 14 }}>
          <Label t={t}>Picture / Receipt</Label>
          <div style={{ border: `2px dashed ${t.border}`, borderRadius: 10, padding: "24px", textAlign: "center", background: t.surfaceAlt, cursor: "pointer" }}>
            <div style={{ color: t.textMuted, marginBottom: 6 }}><Ico d={I.upload} size={24} /></div>
            <div style={{ fontSize: 13, color: t.textMuted }}>Tap to upload image</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}><Label t={t}>True Registered Number</Label><input type="tel" value={form.trueNumber} onChange={e => upd({ trueNumber: e.target.value })} placeholder="+233 XX XXX XXXX" style={inputSt(t)} /></div>
        <div style={{ marginBottom: 14 }}><Label t={t}>Repayment Number</Label><input type="tel" value={form.repaymentNumber} onChange={e => upd({ repaymentNumber: e.target.value })} placeholder="+233 XX XXX XXXX" style={inputSt(t)} /></div>
        <div style={{ marginBottom: 14 }}>
          <Label t={t}>Repayment Channel</Label>
          <select value={form.channel} onChange={e => upd({ channel: e.target.value })} style={inputSt(t)}>
            <option value="">Select channel</option>
            {channels.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}><Label t={t}>Transaction ID</Label><input value={form.txId} onChange={e => upd({ txId: e.target.value })} placeholder="TXN..." style={inputSt(t)} /></div>
        <div style={{ marginBottom: 24 }}>
          <Label t={t}>Remark</Label>
          <textarea value={form.remark} onChange={e => upd({ remark: e.target.value })} placeholder="Additional notes…" style={{ ...inputSt(t), minHeight: 80, resize: "vertical" }} />
        </div>

        <button style={{ width: "100%", padding: "15px", background: t.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Submit Reconciliation
        </button>
      </div>
    </div>
  );
}

// ─── EXEMPT MODAL ─────────────────────────────────────────────────────────────
function ExemptModal({ t, onClose, overdueAmount, currency }) {
  const [agreed, setAgreed] = useState(false);
  const [remark, setRemark]  = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: t.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>Exempt Customer</span>
          <button onClick={onClose} style={{ background: t.surfaceAlt, border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSub }}><Ico d={I.x} size={15} /></button>
        </div>

        <div style={{ background: t.orangeLight, border: `1px solid ${t.orange}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: t.orange, fontWeight: 600, marginBottom: 4 }}>EXEMPTION AGREEMENT</div>
          <div style={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>
            Customer agrees to pay the initial overdue amount of <strong style={{ color: t.orange }}>{currency} {overdueAmount.toFixed(2)}</strong> only. All penalties and additional interest will be waived upon successful payment.
          </div>
        </div>

        <button onClick={() => setAgreed(a => !a)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: `1.5px solid ${agreed ? t.green : t.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", marginBottom: 16, fontFamily: "inherit" }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: agreed ? t.green : t.surfaceAlt, border: `1.5px solid ${agreed ? t.green : t.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
            {agreed && <Ico d={I.check} size={13} sw={2.5} />}
          </div>
          <span style={{ fontSize: 14, color: t.text }}>Customer agrees to pay <strong>{currency} {overdueAmount.toFixed(2)}</strong></span>
        </button>

        <div style={{ marginBottom: 16 }}>
          <Label t={t}>Remark</Label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="Reason for exemption…" style={{ ...inputSt(t), minHeight: 70, resize: "none" }} />
        </div>

        <button disabled={!agreed}
          style={{ width: "100%", padding: "14px", background: agreed ? t.green : t.surfaceAlt, color: agreed ? "#fff" : t.textMuted, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: agreed ? "pointer" : "default", fontFamily: "inherit", transition: "all 0.2s" }}>
          Confirm Exemption
        </button>
      </div>
    </div>
  );
}

// ─── BOTTOM ACTION BAR ────────────────────────────────────────────────────────
function BottomBar({ t, onRecord, onSms, onReconciliation, onExempt }) {
  const btns = [
    { label: "Record",          action: onRecord,          color: t.blue },
    { label: "SMS",             action: onSms,             color: t.green },
    { label: "Reconciliation",  action: onReconciliation,  color: t.orange },
    { label: "Exempt",          action: onExempt,          color: t.purple },
  ];
  return (
    <div style={{ position: "sticky", bottom: 0, background: "rgba(15,15,14,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid rgba(255,255,255,0.08)`, display: "flex", padding: "10px 8px 18px" }}>
      {btns.map(b => (
        <button key={b.label} onClick={b.action}
          style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 4px", fontFamily: "inherit", opacity: 0.9 }}>
          {b.label}
        </button>
      ))}
    </div>
  );
}

// ─── CUSTOMER INFO TAB ────────────────────────────────────────────────────────
function CustomerInfoTab({ customer, t }) {
  return (
    <div style={{ padding: "0 20px 24px" }}>
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 0 16px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ico d={I.person} size={26} sw={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Name
            <span style={{ marginLeft: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 3, fontSize: 10, fontWeight: 600, padding: "1px 7px", color: t.textSub }}>Old</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{customer.name}</div>
        </div>
      </div>

      <div style={{ height: 16 }} />
      <TwoCol left={{ label: "Gender", value: customer.gender === "M" ? "Male" : "Female" }} right={{ label: "Age", value: customer.age }} t={t} />
      <Divider t={t} />
      <Row label="Marriage Status" value={customer.maritalStatus === "M" ? "Married" : customer.maritalStatus === "S" ? "Single" : customer.maritalStatus} t={t} />
      <Row label="Address" value={customer.address} t={t} />
      <Divider t={t} />

      {/* Phones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Customer</div>
        <button style={{ background: t.blueLight, color: t.blue, border: `1px solid ${t.blue}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add Contacts</button>
      </div>

      {[
        { label: "Phone. 1", number: customer.phone1, network: customer.phone1Network, isMain: true },
        { label: "Phone. 2", number: customer.phone2, network: customer.phone2Network, isMain: false },
      ].map((p, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: p.isMain ? t.red : t.text }}>{p.label}</span>
            {p.network && <span style={{ fontSize: 11, color: t.blue, marginLeft: 8 }}>{p.network}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 14, color: t.text, flex: 1 }}>{p.number}</div>
            <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 10px", cursor: "pointer", color: t.textSub, display: "flex" }}><Ico d={I.edit} size={15} /></button>
            <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 10px", cursor: "pointer", color: t.textSub, display: "flex" }}><Ico d={I.copy} size={15} /></button>
            <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 12px", cursor: "pointer", color: t.textSub, fontSize: 12, fontWeight: 600 }}>SMS</button>
            <a href={`tel:${p.number}`} style={{ background: t.green, border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <PhoneIcon size={13} /> Call
            </a>
          </div>
        </div>
      ))}

      <Divider t={t} />

      {/* Emergency contacts */}
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 14 }}>Emergency Contact</div>
      {customer.emergencyContacts.map((ec, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>{ec.label}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6 }}>{ec.name}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 14, color: t.text, flex: 1 }}>{ec.phone}</div>
            <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 10px", cursor: "pointer", color: t.textSub, display: "flex" }}><Ico d={I.copy} size={15} /></button>
            <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 12px", cursor: "pointer", color: t.textSub, fontSize: 12, fontWeight: 600 }}>SMS</button>
            <a href={`tel:${ec.phone}`} style={{ background: t.green, border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <PhoneIcon size={13} /> Call
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LOAN INFO TAB ────────────────────────────────────────────────────────────
function LoanInfoTab({ loan, t }) {
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ paddingTop: 20, marginBottom: 16 }}>
        <span style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 5, fontSize: 12, fontWeight: 700, padding: "4px 10px", color: t.textSub, letterSpacing: "0.06em" }}>{loan.termType}</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginTop: 12, fontFamily: "'DM Serif Display',Georgia,serif" }}>{loan.product}</div>
      </div>
      <Divider t={t} />

      <Row label="Loan ID"       value={loan.loanId}   t={t} />
      <TwoCol left={{ label: "Loan Amount", value: `${loan.currency} ${loan.loanAmount.toLocaleString()}` }} right={{ label: "Loan Date", value: loan.loanDate }} t={t} />
      <Divider t={t} />
      <TwoCol left={{ label: "Loan Terms", value: loan.loanTerms }} right={{ label: "Due Date", value: loan.dueDate }} t={t} />
      <Divider t={t} />
      <TwoCol
        left={{ label: "Overdue Days", value: loan.overdueDays, color: loan.overdueDays > 0 ? t.red : t.green }}
        right={{ label: "Overdue Amount", value: `${loan.currency} ${loan.overdueAmount.toFixed(2)}`, color: loan.overdueAmount > 0 ? t.blue : t.green }}
        t={t} />
      <Divider t={t} />
      <Row label="Amount after exemption" value={`${loan.currency} ${loan.amountAfterExemption.toFixed(2)}`} t={t} />
      <Row label="Paid Amount" value={`${loan.currency} ${loan.paidAmount.toFixed(2)}`} t={t} />
      <Divider t={t} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${t.blue}`, borderRadius: 8, color: t.blue, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Loan Receipt &gt;&gt;</button>
        <button style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Download link</button>
      </div>

      {/* Terms section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Terms <span style={{ color: t.blue }}>{loan.loanTerms}</span></div>
        {loan.overdueDays > 0 && <span style={{ background: t.redLight, color: t.red, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>Overdue</span>}
      </div>
      <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: "14px 16px" }}>
        <TwoCol left={{ label: "Due Date", value: loan.dueDate }} right={{ label: "Overdue Days", value: loan.overdueDays, color: loan.overdueDays > 0 ? t.red : t.text }} t={t} />
        <Row label="Rec Total Amount" value={`${loan.currency} ${loan.recTotalAmount.toFixed(2)}`} t={t} />
      </div>
    </div>
  );
}

// ─── ACTION INFO TAB ──────────────────────────────────────────────────────────
function ActionInfoTab({ actions, t }) {
  if (!actions.length) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: t.textMuted, fontSize: 14 }}>No actions recorded yet.</div>
  );
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, marginBottom: 12 }}>
        <button style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 12px", cursor: "pointer", color: t.textSub, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Ico d={I.filter} size={13} /> Filter
        </button>
      </div>
      {actions.map(a => (
        <div key={a.no} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.textMuted }}>NO.{a.no}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: t.textMuted }}>Action Time</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.blue }}>{a.time}</div>
            </div>
          </div>
          <Divider t={t} />
          <Row label="Contact Name"  value={a.contactName} t={t} />
          <TwoCol left={{ label: "Contact Type", value: a.contactType }} right={{ label: "Collector", value: a.collector }} t={t} />
          <Divider t={t} />
          <TwoCol left={{ label: "Contact Phone", value: a.contactPhone }} right={{ label: "Action Code", value: `${a.actionCode}` }} t={t} />
          <Row label="Result"       value={a.subCode}       t={t} valueColor={t.blue} />
          <Row label="Action Description" value={a.description} t={t} />
        </div>
      ))}
    </div>
  );
}

// ─── DEDUCTION HISTORY TAB ────────────────────────────────────────────────────
function DeductionHistoryTab({ deductions, currency, t }) {
  const total = deductions.reduce((s, d) => s + d.amount, 0);
  if (!deductions.length) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: t.textMuted, fontSize: 14 }}>No payment history.</div>
  );
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ background: t.greenLight, border: `1px solid ${t.green}`, borderRadius: 10, padding: "14px 16px", margin: "16px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: t.green, fontWeight: 600 }}>Total Paid</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.green, fontFamily: "'DM Serif Display',Georgia,serif" }}>{currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>
      {deductions.map((d, i) => (
        <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.green }}>{currency} {d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>{d.date}</div>
          </div>
          <TwoCol left={{ label: "Transaction ID", value: d.txId }} right={{ label: "Channel", value: d.channel }} t={t} />
        </div>
      ))}
    </div>
  );
}

// ─── DETAIL SCREEN ────────────────────────────────────────────────────────────
function DetailScreen({ caseData, t, onBack, onCaseUpdate }) {
  const [activeTab, setActiveTab]         = useState("Customer Info");
  const [overlay, setOverlay]             = useState(null); // "record"|"sms"|"recon"|"exempt"
  const tabs = ["Customer Info", "Loan Info", "Action Info", "Deduction History"];

  const addAction = (action) => {
    const updated = { ...caseData, actions: [{ ...action, no: caseData.actions.length + 1, contactType: "SF", collector: "ENIOLA BALOGUN", contactPhone: "Phone 1" }, ...caseData.actions] };
    onCaseUpdate(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: t.bg }}>
      {/* Header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: t.text, display: "flex" }}><Ico d={I.back} size={20} sw={2} /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif" }}>Details</span>
      </div>

      {/* 2×2 Tab Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 16px 0" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "13px 10px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: `1.5px solid ${activeTab === tab ? t.blue : t.border}`, background: activeTab === tab ? t.blue : t.surface, color: activeTab === tab ? "#fff" : t.textSub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "Customer Info"      && <CustomerInfoTab    customer={caseData.customer}                              t={t} />}
        {activeTab === "Loan Info"          && <LoanInfoTab         loan={caseData.loan}                                      t={t} />}
        {activeTab === "Action Info"        && <ActionInfoTab       actions={caseData.actions}                                t={t} />}
        {activeTab === "Deduction History"  && <DeductionHistoryTab deductions={caseData.deductions} currency={caseData.loan.currency} t={t} />}
      </div>

      {/* Bottom bar */}
      <BottomBar t={t}
        onRecord={() => setOverlay("record")}
        onSms={() => setOverlay("sms")}
        onReconciliation={() => setOverlay("recon")}
        onExempt={() => setOverlay("exempt")} />

      {/* Overlays */}
      {overlay === "record" && <RecordModal t={t} onClose={() => setOverlay(null)} onSubmit={addAction} customerName={caseData.customer.name} />}
      {overlay === "sms"    && <SmsModal    t={t} onClose={() => setOverlay(null)} customerName={caseData.customer.name} phone1={caseData.customer.phone1} phone2={caseData.customer.phone2} />}
      {overlay === "recon"  && <ReconciliationModal t={t} onClose={() => setOverlay(null)} />}
      {overlay === "exempt" && <ExemptModal t={t} onClose={() => setOverlay(null)} overdueAmount={caseData.loan.overdueAmount} currency={caseData.loan.currency} />}
    </div>
  );
}

// ─── CASES LIST ───────────────────────────────────────────────────────────────
function CasesList({ cases, t, onCaseClick, dark, setDark }) {
  const [tab, setTab]  = useState("All");
  const [q, setQ]      = useState("");
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const handleLogoClick = () => {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) { setDark(d => !d); clickCount.current = 0; }
    else clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 600);
  };

  const shown = cases.filter(c => {
    const ms = c.customer.name.toLowerCase().includes(q.toLowerCase()) || c.product.toLowerCase().includes(q.toLowerCase());
    const mt = tab === "All" || c.caseStatus.toLowerCase() === tab.toLowerCase();
    return ms && mt;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: t.bg }}>
      {/* Header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div onClick={handleLogoClick} style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display',Georgia,serif", cursor: "default", userSelect: "none" }}>LendFlow</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: t.textMuted }}>Triple-click logo to toggle theme</div>
          </div>
        </div>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted }}><Ico d={I.search} size={16} /></div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Case Information" style={{ ...inputSt(t), paddingLeft: 40, borderRadius: 24 }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, overflowX: "auto", display: "flex", padding: "0 16px" }}>
        {CASE_TABS.map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ padding: "12px 16px", fontSize: 13, fontWeight: tab === tb ? 700 : 400, color: tab === tb ? t.blue : t.textMuted, background: "transparent", border: "none", cursor: "pointer", borderBottom: `2.5px solid ${tab === tb ? t.blue : "transparent"}`, whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>{tb}</button>
        ))}
      </div>

      {/* Count + filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: t.blue }}>{shown.length} case{shown.length !== 1 ? "s" : ""}</span>
        <button style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: t.textSub, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Ico d={I.filter} size={13} /> Filter
        </button>
      </div>

      {/* Case cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {shown.map((c, idx) => (
          <div key={c.id} onClick={() => onCaseClick(c)}
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.blue}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 8px", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.blue }}>{idx + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textSub, background: t.surfaceAlt, padding: "3px 10px", borderRadius: 6 }}>{c.product}</span>
                <CasePill status={c.caseStatus} t={t} />
              </div>
              <span style={{ fontSize: 12, color: t.textMuted }}>Call {c.callCount} times</span>
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "2px 7px", color: t.textMuted, flexShrink: 0 }}>{c.borrowerType}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.customer.name}</div>
                  <div style={{ fontSize: 12, marginTop: 3 }}>
                    <span style={{ color: t.textMuted }}>Amount: </span>
                    <span style={{ fontWeight: 700, color: t.text }}>{c.overdueAmount.toFixed(2)}</span>
                    <span style={{ color: t.textMuted, marginLeft: 14 }}>Overdue Days: </span>
                    <span style={{ fontWeight: 700, color: c.overdueDays > 0 ? t.red : t.green }}>{c.overdueDays}</span>
                  </div>
                </div>
              </div>
              {/* Call button */}
              <a href={`tel:${c.customer.phone1}`} onClick={e => e.stopPropagation()}
                style={{ width: 46, height: 46, borderRadius: "50%", background: t.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12, textDecoration: "none" }}>
                <PhoneIcon size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]           = useState(false);
  const [cases, setCases]         = useState(mockCases);
  const [selectedCase, setSelected] = useState(null);
  const t = dark ? themes.dark : themes.light;

  const handleCaseUpdate = (updated) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelected(updated);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: ${t.bg}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
        select option { background: ${t.surface}; color: ${t.text}; }
        input::placeholder, textarea::placeholder { color: ${t.textMuted}; }
        textarea { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: t.bg, position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.15)" }}>
        {selectedCase
          ? <DetailScreen caseData={selectedCase} t={t} onBack={() => setSelected(null)} onCaseUpdate={handleCaseUpdate} />
          : <CasesList cases={cases} t={t} onCaseClick={setSelected} dark={dark} setDark={setDark} />
        }
      </div>
    </>
  );
}