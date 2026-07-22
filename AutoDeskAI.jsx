It looks like your code snippet got cut off right at the end of the styles inside your App component. Let's fix that, complete your CSS animations, and implement the rest of the ChatWidget, Dashboard, and other sub-components so this file builds and runs flawlessly when you deploy it to Vercel.
Here is the complete, self-contained AutoDeskAI.jsx (or App.jsx) file. It contains the mock data engines, a stateful AI simulation engine that mimics smart automotive responses, an interactive customer-facing chatbot, and an analytics dashboard view.

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
        @keyframes floatIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .msg-in { animation: floatIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

/* -------------------------------- TOP BAR -------------------------------- */

function TopBar({ theme, setTheme, view, setView, mobilePreview, setMobilePreview }) {
  const dark = theme === "dark";
  return (
    <header className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors ${
      dark ? "bg-[#0B1220]/90 border-slate-800 backdrop-blur-md" : "bg-white/90 border-slate-200 backdrop-blur-md"
    }`}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm tracking-wide uppercase">AutoDesk AI</h1>
          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Concierge Core Engine v2.5</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-xl flex items-center gap-1 border ${dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
          <button
            onClick={() => setView("widget")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              view === "widget" 
                ? (dark ? "bg-blue-600 text-white shadow" : "bg-white text-slate-900 shadow-sm") 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Client Widget
          </button>
          <button
            onClick={() => setView("dashboard")}

className={px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${ view === "dashboard" ? (dark ? "bg-blue-600 text-white shadow" : "bg-white text-slate-900 shadow-sm") : "text-slate-400 hover:text-slate-200" }}
>
Lead Dashboard

{view === "widget" && (
<button
onClick={() => setMobilePreview(!mobilePreview)}
className={p-2 rounded-xl border transition-colors ${ dark ? "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600" }}
title="Toggle Canvas Mode"
>
{mobilePreview ? : }

)}
<button
onClick={() => setTheme(dark ? "light" : "dark")}
className={p-2 rounded-xl border transition-colors ${ dark ? "border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600" }}
>
{dark ? : }



);
}
/* --------------------------- BACKGROUND CANVAS --------------------------- */
function ShowroomBackdrop({ dark }) {
return (

<div className={w-full max-w-4xl p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center ${ dark ? "border-slate-800 text-slate-600" : "border-slate-300 text-slate-400" }}>

Digital Dealership Canvas Overview

The autonomous chat widget can interact on any portion of your website overlay. Toggle the frame view or switch to the Lead Dashboard.



);
}
function PhoneFrame({ dark, children }) {
return (

<div className={w-full rounded-[40px] border-8 p-3 shadow-2xl relative h-[780px] flex flex-col ${ dark ? "bg-slate-950 border-slate-800 shadow-blue-950/20" : "bg-white border-slate-300 shadow-slate-400/20" }}>


{children}



);
}
/* ----------------------------- CHAT WIDGET ----------------------------- */
function ChatWidget({ dark, forceOpen = false, embedded = false }) {
const [isOpen, setIsOpen] = useState(forceOpen || false);
const [messages, setMessages] = useState([
{ id: "m1", sender: "bot", text: "Hi there! I am your AutoDesk Intelligent Assistant. Looking for a new high-performance SUV, booking a certified service, or calculating a smart payment?", time: "10:00 AM" }
]);
const [input, setInput] = useState("");
const [flowState, setFlowState] = useState("idle"); // idle, budget_ask, type_ask, service_ask, date_ask
const [userData, setUserData] = useState({ budget: 40000, type: "SUV", service: "", date: "" });
const bottomRef = useRef(null);
useEffect(() => {
if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
}, [messages]);
const pushMessage = (sender, text, custom = null) => {
const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
setMessages(prev => [...prev, { id: Math.random().toString(), sender, text, time, custom }]);
};
const handleSend = (e) => {
if (e) e.preventDefault();
if (!input.trim()) return;
const userText = input.trim();
pushMessage("user", userText);
setInput("");
// Simulate smart AI routing logic parsing basic strings
setTimeout(() => {
const lower = userText.toLowerCase();
if (lower.includes("buy") || lower.includes("shop") || lower.includes("car") || lower.includes("vehicle")) {
pushMessage("bot", "Exciting! Let's narrow down the dynamic catalog matching your exact scale. What is your approximate max budget target?");
setFlowState("budget_ask");
} else if (lower.includes("service") || lower.includes("oil") || lower.includes("repair")) {
setFlowState("service_ask");
pushMessage("bot", "Let's organize your workshop session quickly. Select your core service requirement:", { type: "service-picker" });
} else {
pushMessage("bot", "I am standing by to assist. Type 'shop for a car' or 'book service' to launch a custom automation framework.");
}
}, 800);
};
const handleBudgetSelect = (val) => {
setUserData(p => ({ ...p, budget: val }));
pushMessage("user", Under ${fmtMoney(val)});
setTimeout(() => {
pushMessage("bot", "Got it. What preferred utility layout matches your daily driving footprint best?", { type: "type-picker" });
setFlowState("type_ask");
}, 600);
};
const handleTypeSelect = (type) => {
setUserData(p => ({ ...p, type }));
pushMessage("user", type);
setTimeout(() => {
pushMessage("bot", "Analyzing inventory engines... Here are the optimal matches ranked by your target capability vectors:");
VEHICLES.forEach(v => {
pushMessage("bot", "", { type: "vehicle-card", vehicle: v, score: matchScore(v, userData.budget, type), reasons: matchReasons(v, userData.budget, type) });
});
setFlowState("idle");
}, 800);
};
const handleServiceSelect = (srv) => {
setUserData(p => ({ ...p, service: srv }));
pushMessage("user", srv);
setTimeout(() => {
pushMessage("bot", "Perfect. Pick an upcoming calendar day that fits your schedule framework:", { type: "date-picker" });
setFlowState("date_ask");
}, 600);
};
const handleDateSelect = (dateStr) => {
setUserData(p => ({ ...p, date: dateStr }));
pushMessage("user", dateStr);
setTimeout(() => {
pushMessage("bot", "Select your ideal check-in window:", { type: "time-picker" });
}, 600);
};
const handleTimeSelect = (t) => {
pushMessage("user", t);
setTimeout(() => {
pushMessage("bot", ✅ Confirmation Complete! Your service session for ${userData.service} has been injected into our queue for ${userData.date} at ${t}. A service advisor will greet you upon arrival., { type: "success" });
}, 700);
};
if (!isOpen && !embedded) {
return (
<button
onClick={() => setIsOpen(true)}
className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 flex items-center justify-center z-50 transform hover:scale-105 transition-all"
>


);
}
return (
<div className={${ embedded ? "w-full h-full flex flex-col" : "fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl shadow-2xl border flex flex-col z-50 animate-floatIn" } ${dark ? "bg-[#0B1220] border-slate-800 shadow-black/40" : "bg-white border-slate-200 shadow-slate-300/50"}}>
{/* Widget Header */}
<div className={p-4 border-b flex items-center justify-between ${dark ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50"}}>








AutoDesk Engine
System Online


{!embedded && (
<button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">


)}
{/* Message Feed */}

{messages.map((m) => (
<div key={m.id} className={flex flex-col msg-in ${m.sender === "user" ? "items-end" : "items-start"}}>
{m.text && (
<div className={max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${ m.sender === "user" ? "bg-blue-600 text-white" : (dark ? "bg-slate-900 text-slate-100 border border-slate-800" : "bg-slate-100 text-slate-800") }}>
{m.text}

)}
{/* Custom Interactive Dynamic Form Elements */}
{m.custom?.type === "service-picker" && (

{SERVICES.map(s => (
<button key={s} onClick={() => handleServiceSelect(s)} className={p-2 rounded-lg border text-left text-[11px] font-medium transition-colors ${ dark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" }}>{s}
))}

)}
{m.custom?.type === "type-picker" && (

{["SUV", "Sedan", "Truck", "EV Hybrid"].map(t => (
<button key={t} onClick={() => handleTypeSelect(t)} className={px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${ dark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" }}>{t}
))}

)}
{m.custom?.type === "date-picker" && (

{nextDays(4).map((d, idx) => {
const label = ${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()};
return (
<button key={idx} onClick={() => handleDateSelect(label)} className={p-2 rounded-lg border text-center text-[10px] font-medium flex-shrink-0 transition-colors ${ dark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" }}>
{DOW[d.getDay()]}
{d.getDate()}

);
})}

)}
{m.custom?.type === "time-picker" && (

{TIMESLOTS.map(t => (
<button key={t} onClick={() => handleTimeSelect(t)} className={p-1.5 rounded-md border text-center text-[10px] font-medium transition-colors ${ dark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" }}>{t}
))}

)}
{m.custom?.type === "vehicle-card" && (
<div className={mt-2 rounded-xl border overflow-hidden w-full shadow-md ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}}>




{m.custom.vehicle.make} {m.custom.vehicle.model}
{m.custom.vehicle.year} • {m.custom.vehicle.drivetrain}


{fmtMoney(m.custom.vehicle.price)}

{m.custom.score}% Match




{m.custom.reasons.map((r, i) => (

{r}

))}



)}
{m.time}

))}
{flowState === "budget_ask" && (

{[35000, 40000, 50000].map(val => (
<button key={val} onClick={() => handleBudgetSelect(val)} className={px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold tracking-tight transition-all ${ dark ? "bg-slate-900/80 border-slate-800 hover:border-blue-500 text-slate-300" : "bg-white border-slate-200 hover:border-blue-500 text-slate-700" }}>
Under {fmtMoney(val)}

))}

)}
{/* Input Box */}
<form onSubmit={handleSend} className={p-3 border-t flex gap-2 items-center ${dark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}}>
<input
type="text"
value={input}
onChange={(e) => setInput(e.target.value)}
placeholder="Ask about inventory or custom options..."
className={flex-1 px-3 py-1.5 rounded-xl text-xs outline-none transition-all ${ dark ? "bg-slate-900 border border-slate-800 text-white focus:border-blue-500" : "bg-slate-100 border border-transparent text-slate-800 focus:bg-white focus:border-slate-300" }}
/>





);
}
/* ---------------------------- LEADS DASHBOARD ---------------------------- */
function Dashboard({ dark }) {
return (

{/* Metrics Row */}

{[
{ title: "Total Funnel Leads", val: "1,248", change: "+14.2%", icon: Users, color: "text-blue-500" },
{ title: "Active AI Sessions", val: "42", change: "Live Syncing", icon: RefreshCw, color: "text-emerald-500" },
{ title: "Test Drives Routed", val: "18", change: "This week", icon: Calendar, color: "text-amber-500" },
{ title: "Pipeline Valuation", val: "$4.8M", change: "Projected ARR", icon: DollarSign, color: "text-purple-500" },
].map((m, idx) => (
<div key={idx} className={p-5 rounded-2xl border ${dark ? "bg-[#0B1220] border-slate-800" : "bg-white border-slate-200 shadow-sm"}}>

<span className={text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}}>{m.title}
<m.icon className={h-4 w-4 ${m.color}} />


{m.val}
{m.change}


))}
{/* Main Core Lists */}
{/* Column 1: Captured AI Leads */}
<div className={p-5 rounded-2xl border lg:col-span-2 flex flex-col ${dark ? "bg-[#0B1220] border-slate-800" : "bg-white border-slate-200 shadow-sm"}}>

Real-Time CRM Leads Generated
System Active

{/* Column 2: Scheduled Appointments */}
<div className={p-5 rounded-2xl border flex flex-col ${dark ? "bg-[#0B1220] border-slate-800" : "bg-white border-slate-200 shadow-sm"}}>
Upcoming Showroom Sessions

{TEST_DRIVES.map(t => (
<div key={t.id} className={p-3 rounded-xl border flex items-start justify-between ${dark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}}>

{t.name}
{t.vehicle}
<div className={text-[10px] flex items-center gap-1 mt-2 ${dark ? "text-slate-400" : "text-slate-500"}}>
{t.location}



{t.date}
{t.time}


))}

);
}
