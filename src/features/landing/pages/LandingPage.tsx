import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";

// ─── Avatar sprite (4 cols × 2 rows) ───────────────────────────────────────
const AVATARS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3Do5bvSlH2WSw862TZzWccUJJESenQB2FqqizzpLlapyJIBTO4CCdBULetW32XZJQWSmHD93MAyg6DCIM4Ns5Jx7_2J6uN27rpL7LPMp3RRHpLokHNDErIgRDwWoHhJJv2E_kr-LdHmxQmg-s-DoFiHtG7920SgoLTw16t0xwxZTAdM130eMd7fXzu0Nz0nfsscetnAZKOZ6nQWt5MHzBsqVbyTUFL2cGePLe7ECETINAxUT7yrPdKg";

const Avatar = ({
  col, row, size, className = "",
}: {
  col: number; row: number; size: string; className?: string;
}) => (
  <div className={`relative overflow-hidden shrink-0 ${size} ${className}`}>
    <img
      src={AVATARS_IMG}
      alt="Avatar"
      style={{
        position: "absolute", width: "400%", height: "200%", maxWidth: "none",
        left: `${col * -100}%`, top: `${row * -100}%`, objectFit: "cover",
      }}
    />
  </div>
);

// ─── Scroll-reveal hook ─────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Component ──────────────────────────────────────────────────────────────
export const LandingPage = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef<HTMLElement>(null);
  // ── Scroll progress bar ──────────────────────────────────────────────────
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setScrollPct((window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Header shrink on scroll ──────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Live countdown timer ─────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(600); // 10:00
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s <= 1 ? 600 : s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // ── Animated chat messages ───────────────────────────────────────────────
  const chatMessages = [
    { side: "left",  text: "I actually think pineapple belongs on pizza. Fight me. 🍍" },
    { side: "right", text: "Brave opener! But I'm a strict Margherita purist." },
    { side: "right", text: "What else are you passionate about?" },
    { side: "left",  text: "Indie game development and weird 80s synth music." },
  ];
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleMsgs(0);
        let i = 0;
        const show = () => {
          i++;
          setVisibleMsgs(i);
          if (i < chatMessages.length) setTimeout(show, 600);
        };
        setTimeout(show, 400);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Section reveal refs ──────────────────────────────────────────────────
  const hero     = useReveal(0.05);
  const value    = useReveal(0.2);
  const howWorks = useReveal(0.1);
  const bento    = useReveal(0.1);
  const safety   = useReveal(0.1);
  const cta      = useReveal(0.15);

  // ── Parallax mouse effect on hero ────────────────────────────────────────
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * 20,
    });
  }, []);

  // ── Scroll to How It Works ──────────────────────────────────────────────
  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] antialiased min-h-screen flex flex-col relative overflow-x-hidden">

      {/* ── Header ── */}
      <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/90 backdrop-blur-xl border-b border-[#c7c4d2]/30 shadow-[0_2px_20px_rgba(84,66,221,0.08)]"
          : "py-4 bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 w-full flex items-center justify-between">
          <span className="font-[Outfit] font-bold text-2xl text-[#5442dd]">Ryple</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={scrollToHowItWorks}
              className="hidden sm:block font-[Inter] font-medium text-sm text-[#5442dd] hover:opacity-70 transition-opacity"
            >
              How it works
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="font-[Inter] font-semibold text-sm bg-[#5442dd] text-white px-6 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_8px_30px_rgba(84,66,221,0.4)] active:scale-95 transition-all duration-200"
            >
              Log In
            </button>
          </div>
        </div>

        {/* ── Scroll progress bar (moves with header bottom) ── */}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#5442dd] to-[#c5c0ff] transition-all duration-100"
          style={{ width: `${scrollPct}%` }}
        />
      </header>

      <main className="flex-grow pt-[72px]">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          className="relative pt-12 pb-8 md:pt-[100px] md:pb-[80px] px-5 overflow-hidden min-h-[90vh] flex flex-col justify-center"
          onMouseMove={onMouseMove}
        >
          {/* Blurred gradient orbs */}
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#6d5ef7]/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] rounded-full bg-[#c5c0ff]/30 blur-[100px] pointer-events-none" />

          {/* Floating icons — parallax */}
          <div
            className="absolute top-24 left-12 text-[#5442dd] opacity-25 transition-transform duration-200 ease-out"
            style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)` }}
          >
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div
            className="absolute top-40 right-16 text-[#ffb785] opacity-30 transition-transform duration-200 ease-out"
            style={{ transform: `translate(${mouse.x * -0.8}px, ${mouse.y * -0.3}px)` }}
          >
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div
            className="absolute bottom-32 left-20 text-[#c5c0ff] opacity-40 transition-transform duration-200 ease-out"
            style={{ transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.7}px)` }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>

          <div
            ref={hero.ref}
            className="max-w-7xl mx-auto flex flex-col items-center text-center"
          >
            {/* Live badge */}
            <div
              className={`mb-6 transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0ms" }}
            >
              <span className="font-[Inter] font-semibold text-sm text-[#5442dd] tracking-widest uppercase bg-[#e4dfff]/40 px-4 py-2 rounded-full inline-flex items-center gap-2 border border-[#5442dd]/20">
                <span className="w-2 h-2 rounded-full bg-[#5442dd] animate-ping inline-block" />
                AI-POWERED SOCIAL DISCOVERY
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`font-[Outfit] font-bold text-[32px] leading-[40px] md:text-[56px] md:leading-[64px] tracking-[-0.02em] text-[#1b1b24] max-w-4xl mx-auto mb-5 transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "100ms" }}
            >
              Meet someone you were{" "}
              <br className="hidden md:block" />
              <span
                className="italic pr-2"
                style={{
                  background: "linear-gradient(135deg, #5442dd 0%, #6d5ef7 50%, #c5c0ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                never looking for.
              </span>
            </h1>

            <p
              className={`font-[Outfit] font-semibold text-[18px] md:text-[22px] text-[#474555] max-w-2xl mx-auto mb-3 transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "200ms" }}
            >
              Two strangers. Ten minutes. One real conversation.
            </p>
            <p
              className={`font-[Inter] text-[16px] md:text-[18px] text-[#787586] max-w-xl mx-auto mb-8 transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "300ms" }}
            >
              No profiles to judge. No followers to impress. Just two people discovering each other.
            </p>

            {/* Hero visual */}
            <div
              className={`relative w-full max-w-3xl mx-auto mb-8 transition-all duration-700 ${hero.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="aspect-[16/9] md:aspect-[21/9] bg-[#f0ecf9] rounded-xl md:rounded-[3rem] overflow-hidden relative shadow-[0_20px_60px_rgba(84,66,221,0.15)] border border-[#c7c4d2]/20">
                <img
                  alt="Avatars"
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                  src={AVATARS_IMG}
                />
                {/* Glass card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex items-center gap-6 md:gap-12 px-6 md:px-10 py-5 md:py-7 rounded-[2rem] shadow-xl border border-white/60"
                    style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px)" }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Avatar col={0} row={0} size="w-16 h-16 md:w-24 md:h-24" className="rounded-full border-4 border-white shadow-lg ring-4 ring-[#5442dd]/10" />
                      <span className="font-[Inter] text-xs font-semibold text-[#1b1b24] bg-white/90 px-2.5 py-0.5 rounded-full shadow-sm">Stranger A</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-[Outfit] font-bold text-[28px] md:text-[40px] text-[#5442dd] tabular-nums tracking-tight">
                        {mm}:{ss}
                      </span>
                      <span className="font-[Inter] text-xs md:text-sm text-[#787586] bg-white/60 px-3 py-1 rounded-full">
                        Just talk. ✨
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Avatar col={3} row={0} size="w-16 h-16 md:w-24 md:h-24" className="rounded-full border-4 border-white shadow-lg ring-4 ring-[#5442dd]/10" />
                      <span className="font-[Inter] text-xs font-semibold text-[#1b1b24] bg-white/90 px-2.5 py-0.5 rounded-full shadow-sm">Anonymous B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "500ms" }}
            >
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto font-[Inter] font-semibold text-[16px] bg-[#5442dd] text-white px-8 py-4 rounded-full hover:scale-105 hover:shadow-[0_12px_40px_rgba(84,66,221,0.4)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                ✨ Start a 10-Minute Conversation
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto font-[Inter] font-semibold text-[16px] bg-white border-2 border-[#5442dd] text-[#5442dd] px-8 py-4 rounded-full hover:bg-[#f6f2ff] hover:scale-105 active:scale-95 transition-all duration-200">
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* ══ VALUE PROP ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-[100px] px-5 bg-[#f6f2ff]">
          <div ref={value.ref} className="max-w-4xl mx-auto text-center">
            <h2
              className={`font-[Outfit] font-semibold text-[20px] md:text-[24px] text-[#474555] mb-6 transition-all duration-700 ${value.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              What if you met people before you knew anything about them?
            </h2>
            <h3
              className={`font-[Outfit] font-bold text-[28px] md:text-[52px] leading-[1.1] text-[#1b1b24] uppercase tracking-tight transition-all duration-700 ${value.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: "150ms" }}
            >
              NO PROFILE.{" "}
              <span className="text-[#787586]">NO JUDGMENT.</span>
              <br />
              <span className="text-[#5442dd]">JUST CONVERSATION.</span>
            </h3>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <section ref={howItWorksRef} id="how-it-works" className="py-16 md:py-[100px] px-5 bg-[#fcf8ff]">
          <div className="max-w-6xl mx-auto">
            <div ref={howWorks.ref}>
              <div
                className={`text-center mb-12 transition-all duration-700 ${howWorks.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <h2 className="font-[Outfit] font-bold text-[28px] md:text-[36px] text-[#1b1b24] mb-2">How it works</h2>
                <p className="font-[Inter] text-[16px] text-[#787586]">Five simple steps to meaningful connections.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                {/* Connecting line */}
                <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-[#c7c4d2]/40 z-0" />
                {/* Animated line fill */}
                <div
                  className="hidden md:block absolute top-[60px] left-[10%] h-0.5 bg-gradient-to-r from-[#5442dd] to-[#c5c0ff] z-0 transition-all duration-[1500ms] ease-out"
                  style={{ width: howWorks.visible ? "80%" : "0%" }}
                />

                {[
                  { col: 0, row: 0, step: 1, label: "Choose a vibe", icon: null, bg: "bg-white border border-[#c7c4d2]/20" },
                  { col: 1, row: 0, step: 2, label: "Meet a stranger", icon: null, bg: "bg-white border border-[#c7c4d2]/20" },
                  { col: -1, row: -1, step: 3, label: "Talk for 10 min", icon: `${mm}:${ss}`, bg: "bg-[#5442dd]" },
                  { col: 2, row: 0, step: 4, label: "Choose together", icon: null, bg: "bg-white border border-[#c7c4d2]/20" },
                  { col: 3, row: 1, step: 5, label: "Build the bond", icon: "favorite", bg: "bg-white border border-[#c7c4d2]/20", blur: true },
                ].map((s, i) => (
                  <div
                    key={s.step}
                    className={`flex flex-col items-center text-center relative z-10 transition-all duration-700 ${howWorks.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    <div className={`w-32 h-32 rounded-full ${s.bg} shadow-[0_8px_30px_rgba(84,66,221,0.12)] flex items-center justify-center mb-4 overflow-hidden relative hover:scale-110 transition-transform duration-300 cursor-pointer`}>
                      {s.step === 3 ? (
                        <span className="font-[Outfit] font-bold text-[28px] text-white">{mm}:{ss}</span>
                      ) : s.icon === "favorite" ? (
                        <>
                          <span className="material-symbols-outlined text-5xl text-[#ffb785] z-10 drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                          {s.blur && <Avatar col={s.col} row={s.row} size="w-32 h-32" className="absolute inset-0 rounded-full opacity-40 blur-sm" />}
                        </>
                      ) : (
                        <Avatar col={s.col} row={s.row} size="w-32 h-32" className="rounded-full" />
                      )}
                    </div>
                    <span className={`font-[Inter] font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center mb-2 ${s.step === 3 ? "bg-[#5442dd] text-white" : "bg-[#e4dfff]/40 text-[#5442dd]"}`}>
                      {s.step}
                    </span>
                    <h4 className="font-[Outfit] font-semibold text-[18px] text-[#1b1b24]">{s.label}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ BENTO GRID ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-[100px] px-5 bg-[#e5e0ed] rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto">
            <div ref={bento.ref}>
              <div
                className={`text-center mb-10 max-w-2xl mx-auto transition-all duration-700 ${bento.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <h2 className="font-[Outfit] font-bold text-[28px] md:text-[36px] text-[#1b1b24] mb-2">
                  Choose the conversation. Not the person.
                </h2>
                <p className="font-[Inter] text-[16px] text-[#787586]">What do you want to talk about today?</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Deep Talk */}
                <div
                  className={`md:w-1/2 min-h-[300px] md:min-h-[520px] bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-[2rem] p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(49,46,129,0.5)] ${bento.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
                  style={{ transitionDelay: "100ms" }}
                >
                  <span className="material-symbols-outlined absolute top-8 right-8 text-white/10 text-[120px] transform rotate-12 group-hover:rotate-[20deg] group-hover:scale-110 group-hover:text-white/20 transition-all duration-500">
                    psychology
                  </span>
                  <div className="z-10 relative">
                    <span className="font-[Inter] text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Most Popular</span>
                    <h3 className="font-[Outfit] font-bold text-[36px] leading-[44px] text-white mb-2">Deep Talk</h3>
                    <p className="font-[Inter] text-[15px] text-white/60">Philosophy, life purpose, and universe.</p>
                  </div>
                </div>

                {/* 2×2 right grid */}
                <div className="md:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
                  {[
                    { bg: "bg-[#FEF08A]", icon: "celebration", iconColor: "#CA8A04", textColor: "#854D0E", label: "Fun", delay: 200 },
                    { bg: "bg-[#FECACA]", icon: "movie",       iconColor: "#DC2626", textColor: "#991B1B", label: "Culture", delay: 300 },
                    { bg: "bg-[#BFDBFE]", icon: "lightbulb",   iconColor: "#2563EB", textColor: "#1E3A8A", label: "Ideas",  delay: 400 },
                    { bg: "bg-[#E9D5FF]", icon: "sports_esports", iconColor: "#9333EA", textColor: "#581C87", label: "Gaming", delay: 500 },
                  ].map(c => (
                    <div
                      key={c.label}
                      className={`${c.bg} rounded-[2rem] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-pointer aspect-square transition-all duration-700 hover:scale-105 hover:shadow-lg ${bento.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                      style={{ transitionDelay: `${c.delay}ms` }}
                    >
                      <span
                        className="material-symbols-outlined text-5xl mb-3 group-hover:-translate-y-3 group-hover:scale-110 transition-transform duration-300"
                        style={{ color: c.iconColor }}
                      >
                        {c.icon}
                      </span>
                      <h3 className="font-[Outfit] font-semibold text-[20px]" style={{ color: c.textColor }}>{c.label}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CHAT SHOWCASE ═════════════════════════════════════════════════ */}
        <section className="py-16 md:py-[120px] px-5 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-[Outfit] font-bold text-[28px] md:text-[56px] leading-[1.1] text-[#1b1b24] uppercase tracking-tight mb-5">
                10 MINUTES <br />
                <span className="text-[#5442dd]">CAN BE ENOUGH.</span>
              </h2>
              <p className="font-[Inter] text-[18px] leading-[28px] text-[#787586] max-w-lg">
                Dive straight into meaningful dialogue. The ticking clock removes small talk and encourages real connection.
              </p>
            </div>

            <div className="lg:w-1/2 w-full max-w-md" ref={chatRef}>
              <div className="bg-[#fcf8ff] rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(84,66,221,0.12)] border border-[#c7c4d2]/20">
                {/* Chat header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#c7c4d2]/20 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar col={2} row={1} size="w-10 h-10" className="rounded-full" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-[Inter] font-semibold text-sm text-[#1b1b24]">Anonymous User</p>
                      <p className="font-[Inter] text-xs text-green-500">● Online</p>
                    </div>
                  </div>
                  <div className="bg-[#5442dd]/10 text-[#5442dd] px-3 py-1.5 rounded-full font-[Inter] font-semibold text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    {mm}:{ss}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex flex-col gap-3 p-5 min-h-[280px]">
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] transition-all duration-500 ${i < visibleMsgs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${m.side === "right" ? "self-end" : "self-start"}`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <div className={`px-4 py-2.5 rounded-2xl font-[Inter] text-[14px] leading-[20px] shadow-sm ${
                        m.side === "right"
                          ? "bg-[#5442dd] text-white rounded-tr-sm"
                          : "bg-white border border-[#c7c4d2]/30 text-[#1b1b24] rounded-tl-sm"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {/* Typing indicator */}
                  {visibleMsgs >= chatMessages.length && (
                    <div className="self-end animate-fade-in">
                      <div className="bg-[#f0ecf9] px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-1">
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-2 h-2 rounded-full bg-[#5442dd] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#c7c4d2]/30 shadow-sm">
                    <input
                      disabled
                      placeholder="Type a message..."
                      className="flex-grow bg-transparent border-none outline-none font-[Inter] text-[14px] text-[#1b1b24] placeholder:text-[#787586]"
                    />
                    <button className="w-9 h-9 rounded-full bg-[#5442dd] text-white flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SAFETY ════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-[100px] px-5 bg-[#f6f2ff]">
          <div className="max-w-5xl mx-auto text-center">
            <div ref={safety.ref}>
              <h2
                className={`font-[Outfit] font-bold text-[24px] md:text-[36px] text-[#1b1b24] mb-12 uppercase tracking-tight transition-all duration-700 ${safety.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                ANONYMOUS DOESN'T MEAN UNACCOUNTABLE.
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: "flag",   bg: "bg-red-50",    iconColor: "#ba1a1a", label: "Easy Report",   desc: "One tap to report inappropriate behavior.", delay: 0 },
                  { icon: "block",  bg: "bg-[#e5e0ed]", iconColor: "#474555", label: "Instant Block",  desc: "Never interact with them again.", delay: 100 },
                  { icon: "shield", bg: "bg-[#e4dfff]", iconColor: "#5442dd", label: "Privacy First",  desc: "Your identity stays hidden until you choose.", delay: 200 },
                  { icon: "policy", bg: "bg-green-50",  iconColor: "#059669", label: "AI Safety",      desc: "Automated detection for a safe environment.", delay: 300 },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center p-5 rounded-3xl bg-white shadow-[0_4px_20px_rgba(84,66,221,0.06)] hover:shadow-[0_8px_30px_rgba(84,66,221,0.12)] hover:-translate-y-2 transition-all duration-300 ${safety.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    style={{ transitionDelay: `${item.delay}ms` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}>
                      <span className="material-symbols-outlined text-3xl" style={{ color: item.iconColor }}>{item.icon}</span>
                    </div>
                    <h4 className="font-[Outfit] font-semibold text-[16px] text-[#1b1b24] mb-1">{item.label}</h4>
                    <p className="font-[Inter] text-[13px] text-[#787586] leading-[18px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
        <section className="py-[100px] md:py-[140px] px-5 relative overflow-hidden text-white text-center" style={{ background: "linear-gradient(135deg, #3730a3 0%, #5442dd 50%, #6d5ef7 100%)" }}>
          {/* Animated background circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full bg-white/5 animate-[spin_20s_linear_infinite]" />
            <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/5 animate-[spin_30s_linear_infinite_reverse]" />
            <div className="absolute top-[30%] right-[10%] w-[150px] h-[150px] rounded-full bg-[#c5c0ff]/20 blur-3xl" />
          </div>

          <div ref={cta.ref} className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
            {/* Staggered avatar cluster */}
            <div className={`flex -space-x-4 mb-8 transition-all duration-700 ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {[
                { col: 0, row: 0, delay: 0, ty: 0 },
                { col: 1, row: 0, delay: 80, ty: -16 },
                { col: 2, row: 0, delay: 160, ty: 0 },
                { col: 3, row: 0, delay: 240, ty: -10 },
                { col: 0, row: 1, delay: 320, ty: 0 },
              ].map((a, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 hover:scale-125 hover:z-10 cursor-pointer ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${a.delay}ms`, transform: `translateY(${a.ty}px)` }}
                >
                  <Avatar col={a.col} row={a.row} size="w-16 h-16" className="rounded-full border-4 border-[#5442dd]" />
                </div>
              ))}
            </div>

            <h2
              className={`font-[Outfit] font-bold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.02em] mb-4 transition-all duration-700 ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "200ms" }}
            >
              Someone interesting is out there.
            </h2>
            <p
              className={`font-[Inter] text-[18px] text-white/75 mb-10 transition-all duration-700 ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "300ms" }}
            >
              Ready to meet them?
            </p>
            <button
              onClick={() => navigate("/signup")}
              className={`font-[Inter] font-semibold text-[18px] bg-white text-[#5442dd] px-10 py-5 rounded-full hover:scale-110 hover:shadow-[0_15px_50px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-300 ${cta.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ transitionDelay: "400ms" }}
            >
              ✨ Start a 10-Minute Conversation
            </button>
          </div>
        </section>
      </main>

      {/* ── Giant Brand Wordmark ── */}
      <div className="bg-white w-full overflow-hidden select-none border-t border-[#c7c4d2]/10 pt-16 pb-8">
        <div
          className="font-[Outfit] font-bold text-center w-full block"
          style={{
            fontSize: 'clamp(72px, 20vw, 300px)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #5442dd 0%, #8b6ef5 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Ryple
        </div>
        <p className="text-center font-[Inter] text-[#a09eb8] text-sm mt-6 mb-2 tracking-widest uppercase">
          Start a ripple. Make a real friend.
        </p>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-[#c7c4d2]/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-5 py-8 w-full max-w-7xl mx-auto">
          <div className="font-[Outfit] font-bold text-[20px] text-[#5442dd]">Ryple</div>
          <nav className="flex flex-wrap justify-center gap-6">
            {["Features", "Privacy", "Terms", "Safety", "Contact"].map(link => (
              <a key={link} className="font-[Inter] text-[14px] text-[#474555] hover:text-[#5442dd] transition-colors cursor-pointer" href="#">
                {link}
              </a>
            ))}
          </nav>
          <div className="font-[Inter] text-[13px] text-[#787586]">© 2024 Ryple. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
