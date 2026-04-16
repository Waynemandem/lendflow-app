import { useState, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  light: {
    bg:"#f5f4f0", surface:"#ffffff", surfaceAlt:"#f0efe9",
    border:"#e8e6df", borderStrong:"#d0cdc4",
    text:"#1a1916", textSub:"#6b6860", textMuted:"#a8a69e",
    accent:"#1a1916", accentText:"#ffffff",
    blue:"#2563eb", blueLight:"#eff6ff",
    red:"#dc2626", redLight:"#fef2f2",
    green:"#16a34a", greenLight:"#f0fdf4",
    orange:"#ea580c", orangeLight:"#fff7ed",
    purple:"#7c3aed", purpleLight:"#f5f3ff",
  },
  dark: {
    bg:"#0f0f0e", surface:"#1a1a18", surfaceAlt:"#222220",
    border:"#2e2e2b", borderStrong:"#3e3e3a",
    text:"#e8e6e1", textSub:"#8a8880", textMuted:"#555450",
    accent:"#e8e6e1", accentText:"#0f0f0e",
    blue:"#3b82f6", blueLight:"rgba(59,130,246,0.12)",
    red:"#ef4444", redLight:"rgba(239,68,68,0.12)",
    green:"#22c55e", greenLight:"rgba(34,197,94,0.12)",
    orange:"#f97316", orangeLight:"rgba(249,115,22,0.12)",
    purple:"#a78bfa", purpleLight:"rgba(167,139,250,0.12)",
  },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PRODUCTS = ["All Products","glowcredit","loanglide","quickfund","swiftcash"];
const CASE_TABS = ["All","Unfinished","Prioritized","PTP","Pending","Processed"];
const RELATIONSHIPS = ["Spouse","Parent","Child","Sibling","Friend","Colleague","Other"];
const ACTION_CODES = {
  "Customer Self":["PTP","Postpone","Refuse to Pay","Denied Loan","Power Off/Out of Service","Voicemail","No Number Available","No Answer/Rejected","Others","Suspected Fraud"],
  "Contact":      ["PTP","Promise to Pass On","Unwilling to Pass On","Unknown CM","Power Off/Out of Service","Voicemail","No Number","No One Answered","Others"],
  "Complaint":    ["Repayment Issues","Customer Service Question","App Issues","Internet Issues","Amount Problem","Other Complaint","Client Death"],
};

// ─── CASE STATUS LOGIC (derived, not stored) ──────────────────────────────────
// lastLogin: ISO timestamp of last time customer opened the loan app (null = never)
// isPrioritized : lastLogin within 24 hrs
// isUnfinished  : callCount === 0
// isPTP         : any action with subCode === "PTP"
// isPending     : loan.paidAmount > 0 && loan.overdueDays > 0
// isProcessed   : callCount > 0 && loan.overdueDays === 0
// Dots on card  : blue = prioritized | green = any payment made | red = overdueDays > 14

const NOW = new Date("2026-04-16T10:00:00"); // fixed "now" so demo is stable

const getCaseStatus = (c) => {
  const hasPTP      = c.actions.some(a => a.subCode === "PTP");
  const isPending   = c.loan.paidAmount > 0 && c.loan.overdueDays > 0;
  const isProcessed = c.callCount > 0 && c.loan.overdueDays === 0;
  if (hasPTP)      return "ptp";
  if (isPending)   return "pending";
  if (isProcessed) return "processed";
  if (c.callCount === 0) return "unfinished";
  return "unfinished";
};

const isPrioritized = (c) => {
  if (!c.lastLogin) return false;
  const diff = NOW - new Date(c.lastLogin);
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
};

const mockCases = [
  // Ahmed — called, has PTP action, overdue 12 days → PTP tab, red dot
  { id:1, product:"glowcredit", borrowerType:"Old", callCount:4, overdueDays:12, overdueAmount:725.35,
    lastLogin: null,
    customer:{ name:"Ahmed Zakaria", gender:"M", age:36, maritalStatus:"M", phone1:"+1 (404) 256-7890", phone1Network:"AT&T", phone2:"+1 (404) 123-4567", phone2Network:"T-Mobile", address:"14 Peachtree St NE, Atlanta, GA 30309", emergencyContacts:[{label:"Brothers or sisters",name:"Fatawu Zakaria",phone:"+1 (404) 987-6543"},{label:"Father or mother",name:"Amina Zakaria",phone:"+1 (404) 555-1234"}] },
    loan:{ loanId:"9565384679456116824", product:"glowcredit", termType:"7D3T", loanAmount:1700, loanDate:"2026-03-24", loanTerms:3, overdueDays:12, overdueAmount:725.35, amountAfterExemption:725.35, paidAmount:1400.66, recTotalAmount:715.36, dueDate:"2026-04-14" },
    actions:[{no:1,time:"2026-04-13 09:18:56",contactName:"Ahmed Zakaria",contactType:"SF",collector:"ENIOLA BALOGUN",contactPhone:"Phone 1",actionCode:"Customer Self",subCode:"PTP",description:"Will pay around 5pm today"},{no:2,time:"2026-04-12 14:32:10",contactName:"Fatawu Zakaria",contactType:"EC",collector:"ENIOLA BALOGUN",contactPhone:"Phone 2",actionCode:"Contact",subCode:"Promise to Pass On",description:"Brother said will remind him"}],
    deductions:[{date:"2026-03-28",amount:800.00,txId:"TXN884729201",channel:"Mobile Money"},{date:"2026-03-15",amount:600.66,txId:"TXN772819300",channel:"Bank Transfer"}] },

  // Mourh — called, PTP action, overdue 3 days → PTP tab, green dot (has paid), blue dot (logged in 2hrs ago)
  { id:2, product:"loanglide", borrowerType:"Old", callCount:7, overdueDays:3, overdueAmount:480.53,
    lastLogin: "2026-04-16T08:22:00",
    customer:{ name:"Mourh Ruth", gender:"F", age:29, maritalStatus:"S", phone1:"+1 (212) 234-5678", phone1Network:"Verizon", phone2:"+1 (212) 876-5432", phone2Network:"AT&T", address:"7 5th Avenue, New York, NY 10003", emergencyContacts:[{label:"Spouse",name:"Daniel Ruth",phone:"+1 (212) 444-9988"}] },
    loan:{ loanId:"7712938475610023847", product:"loanglide", termType:"14D2T", loanAmount:1200, loanDate:"2026-03-20", loanTerms:2, overdueDays:3, overdueAmount:480.53, amountAfterExemption:480.53, paidAmount:719.47, recTotalAmount:480.53, dueDate:"2026-04-10" },
    actions:[{no:1,time:"2026-04-13 11:02:44",contactName:"Mourh Ruth",contactType:"SF",collector:"ENIOLA BALOGUN",contactPhone:"Phone 1",actionCode:"Customer Self",subCode:"PTP",description:"Will pay by end of day"}],
    deductions:[{date:"2026-04-01",amount:719.47,txId:"TXN991827364",channel:"Mobile Money"}] },

  // Alice — never called, overdue 1 day, partial payments made → Unfinished tab, green dot
  { id:3, product:"glowcredit", borrowerType:"Old", callCount:0, overdueDays:1, overdueAmount:369.15,
    lastLogin: null,
    customer:{ name:"Alice Whajah", gender:"F", age:44, maritalStatus:"M", phone1:"+1 (323) 321-0987", phone1Network:"T-Mobile", phone2:"+1 (323) 678-3421", phone2Network:"Verizon", address:"22 Sunset Blvd, Los Angeles, CA 90028", emergencyContacts:[{label:"Brothers or sisters",name:"Kofi Whajah",phone:"+1 (323) 111-2233"},{label:"Father or mother",name:"Grace Mensah",phone:"+1 (323) 344-5566"},{label:"Spouse",name:"James Whajah",phone:"+1 (323) 788-9900"}] },
    loan:{ loanId:"3348291764500187263", product:"glowcredit", termType:"7D3T", loanAmount:900, loanDate:"2026-04-05", loanTerms:3, overdueDays:1, overdueAmount:369.15, amountAfterExemption:369.15, paidAmount:530.85, recTotalAmount:369.15, dueDate:"2026-04-13" },
    actions:[], deductions:[{date:"2026-04-10",amount:300.00,txId:"TXN556611223",channel:"Mobile Money"},{date:"2026-04-07",amount:230.85,txId:"TXN443322110",channel:"Bank Transfer"}] },

  // Christopher — called, no PTP, overdue 1 day, logged in 30min ago → Unfinished tab, blue dot (prioritized)
  { id:4, product:"glowcredit", borrowerType:"Old", callCount:5, overdueDays:1, overdueAmount:255.90,
    lastLogin: "2026-04-16T09:32:00",
    customer:{ name:"Christopher Tetteh Gamah", gender:"M", age:51, maritalStatus:"M", phone1:"+1 (312) 909-8877", phone1Network:"AT&T", phone2:"+1 (312) 566-7788", phone2Network:"T-Mobile", address:"3 Michigan Ave, Chicago, IL 60601", emergencyContacts:[{label:"Spouse",name:"Abena Gamah",phone:"+1 (312) 443-2211"}] },
    loan:{ loanId:"5521837465029381746", product:"glowcredit", termType:"30D1T", loanAmount:2000, loanDate:"2026-03-14", loanTerms:1, overdueDays:1, overdueAmount:255.90, amountAfterExemption:255.90, paidAmount:1744.10, recTotalAmount:255.90, dueDate:"2026-04-13" },
    actions:[{no:1,time:"2026-04-12 08:45:30",contactName:"Christopher Tetteh Gamah",contactType:"SF",collector:"ENIOLA BALOGUN",contactPhone:"Phone 1",actionCode:"Customer Self",subCode:"Postpone",description:"Says he will pay next week"}],
    deductions:[{date:"2026-03-30",amount:1000.00,txId:"TXN667788990",channel:"Mobile Money"},{date:"2026-03-20",amount:744.10,txId:"TXN554433221",channel:"Bank Transfer"}] },

  // Efua — called, no PTP, overdue 5 days, paid something → Pending tab, green dot
  { id:5, product:"quickfund", borrowerType:"New", callCount:2, overdueDays:5, overdueAmount:1120.00,
    lastLogin: null,
    customer:{ name:"Efua Mensah", gender:"F", age:33, maritalStatus:"S", phone1:"+1 (713) 112-3344", phone1Network:"Verizon", phone2:"+1 (713) 556-7788", phone2Network:"AT&T", address:"9 Main St, Houston, TX 77002", emergencyContacts:[{label:"Father or mother",name:"Kwame Mensah",phone:"+1 (713) 998-7766"}] },
    loan:{ loanId:"8890123456781234567", product:"quickfund", termType:"14D2T", loanAmount:3000, loanDate:"2026-03-28", loanTerms:2, overdueDays:5, overdueAmount:1120.00, amountAfterExemption:1120.00, paidAmount:1880.00, recTotalAmount:1120.00, dueDate:"2026-04-09" },
    actions:[], deductions:[{date:"2026-04-05",amount:1880.00,txId:"TXN112233445",channel:"Mobile Money"}] },

  // Kofi — called, overdue 0, fully paid → Processed tab, green dot
  { id:6, product:"swiftcash", borrowerType:"New", callCount:3, overdueDays:0, overdueAmount:0,
    lastLogin: null,
    customer:{ name:"Kofi Asante", gender:"M", age:27, maritalStatus:"S", phone1:"+1 (404) 771-2233", phone1Network:"T-Mobile", phone2:"+1 (404) 882-3344", phone2Network:"Verizon", address:"55 Baker St, Atlanta, GA 30318", emergencyContacts:[{label:"Father or mother",name:"Yaa Asante",phone:"+1 (404) 661-1122"}] },
    loan:{ loanId:"1122334455667788990", product:"swiftcash", termType:"7D3T", loanAmount:500, loanDate:"2026-03-10", loanTerms:3, overdueDays:0, overdueAmount:0, amountAfterExemption:0, paidAmount:500, recTotalAmount:0, dueDate:"2026-04-01" },
    actions:[{no:1,time:"2026-04-01 10:00:00",contactName:"Kofi Asante",contactType:"SF",collector:"ENIOLA BALOGUN",contactPhone:"Phone 1",actionCode:"Customer Self",subCode:"PTP",description:"Payment confirmed"}],
    deductions:[{date:"2026-04-01",amount:500.00,txId:"TXN334455667",channel:"Bank Transfer"}] },

  // Nadia — never called, overdue 33 days → Unfinished tab, red dot (long overdue)
  { id:7, product:"loanglide", borrowerType:"New", callCount:0, overdueDays:33, overdueAmount:2100.00,
    lastLogin: null,
    customer:{ name:"Nadia Fontaine", gender:"F", age:38, maritalStatus:"S", phone1:"+1 (305) 441-5566", phone1Network:"AT&T", phone2:"+1 (305) 772-8899", phone2Network:"Verizon", address:"99 Biscayne Blvd, Miami, FL 33132", emergencyContacts:[{label:"Brothers or sisters",name:"Marc Fontaine",phone:"+1 (305) 334-7711"}] },
    loan:{ loanId:"4456789012345678901", product:"loanglide", termType:"30D1T", loanAmount:2500, loanDate:"2026-02-10", loanTerms:1, overdueDays:33, overdueAmount:2100.00, amountAfterExemption:2100.00, paidAmount:400.00, recTotalAmount:2100.00, dueDate:"2026-03-12" },
    actions:[], deductions:[{date:"2026-03-01",amount:400.00,txId:"TXN998877665",channel:"Bank Transfer"}] },

  // Ethan — called, PTP logged, overdue 8 days, logged in 5hrs ago → PTP tab, blue dot + red dot
  { id:8, product:"quickfund", borrowerType:"Old", callCount:5, overdueDays:8, overdueAmount:630.00,
    lastLogin: "2026-04-16T05:10:00",
    customer:{ name:"Ethan Blackwell", gender:"M", age:45, maritalStatus:"M", phone1:"+1 (555) 634-2210", phone1Network:"T-Mobile", phone2:"+1 (555) 899-3344", phone2Network:"AT&T", address:"10 Downing Ave, Boston, MA 02101", emergencyContacts:[{label:"Spouse",name:"Clara Blackwell",phone:"+1 (555) 234-5566"}] },
    loan:{ loanId:"6677889900112233445", product:"quickfund", termType:"14D2T", loanAmount:2000, loanDate:"2026-03-20", loanTerms:2, overdueDays:8, overdueAmount:630.00, amountAfterExemption:630.00, paidAmount:1370.00, recTotalAmount:630.00, dueDate:"2026-04-08" },
    actions:[{no:1,time:"2026-04-14 14:00:00",contactName:"Ethan Blackwell",contactType:"SF",collector:"ENIOLA BALOGUN",contactPhone:"Phone 1",actionCode:"Customer Self",subCode:"PTP",description:"Will pay on Friday"}],
    deductions:[{date:"2026-04-01",amount:1370.00,txId:"TXN556677889",channel:"Mobile Money"}] },
];

const mockRepayments = [
  { id:1, product:"loanglide",   customer:"Asamoah Kwasi Richard",  loanId:"9620280475773870780", amount:201.65, date:"2026-04-15", time:"09:41:01", note:"", principal:190.00, interest:1.91, overdueInterest:4.75, vatFee:4.99 },
  { id:2, product:"glowcredit",  customer:"Ahmed Zakaria",           loanId:"9565384679456116824", amount:800.00, date:"2026-03-28", time:"11:20:34", note:"Partial payment", principal:750.00, interest:15.00, overdueInterest:25.00, vatFee:10.00 },
  { id:3, product:"quickfund",   customer:"Efua Mensah",             loanId:"8890123456781234567", amount:1880.00, date:"2026-04-05", time:"14:05:22", note:"Full settlement", principal:1800.00, interest:45.00, overdueInterest:20.00, vatFee:15.00 },
  { id:4, product:"loanglide",   customer:"Mourh Ruth",              loanId:"7712938475610023847", amount:719.47, date:"2026-04-01", time:"10:30:00", note:"", principal:700.00, interest:10.00, overdueInterest:5.47, vatFee:4.00 },
  { id:5, product:"swiftcash",   customer:"Kofi Asante",             loanId:"1122334455667788990", amount:500.00, date:"2026-04-01", time:"09:00:00", note:"On-time full payment", principal:480.00, interest:12.00, overdueInterest:0, vatFee:8.00 },
  { id:6, product:"glowcredit",  customer:"Alice Whajah",            loanId:"3348291764500187263", amount:300.00, date:"2026-04-10", time:"16:45:11", note:"", principal:285.00, interest:8.00, overdueInterest:4.50, vatFee:2.50 },
];

const mockStats = {
  collector:"ENIOLA BALOGUN", team:"GHIC_1_1_B",
  bucket:"GHIC_S1&GHUC_S1&GHCC_S1&GHKE_S1",
  rank:3, sameBucketWorkers:7,
  updateTime:"2026-04-15 10:03:05",
  currentBonus:0, nextTargetBonus:1000,
  currentRecovery:0.03, nextTargetRecovery:0.03,
  completionRate:23.66, targetAmt:0.13, overdueAmt:0.74,
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size=16, sw=1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const PhoneIco = ({ size=18, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
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
  person:  "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  loan:    "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  history: "M12 8v4l3 3M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  action:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  cases:   "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  orders:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  repay:   "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  stats:   "M18 20V10M12 20V4M6 20v-6",
  chevR:   "M9 18l6-6-6-6",
  medal:   "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  plus:    "M12 5v14M5 12h14",
  trend:   "M22 7l-8.5 8.5-5-5L1 17",
};

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const CasePill = ({ status, t }) => {
  if (status !== "ptp" && status !== "pending" && status !== "processed") return null;
  const map = {
    ptp:       [t.purple, t.purpleLight, "PTP"],
    pending:   [t.orange, t.orangeLight, "Pending"],
    processed: [t.green,  t.greenLight,  "Processed"],
  };
  const [c,bg,label] = map[status];
  return <span style={{ background:bg, color:c, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:3, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{label}</span>;
};

const StatusDot = ({ color }) => (
  <span style={{ display:"inline-block", width:9, height:9, borderRadius:"50%", background:color, flexShrink:0, marginRight:2 }}/>
);

const inSt = t => ({ width:"100%", background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:"11px 14px", color:t.text, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box", appearance:"none" });
const Lbl = ({ c, children }) => <div style={{ fontSize:11, color:c, fontWeight:500, marginBottom:4, letterSpacing:"0.02em" }}>{children}</div>;
const Div = ({ t }) => <div style={{ height:1, background:t.border, margin:"14px 0" }}/>;
const TwoCol = ({ left, right, t }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
    <div><Lbl c={t.textMuted}>{left.label}</Lbl><div style={{ fontSize:15, color:left.color||t.text, fontWeight:500 }}>{left.value}</div></div>
    <div><Lbl c={t.textMuted}>{right.label}</Lbl><div style={{ fontSize:15, color:right.color||t.text, fontWeight:500 }}>{right.value}</div></div>
  </div>
);

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size=32, textSize=18, t, onClick }) => (
  <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, cursor:"default", userSelect:"none" }}>
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={t.blue}/>
      <path d="M20 8v24M26 14h-8.5a4 4 0 0 0 0 8h5a4 4 0 0 1 0 8H13" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/>
    </svg>
    <div>
      <div style={{ fontSize:textSize, fontWeight:800, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif", lineHeight:1.1, letterSpacing:"-0.02em" }}>LendFlow</div>
      <div style={{ fontSize:9, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Collections</div>
    </div>
  </div>
);

// ─── PHONE ROW ────────────────────────────────────────────────────────────────
const PhoneRow = ({ label, number, network, isMain, t }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ marginBottom:7, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14, fontWeight:700, color:isMain?t.red:t.text }}>{label}</span>
      {network && <span style={{ fontSize:11, color:t.blue }}>{network}</span>}
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <span style={{ fontSize:14, color:t.text, flex:1, minWidth:120 }}>{number}</span>
      <button style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 10px", cursor:"pointer", color:t.textSub, display:"flex" }}><Ico d={I.edit} size={14}/></button>
      <button onClick={()=>navigator.clipboard?.writeText(number)} style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 10px", cursor:"pointer", color:t.textSub, display:"flex" }}><Ico d={I.copy} size={14}/></button>
      <button style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", color:t.textSub, fontSize:12, fontWeight:600 }}>SMS</button>
      <a href={`tel:${number}`} style={{ background:t.green, borderRadius:7, padding:"8px 14px", color:"#fff", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
        <PhoneIco size={13}/> Call
      </a>
    </div>
  </div>
);

// ─── ADD CONTACTS MODAL ───────────────────────────────────────────────────────
function AddContactsModal({ t, onClose, onAdd }) {
  const [phone, setPhone]        = useState("");
  const [name, setName]          = useState("");
  const [rel, setRel]            = useState("");
  const [showRelPicker, setShowRelPicker] = useState(false);

  const submit = () => {
    if (!phone||!name||!rel) return;
    onAdd({ label:rel, name, phone });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:700, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:t.surface, borderRadius:"20px 20px 0 0", width:"100%", padding:"0 0 36px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}` }}>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, display:"flex", marginRight:16 }}>
            <Ico d={I.x} size={18} sw={2.2}/>
          </button>
          <span style={{ fontSize:17, fontWeight:700, color:t.blue, fontFamily:"'DM Serif Display',Georgia,serif", flex:1, textAlign:"center", marginRight:34 }}>Add Contacts</span>
        </div>

        <div style={{ padding:"24px 20px 0" }}>
          {/* Phone */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:500, color:t.text, marginBottom:8 }}>
              <span style={{ color:t.red }}>* </span>Phone Number:
            </div>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. 0512345678" style={{ ...inSt(t), borderRadius:10, padding:"14px 16px", fontSize:15 }}/>
          </div>

          {/* Name */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:500, color:t.text, marginBottom:8 }}>
              <span style={{ color:t.red }}>* </span>Name:
            </div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Please enter" style={{ ...inSt(t), borderRadius:10, padding:"14px 16px", fontSize:15 }}/>
          </div>

          {/* Relationship — tap to select */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:14, fontWeight:500, color:t.text, marginBottom:8 }}>
              <span style={{ color:t.red }}>* </span>Relationship:
            </div>
            <button onClick={()=>setShowRelPicker(true)}
              style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", fontFamily:"inherit" }}>
              <span style={{ fontSize:15, color:rel?t.text:t.textMuted }}>{rel || "Select"}</span>
              <Ico d={I.chevR} size={16} sw={2}/>
            </button>
          </div>

          <button onClick={submit}
            style={{ width:"100%", padding:"16px", background:t.blue, color:"#fff", border:"none", borderRadius:50, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity:(!phone||!name||!rel)?0.5:1 }}>
            Submit
          </button>
        </div>
      </div>

      {/* Relationship picker */}
      {showRelPicker && (
        <div style={{ position:"fixed", inset:0, zIndex:800, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"flex-end" }}>
          <div style={{ background:t.surface, borderRadius:"20px 20px 0 0", width:"100%", paddingBottom:36 }}>
            <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${t.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:700, color:t.text }}>Select Relationship</span>
              <button onClick={()=>setShowRelPicker(false)} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, display:"flex" }}><Ico d={I.x} size={16}/></button>
            </div>
            {RELATIONSHIPS.map(r => (
              <button key={r} onClick={()=>{ setRel(r); setShowRelPicker(false); }}
                style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"transparent", border:"none", borderBottom:`1px solid ${t.border}`, cursor:"pointer", fontFamily:"inherit", color:rel===r?t.blue:t.text, fontSize:15 }}>
                {r} {rel===r && <Ico d={I.check} size={16} sw={2.2}/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECORD MODAL (3-step) ────────────────────────────────────────────────────
function RecordModal({ t, onClose, onSubmit, customerName }) {
  const [step, setStep]     = useState(1);
  const [cat, setCat]       = useState(null);
  const [sub, setSub]       = useState(null);
  const [remark, setRemark] = useState("");

  const submit = () => {
    if(!cat||!sub) return;
    onSubmit({ actionCode:cat, subCode:sub, description:remark, contactName:customerName, time:new Date().toISOString().replace("T"," ").slice(0,19) });
    onClose();
  };

  const Screen = ({ children, title, onBk }) => (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:t.surface, display:"flex", flexDirection:"column" }}>
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBk} style={{ background:"none", border:"none", cursor:"pointer", color:t.blue, display:"flex" }}><Ico d={I.back} size={20} sw={2}/></button>
        <span style={{ fontSize:16, fontWeight:700, color:t.blue, fontFamily:"'DM Serif Display',Georgia,serif" }}>{title}</span>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>{children}</div>
    </div>
  );

  if (step===1) return (
    <Screen title="Record Action" onBk={onClose}>
      <div style={{ padding:"10px 0" }}>
        {Object.keys(ACTION_CODES).map(c => (
          <button key={c} onClick={()=>{ setCat(c); setSub(null); setStep(2); }}
            style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"transparent", border:"none", borderBottom:`1px solid ${t.border}`, cursor:"pointer", color:t.text, fontSize:16, fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {c} <Ico d={I.chevR} size={16} sw={2}/>
          </button>
        ))}
      </div>
    </Screen>
  );

  if (step===2) return (
    <Screen title="Reminder Content" onBk={()=>setStep(1)}>
      <div style={{ padding:"10px 0" }}>
        {ACTION_CODES[cat].map(opt => (
          <button key={opt} onClick={()=>{ setSub(opt); setStep(3); }}
            style={{ width:"100%", display:"block", padding:"20px 20px", background:"transparent", border:"none", borderBottom:`1px solid ${t.border}`, cursor:"pointer", color:t.text, fontSize:16, fontFamily:"inherit", textAlign:"left" }}
            onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {opt}
          </button>
        ))}
      </div>
    </Screen>
  );

  return (
    <Screen title="Action Remark" onBk={()=>setStep(2)}>
      <div style={{ padding:"24px 20px" }}>
        <div style={{ background:t.blueLight, border:`1px solid ${t.blue}`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:12, color:t.blue, fontWeight:600, marginBottom:4 }}>{cat}</div>
          <div style={{ fontSize:15, color:t.text, fontWeight:600 }}>{sub}</div>
        </div>
        <Lbl c={t.textMuted}>Action Remark</Lbl>
        <textarea value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Describe the interaction with the customer…"
          style={{ ...inSt(t), minHeight:100, resize:"vertical", lineHeight:1.6 }}/>
        <button onClick={submit} style={{ width:"100%", marginTop:16, padding:"14px", background:t.blue, color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          Submit Record
        </button>
      </div>
    </Screen>
  );
}

// ─── SMS MODAL ────────────────────────────────────────────────────────────────
function SmsModal({ t, onClose, customerName, phone1, phone2 }) {
  const msg = `Dear ${customerName}, your loan repayment is overdue. Please make payment immediately to avoid further charges. Repay now: https://pay.lendflow.app/repay — LendFlow`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(msg); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, display:"flex" }}><Ico d={I.back} size={20} sw={2}/></button>
        <span style={{ fontSize:16, fontWeight:700, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>Send SMS</span>
      </div>
      <div style={{ flex:1, padding:"24px 20px", overflowY:"auto" }}>
        <Lbl c={t.textMuted}>Message Template</Lbl>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:18, fontSize:14, color:t.text, lineHeight:1.75, marginBottom:20 }}>{msg}</div>
        <Lbl c={t.textMuted}>Send To</Lbl>
        {[{l:"Phone 1",n:phone1},{l:"Phone 2",n:phone2}].map(p=>(
          <div key={p.l} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:11, color:t.textMuted, marginBottom:3 }}>{p.l}</div><div style={{ fontSize:15, fontWeight:600, color:t.text }}>{p.n}</div></div>
            <a href={`sms:${p.n}?body=${encodeURIComponent(msg)}`} style={{ background:t.green, color:"#fff", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
              <Ico d={I.sms} size={14}/> Send
            </a>
          </div>
        ))}
        <button onClick={copy} style={{ width:"100%", marginTop:8, padding:"13px", background:copied?t.greenLight:t.surfaceAlt, color:copied?t.green:t.textSub, border:`1px solid ${copied?t.green:t.border}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Ico d={copied?I.check:I.copy} size={15}/> {copied?"Copied!":"Copy Message"}
        </button>
      </div>
    </div>
  );
}

// ─── RECONCILIATION ───────────────────────────────────────────────────────────
function ReconModal({ t, onClose }) {
  const [form, setForm] = useState({ issueType:"", amount:"", date:"", trueNum:"", repayNum:"", channel:"", txId:"", remark:"" });
  const upd = v => setForm(p=>({...p,...v}));
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, display:"flex" }}><Ico d={I.back} size={20} sw={2}/></button>
        <span style={{ fontSize:16, fontWeight:700, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>Reconciliation</span>
      </div>
      <div style={{ flex:1, padding:"20px", overflowY:"auto" }}>
        {[
          {l:"Issue Type", el:<select value={form.issueType} onChange={e=>upd({issueType:e.target.value})} style={inSt(t)}><option value="">Select issue type</option>{["Payment Not Reflected","Wrong Amount","Duplicate Payment","Reversal Request","Other"].map(o=><option key={o}>{o}</option>)}</select>},
          {l:"Amount ($)", el:<input type="number" value={form.amount} onChange={e=>upd({amount:e.target.value})} placeholder="0.00" style={inSt(t)}/>},
          {l:"Repayment Date", el:<input type="date" value={form.date} onChange={e=>upd({date:e.target.value})} style={inSt(t)}/>},
          {l:"Picture / Receipt", el:<div style={{ border:`2px dashed ${t.border}`, borderRadius:10, padding:"28px", textAlign:"center", background:t.surfaceAlt, cursor:"pointer" }}><div style={{ color:t.textMuted, marginBottom:6, display:"flex", justifyContent:"center" }}><Ico d={I.upload} size={26}/></div><div style={{ fontSize:13, color:t.textMuted }}>Tap to upload image</div></div>},
          {l:"True Registered Number", el:<input type="tel" value={form.trueNum} onChange={e=>upd({trueNum:e.target.value})} placeholder="+1 (555) 000-0000" style={inSt(t)}/>},
          {l:"Repayment Number",       el:<input type="tel" value={form.repayNum} onChange={e=>upd({repayNum:e.target.value})} placeholder="+1 (555) 000-0000" style={inSt(t)}/>},
          {l:"Repayment Channel",      el:<select value={form.channel} onChange={e=>upd({channel:e.target.value})} style={inSt(t)}><option value="">Select channel</option>{["Mobile Money","Bank Transfer","Cash","POS","Other"].map(o=><option key={o}>{o}</option>)}</select>},
          {l:"Transaction ID",         el:<input value={form.txId} onChange={e=>upd({txId:e.target.value})} placeholder="TXN..." style={inSt(t)}/>},
          {l:"Remark",                 el:<textarea value={form.remark} onChange={e=>upd({remark:e.target.value})} placeholder="Additional notes…" style={{ ...inSt(t), minHeight:80, resize:"vertical" }}/>},
        ].map(f=>(
          <div key={f.l} style={{ marginBottom:16 }}><Lbl c={t.textMuted}>{f.l}</Lbl>{f.el}</div>
        ))}
        <button style={{ width:"100%", padding:"14px", background:t.blue, color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginTop:8 }}>Submit Reconciliation</button>
      </div>
    </div>
  );
}

// ─── EXEMPT MODAL ─────────────────────────────────────────────────────────────
function ExemptModal({ t, onClose, overdueAmount }) {
  const [agreed, setAgreed] = useState(false);
  const [remark, setRemark] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:t.surface, borderRadius:"20px 20px 0 0", width:"100%", padding:"24px 20px 36px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:17, fontWeight:700, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>Exempt Customer</span>
          <button onClick={onClose} style={{ background:t.surfaceAlt, border:"none", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.textSub }}><Ico d={I.x} size={15}/></button>
        </div>
        <div style={{ background:t.orangeLight, border:`1px solid ${t.orange}`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:12, color:t.orange, fontWeight:600, marginBottom:4 }}>EXEMPTION AGREEMENT</div>
          <div style={{ fontSize:14, color:t.text, lineHeight:1.6 }}>Customer agrees to pay the initial overdue amount of <strong style={{ color:t.orange }}>${overdueAmount.toFixed(2)}</strong> only. All penalties will be waived.</div>
        </div>
        <button onClick={()=>setAgreed(a=>!a)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, background:"transparent", border:`1.5px solid ${agreed?t.green:t.border}`, borderRadius:10, padding:"12px 16px", cursor:"pointer", marginBottom:16, fontFamily:"inherit" }}>
          <div style={{ width:22, height:22, borderRadius:5, background:agreed?t.green:t.surfaceAlt, border:`1.5px solid ${agreed?t.green:t.borderStrong}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {agreed && <Ico d={I.check} size={13} sw={2.5}/>}
          </div>
          <span style={{ fontSize:14, color:t.text }}>Customer agrees to pay <strong>${overdueAmount.toFixed(2)}</strong></span>
        </button>
        <div style={{ marginBottom:16 }}><Lbl c={t.textMuted}>Remark</Lbl><textarea value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Reason for exemption…" style={{ ...inSt(t), minHeight:70, resize:"none" }}/></div>
        <button disabled={!agreed} style={{ width:"100%", padding:"14px", background:agreed?t.green:t.surfaceAlt, color:agreed?"#fff":t.textMuted, border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:agreed?"pointer":"default", fontFamily:"inherit" }}>Confirm Exemption</button>
      </div>
    </div>
  );
}

// ─── BOTTOM BAR ───────────────────────────────────────────────────────────────
const BottomBar = ({ t, onRecord, onSms, onRecon, onExempt }) => (
  <div style={{ background:"rgba(10,10,10,0.96)", backdropFilter:"blur(12px)", display:"flex", padding:"10px 4px 18px", flexShrink:0 }}>
    {[["Record",onRecord],["SMS",onSms],["Reconciliation",onRecon],["Exempt",onExempt]].map(([l,fn])=>(
      <button key={l} onClick={fn} style={{ flex:1, background:"transparent", border:"none", cursor:"pointer", color:"#fff", fontSize:12, fontWeight:600, padding:"8px 4px", fontFamily:"inherit" }}>{l}</button>
    ))}
  </div>
);

// ─── BOTTOM NAV BAR ───────────────────────────────────────────────────────────
const BottomNav = ({ page, setPage, t }) => {
  const tabs = [
    { key:"cases",   label:"Cases",     icon:I.cases  },
    { key:"orders",  label:"Orders",    icon:I.orders },
    { key:"repay",   label:"Repayment", icon:I.repay  },
    { key:"stats",   label:"Statistics",icon:I.stats  },
  ];
  return (
    <div style={{ background:t.surface, borderTop:`1px solid ${t.border}`, display:"flex", padding:"6px 0 16px", flexShrink:0 }}>
      {tabs.map(tb=>{
        const active = page===tb.key;
        return (
          <button key={tb.key} onClick={()=>setPage(tb.key)}
            style={{ flex:1, background:"transparent", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"6px 4px", color:active?t.blue:t.textMuted, fontFamily:"inherit" }}>
            <Ico d={tb.icon} size={20} sw={active?2:1.5}/>
            <span style={{ fontSize:10, fontWeight:active?700:400 }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── CUSTOMER INFO TAB ────────────────────────────────────────────────────────
function CustomerInfoTab({ customer, t, onAddContact }) {
  const [cust, setCust] = useState(customer);
  const [showAdd, setShowAdd] = useState(false);

  const addContact = ec => {
    setCust(prev => ({ ...prev, emergencyContacts:[...prev.emergencyContacts, ec] }));
    setShowAdd(false);
  };

  return (
    <div style={{ padding:"0 20px 100px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 0 16px", borderBottom:`1px solid ${t.border}` }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:t.blue, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ico d={I.person} size={26} sw={1.5}/>
        </div>
        <div>
          <div style={{ fontSize:11, color:t.textMuted, marginBottom:4 }}>Name <span style={{ marginLeft:8, background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:3, fontSize:10, fontWeight:600, padding:"1px 7px", color:t.textSub }}>Old</span></div>
          <div style={{ fontSize:18, fontWeight:700, color:t.text }}>{cust.name}</div>
        </div>
      </div>
      <div style={{ height:16 }}/>
      <TwoCol left={{ label:"Gender", value:cust.gender==="M"?"Male":"Female" }} right={{ label:"Age", value:cust.age }} t={t}/>
      <Div t={t}/>
      <TwoCol left={{ label:"Marriage Status", value:cust.maritalStatus==="M"?"Married":"Single" }} right={{ label:"Address", value:cust.address }} t={t}/>
      <Div t={t}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:600, color:t.text }}>Customer</div>
        <button onClick={()=>setShowAdd(true)} style={{ background:t.blueLight, color:t.blue, border:`1px solid ${t.blue}`, borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>Add Contacts</button>
      </div>
      <PhoneRow label="Phone. 1" number={cust.phone1} network={cust.phone1Network} isMain t={t}/>
      <PhoneRow label="Phone. 2" number={cust.phone2} network={cust.phone2Network} isMain={false} t={t}/>
      <Div t={t}/>
      <div style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:14 }}>Emergency Contact</div>
      {cust.emergencyContacts.map((ec,i)=>(
        <div key={i} style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:t.textMuted, marginBottom:4 }}>{ec.label}</div>
          <div style={{ fontSize:15, fontWeight:600, color:t.text, marginBottom:6 }}>{ec.name}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:14, color:t.text, flex:1, minWidth:120 }}>{ec.phone}</span>
            <button onClick={()=>navigator.clipboard?.writeText(ec.phone)} style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 10px", cursor:"pointer", color:t.textSub, display:"flex" }}><Ico d={I.copy} size={14}/></button>
            <button style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", color:t.textSub, fontSize:12, fontWeight:600 }}>SMS</button>
            <a href={`tel:${ec.phone}`} style={{ background:t.green, borderRadius:7, padding:"8px 14px", color:"#fff", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
              <PhoneIco size={13}/> Call
            </a>
          </div>
        </div>
      ))}
      {showAdd && <AddContactsModal t={t} onClose={()=>setShowAdd(false)} onAdd={addContact}/>}
    </div>
  );
}

// ─── LOAN INFO TAB ────────────────────────────────────────────────────────────
const LoanInfoTab = ({ loan, t }) => (
  <div style={{ padding:"0 20px 100px" }}>
    <div style={{ paddingTop:20, marginBottom:16 }}>
      <span style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:5, fontSize:12, fontWeight:700, padding:"4px 10px", color:t.textSub }}>{loan.termType}</span>
      <div style={{ fontSize:20, fontWeight:700, color:t.text, marginTop:12, fontFamily:"'DM Serif Display',Georgia,serif" }}>{loan.product}</div>
    </div>
    <Div t={t}/>
    <Lbl c={t.textMuted}>Loan ID</Lbl><div style={{ fontSize:14, color:t.text, fontWeight:500, marginBottom:14, wordBreak:"break-all" }}>{loan.loanId}</div>
    <TwoCol left={{ label:"Loan Amount", value:`$${loan.loanAmount.toLocaleString()}` }} right={{ label:"Loan Date", value:loan.loanDate }} t={t}/>
    <Div t={t}/>
    <TwoCol left={{ label:"Loan Terms", value:loan.loanTerms }} right={{ label:"Due Date", value:loan.dueDate }} t={t}/>
    <Div t={t}/>
    <TwoCol left={{ label:"Overdue Days", value:loan.overdueDays, color:loan.overdueDays>0?t.red:t.green }} right={{ label:"Overdue Amount", value:`$${loan.overdueAmount.toFixed(2)}`, color:loan.overdueAmount>0?t.blue:t.green }} t={t}/>
    <Div t={t}/>
    <Lbl c={t.textMuted}>Amount after exemption</Lbl><div style={{ fontSize:15, color:t.text, fontWeight:500, marginBottom:14 }}>${loan.amountAfterExemption.toFixed(2)}</div>
    <Lbl c={t.textMuted}>Paid Amount</Lbl><div style={{ fontSize:15, color:t.text, fontWeight:500, marginBottom:14 }}>${loan.paidAmount.toFixed(2)}</div>
    <Div t={t}/>
    <div style={{ display:"flex", gap:10, marginBottom:20 }}>
      <button style={{ flex:1, padding:"10px", background:"transparent", border:`1px solid ${t.blue}`, borderRadius:8, color:t.blue, fontSize:13, fontWeight:600, cursor:"pointer" }}>Loan Receipt &gt;&gt;</button>
      <button style={{ flex:1, padding:"10px", background:"transparent", border:`1px solid ${t.border}`, borderRadius:8, color:t.textSub, fontSize:13, fontWeight:600, cursor:"pointer" }}>Download link</button>
    </div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Terms <span style={{ color:t.blue }}>{loan.loanTerms}</span></div>
      {loan.overdueDays>0 && <span style={{ background:t.redLight, color:t.red, fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:5 }}>Overdue</span>}
    </div>
    <div style={{ background:t.surfaceAlt, borderRadius:10, padding:"14px 16px" }}>
      <TwoCol left={{ label:"Due Date", value:loan.dueDate }} right={{ label:"Overdue Days", value:loan.overdueDays, color:loan.overdueDays>0?t.red:t.text }} t={t}/>
      <Lbl c={t.textMuted}>Rec Total Amount</Lbl><div style={{ fontSize:15, color:t.text, fontWeight:500 }}>${loan.recTotalAmount.toFixed(2)}</div>
    </div>
  </div>
);

// ─── ACTION INFO TAB ──────────────────────────────────────────────────────────
const ActionInfoTab = ({ actions, t }) => (
  <div style={{ padding:"0 20px 100px" }}>
    <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:16, marginBottom:12 }}>
      <button style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", color:t.textSub, display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
        <Ico d={I.filter} size={13}/> Filter
      </button>
    </div>
    {!actions.length && <div style={{ textAlign:"center", padding:"60px 0", color:t.textMuted, fontSize:14 }}>No actions recorded yet.</div>}
    {actions.map(a=>(
      <div key={a.no} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:t.textMuted }}>NO.{a.no}</span>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:11, color:t.textMuted }}>Action Time</div><div style={{ fontSize:13, fontWeight:700, color:t.blue }}>{a.time}</div></div>
        </div>
        <Div t={t}/>
        <Lbl c={t.textMuted}>Contact Name</Lbl><div style={{ fontSize:15, color:t.text, fontWeight:500, marginBottom:14 }}>{a.contactName}</div>
        <TwoCol left={{ label:"Contact Type", value:a.contactType }} right={{ label:"Collector", value:a.collector }} t={t}/>
        <Div t={t}/>
        <TwoCol left={{ label:"Contact Phone", value:a.contactPhone }} right={{ label:"Action Code", value:a.actionCode }} t={t}/>
        <Lbl c={t.textMuted}>Result</Lbl><div style={{ fontSize:15, color:t.blue, fontWeight:500, marginBottom:14 }}>{a.subCode}</div>
        <Lbl c={t.textMuted}>Action Description</Lbl><div style={{ fontSize:15, color:t.text, fontWeight:500 }}>{a.description||"—"}</div>
      </div>
    ))}
  </div>
);

// ─── DEDUCTION HISTORY TAB ────────────────────────────────────────────────────
const DeductionHistoryTab = ({ deductions, t }) => {
  const total = deductions.reduce((s,d)=>s+d.amount,0);
  return (
    <div style={{ padding:"0 20px 100px" }}>
      <div style={{ background:t.greenLight, border:`1px solid ${t.green}`, borderRadius:10, padding:"14px 16px", margin:"16px 0 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:12, color:t.green, fontWeight:600 }}>Total Paid</div>
        <div style={{ fontSize:22, fontWeight:800, color:t.green, fontFamily:"'DM Serif Display',Georgia,serif" }}>${total.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
      </div>
      {!deductions.length && <div style={{ textAlign:"center", padding:"40px 0", color:t.textMuted, fontSize:14 }}>No payment history.</div>}
      {deductions.map((d,i)=>(
        <div key={i} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontSize:17, fontWeight:700, color:t.green }}>${d.amount.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            <div style={{ fontSize:12, color:t.textMuted }}>{d.date}</div>
          </div>
          <TwoCol left={{ label:"Transaction ID", value:d.txId }} right={{ label:"Channel", value:d.channel }} t={t}/>
        </div>
      ))}
    </div>
  );
};

// ─── DETAIL SCREEN ────────────────────────────────────────────────────────────
function DetailScreen({ caseData, t, onBack, onCaseUpdate }) {
  const [activeTab, setActiveTab] = useState("Customer Info");
  const [overlay, setOverlay]     = useState(null);
  const TABS = [
    { key:"Customer Info",     icon:I.person  },
    { key:"Loan Info",         icon:I.loan    },
    { key:"Action Info",       icon:I.action  },
    { key:"Deduction History", icon:I.history },
  ];
  const addAction = a => {
    const updated = { ...caseData, callCount:caseData.callCount+1, actions:[{ ...a, no:caseData.actions.length+1, contactType:"SF", collector:"ENIOLA BALOGUN", contactPhone:"Phone 1" }, ...caseData.actions] };
    onCaseUpdate(updated);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.bg }}>
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, display:"flex" }}><Ico d={I.back} size={20} sw={2}/></button>
        <span style={{ fontSize:16, fontWeight:700, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>Details</span>
        <div style={{ marginLeft:"auto" }}><CasePill status={caseData.caseStatus} t={t}/></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:"14px 16px 0", flexShrink:0 }}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
            style={{ padding:"13px 10px", fontSize:13, fontWeight:600, borderRadius:10, border:`1.5px solid ${activeTab===tab.key?t.blue:t.border}`, background:activeTab===tab.key?t.blue:t.surface, color:activeTab===tab.key?"#fff":t.textSub, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Ico d={tab.icon} size={14} sw={activeTab===tab.key?2:1.5}/>
            {tab.key}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {activeTab==="Customer Info"     && <CustomerInfoTab    customer={caseData.customer}     t={t}/>}
        {activeTab==="Loan Info"         && <LoanInfoTab        loan={caseData.loan}              t={t}/>}
        {activeTab==="Action Info"       && <ActionInfoTab      actions={caseData.actions}        t={t}/>}
        {activeTab==="Deduction History" && <DeductionHistoryTab deductions={caseData.deductions} t={t}/>}
      </div>
      <BottomBar t={t} onRecord={()=>setOverlay("record")} onSms={()=>setOverlay("sms")} onRecon={()=>setOverlay("recon")} onExempt={()=>setOverlay("exempt")}/>
      {overlay==="record" && <RecordModal t={t} onClose={()=>setOverlay(null)} onSubmit={addAction} customerName={caseData.customer.name}/>}
      {overlay==="sms"    && <SmsModal   t={t} onClose={()=>setOverlay(null)} customerName={caseData.customer.name} phone1={caseData.customer.phone1} phone2={caseData.customer.phone2}/>}
      {overlay==="recon"  && <ReconModal t={t} onClose={()=>setOverlay(null)}/>}
      {overlay==="exempt" && <ExemptModal t={t} onClose={()=>setOverlay(null)} overdueAmount={caseData.loan.overdueAmount}/>}
    </div>
  );
}

// ─── CASES LIST ───────────────────────────────────────────────────────────────
function CasesList({ cases, t, onCaseClick }) {
  const [tab, setTab] = useState("All");
  const [q, setQ]     = useState("");

  const enriched = cases.map(c => {
    const status   = getCaseStatus(c);
    const blueDot  = isPrioritized(c);
    const greenDot = c.loan.paidAmount > 0;
    const redDot   = c.overdueDays > 14;
    return { ...c, status, blueDot, greenDot, redDot };
  });

  const tabFilter = c => {
    switch (tab) {
      case "Unfinished":  return c.callCount === 0;
      case "Prioritized": return c.blueDot;
      case "PTP":         return c.status === "ptp";
      case "Pending":     return c.status === "pending";
      case "Processed":   return c.status === "processed";
      default:            return true;
    }
  };

  const shown = enriched.filter(c => {
    const mq = c.customer.name.toLowerCase().includes(q.toLowerCase()) ||
               c.product.toLowerCase().includes(q.toLowerCase());
    return mq && tabFilter(c);
  });

  const tabCount = tb => {
    switch (tb) {
      case "Unfinished":  return enriched.filter(c=>c.callCount===0).length;
      case "Prioritized": return enriched.filter(c=>c.blueDot).length;
      case "PTP":         return enriched.filter(c=>c.status==="ptp").length;
      case "Pending":     return enriched.filter(c=>c.status==="pending").length;
      case "Processed":   return enriched.filter(c=>c.status==="processed").length;
      default:            return enriched.length;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.bg }}>
      {/* Search */}
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"12px 16px", flexShrink:0 }}>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.textMuted }}><Ico d={I.search} size={16}/></div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Case Information" style={{ ...inSt(t), paddingLeft:40, borderRadius:24 }}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, overflowX:"auto", display:"flex", padding:"0 8px", flexShrink:0 }}>
        {CASE_TABS.map(tb => {
          const active = tab === tb;
          return (
            <button key={tb} onClick={()=>setTab(tb)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"11px 10px", fontSize:13, fontWeight:active?700:400, color:active?t.blue:t.textMuted, background:"transparent", border:"none", cursor:"pointer", borderBottom:`2.5px solid ${active?t.blue:"transparent"}`, whiteSpace:"nowrap", fontFamily:"inherit", flexShrink:0 }}>
              {tb}
              <span style={{ fontSize:10, fontWeight:700, background:active?t.blue:t.surfaceAlt, color:active?"#fff":t.textMuted, borderRadius:10, padding:"1px 6px", minWidth:18, textAlign:"center" }}>
                {tabCount(tb)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count + legend */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:14, fontWeight:700, color:t.blue }}>{shown.length} case{shown.length!==1?"s":""}</span>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, color:t.textMuted }}>
            <span style={{ display:"flex", alignItems:"center", gap:3 }}><StatusDot color={t.blue}/>Active</span>
            <span style={{ display:"flex", alignItems:"center", gap:3 }}><StatusDot color={t.green}/>Paid</span>
            <span style={{ display:"flex", alignItems:"center", gap:3 }}><StatusDot color={t.red}/>Overdue</span>
          </div>
        </div>
        <button style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:7, padding:"6px 12px", cursor:"pointer", color:t.textSub, display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
          <Ico d={I.filter} size={13}/> Filter
        </button>
      </div>

      {/* Cards */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 14px 16px" }}>
        {shown.map((c, idx) => (
          <div key={c.id} onClick={()=>onCaseClick(c)}
            style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, marginBottom:10, overflow:"hidden", cursor:"pointer", transition:"border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=t.blue; e.currentTarget.style.boxShadow=`0 2px 12px ${t.blue}18`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.boxShadow="none"; }}>

            {/* Top: number + product + PTP badge only + call count */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px 7px", borderBottom:`1px solid ${t.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:14, fontWeight:700, color:t.blue }}>{idx+1}</span>
                <span style={{ fontSize:12, fontWeight:600, color:t.textSub, background:t.surfaceAlt, padding:"2px 9px", borderRadius:5 }}>{c.product}</span>
                <CasePill status={c.status} t={t}/>
              </div>
              <span style={{ fontSize:11, color:t.textMuted }}>Call {c.callCount} times</span>
            </div>

            {/* Bottom: type + dots + name + amount/overdue + call btn */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, flex:1, minWidth:0 }}>
                <span style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:4, fontSize:10, fontWeight:700, padding:"2px 6px", color:t.textMuted, flexShrink:0, marginTop:3 }}>
                  {c.borrowerType}
                </span>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      {c.blueDot  && <StatusDot color={t.blue}/>}
                      {c.greenDot && <StatusDot color={t.green}/>}
                      {c.redDot   && <StatusDot color={t.red}/>}
                    </div>
                    <span style={{ fontSize:15, fontWeight:700, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {c.customer.name}
                    </span>
                  </div>
                  <div style={{ fontSize:12 }}>
                    <span style={{ color:t.textMuted }}>Amount: </span>
                    <span style={{ fontWeight:700, color:t.text }}>${c.overdueAmount.toFixed(2)}</span>
                    <span style={{ color:t.textMuted, marginLeft:12 }}>Overdue Days: </span>
                    <span style={{ fontWeight:700, color:c.overdueDays>0?t.red:t.green }}>{c.overdueDays}</span>
                  </div>
                </div>
              </div>
              <a href={`tel:${c.customer.phone1}`} onClick={e=>e.stopPropagation()}
                style={{ width:44, height:44, borderRadius:"50%", background:t.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:10, textDecoration:"none" }}>
                <PhoneIco size={19}/>
              </a>
            </div>
          </div>
        ))}
        {!shown.length && (
          <div style={{ textAlign:"center", padding:"48px 0", color:t.textMuted, fontSize:14 }}>No cases found.</div>
        )}
      </div>
    </div>
  );
}


// ─── REPAYMENT SCREEN ─────────────────────────────────────────────────────────
function RepaymentScreen({ repayments, t }) {
  const [product, setProduct]   = useState("All Products");
  const [dateStr, setDateStr]   = useState("2026-04-15");

  const shown = repayments.filter(r =>
    (product==="All Products"||r.product===product)
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.bg }}>
      {/* Filters */}
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"12px 16px", display:"flex", gap:10, flexShrink:0 }}>
        <div style={{ flex:1, position:"relative" }}>
          <select value={product} onChange={e=>setProduct(e.target.value)} style={{ ...inSt(t), paddingRight:32, borderRadius:8 }}>
            {PRODUCTS.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ flex:1, position:"relative" }}>
          <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} style={{ ...inSt(t), borderRadius:8 }}/>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 24px" }}>
        {!shown.length && <div style={{ textAlign:"center", padding:"48px 0", color:t.textMuted, fontSize:14 }}>No repayments found.</div>}
        {shown.map(r=>(
          <div key={r.id} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
            <div style={{ padding:"18px 18px 14px" }}>
              <div style={{ fontSize:12, color:t.textMuted, marginBottom:4 }}>Repayment Amount:</div>
              <div style={{ fontSize:28, fontWeight:800, color:t.text, letterSpacing:"-0.02em", fontFamily:"'DM Serif Display',Georgia,serif", marginBottom:10 }}>${r.amount.toFixed(2)}</div>
              <div style={{ fontSize:12, color:t.textMuted, marginBottom:2 }}>User Name:</div>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:12 }}>{r.customer}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                <div>
                  <div style={{ fontSize:12, color:t.textMuted, marginBottom:2 }}>Repayment Time</div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{r.date}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{r.time}</div>
                </div>
                <div>
                  <div style={{ fontSize:12, color:t.textMuted, marginBottom:2 }}>Loan ID</div>
                  <div style={{ fontSize:12, color:t.text, wordBreak:"break-all", lineHeight:1.5 }}>{r.loanId}</div>
                </div>
              </div>
              {r.note && <div style={{ marginTop:10 }}><div style={{ fontSize:12, color:t.textMuted, marginBottom:2 }}>Note</div><div style={{ fontSize:13, color:t.text }}>{r.note}</div></div>}
            </div>
            <Div t={t}/>
            <div style={{ padding:"0 18px 16px" }}>
              {[["Principal",r.principal],["Interest",r.interest],["Overdue Interest",r.overdueInterest],["VAT Fee",r.vatFee]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:13, color:t.textMuted }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:t.text }}>${v.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign:"center", fontSize:12, color:t.textMuted, padding:"8px 0" }}>— no more —</div>
      </div>
    </div>
  );
}

// ─── STATISTICS SCREEN ────────────────────────────────────────────────────────
const MEDAL_COLORS = {
  1: { bg:"linear-gradient(135deg,#FFD700,#FFA500)", ring:"#FFD700", text:"#7b4f00", label:"Gold"   },
  2: { bg:"linear-gradient(135deg,#C0C0C0,#A0A0A0)", ring:"#C0C0C0", text:"#4a4a4a", label:"Silver" },
  3: { bg:"linear-gradient(135deg,#CD7F32,#A0522D)", ring:"#CD7F32", text:"#5c2e00", label:"Bronze" },
};

function MedalBadge({ rank }) {
  const m = MEDAL_COLORS[rank] || { bg:"linear-gradient(135deg,#6b7280,#4b5563)", ring:"#6b7280", text:"#fff", label:`#${rank}` };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:m.bg, border:`3px solid ${m.ring}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${m.ring}55` }}>
        {rank <= 3 ? (
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="11" r="8" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
            <text x="15" y="15" textAnchor="middle" fill={m.text} fontSize="9" fontWeight="bold" dominantBaseline="middle">{rank}</text>
            <path d="M9.5 17.5L8 27l7-3.5 7 3.5-1.5-9.5" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
          </svg>
        ) : (
          <span style={{ fontSize:16, fontWeight:800, color:"#fff" }}>#{rank}</span>
        )}
      </div>
      <span style={{ fontSize:10, fontWeight:700, color:rank<=3?m.ring:"#6b7280" }}>{m.label}</span>
    </div>
  );
}

function StatisticsScreen({ stats, t }) {
  const pct = Math.min((stats.currentRecovery / (stats.nextTargetRecovery||1)) * 100, 100);
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.bg, overflowY:"auto" }}>
      <div style={{ padding:"16px 16px 32px" }}>

        {/* Bucket */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:13, color:t.textMuted, fontWeight:600, flexShrink:0 }}>Bucket</span>
          <div style={{ fontSize:12, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"monospace" }}>{stats.bucket}</div>
        </div>

        {/* Rank card */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 18px", marginBottom:14 }}>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:20 }}>
            <MedalBadge rank={stats.rank}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:t.textMuted, marginBottom:4 }}>
                Team <span style={{ color:t.text, fontWeight:700 }}>{stats.team}</span>
              </div>
              <div style={{ fontSize:13, color:t.textMuted, marginBottom:4 }}>
                Same bucket work number <span style={{ color:t.blue, fontWeight:700 }}>{stats.sameBucketWorkers}</span>
              </div>
              <div style={{ fontSize:11, color:t.textMuted }}>Update time: {stats.updateTime}</div>
            </div>
            <div style={{ fontSize:10, color:t.textMuted, textAlign:"right", flexShrink:0, lineHeight:1.5 }}>Amount Unit:<br/>Ten thousand</div>
          </div>

          {/* Bonus progress */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>${stats.currentBonus.toLocaleString()}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>Current Bonus</div>
            </div>
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:7, height:18, borderRadius:2, background:t.blue, opacity:0.3+(i*0.25) }}/>
              ))}
              <div style={{ width:0, height:0, borderTop:"7px solid transparent", borderBottom:"7px solid transparent", borderLeft:`11px solid ${t.blue}`, marginLeft:2 }}/>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:22, fontWeight:800, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif" }}>${stats.nextTargetBonus.toLocaleString()}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>Next Target Bonus</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height:8, background:t.border, borderRadius:4, marginBottom:16, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:t.blue, borderRadius:4 }}/>
          </div>

          {/* Recovery */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:26, fontWeight:800, color:t.blue, fontFamily:"'DM Serif Display',Georgia,serif" }}>{stats.currentRecovery.toFixed(2)}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>Current Recovery Amt</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:15, fontWeight:600, color:t.text }}>{stats.nextTargetRecovery.toFixed(2)}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>Next Target Recovery Amt</div>
            </div>
          </div>

          <button style={{ width:"100%", textAlign:"right", background:"transparent", border:"none", cursor:"pointer", color:t.blue, fontSize:13, fontWeight:600, marginTop:14, padding:0, fontFamily:"inherit" }}>
            Historical Bonus &gt;&gt;
          </button>
        </div>

        {/* Completion stats */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"18px", marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
            {[
              { label:"Completion Rate", value:`${stats.completionRate}%` },
              { label:"Target Amt",      value:stats.targetAmt.toFixed(2) },
              { label:"Overdue Amt",     value:stats.overdueAmt.toFixed(2) },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center", padding:"10px 4px" }}>
                <div style={{ fontSize:20, fontWeight:800, color:t.text, fontFamily:"'DM Serif Display',Georgia,serif", marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:11, color:t.textMuted, lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's activity */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"18px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Today's Activity</div>
          {[
            { label:"Cases Worked",     value:"4",         color:t.blue   },
            { label:"Calls Made",       value:"17",        color:t.text   },
            { label:"PTP Secured",      value:"2",         color:t.purple },
            { label:"Amount Recovered", value:"$1,205.88", color:t.green  },
          ].map(s=>(
            <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:t.textSub }}>{s.label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── ORDERS SCREEN ────────────────────────────────────────────────────────────
const ORDER_TABS = ["All","Under Review","Agree","Reject","Successful"];

function OrdersScreen({ t }) {
  const [activeTab, setActiveTab]   = useState("All");
  const [activeView, setActiveView] = useState("manualrepay");

  const EmptyBox = () => (
    <svg width="130" height="120" viewBox="0 0 130 120" fill="none">
      <rect x="28" y="50" width="74" height="58" rx="5" fill={t.border}/>
      <path d="M28 66h74" stroke={t.borderStrong} strokeWidth="2"/>
      <path d="M12 50l16-22h74l16 22" fill={t.surfaceAlt} stroke={t.border} strokeWidth="2"/>
      <circle cx="90" cy="32" r="14" fill={t.borderStrong}/>
      <text x="90" y="38" textAnchor="middle" fill={t.surface} fontSize="16" fontWeight="bold">!</text>
      <circle cx="52" cy="78" r="4" fill={t.borderStrong}/>
      <circle cx="78" cy="78" r="4" fill={t.borderStrong}/>
      <path d="M49 92 q16 9 32 0" stroke={t.borderStrong} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.bg }}>
      {/* Search */}
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"12px 16px", flexShrink:0 }}>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.textMuted }}><Ico d={I.search} size={16}/></div>
          <input placeholder="Search Case Information" style={{ ...inSt(t), paddingLeft:40, borderRadius:24 }} readOnly/>
        </div>
      </div>

      {/* Manualrepay / Reconciliation buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"14px 16px 0", flexShrink:0 }}>
        {[["manualrepay","Manualrepay"],["reconciliation","Reconciliation"]].map(([key,label])=>(
          <button key={key} onClick={()=>setActiveView(key)}
            style={{ padding:"14px", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", background:activeView===key?t.blue:"transparent", color:activeView===key?"#fff":t.text, border:`1.5px solid ${activeView===key?t.blue:t.border}`, transition:"all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, overflowX:"auto", display:"flex", padding:"0 8px", flexShrink:0, marginTop:14 }}>
        {ORDER_TABS.map(tb=>(
          <button key={tb} onClick={()=>setActiveTab(tb)}
            style={{ padding:"11px 14px", fontSize:13, fontWeight:activeTab===tb?700:400, color:activeTab===tb?t.blue:t.textMuted, background:"transparent", border:"none", cursor:"pointer", borderBottom:`2.5px solid ${activeTab===tb?t.blue:"transparent"}`, whiteSpace:"nowrap", fontFamily:"inherit", flexShrink:0 }}>
            {tb}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:t.surfaceAlt, padding:"40px 20px" }}>
        <EmptyBox/>
        <div style={{ fontSize:15, color:t.textMuted, fontWeight:500 }}>
          NO {activeView==="manualrepay"?"Manualrepay":"Reconciliation"} history yet
        </div>
      </div>
    </div>
  );
}

// ─── DESKTOP SIDEBAR ──────────────────────────────────────────────────────────
function Sidebar({ t, page, setPage, dark, setDark }) {
  const clickCount = useRef(0); const clickTimer = useRef(null);
  const handleLogoClick = () => {
    clickCount.current+=1; clearTimeout(clickTimer.current);
    if(clickCount.current>=3){setDark(d=>!d);clickCount.current=0;}
    else clickTimer.current=setTimeout(()=>{clickCount.current=0;},600);
  };
  const nav = [
    { key:"cases",  label:"Cases",      icon:I.cases  },
    { key:"orders", label:"Orders",     icon:I.orders },
    { key:"repay",  label:"Repayment",  icon:I.repay  },
    { key:"stats",  label:"Statistics", icon:I.stats  },
  ];
  return (
    <div style={{ width:220, background:t.surface, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", height:"100vh", flexShrink:0 }}>
      <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${t.border}` }}>
        <Logo t={t} onClick={handleLogoClick}/>
      </div>
      <nav style={{ flex:1, padding:"14px 10px" }}>
        <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:t.textMuted, padding:"0 10px 10px" }}>Menu</div>
        {nav.map(item=>{
          const active=page===item.key;
          return (
            <button key={item.key} onClick={()=>setPage(item.key)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 10px", background:active?t.blueLight:"transparent", borderRadius:7, border:"none", cursor:"pointer", color:active?t.blue:t.textSub, fontWeight:active?600:400, fontSize:13, textAlign:"left", marginBottom:2, fontFamily:"inherit" }}>
              <Ico d={item.icon} size={15} sw={active?2:1.5}/>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"14px 20px", borderTop:`1px solid ${t.border}` }}>
        <div style={{ fontSize:10, color:t.textMuted, marginBottom:8 }}>Triple-click logo to toggle theme</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:t.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>EB</div>
          <div><div style={{ fontSize:12, fontWeight:600, color:t.text }}>Eniola Balogun</div><div style={{ fontSize:10, color:t.textMuted }}>Collector</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]         = useState(false);
  const [cases, setCases]       = useState(mockCases);
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState("cases");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const t = dark ? T.dark : T.light;

  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  useState(()=>{ window.addEventListener("resize",checkMobile); return ()=>window.removeEventListener("resize",checkMobile); });

  const handleCaseUpdate = updated => {
    setCases(prev=>prev.map(c=>c.id===updated.id?updated:c));
    setSelected(updated);
  };

  // ── MOBILE ──────────────────────────────────────────────────────────────────
  const clickCount = useRef(0); const clickTimer = useRef(null);
  const handleLogoClick = () => {
    clickCount.current+=1; clearTimeout(clickTimer.current);
    if(clickCount.current>=3){setDark(d=>!d);clickCount.current=0;}
    else clickTimer.current=setTimeout(()=>{clickCount.current=0;},600);
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'DM Sans',sans-serif;background:${t.bg};}
    ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}
    select option{background:${t.surface};color:${t.text};}
    input::placeholder,textarea::placeholder{color:${t.textMuted};}
    textarea{font-family:inherit;}
  `;

  const renderPage = () => {
    if (page==="repay")  return <RepaymentScreen  repayments={mockRepayments} t={t}/>;
    if (page==="stats")  return <StatisticsScreen stats={mockStats}           t={t}/>;
    if (page==="orders") return <OrdersScreen                                 t={t}/>;
    // Cases
    if (selected) return <DetailScreen caseData={selected} t={t} onBack={()=>setSelected(null)} onCaseUpdate={handleCaseUpdate}/>;
    return <CasesList cases={cases} t={t} onCaseClick={c=>{setSelected(c);setPage("cases");}}/>;
  };

  if (!isMobile) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display:"flex", height:"100vh", background:t.bg, overflow:"hidden" }}>
        <Sidebar t={t} page={page} setPage={p=>{setPage(p);setSelected(null);}} dark={dark} setDark={setDark}/>
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {/* Left panel — cases list always shown */}
          <div style={{ width:400, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
            <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"14px 20px", flexShrink:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                {page==="cases"?"Cases":page==="repay"?"Repayment":page==="stats"?"Statistics":"Orders"}
              </div>
            </div>
            <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
              {page==="cases"  && <CasesList     cases={cases}             t={t} onCaseClick={setSelected}/>}
              {page==="repay"  && <RepaymentScreen repayments={mockRepayments} t={t}/>}
              {page==="stats"  && <StatisticsScreen stats={mockStats}       t={t}/>}
              {page==="orders" && <OrdersScreen                             t={t}/>}
            </div>
          </div>
          {/* Right panel — detail or empty state */}
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {selected && page==="cases"
              ? <DetailScreen caseData={selected} t={t} onBack={()=>setSelected(null)} onCaseUpdate={handleCaseUpdate}/>
              : <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:t.textMuted }}>
                  <Logo t={t} size={52} textSize={26}/>
                  <div style={{ fontSize:13, marginTop:4 }}>
                    {page==="cases"?"Select a case to view details":""}
                  </div>
                </div>
            }
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:t.bg, overflow:"hidden" }}>
        {/* Mobile topbar — hide when inside detail */}
        {!selected && (
          <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <Logo t={t} size={26} textSize={15} onClick={handleLogoClick}/>
            <div style={{ fontSize:10, color:t.textMuted }}>3× logo = theme</div>
          </div>
        )}
        {/* Page content */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {renderPage()}
        </div>
        {/* Bottom nav — hide when inside detail */}
        {!selected && <BottomNav page={page} setPage={setPage} t={t}/>}
      </div>
    </>
  );
}