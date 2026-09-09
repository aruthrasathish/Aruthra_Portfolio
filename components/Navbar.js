"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, ChevronDown, Menu, X } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

// Every section, in the order it appears on the page. This list drives the
// scroll spy, the mobile sheet, and the "More" group below.
const SECTIONS = [
  { id: "home", label: "Overview" },
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "awards", label: "Awards" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

// Nine top-level labels do not fit cleanly at 1024px, so the secondary four
// collapse into a "More" menu. Every section stays one click away.
const PRIMARY_IDS = ["home", "about", "experience", "projects", "contact"];
const MORE_IDS = ["education", "skills", "awards", "certifications"];

const byId = (id) => SECTIONS.find((section) => section.id === id);
const PRIMARY = PRIMARY_IDS.map(byId);
const MORE = MORE_IDS.map(byId);

// Shown below lg, where the full bar would wrap.
const COMPACT_IDS = ["projects", "contact"];
const COMPACT = COMPACT_IDS.map(byId);

const NAV_UNDERLINE_STYLE = {
  background: "linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)",
  boxShadow: "0 0 8px rgba(99,102,241,0.5)",
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);
  const mounted = useMounted();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setIsScrolled(window.scrollY > 20);
        if (window.scrollY < 100) setActiveSection("home");
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.25, rootMargin: "-100px 0px -50% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      if (id === "home") return;
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Close the "More" popover on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleNavClick = useCallback((id) => {
    setActiveSection(id);
    setMoreOpen(false);
    setMenuOpen(false);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const moreIsActive = MORE_IDS.includes(activeSection);

  const renderLink = (link, layoutId) => {
    const isActive = activeSection === link.id;
    return (
      <button
        key={link.id}
        onClick={() => handleNavClick(link.id)}
        className="relative px-1 py-2"
        aria-current={isActive ? "true" : undefined}
      >
        <span
          className="text-sm transition-colors duration-150"
          style={{
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: isActive ? 500 : 400,
          }}
        >
          {link.label}
        </span>
        {isActive && (
          <motion.span
            layoutId={layoutId}
            className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full"
            style={NAV_UNDERLINE_STYLE}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  const themeButton = (size) => (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 ${
        size === "sm" ? "h-8 w-8" : "h-9 w-9"
      }`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      {isDark ? (
        <Sun className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
      ) : (
        <Moon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
      )}
    </button>
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300"
      style={{
        background: isScrolled || menuOpen ? "var(--nav-bg)" : "transparent",
        backdropFilter: isScrolled || menuOpen ? "blur(20px)" : "none",
        WebkitBackdropFilter: isScrolled || menuOpen ? "blur(20px)" : "none",
        borderBottom:
          isScrolled || menuOpen
            ? "1px solid var(--nav-border)"
            : "1px solid transparent",
        boxShadow: isScrolled || menuOpen ? "var(--nav-shadow)" : "none",
      }}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
        aria-label="Primary"
      >
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            handleNavClick("home");
          }}
          className="flex items-center transition-opacity hover:opacity-80 min-w-0"
        >
          <span
            className="text-base lg:text-lg font-semibold tracking-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            Aruthra&apos;s Portfolio
          </span>
        </a>

        {/* Full nav from lg up. */}
        <div className="hidden lg:flex items-center gap-5">
          {PRIMARY.slice(0, 4).map((link) => renderLink(link, "nav-underline"))}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className="relative flex items-center gap-1 px-1 py-2"
            >
              <span
                className="text-sm transition-colors duration-150"
                style={{
                  color: moreIsActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: moreIsActive ? 500 : 400,
                }}
              >
                More
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: moreOpen ? "rotate(180deg)" : "none",
                }}
                aria-hidden="true"
              />
              {moreIsActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full"
                  style={NAV_UNDERLINE_STYLE}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  aria-hidden="true"
                />
              )}
            </button>

            {moreOpen ? (
              <div
                className="absolute right-0 top-full mt-2 min-w-[13rem] rounded-xl p-1.5 z-50"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.35)",
                }}
              >
                {MORE.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleNavClick(link.id)}
                      aria-current={isActive ? "true" : undefined}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 hover:bg-[var(--bg-hover)]"
                      style={{
                        color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {renderLink(PRIMARY[4], "nav-underline")}

          {mounted && themeButton("md")}
        </div>

        {/* Below lg: two anchors plus a full sheet, so nothing is unreachable. */}
        <div className="lg:hidden flex items-center gap-3 sm:gap-4">
          {COMPACT.map((link) => renderLink(link, "compact-nav-underline"))}
          {mounted && themeButton("sm")}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            {menuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="lg:hidden px-4 sm:px-6 pb-4"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <ul className="max-w-6xl mx-auto grid grid-cols-2 gap-1.5 pt-3">
            {SECTIONS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.id)}
                    aria-current={isActive ? "true" : undefined}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors duration-150"
                    style={{
                      background: isActive ? "var(--accent-dim)" : "transparent",
                      color: isActive ? "var(--accent-lighter)" : "var(--text-secondary)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
