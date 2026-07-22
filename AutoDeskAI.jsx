import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Car, Calendar, Wrench, RefreshCw, DollarSign,
  User, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Fuel, Gauge,
  ShieldCheck, MapPin, Clock, Phone, Mail, ArrowRight, LayoutDashboard,
  Users, ClipboardList, BarChart3, Sun, Moon, Smartphone, Monitor,
  Search, Star, Bot, ChevronDown, Check, Zap, Award
} from "lucide-react";

/* ---------------------------------- DATA ---------------------------------- */

const VEHICLES = [
  {
    id: "v1", make: "Solvane", model: "Atlas SE", year: 2025, price: 36450,
    type: "SUV", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
    mpg: "28 city / 34 hwy", engine: "2.0L Turbo I4, 228 hp", drivetrain: "AWD",
    seats: "5 seats", safety: ["Adaptive Cruise Control", "Lane Keep Assist", "360° Camera", "Auto Emergency Braking"],
    features: ["Panoramic sunroof", "Wireless CarPlay/Android Auto", "Heated + ventilated seats", "12.3\" touchscreen"],
    rating: 4.7,
  },
  {
    id: "v2", make: "Kestrel", model: "Ridgeline LX", year: 2025, price: 38990,
    type: "SUV", img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
    mpg: "25 city / 31 hwy", engine: "2.5L Hybrid I4, 245 hp combined", drivetrain: "AWD",
    seats: "7 seats", safety: ["Blind Spot Monitor", "Rear Cross-Traffic Alert", "Auto High-Beams", "Auto Emergency Braking"],
    features: ["3rd row seating", "Hands-free liftgate", "Premium audio (12 spk)", "Ambient interior lighting"],
    rating: 4.8,
  },
  {
    id: "v3", make: "Norwin", model: "Aster GX", year: 2024, price: 33210,
    type: "SUV", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    mpg: "30 city / 36 hwy", engine: "1.5L Turbo I4, 191 hp", drivetrain: "FWD",
    seats: "5 seats", safety: ["Lane Departure Warning", "Auto Emergency Braking", "Rear Camera", "Tire Pressure Monitor"],
    features: ["Dual-zone climate", "10\" touchscreen", "Power liftgate", "Leatherette seating"],
    rating: 4.5,
  },
];

const LOCATIONS = ["Downtown Motors — Main St", "Northgate Auto Plaza", "Riverside Certified Pre-Owned"];
const SERVICES = ["Oil Change", "Tire Rotation", "Brake Inspection", "Battery Check", "Multi-point Inspection", "Software Update"];
const TIMESLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];

const SALES_PEOPLE = ["Maria Chen", "Jordan Blake", "Priya Nair", "Sam Ortiz"];

const LEADS = [
  { id: "L-1042", name: "Ethan Cole", vehicle: "Kestrel Ridgeline LX", status: "Hot", value: 38990, rep: "Maria Chen", time: "12m ago" },
  { id: "L-1041", name: "Dana Whitfield", vehicle: "Solvane Atlas SE", status: "Warm", value: 36450, rep: "Jordan Blake", time: "38m ago" },
  { id: "L-1040", name: "Marcus Reyes", vehicle: "Norwin Aster GX", status: "New", value: 33210, rep: "Unassigned", time: "1h ago" },
  { id: "L-1039", name: "Aiko Tanaka", vehicle: "Kestrel Ridgeline LX", status: "Hot", value: 38990, rep: "Priya Nair", time: "2h ago" },
  { id: "L-1038", name: "Bilal Farooq", vehicle: "Solvane Atlas SE", status: "Cold", value: 36450, rep: "Sam Ortiz", time: "5h ago" },
];

const TEST_DRIVES = [
  { id: "TD-221", name: "Ethan Cole", vehicle: "Kestrel Ridgeline LX", date: "Jul 24", time: "1:30 PM", location: "Downtown Motors" },
  { id: "TD-220", name: "Grace Kim", vehicle: "Norwin Aster GX", date: "Jul 24", time: "10:30 AM", location: "Northgate Auto Plaza" },
  { id: "TD-219", name: "Owen Park", vehicle: "Solvane Atlas SE", date: "Jul 25", time: "3:00 PM", location: "Downtown Motors" },
];

const SERVICE_BOOKINGS = [
  { id: "SV-887", name: "Layla Hassan", vehicle: "Solvane Atlas SE '23", service: "Oil Change", date: "Jul 24", time: "9:00 AM" },
  { id: "SV-886", name: "Noah Bennett", vehicle: "Kestrel Ridgeline '22", service: "Brake Inspection", date: "Jul 25", time: "12:00 PM" },
];

const CONVERSATIONS = [
  { id: "C-5510", name: "Ethan Cole", intent: "Test drive + financing", messages: 14, status: "Handed to sales" },
  { id: "C-5509", name: "Dana Whitfield", intent: "Vehicle comparison", messages: 9, status: "In progress" },
  { id: "C-5508", name: "Marcus Reyes", intent: "Trade-in estimate", messages: 6, status: "In progress" },
  { id: "C-5507", name: "Aiko Tanaka", intent: "Service booking", messages: 5, status: "Completed" },
];

/* -------------------------------- HELPERS -------------------------------- */

function matchScore(v, budget, vType) {
  let score = 82;
  if (v.type === vType) score += 8;
  const headroom = (budget - v.price) / budget;
  score += Math.max(-15, Math.min(10, headroom * 40));
  return Math.max(70, Math.min(99, Math.round(score)));
}
function matchReasons(v, budget, vType) {
  const reasons = [];
  if (v.type === vType) reasons.push(`Matches your ${vType.toLowerCase()} preference`);
  if (v.price <= budget) reasons.push(`${fmtMoney(budget - v.price)} under your budget`);
  if (v.rating >= 4.7) reasons.push("Top-rated by recent buyers");
  if (v.safety.length >= 4) reasons.push("Full advanced safety suite");
  return reasons.slice(0, 3);
}

function nextDays(n) {
  const out = [];
  const today = new Date(2026, 6, 23);
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtMoney(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function statusColor(status, theme) {
  const map = {
    Hot: theme === "dark" ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-red-50 text-red-600 border-red-200",
    Warm: theme === "dark" ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-600 border-amber-200",
    New: theme === "dark" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" : "bg-blue-50 text-blue-600 border-blue-200",
    Cold: theme === "dark" ? "bg-slate-500/15 text-slate-300 border-slate-500/30" : "bg-slate-100 text-slate-500 border-slate-200",
  };
  return map[status] || map.New;
}

/* ================================================================== */
/*                              MAIN APP                              */
/* ================================================================== */

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("widget"); // widget | dashboard
  const [mobilePreview, setMobilePreview] = useState(false);

  const dark = theme === "dark";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        dark ? "bg-[#070B14] text-slate-100" : "bg-[#F3F6FB] text-slate-800"
      }`}
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
    >
      <TopBar theme={theme} setTheme={setTheme} view={view} setView={setView} mobilePreview={mobilePreview} setMobilePreview={setMobilePreview} />

      {view === "dashboard" ? (
        <Dashboard dark={dark} />
      ) : (
        <ShowroomBackdrop dark={dark} />
      )}

      {view === "widget" && (
        mobilePreview ? (
          <PhoneFrame dark={dark}>
            <ChatWidget dark={dark} forceOpen embedded />
          </PhoneFrame>
        ) : (
          <ChatWidget dark={dark} />
        )
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Sora', ui-sans-serif, system-ui; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 10px; }
        @keyframes floatIn { from { opacity: 0; transform: translateY(14px) scale(0.98);} to { opacity: 1; transform: translateY(0) scale(1);} }
        .msg-in { animation: floatIn 0.32s cubic-bezier(.2,.8,.2,1); }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.45);} 50% { box-shadow: 0 0 0 10px rgba(59,130,246,0);} }
        .pulse-ring { animation: pulseGlow 2.4s infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .spin-slow { animation: spinSlow 6s linear infinite; }
        @keyframes typingDot { 0%,60%,100%{opacity:.25; transform: translateY(0);} 30%{opacity:1; transform: translateY(-3px);} }
        .type-dot { animation: typingDot 1.1s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #60A5FA; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

/* ------------------------------- TOP BAR --------------------------------- */

function TopBar({ theme, setTheme, view, setView, mobilePreview, setMobilePreview }) {
  const dark = theme === "dark";
  return (
    <div
      className={`sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b backdrop-blur-xl ${
        dark ? "bg-[#070B14]/80 border-white/10" : "bg-white/80 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dark ? "#0E1830" : "#EAF1FE", border: `1px solid ${dark ? "rgba(90,150,255,0.35)" : "rgba(37,99,235,0.25)"}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke={dark ? "#5AA6FF" : "#2563EB"} strokeWidth="1.1" opacity="0.5" />
            {[...Array(8)].map((_, i) => (
              <line key={i} x1="12" y1="3.2" x2="12" y2={i % 2 === 0 ? "5" : "4.2"} stroke={dark ? "#8FC1FF" : "#2563EB"} strokeWidth="1" transform={`rotate(${i * 45} 12 12)`} opacity={i === 5 ? 1 : 0.4} />
            ))}
            <line x1="12" y1="12" x2="15.4" y2="8.4" stroke={dark ? "#5AA6FF" : "#2563EB"} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.4" fill={dark ? "#5AA6FF" : "#2563EB"} />
          </svg>
        </div>
        <span className="font-display font-bold text-[15px] tracking-tight">AutoDesk<span className="text-blue-500">AI</span></span>
        <span className={`hidden sm:inline text-[11px] px-2 py-0.5 rounded-full font-medium ${dark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
          dealership prototype
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <ToggleButton active={view === "widget"} onClick={() => setView("widget")} dark={dark} icon={<MessageCircle size={13} />} label="Showroom" />
        <ToggleButton active={view === "dashboard"} onClick={() => setView("dashboard")} dark={dark} icon={<LayoutDashboard size={13} />} label="CRM Dashboard" />
        <div className={`w-px h-5 mx-1 ${dark ? "bg-white/10" : "bg-slate-200"}`} />
        <ToggleButton active={mobilePreview} onClick={() => setMobilePreview((m) => !m)} dark={dark} icon={mobilePreview ? <Smartphone size={13} /> : <Monitor size={13} />} label={mobilePreview ? "Mobile" : "Desktop"} />
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${dark ? "bg-white/5 hover:bg-white/10 text-amber-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, dark, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
          : dark
          ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* --------------------------- SHOWROOM BACKDROP ---------------------------- */

function ShowroomBackdrop({ dark }) {
  return (
    <div className="relative h-[calc(100vh-52px)] overflow-hidden flex items-center justify-center px-6">
      {/* motion-streak signature — headlight blur lines racing across the canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[18, 34, 52, 68, 84].map((top, i) => (
          <div
            key={top}
            className="absolute h-px"
            style={{
              top: `${top}%`,
              left: 0,
              width: `${46 - i * 4}%`,
              background: `linear-gradient(90deg, transparent, ${dark ? "rgba(90,150,255,0.55)" : "rgba(37,99,235,0.35)"}, transparent)`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>
      {/* vehicle silhouette watermark */}
      <Car
        size={560}
        strokeWidth={0.5}
        className={`absolute -right-24 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? "text-white/[0.03]" : "text-blue-900/[0.04]"}`}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: dark
            ? "radial-gradient(900px 460px at 15% 15%, rgba(37,99,235,0.14), transparent 60%)"
            : "radial-gradient(900px 460px at 15% 15%, rgba(59,130,246,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-xl text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium mb-5 border ${dark ? "border-blue-500/30 text-blue-300 bg-blue-500/10" : "border-blue-200 text-blue-600 bg-blue-50"}`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
          </span>
          Live on dealership site
        </div>
        <h1 className="font-display text-3xl sm:text-[2.7rem] font-bold tracking-tight leading-[1.08]">
          Your dealership,<br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">answering every visitor</span>
        </h1>
        <p className={`mt-4 text-[15px] leading-relaxed max-w-md mx-auto ${dark ? "text-slate-400" : "text-slate-500"}`}>
          This is what a customer sees on your website. Open the assistant in the corner to try
          vehicle search, test drive booking, financing, and trade-in — start to finish.
        </p>
        <div className={`mt-9 flex items-center justify-center rounded-2xl divide-x ${dark ? "divide-white/10 bg-white/[0.03] border border-white/10" : "divide-slate-200 bg-white border border-slate-200"}`}>
          {[
            { n: "24/7", l: "always answering" },
            { n: "38%", l: "more booked test drives" },
            { n: "2.1x", l: "lead conversion" },
          ].map((s) => (
            <div key={s.l} className="flex-1 px-5 py-4">
              <div className="font-display text-xl font-bold text-blue-500 tabular-nums">{s.n}</div>
              <div className={`text-[11px] mt-0.5 ${dark ? "text-slate-500" : "text-slate-500"}`}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ dark, children }) {
  return (
    <div className="flex justify-center items-start py-10 px-4">
      <div
        className={`relative rounded-[2.6rem] p-3 border ${dark ? "bg-black border-white/10" : "bg-slate-900 border-slate-800"}`}
        style={{ width: 390, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20" />
        <div className={`relative rounded-[2.1rem] overflow-hidden ${dark ? "bg-[#070B14]" : "bg-[#F3F6FB]"}`} style={{ height: 780 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*                             CHAT WIDGET                             */
/* ================================================================== */

function ChatWidget({ dark, forceOpen, embedded }) {
  const [open, setOpen] = useState(!!forceOpen);
  const [screen, setScreen] = useState("welcome");
  const [msgs, setMsgs] = useState(seedMessages());
  const [typing, setTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(null);
  const [msgCount, setMsgCount] = useState(1);
  const [leadDone, setLeadDone] = useState(false);
  const [leadPending, setLeadPending] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [budget, setBudget] = useState(40000);
  const [vType, setVType] = useState("SUV");
  const [favorites, setFavorites] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [agentMode, setAgentMode] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing, screen]);

  useEffect(() => {
    if (!open || screen !== "welcome" || agentMode) return;
    const timer = setTimeout(() => {
      say("ai", "Still deciding? Our Kestrel Ridgeline LX has been the most test-driven vehicle this week — want a quick look?");
    }, 16000);
    return () => clearTimeout(timer);
  }, [open, screen, msgCount, agentMode]);

  function seedMessages() {
    return [
      { from: "ai", text: "Hi there! 👋 I'm Ava, your AI assistant from Downtown Motors." },
      { from: "ai", text: "How can I help you today?" },
    ];
  }

  function say(from, text, extra) {
    setMsgs((m) => [...m, { from, text, stream: from === "ai", ...extra }]);
  }

  function aiReply(text, extra, delay = 650) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      say("ai", text, extra);
      setMsgCount((c) => {
        const next = c + 1;
        if (next >= 4 && !leadDone && !leadPending) {
          setLeadPending(true);
          setTimeout(() => {
            say("ai", "By the way — mind sharing a few details so a specialist can follow up with the best offer?");
            setScreen("lead");
          }, 900);
        }
        return next;
      });
    }, delay);
  }

  function handleQuickAction(action) {
    say("user", action);
    setMsgCount((c) => c + 1);
    if (action === "Browse Vehicles") {
      aiReply("Great! What type of vehicle are you looking for, and what's your budget?");
      setScreen("searchFilters");
    } else if (action === "Book a Test Drive") {
      aiReply("I'd love to set that up. Which vehicle are you interested in test driving?");
      setScreen("testDriveVehiclePick");
    } else if (action === "Schedule Service") {
      aiReply("Sure thing — let's get your service booked in under a minute.");
      setScreen("service");
    } else if (action === "Trade-In My Car") {
      aiReply("Happy to help! Tell me a bit about your current vehicle and I'll estimate its value.");
      setScreen("tradeIn");
    } else if (action === "Financing Options") {
      aiReply("Let's find a payment that fits. A few quick numbers first.");
      setScreen("financing");
    } else if (action === "Talk to Sales") {
      aiReply("Of course — I'll connect you with our team. First, let me grab your details so they can reach out right away.");
      setScreen("lead");
    }
  }

  function runVehicleSearch() {
    say("user", `Looking for a ${vType} under ${fmtMoney(budget)}`);
    setMsgCount((c) => c + 1);
    const steps = ["Scanning live inventory…", "Matching your budget…", "Ranking by fit for you…"];
    let i = 0;
    setTyping(false);
    setThinkingStep(steps[0]);
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) setThinkingStep(steps[i]);
      else {
        clearInterval(iv);
        setThinkingStep(null);
        say("ai", `Found ${VEHICLES.length} great matches within budget — ranked by how well they fit what you've told me. Here are my top picks:`);
        setScreen("results");
      }
    }, 550);
  }

  function toggleFavorite(id) {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  function toggleCompare(id) {
    setCompareIds((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 2) return [c[1], id];
      return [...c, id];
    });
  }

  function detectIntent(raw) {
    const t = raw.toLowerCase();
    if (/\b(frustrat|annoyed|angry|ridiculous|not working|useless|terrible|awful|upset)\b/.test(t)) return "frustrated";
    if (/\b(human|agent|person|representative|real person|manager)\b/.test(t)) return "human";
    if (/\b(suv|sedan|truck|ev|electric|vehicle|car|browse|inventory|looking for)\b/.test(t)) return "browse";
    if (/\b(test drive|drive it|try it out)\b/.test(t)) return "testdrive";
    if (/\b(service|oil change|brake|tire|maintenance|repair)\b/.test(t)) return "service";
    if (/\b(trade|trade-in|trade in|sell my car)\b/.test(t)) return "tradein";
    if (/\b(financ|loan|payment|apr|monthly|afford)\b/.test(t)) return "financing";
    if (/\b(compare|comparison|vs\.?|versus)\b/.test(t)) return "compare";
    if (/\b(hi|hello|hey)\b/.test(t)) return "greeting";
    return "unknown";
  }

  function handleFreeText(raw) {
    say("user", raw);
    setMsgCount((c) => c + 1);
    const intent = detectIntent(raw);
    if (intent === "frustrated") {
      aiReply("I'm sorry that's been frustrating — let me help make this quicker. Want me to connect you with a live specialist right away?");
      return;
    }
    if (intent === "human") {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setAgentMode(true);
        say("ai", "Of course — connecting you with a live specialist now. One moment…");
        setTimeout(() => say("ai", "Hi, this is Marcus from our sales team 👋 I can see what you and Ava discussed — happy to pick up from here. What can I help with?"), 1300);
      }, 700);
      return;
    }
    if (intent === "browse") { aiReply("Sounds good — let's narrow it down by type and budget."); setScreen("searchFilters"); return; }
    if (intent === "testdrive") { aiReply("Let's get that booked. Which vehicle would you like to test drive?"); setScreen("testDriveVehiclePick"); return; }
    if (intent === "service") { aiReply("Happy to help with that — let's get your appointment set."); setScreen("service"); return; }
    if (intent === "tradein") { aiReply("Let's figure out what your current vehicle is worth."); setScreen("tradeIn"); return; }
    if (intent === "financing") { aiReply("Let's estimate a monthly payment that works for you."); setScreen("financing"); return; }
    if (intent === "compare" && favorites.length >= 2) { aiReply("Comparing your shortlisted vehicles now."); setCompareIds(favorites.slice(0, 2)); setScreen("compare"); return; }
    if (intent === "greeting") { aiReply("Hey! What can I help you find today?"); setScreen("welcome"); return; }
    aiReply("I can help with vehicle search, test drives, service, trade-in value, or financing — what sounds useful?");
  }

  function openDetails(v) {
    setSelectedVehicle(v);
    say("user", `Tell me more about the ${v.make} ${v.model}`);
    aiReply(`Great choice — the ${v.make} ${v.model} is one of our most popular ${v.type.toLowerCase()}s this month.`);
    setScreen("details");
  }

  function submitLead(data) {
    setLeadDone(true);
    setLeadPending(false);
    say("user", `${data.name} · ${data.email} · ${data.phone}`);
    aiReply("Perfect — you're all set! A specialist will reach out shortly.", {}, 700);
    setScreen("leadSuccess");
  }

  function bookTestDrive(v, date, time, loc) {
    say("user", `Book ${v.make} ${v.model} — ${date} at ${time}, ${loc}`);
    aiReply(`Confirmed! Your test drive for the ${v.make} ${v.model} is booked.`, {}, 700);
    setScreen("testDriveSuccess");
  }

  function bookService(vehicle, service, date, time) {
    say("user", `${service} for ${vehicle} — ${date} at ${time}`);
    aiReply("Your service appointment is booked. See you then!", {}, 700);
    setScreen("serviceSuccess");
  }

  const width = embedded ? "100%" : "min(396px, calc(100vw - 32px))";
  const height = embedded ? "100%" : "min(620px, calc(100vh - 140px))";

  return (
    <>
      {!embedded && (
        <button
          onClick={() => setOpen((o) => !o)}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 ${
            open ? "" : "pulse-ring"
          }`}
          style={{
            background: "linear-gradient(135deg,#3B82F6,#4F46E5)",
            boxShadow: "0 15px 35px -8px rgba(59,130,246,0.55)",
          }}
        >
          {open ? <X size={24} className="text-white" /> : <MessageCircle size={26} className="text-white" />}
        </button>
      )}

      {open && (
        <div
          className={`${embedded ? "" : "fixed bottom-24 right-6 z-50"} flex flex-col overflow-hidden msg-in`}
          style={{
            width, height,
            borderRadius: embedded ? 0 : 26,
            background: dark ? "rgba(13,17,28,0.92)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.06)",
            boxShadow: embedded ? "none" : "0 30px 60px -15px rgba(0,0,0,0.45)",
          }}
        >
          {/* Header */}
          <div
            className="relative px-4 py-3.5 flex items-center justify-between shrink-0"
            style={{ background: "linear-gradient(120deg,#1D4ED8,#4338CA)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#60A5FA,#818CF8,#60A5FA)", backgroundSize: "200% 100%", animation: "shimmer 3.5s linear infinite" }} />
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9.5" stroke="#fff" strokeWidth="1.1" opacity="0.55" />
                  {[...Array(8)].map((_, i) => (
                    <line key={i} x1="12" y1="3.2" x2="12" y2={i % 2 === 0 ? "5" : "4.2"} stroke="#fff" strokeWidth="1" transform={`rotate(${i * 45} 12 12)`} opacity={i === 5 ? 1 : 0.45} />
                  ))}
                  <line x1="12" y1="12" x2="15.4" y2="8.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.4" fill="#fff" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1D4ED8]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-[13.5px] leading-tight">{agentMode ? "Marcus · Sales Specialist" : "Ava · Downtown Motors"}</div>
                <div className="text-blue-100 text-[11px] leading-tight">{agentMode ? "Live agent · connected" : "AI assistant · replies instantly"}</div>
              </div>
            </div>
            {!embedded && (
              <div className="flex items-center gap-1">
                {favorites.length > 0 && (
                  <button onClick={() => setScreen(favorites.length >= 2 ? "compare" : "results")} className="relative flex items-center gap-1 text-white/85 hover:text-white px-1.5 py-1 text-[11px] font-medium">
                    <Star size={13} className="fill-amber-300 text-amber-300" />{favorites.length}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div ref={scrollRef} className={`flex-1 overflow-y-auto px-3.5 py-4 space-y-3 ${dark ? "" : ""}`}>
            {msgs.map((m, i) => (
              <Bubble key={i} m={m} dark={dark} />
            ))}
            {typing && <TypingBubble dark={dark} />}
            {thinkingStep && <ThinkingBubble dark={dark} text={thinkingStep} />}

            {screen === "welcome" && <Welcome dark={dark} onAction={handleQuickAction} />}
            {screen === "searchFilters" && (
              <SearchFilters dark={dark} vType={vType} setVType={setVType} budget={budget} setBudget={setBudget} onSearch={runVehicleSearch} />
            )}
            {screen === "results" && (
              <Results
                dark={dark}
                favorites={favorites}
                compareIds={compareIds}
                budget={budget}
                vType={vType}
                onDetails={openDetails}
                onFavorite={toggleFavorite}
                onCompareToggle={toggleCompare}
                onBookTD={(v) => { setSelectedVehicle(v); setScreen("testDrive"); say("user", `Book a test drive for ${v.make} ${v.model}`); }}
                onCompare={() => setScreen("compare")}
              />
            )}
            {screen === "compare" && (
              <CompareView dark={dark} ids={compareIds} onBack={() => setScreen("results")} onTestDrive={(v) => { setSelectedVehicle(v); setScreen("testDrive"); }} />
            )}
            {screen === "details" && selectedVehicle && (
              <VehicleDetails
                dark={dark}
                v={selectedVehicle}
                onBack={() => setScreen("results")}
                onTestDrive={() => setScreen("testDrive")}
                onQuote={() => { say("user", `Request a quote for ${selectedVehicle.make} ${selectedVehicle.model}`); setScreen("lead"); }}
              />
            )}
            {screen === "testDriveVehiclePick" && (
              <VehiclePicker dark={dark} onPick={(v) => { setSelectedVehicle(v); setScreen("testDrive"); }} />
            )}
            {screen === "testDrive" && (
              <TestDriveBooking dark={dark} vehicle={selectedVehicle || VEHICLES[0]} onConfirm={bookTestDrive} />
            )}
            {screen === "testDriveSuccess" && <SuccessCard dark={dark} title="Test drive booked!" subtitle="We've sent a confirmation and calendar invite to your email." icon={<Calendar size={22} />} />}
            {screen === "service" && <ServiceBooking dark={dark} onConfirm={bookService} />}
            {screen === "serviceSuccess" && <SuccessCard dark={dark} title="Service appointment set" subtitle="You'll get a reminder 24 hours before your visit." icon={<Wrench size={22} />} />}
            {screen === "financing" && <FinancingAssistant dark={dark} />}
            {screen === "tradeIn" && <TradeInEstimator dark={dark} />}
            {screen === "lead" && !leadDone && <LeadCapture dark={dark} onSubmit={submitLead} vehicle={selectedVehicle} />}
            {screen === "leadSuccess" && <SuccessCard dark={dark} title="You're all set!" subtitle="A specialist will reach out within the hour." icon={<CheckCircle2 size={22} />} />}
          </div>

          {/* Input row + quick chips */}
          <MemoryBar dark={dark} vType={vType} budget={budget} screen={screen} selectedVehicle={selectedVehicle} favorites={favorites} leadDone={leadDone} />
          <ChatInputRow dark={dark} onSend={handleFreeText} onReset={() => { setScreen("welcome"); setMsgs(seedMessages()); setMsgCount(1); setAgentMode(false); }} />
        </div>
      )}
    </>
  );
}

/* ------------------------------ SUB-COMPONENTS ---------------------------- */

function Bubble({ m, dark }) {
  const ai = m.from === "ai";
  const [shown, setShown] = useState(ai && m.stream ? "" : m.text);
  useEffect(() => {
    if (!(ai && m.stream)) return;
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setShown(m.text.slice(0, i));
      if (i >= m.text.length) clearInterval(iv);
    }, 14);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, []);
  const done = shown.length >= m.text.length;
  return (
    <div className={`flex ${ai ? "justify-start" : "justify-end"} msg-in`}>
      <div
        className={`max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-snug rounded-2xl ${
          ai
            ? dark
              ? "bg-white/[0.06] text-slate-100 rounded-tl-sm border border-white/[0.06]"
              : "bg-slate-100 text-slate-700 rounded-tl-sm"
            : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
        }`}
      >
        {shown}
        {ai && m.stream && !done && <span className="inline-block w-[2px] h-3 bg-current ml-0.5 align-middle animate-pulse" />}
      </div>
    </div>
  );
}

function TypingBubble({ dark }) {
  return (
    <div className="flex justify-start">
      <div className={`flex items-center gap-1 px-3.5 py-3 rounded-2xl rounded-tl-sm ${dark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`type-dot w-1.5 h-1.5 rounded-full ${dark ? "bg-slate-400" : "bg-slate-400"}`} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function Card({ dark, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-3.5 msg-in ${className}`}
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "#fff",
        border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.07)",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, dark, icon, full }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-transform active:scale-[0.98]`}
      style={{ background: "linear-gradient(120deg,#2563EB,#4F46E5)", boxShadow: "0 8px 18px -6px rgba(59,130,246,0.5)" }}
    >
      {icon}{children}
    </button>
  );
}

function SecondaryButton({ children, onClick, dark, icon, full }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition ${
        dark ? "bg-white/[0.06] text-slate-200 hover:bg-white/[0.1] border border-white/10" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function Welcome({ dark, onAction }) {
  const actions = [
    { label: "Browse Vehicles", icon: <Car size={15} /> },
    { label: "Book a Test Drive", icon: <Calendar size={15} /> },
    { label: "Schedule Service", icon: <Wrench size={15} /> },
    { label: "Trade-In My Car", icon: <RefreshCw size={15} /> },
    { label: "Financing Options", icon: <DollarSign size={15} /> },
    { label: "Talk to Sales", icon: <User size={15} /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 pt-1 msg-in">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => onAction(a.label)}
          className={`flex flex-col items-start gap-2 p-3 rounded-xl text-left text-[12.5px] font-medium transition hover:-translate-y-0.5 ${
            dark ? "bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-200" : "bg-white hover:bg-blue-50/70 border border-slate-200 text-slate-700"
          }`}
        >
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"}`}>{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}

function SearchFilters({ dark, vType, setVType, budget, setBudget, onSearch }) {
  const types = ["SUV", "Sedan", "Truck", "EV"];
  return (
    <Card dark={dark}>
      <div className="text-[12px] font-semibold mb-2 uppercase tracking-wide text-slate-400">Vehicle type</div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setVType(t)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition ${
              vType === t
                ? "bg-blue-600 text-white border-blue-600"
                : dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Max budget</span>
        <span className="font-mono text-[13px] font-semibold text-blue-500">{fmtMoney(budget)}</span>
      </div>
      <input type="range" min="20000" max="60000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-blue-600 mb-4" />
      <PrimaryButton dark={dark} full onClick={onSearch} icon={<Search size={14} />}>Find my vehicles</PrimaryButton>
    </Card>
  );
}

function VehicleCard({ v, dark, onDetails, onBookTD, isFav, onFavorite, isComparing, onCompareToggle, score, reasons }) {
  const [showWhy, setShowWhy] = useState(false);
  return (
    <Card dark={dark} className="!p-0 overflow-hidden">
      <div className="h-32 w-full overflow-hidden relative">
        <img src={v.img} alt={v.model} className="w-full h-full object-cover" />
        <button
          onClick={() => onFavorite(v.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
          aria-label="Save to shortlist"
        >
          <Star size={14} className={isFav ? "fill-amber-300 text-amber-300" : "text-white"} />
        </button>
        {typeof score === "number" && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10.5px] font-semibold">
            <Zap size={10} className="fill-white" />{score}% match
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-semibold text-[14px]">{v.year} {v.make} {v.model}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] text-slate-400">{v.rating} · {v.type}</span>
            </div>
          </div>
          <div className="font-mono font-semibold text-blue-500 text-[14px]">{fmtMoney(v.price)}</div>
        </div>
        <div className="flex gap-3 mt-2.5 mb-2.5 text-[11px]">
          <span className={`flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}><Fuel size={12} />{v.mpg.split(" / ")[1]}</span>
          <span className={`flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}><Gauge size={12} />{v.drivetrain}</span>
          <span className={`flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}><User size={12} />{v.seats}</span>
        </div>
        {reasons && reasons.length > 0 && (
          <div className="mb-2.5">
            <button onClick={() => setShowWhy((s) => !s)} className={`flex items-center gap-1 text-[11px] font-medium ${dark ? "text-blue-300" : "text-blue-600"}`}>
              <Sparkles size={11} />Why we picked this <ChevronDown size={12} className={`transition-transform ${showWhy ? "rotate-180" : ""}`} />
            </button>
            {showWhy && (
              <div className="mt-1.5 space-y-1 msg-in">
                {reasons.map((r) => (
                  <div key={r} className="flex items-start gap-1.5 text-[11.5px] text-slate-400"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />{r}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {onCompareToggle && (
          <label className={`flex items-center gap-1.5 text-[11px] mb-2.5 cursor-pointer ${dark ? "text-slate-400" : "text-slate-500"}`}>
            <input type="checkbox" checked={isComparing} onChange={() => onCompareToggle(v.id)} className="accent-blue-600" />
            Add to compare
          </label>
        )}
        <div className="flex gap-2">
          <SecondaryButton dark={dark} full onClick={() => onDetails(v)}>View details</SecondaryButton>
          <PrimaryButton dark={dark} full onClick={() => onBookTD(v)} icon={<Calendar size={13} />}>Test drive</PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

function ThinkingBubble({ dark, text }) {
  return (
    <div className="flex justify-start msg-in">
      <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[12px] ${dark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-500"}`}>
        <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full spin-slow" style={{ animationDuration: "0.8s" }} />
        {text}
      </div>
    </div>
  );
}

function Results({ dark, onDetails, onBookTD, favorites, compareIds, onFavorite, onCompareToggle, onCompare, budget, vType }) {
  const ranked = [...VEHICLES].sort((a, b) => matchScore(b, budget, vType) - matchScore(a, budget, vType));
  return (
    <div className="space-y-3">
      {compareIds.length > 0 && (
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] ${dark ? "bg-blue-500/10 border border-blue-500/25 text-blue-200" : "bg-blue-50 border border-blue-100 text-blue-700"}`}>
          <span>{compareIds.length} selected to compare</span>
          <button disabled={compareIds.length < 2} onClick={onCompare} className={`font-semibold ${compareIds.length < 2 ? "opacity-40" : "underline"}`}>Compare now</button>
        </div>
      )}
      {ranked.map((v) => (
        <VehicleCard
          key={v.id} v={v} dark={dark} onDetails={onDetails} onBookTD={onBookTD}
          isFav={favorites.includes(v.id)} onFavorite={onFavorite}
          isComparing={compareIds.includes(v.id)} onCompareToggle={onCompareToggle}
          score={matchScore(v, budget, vType)} reasons={matchReasons(v, budget, vType)}
        />
      ))}
    </div>
  );
}

function CompareView({ dark, ids, onBack, onTestDrive }) {
  const cars = VEHICLES.filter((v) => ids.includes(v.id));
  if (cars.length < 2) {
    return <Card dark={dark}><div className="text-[12.5px] text-slate-400 text-center">Pick two vehicles from your results to compare them here.</div></Card>;
  }
  const rows = [
    { label: "Price", key: (v) => fmtMoney(v.price) },
    { label: "Engine", key: (v) => v.engine },
    { label: "Fuel economy", key: (v) => v.mpg },
    { label: "Drivetrain", key: (v) => v.drivetrain },
    { label: "Seating", key: (v) => v.seats },
    { label: "Rating", key: (v) => `${v.rating} / 5` },
  ];
  return (
    <Card dark={dark}>
      <button onClick={onBack} className="flex items-center gap-1 text-[11.5px] text-slate-400 mb-3"><ChevronLeft size={13} />Back to results</button>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {cars.map((v) => (
          <div key={v.id} className="text-center">
            <img src={v.img} className="w-full h-16 object-cover rounded-lg mb-1.5" />
            <div className="text-[11.5px] font-semibold leading-tight">{v.year} {v.make}<br />{v.model}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg overflow-hidden border border-white/10 mb-3">
        {rows.map((r, i) => (
          <div key={r.label} className={`grid grid-cols-2 ${i % 2 === 0 ? (dark ? "bg-white/[0.03]" : "bg-slate-50") : ""}`}>
            {cars.map((v) => (
              <div key={v.id} className="px-2.5 py-2 text-[11px] border-b border-white/5 last:border-0">
                <div className="text-slate-400 text-[9.5px] uppercase tracking-wide">{r.label}</div>
                <div className="font-medium mt-0.5">{r.key(v)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cars.map((v) => (
          <SecondaryButton key={v.id} dark={dark} full onClick={() => onTestDrive(v)} icon={<Calendar size={12} />}>Test drive {v.make}</SecondaryButton>
        ))}
      </div>
    </Card>
  );
}

function VehiclePicker({ dark, onPick }) {
  return (
    <div className="space-y-2">
      {VEHICLES.map((v) => (
        <button
          key={v.id}
          onClick={() => onPick(v)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition ${dark ? "bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]" : "bg-white hover:bg-blue-50/60 border border-slate-200"}`}
        >
          <img src={v.img} className="w-14 h-11 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{v.year} {v.make} {v.model}</div>
            <div className="font-mono text-[11.5px] text-blue-500">{fmtMoney(v.price)}</div>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
        </button>
      ))}
    </div>
  );
}

function VehicleDetails({ dark, v, onBack, onTestDrive, onQuote }) {
  return (
    <Card dark={dark} className="!p-0 overflow-hidden">
      <div className="h-40 w-full relative">
        <img src={v.img} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-display font-bold text-[16px]">{v.year} {v.make} {v.model}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] text-slate-400">{v.rating} rating · {v.type}</span>
            </div>
          </div>
          <div className="font-mono font-bold text-blue-500 text-[16px]">{fmtMoney(v.price)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3">
          <Spec dark={dark} icon={<Fuel size={13} />} label="Fuel economy" value={v.mpg} />
          <Spec dark={dark} icon={<Gauge size={13} />} label="Engine" value={v.engine} />
        </div>

        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Features</div>
          <div className="flex flex-wrap gap-1.5">
            {v.features.map((f) => (
              <span key={f} className={`text-[11px] px-2 py-1 rounded-full ${dark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600"}`}>{f}</span>
            ))}
          </div>
        </div>

        <div className="mb-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 flex items-center gap-1"><ShieldCheck size={12} /> Safety</div>
          <div className="space-y-1">
            {v.safety.map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-[12px]"><Check size={12} className="text-emerald-500" />{s}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton dark={dark} full icon={<BarChart3 size={13} />}>Compare</SecondaryButton>
          <SecondaryButton dark={dark} full onClick={onQuote} icon={<Mail size={13} />}>Get quote</SecondaryButton>
        </div>
        <div className="mt-2">
          <PrimaryButton dark={dark} full onClick={onTestDrive} icon={<Calendar size={13} />}>Book test drive</PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

function Spec({ dark, icon, label, value }) {
  return (
    <div className={`rounded-lg p-2 ${dark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
      <div className="flex items-center gap-1 text-[10.5px] text-slate-400 mb-0.5">{icon}{label}</div>
      <div className="text-[12px] font-medium">{value}</div>
    </div>
  );
}

function TestDriveBooking({ dark, vehicle, onConfirm }) {
  const days = nextDays(9);
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState(TIMESLOTS[1]);
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const label = `${MON[date.getMonth()]} ${date.getDate()}`;
  return (
    <Card dark={dark}>
      <div className="flex items-center gap-2 mb-3">
        <img src={vehicle.img} className="w-11 h-9 rounded-md object-cover" />
        <div className="text-[13px] font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</div>
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Pick a date</div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
        {days.map((d, i) => {
          const active = d.toDateString() === date.toDateString();
          return (
            <button key={i} onClick={() => setDate(d)} className={`shrink-0 w-12 py-1.5 rounded-xl text-center transition ${active ? "bg-blue-600 text-white" : dark ? "bg-white/[0.05] text-slate-300 border border-white/10" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>
              <div className="text-[9.5px] opacity-75">{DOW[d.getDay()]}</div>
              <div className="text-[13px] font-semibold">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Pick a time</div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {TIMESLOTS.map((t) => (
          <button key={t} onClick={() => setTime(t)} className={`py-1.5 rounded-lg text-[11.5px] font-medium transition ${time === t ? "bg-blue-600 text-white" : dark ? "bg-white/[0.05] text-slate-300 border border-white/10" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Dealership location</div>
      <div className="space-y-1.5 mb-4">
        {LOCATIONS.map((l) => (
          <button key={l} onClick={() => setLoc(l)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] transition ${loc === l ? (dark ? "bg-blue-500/15 border border-blue-500/40 text-blue-200" : "bg-blue-50 border border-blue-200 text-blue-700") : dark ? "bg-white/[0.04] border border-white/10 text-slate-300" : "bg-slate-50 border border-slate-200 text-slate-600"}`}>
            <MapPin size={13} />{l}
          </button>
        ))}
      </div>

      <PrimaryButton dark={dark} full icon={<CheckCircle2 size={14} />} onClick={() => onConfirm(vehicle, label, time, loc)}>
        Confirm booking — {label}, {time}
      </PrimaryButton>
    </Card>
  );
}

function ServiceBooking({ dark, onConfirm }) {
  const [vehicle, setVehicle] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const days = nextDays(7);
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState(TIMESLOTS[0]);
  const label = `${MON[date.getMonth()]} ${date.getDate()}`;
  return (
    <Card dark={dark}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Your vehicle</div>
      <input
        value={vehicle}
        onChange={(e) => setVehicle(e.target.value)}
        placeholder="e.g. 2023 Solvane Atlas SE"
        className={`w-full px-3 py-2 rounded-lg text-[12.5px] mb-3 outline-none ${dark ? "bg-white/[0.05] border border-white/10 placeholder-slate-500" : "bg-slate-50 border border-slate-200 placeholder-slate-400"}`}
      />
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Service type</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SERVICES.map((s) => (
          <button key={s} onClick={() => setService(s)} className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-medium border transition ${service === s ? "bg-blue-600 text-white border-blue-600" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Date</div>
          <select value={label} onChange={(e) => { const d = days.find((x) => `${MON[x.getMonth()]} ${x.getDate()}` === e.target.value); setDate(d); }} className={`w-full px-2.5 py-2 rounded-lg text-[12px] outline-none ${dark ? "bg-white/[0.05] border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
            {days.map((d, i) => <option key={i}>{MON[d.getMonth()]} {d.getDate()}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Time</div>
          <select value={time} onChange={(e) => setTime(e.target.value)} className={`w-full px-2.5 py-2 rounded-lg text-[12px] outline-none ${dark ? "bg-white/[0.05] border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
            {TIMESLOTS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <PrimaryButton dark={dark} full icon={<Wrench size={14} />} onClick={() => onConfirm(vehicle || "your vehicle", service, label, time)}>
        Submit appointment
      </PrimaryButton>
    </Card>
  );
}

function FinancingAssistant({ dark }) {
  const [price, setPrice] = useState(37000);
  const [down, setDown] = useState(5000);
  const [credit, setCredit] = useState("Good (670-739)");
  const [show, setShow] = useState(false);

  const rateMap = { "Excellent (740+)": 0.049, "Good (670-739)": 0.069, "Fair (580-669)": 0.099, "Building (<580)": 0.139 };
  const rate = rateMap[credit];
  const principal = Math.max(price - down, 0);
  const months = 60;
  const m = rate / 12;
  const payment = m === 0 ? principal / months : (principal * m) / (1 - Math.pow(1 + m, -months));

  return (
    <Card dark={dark}>
      <Row dark={dark} label="Vehicle budget" value={fmtMoney(price)}>
        <input type="range" min="20000" max="70000" step="500" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-blue-600" />
      </Row>
      <Row dark={dark} label="Down payment" value={fmtMoney(down)}>
        <input type="range" min="0" max="20000" step="500" value={down} onChange={(e) => setDown(Number(e.target.value))} className="w-full accent-blue-600" />
      </Row>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Credit score range</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(rateMap).map((c) => (
          <button key={c} onClick={() => setCredit(c)} className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition ${credit === c ? "bg-blue-600 text-white border-blue-600" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>{c}</button>
        ))}
      </div>
      <PrimaryButton dark={dark} full icon={<DollarSign size={14} />} onClick={() => setShow(true)}>Calculate my payment</PrimaryButton>

      {show && (
        <div className={`mt-3.5 rounded-xl p-4 text-center msg-in ${dark ? "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"}`}>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Estimated monthly payment</div>
          <div className="font-display text-3xl font-bold text-blue-500">{fmtMoney(Math.round(payment))}<span className="text-[13px] text-slate-400 font-medium">/mo</span></div>
          <div className="text-[11px] text-slate-400 mt-1.5">60-month term · {(rate * 100).toFixed(1)}% est. APR · {fmtMoney(principal)} financed</div>
        </div>
      )}
    </Card>
  );
}

function Row({ dark, label, value, children }) {
  return (
    <div className="mb-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className="font-mono text-[13px] font-semibold text-blue-500">{value}</span>
      </div>
      {children}
    </div>
  );
}

function TradeInEstimator({ dark }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2021);
  const [mileage, setMileage] = useState(45000);
  const [condition, setCondition] = useState("Good");
  const [show, setShow] = useState(false);

  const condMult = { Excellent: 1.08, Good: 0.95, Fair: 0.78, Poor: 0.58 };
  const base = 24000 - (2026 - year) * 1450 - mileage * 0.045;
  const est = Math.max(base * condMult[condition], 2500);
  const low = Math.round(est * 0.92 / 50) * 50;
  const high = Math.round(est * 1.08 / 50) * 50;

  return (
    <Card dark={dark}>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <Field dark={dark} label="Make"><input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Solvane" className={fieldCls(dark)} /></Field>
        <Field dark={dark} label="Model"><input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Atlas SE" className={fieldCls(dark)} /></Field>
      </div>
      <Row dark={dark} label="Year" value={String(year)}>
        <input type="range" min="2012" max="2026" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full accent-blue-600" />
      </Row>
      <Row dark={dark} label="Mileage" value={`${mileage.toLocaleString()} mi`}>
        <input type="range" min="0" max="150000" step="1000" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full accent-blue-600" />
      </Row>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Condition</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(condMult).map((c) => (
          <button key={c} onClick={() => setCondition(c)} className={`px-2.5 py-1.5 rounded-full text-[11.5px] font-medium border transition ${condition === c ? "bg-blue-600 text-white border-blue-600" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>{c}</button>
        ))}
      </div>
      <PrimaryButton dark={dark} full icon={<RefreshCw size={14} />} onClick={() => setShow(true)}>Estimate trade-in value</PrimaryButton>

      {show && (
        <div className={`mt-3.5 rounded-xl p-4 text-center msg-in ${dark ? "bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-emerald-500/30" : "bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100"}`}>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Estimated trade-in value</div>
          <div className="font-display text-2xl font-bold text-emerald-500">{fmtMoney(low)} – {fmtMoney(high)}</div>
          <div className="text-[11px] text-slate-400 mt-1.5">Final offer confirmed after in-person inspection</div>
        </div>
      )}
    </Card>
  );
}

function fieldCls(dark) {
  return `w-full px-3 py-2 rounded-lg text-[12.5px] outline-none ${dark ? "bg-white/[0.05] border border-white/10 placeholder-slate-500" : "bg-slate-50 border border-slate-200 placeholder-slate-400"}`;
}

function Field({ dark, label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function LeadCapture({ dark, onSubmit, vehicle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pref, setPref] = useState(vehicle ? `${vehicle.make} ${vehicle.model}` : "");
  const [timeline, setTimeline] = useState("This month");
  const [tradeIn, setTradeIn] = useState("No");
  const canSubmit = name && email && phone;

  return (
    <Card dark={dark}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"}`}><User size={14} /></div>
        <div className="text-[13px] font-semibold">Quick details</div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={fieldCls(dark)} />
        <div className="grid grid-cols-2 gap-2.5">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={fieldCls(dark)} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={fieldCls(dark)} />
        </div>
        <input value={pref} onChange={(e) => setPref(e.target.value)} placeholder="Preferred vehicle" className={fieldCls(dark)} />
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Purchase timeline</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["Immediately", "This month", "1-3 months", "Just browsing"].map((t) => (
          <button key={t} onClick={() => setTimeline(t)} className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition ${timeline === t ? "bg-blue-600 text-white border-blue-600" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>{t}</button>
        ))}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Trading in a vehicle?</div>
      <div className="flex gap-1.5 mb-4">
        {["Yes", "No"].map((t) => (
          <button key={t} onClick={() => setTradeIn(t)} className={`px-4 py-1.5 rounded-full text-[11.5px] font-medium border transition ${tradeIn === t ? "bg-blue-600 text-white border-blue-600" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>{t}</button>
        ))}
      </div>

      <PrimaryButton dark={dark} full icon={<Send size={13} />} onClick={() => canSubmit && onSubmit({ name, email, phone, pref, timeline, tradeIn })}>
        Submit
      </PrimaryButton>
      {!canSubmit && <div className="text-[10.5px] text-slate-400 text-center mt-1.5">Name, email, and phone are required</div>}
    </Card>
  );
}

function SuccessCard({ dark, title, subtitle, icon }) {
  return (
    <div className={`rounded-2xl p-6 text-center msg-in ${dark ? "bg-gradient-to-br from-emerald-600/15 to-blue-600/15 border border-emerald-500/25" : "bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100"}`}>
      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
        {icon}
      </div>
      <div className="font-display font-bold text-[15px] mb-1">{title}</div>
      <div className="text-[12.5px] text-slate-400">{subtitle}</div>
    </div>
  );
}

function MemoryBar({ dark, vType, budget, screen, selectedVehicle, favorites, leadDone }) {
  const chips = [];
  if (screen !== "welcome") chips.push(`${vType} · under ${fmtMoney(budget)}`);
  if (selectedVehicle) chips.push(`${selectedVehicle.make} ${selectedVehicle.model}`);
  if (favorites.length) chips.push(`${favorites.length} shortlisted`);
  chips.push(leadDone ? "Lead captured" : "Not yet a lead");
  if (chips.length <= 1) return null;
  return (
    <div className={`shrink-0 px-3.5 pt-2 flex items-center gap-1.5 overflow-x-auto text-[10.5px] ${dark ? "text-slate-500" : "text-slate-400"}`}>
      <Sparkles size={11} className="shrink-0 text-blue-400" />
      <span className="shrink-0 font-medium">Ava remembers:</span>
      {chips.map((c, i) => (
        <span key={i} className={`shrink-0 px-2 py-0.5 rounded-full ${dark ? "bg-white/[0.05]" : "bg-slate-100"}`}>{c}</span>
      ))}
    </div>
  );
}

function ChatInputRow({ dark, onSend, onReset }) {
  const [val, setVal] = useState("");
  const [listening, setListening] = useState(false);

  function startVoice() {
    if (listening) return;
    setListening(true);
    setVal("");
    const phrase = "Show me SUVs under 40 thousand dollars";
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVal(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(iv);
        setTimeout(() => { setListening(false); onSend(phrase); setVal(""); }, 400);
      }
    }, 28);
  }

  return (
    <div className={`shrink-0 px-3 py-3 border-t ${dark ? "border-white/[0.07]" : "border-slate-100"}`}>
      <div className="flex items-center gap-2">
        <button onClick={onReset} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${dark ? "bg-white/[0.06] text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-800"}`} title="Restart conversation">
          <RefreshCw size={14} />
        </button>
        <div className="relative flex-1">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onSend(val.trim()); setVal(""); } }}
            placeholder={listening ? "Listening…" : "Type a message…"}
            className={`w-full pl-3.5 pr-9 py-2.5 rounded-full text-[13px] outline-none ${dark ? "bg-white/[0.06] border border-white/10 placeholder-slate-500" : "bg-slate-100 border border-transparent placeholder-slate-400"}`}
          />
          <button
            onClick={startVoice}
            aria-label="Voice input"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${listening ? "bg-red-500 text-white animate-pulse" : dark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" /><path d="M19 11a7 7 0 01-14 0M12 18v3" strokeLinecap="round" /></svg>
          </button>
        </div>
        <button
          onClick={() => { if (val.trim()) { onSend(val.trim()); setVal(""); } }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
          style={{ background: "linear-gradient(120deg,#2563EB,#4F46E5)" }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*                          CRM DASHBOARD VIEW                         */
/* ================================================================== */

function Dashboard({ dark }) {
  const [tab, setTab] = useState("leads");

  const stats = [
    { label: "New leads (24h)", value: "18", delta: "+22%", icon: <Users size={16} />, bg: dark ? "bg-blue-500/15" : "bg-blue-50", fg: "text-blue-500" },
    { label: "Test drives booked", value: "7", delta: "+14%", icon: <Calendar size={16} />, bg: dark ? "bg-indigo-500/15" : "bg-indigo-50", fg: "text-indigo-500" },
    { label: "Service bookings", value: "5", delta: "+8%", icon: <Wrench size={16} />, bg: dark ? "bg-emerald-500/15" : "bg-emerald-50", fg: "text-emerald-500" },
    { label: "AI conversations", value: "63", delta: "+31%", icon: <MessageCircle size={16} />, bg: dark ? "bg-amber-500/15" : "bg-amber-50", fg: "text-amber-500" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-52px)]">
      <aside className={`w-56 shrink-0 border-r px-3 py-5 hidden md:block ${dark ? "border-white/10" : "border-slate-200"}`}>
        <div className={`text-[11px] font-semibold uppercase tracking-wider mb-2 px-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>Overview</div>
        {[
          { id: "leads", label: "Leads", icon: <Users size={15} /> },
          { id: "testdrives", label: "Test drives", icon: <Calendar size={15} /> },
          { id: "service", label: "Service bookings", icon: <Wrench size={15} /> },
          { id: "conversations", label: "AI conversations", icon: <MessageCircle size={15} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium mb-1 transition ${
              tab === t.id
                ? dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700"
                : dark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
        <div className={`mt-6 rounded-xl p-3 ${dark ? "bg-white/[0.04] border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 mb-1"><Zap size={12} />AI performance</div>
          <div className="text-[11.5px] text-slate-400 leading-relaxed">Ava resolved 89% of conversations without a human handoff this week.</div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-5 max-w-6xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold">Dealership CRM</h2>
            <p className={`text-[12.5px] ${dark ? "text-slate-400" : "text-slate-500"}`}>Leads and bookings captured by Ava, your AI assistant.</p>
          </div>
          <div className={`hidden sm:flex items-center gap-1.5 text-[11.5px] px-3 py-1.5 rounded-full ${dark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-600"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Synced live
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${dark ? "bg-white/[0.04] border border-white/10" : "bg-white border border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg} ${s.fg}`}>{s.icon}</span>
                <span className="text-[11px] font-semibold text-emerald-500">{s.delta}</span>
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className={`text-[11.5px] ${dark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {tab === "leads" && <LeadsTable dark={dark} />}
        {tab === "testdrives" && <TestDrivesTable dark={dark} />}
        {tab === "service" && <ServiceTable dark={dark} />}
        {tab === "conversations" && <ConversationsTable dark={dark} />}
      </main>
    </div>
  );
}

function TableShell({ dark, title, children }) {
  return (
    <div className={`rounded-xl overflow-hidden ${dark ? "bg-white/[0.04] border border-white/10" : "bg-white border border-slate-200"}`}>
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${dark ? "border-white/10" : "border-slate-100"}`}>
        <ClipboardList size={14} className="text-blue-500" />
        <span className="text-[13px] font-semibold">{title}</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-2.5">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-[12.5px] ${className}`}>{children}</td>;
}

function LeadsTable({ dark }) {
  return (
    <TableShell dark={dark} title="New leads">
      <table className="w-full">
        <thead><tr className={dark ? "border-b border-white/10" : "border-b border-slate-100"}>
          <Th>Lead</Th><Th>Vehicle interest</Th><Th>Est. value</Th><Th>Status</Th><Th>Assigned</Th><Th>Received</Th>
        </tr></thead>
        <tbody>
          {LEADS.map((l) => (
            <tr key={l.id} className={dark ? "border-b border-white/5 last:border-0" : "border-b border-slate-50 last:border-0"}>
              <Td className="font-medium">{l.name}</Td>
              <Td className="text-slate-400">{l.vehicle}</Td>
              <Td className="font-mono">{fmtMoney(l.value)}</Td>
              <Td><span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusColor(l.status, dark ? "dark" : "light")}`}>{l.status}</span></Td>
              <Td>
                {l.rep === "Unassigned" ? (
                  <span className="text-amber-500 text-[11.5px] font-medium">Unassigned</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-semibold ${dark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>{l.rep.split(" ").map((n) => n[0]).join("")}</span>
                    {l.rep}
                  </span>
                )}
              </Td>
              <Td className="text-slate-400">{l.time}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function TestDrivesTable({ dark }) {
  return (
    <TableShell dark={dark} title="Test drive requests">
      <table className="w-full">
        <thead><tr className={dark ? "border-b border-white/10" : "border-b border-slate-100"}>
          <Th>Customer</Th><Th>Vehicle</Th><Th>Date</Th><Th>Time</Th><Th>Location</Th>
        </tr></thead>
        <tbody>
          {TEST_DRIVES.map((t) => (
            <tr key={t.id} className={dark ? "border-b border-white/5 last:border-0" : "border-b border-slate-50 last:border-0"}>
              <Td className="font-medium">{t.name}</Td>
              <Td className="text-slate-400">{t.vehicle}</Td>
              <Td>{t.date}</Td>
              <Td>{t.time}</Td>
              <Td className="text-slate-400">{t.location}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ServiceTable({ dark }) {
  return (
    <TableShell dark={dark} title="Service bookings">
      <table className="w-full">
        <thead><tr className={dark ? "border-b border-white/10" : "border-b border-slate-100"}>
          <Th>Customer</Th><Th>Vehicle</Th><Th>Service</Th><Th>Date</Th><Th>Time</Th>
        </tr></thead>
        <tbody>
          {SERVICE_BOOKINGS.map((s) => (
            <tr key={s.id} className={dark ? "border-b border-white/5 last:border-0" : "border-b border-slate-50 last:border-0"}>
              <Td className="font-medium">{s.name}</Td>
              <Td className="text-slate-400">{s.vehicle}</Td>
              <Td>{s.service}</Td>
              <Td>{s.date}</Td>
              <Td>{s.time}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ConversationsTable({ dark }) {
  return (
    <TableShell dark={dark} title="AI conversations">
      <table className="w-full">
        <thead><tr className={dark ? "border-b border-white/10" : "border-b border-slate-100"}>
          <Th>Customer</Th><Th>Detected intent</Th><Th>Messages</Th><Th>Status</Th>
        </tr></thead>
        <tbody>
          {CONVERSATIONS.map((c) => (
            <tr key={c.id} className={dark ? "border-b border-white/5 last:border-0" : "border-b border-slate-50 last:border-0"}>
              <Td className="font-medium">{c.name}</Td>
              <Td className="text-slate-400">{c.intent}</Td>
              <Td>{c.messages}</Td>
              <Td>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  c.status === "Completed" ? (dark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-600")
                  : c.status === "Handed to sales" ? (dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600")
                  : (dark ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-600")
                }`}>{c.status}</span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
