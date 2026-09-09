"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Project cover art.
 *
 * Two paths behind one API:
 *  - `project.image` points at a real screenshot. If the file exists it wins,
 *    with `project.imageAlt` as meaningful alt text.
 *  - If the file is absent (onError) the cover falls back to a drawn cover
 *    chosen by `project.visualType`. Nothing is ever a broken image, and no
 *    stock photography or unrelated artwork is used anywhere.
 *
 * The drawn covers are pure SVG on a fixed 400x250 viewBox, so they scale
 * cleanly from 375px to 1440px+ with no clipping and no horizontal overflow.
 * They sit on a dark console canvas in both themes, matching the hero code
 * panel, which already keeps its dark surface in light mode for contrast.
 *
 * Motion is opt-in: keyframes only run while `data-active="true"`, which is
 * set once the cover scrolls into view and never when reduced motion is on.
 */

// Each composition is still authored in a 400x250 space. The app frame wraps
// it: a 34px icon rail on the left and a 52px header (title bar + toolbar) on
// top, so the content group is simply translated into place - no coordinate
// rework and no non-uniform scaling.
const W = 400;
const H = 250;
const RAIL = 34;
const CHROME_H = 26;
const TOOLBAR_H = 26;
const VB_W = W + RAIL;
const VB_H = H + TOOLBAR_H;

// Console ink. Deliberately fixed rather than themed - these read as product
// screenshots, not as page surface.
const INK = {
  bg: "#0B0F1C",
  panel: "#121829",
  panelAlt: "#1A2136",
  line: "#2B3550",
  lineSoft: "#212A42",
  text: "#E6EAF4",
  dim: "#96A0BA",
  faint: "#5C6784",
  danger: "#F87171",
  ok: "#34D399",
};

/* ------------------------------------------------------------------ shared */

/**
 * Application frame.
 *
 * The covers previously read as bare diagrams because they had no product
 * around them. This adds the framing a real screenshot carries - an icon rail,
 * a title bar and a toolbar with tabs and status - so the cover reads as an
 * interface first and an architecture illustration second. The glyphs are
 * abstract shapes, never imitations of anyone's brand mark.
 */
function AppFrame({ app, right, tabs = [], active = 0, status }) {
  const toneFill =
    status?.tone === "danger"
      ? "rgba(248,113,113,0.16)"
      : status?.tone === "ok"
      ? "rgba(52,211,153,0.14)"
      : "rgba(148,163,184,0.12)";
  const toneText =
    status?.tone === "danger"
      ? "#FCA5A5"
      : status?.tone === "ok"
      ? INK.ok
      : INK.dim;

  return (
    <g>
      {/* Icon rail */}
      <rect x="0" y="0" width={RAIL} height={VB_H} fill={INK.panel} />
      <line x1={RAIL} y1="0" x2={RAIL} y2={VB_H} stroke={INK.line} strokeWidth="1" />
      <rect x="9" y="9" width="16" height="16" rx="5" fill="currentColor" opacity="0.9" />
      {[0, 1, 2, 3].map((index) => (
        <g key={index}>
          {index === 0 ? (
            <rect x="0" y={44 + index * 26} width="2.5" height="16" rx="1.25" fill="currentColor" />
          ) : null}
          <rect
            x="11"
            y={47 + index * 26}
            width="12"
            height="10"
            rx="2.5"
            fill={index === 0 ? "currentColor" : INK.line}
            opacity={index === 0 ? 0.85 : 1}
          />
        </g>
      ))}
      <circle cx="17" cy={VB_H - 16} r="7" fill={INK.panelAlt} stroke={INK.line} />

      {/* Title bar */}
      <rect x={RAIL} y="0" width={W} height={CHROME_H} fill={INK.panel} />
      <line x1={RAIL} y1={CHROME_H} x2={VB_W} y2={CHROME_H} stroke={INK.line} strokeWidth="1" />
      <circle cx={RAIL + 14} cy="13" r="3.2" fill="#EF4F4F" opacity="0.75" />
      <circle cx={RAIL + 25} cy="13" r="3.2" fill="#F2B33D" opacity="0.75" />
      <circle cx={RAIL + 36} cy="13" r="3.2" fill="#3DD68C" opacity="0.75" />
      <text
        x={RAIL + 50}
        y="17"
        fontSize="10.5"
        fill={INK.dim}
        fontFamily="ui-monospace, monospace"
      >
        {app}
      </text>
      {right ? (
        <text
          x={VB_W - 12}
          y="17"
          fontSize="9.5"
          fill={INK.faint}
          textAnchor="end"
          fontFamily="ui-monospace, monospace"
        >
          {right}
        </text>
      ) : null}

      {/* Toolbar: tabs, status pill, account dot */}
      <rect x={RAIL} y={CHROME_H} width={W} height={TOOLBAR_H} fill={INK.panelAlt} />
      <line
        x1={RAIL}
        y1={CHROME_H + TOOLBAR_H}
        x2={VB_W}
        y2={CHROME_H + TOOLBAR_H}
        stroke={INK.line}
        strokeWidth="1"
      />
      {tabs.map((tab, index) => {
        const x = RAIL + 14 + index * 74;
        const isActive = index === active;
        return (
          <g key={tab}>
            <text
              x={x}
              y={CHROME_H + 17}
              fontSize="10"
              fill={isActive ? INK.text : INK.faint}
              fontWeight={isActive ? 600 : 400}
            >
              {tab}
            </text>
            {isActive ? (
              <rect
                x={x}
                y={CHROME_H + TOOLBAR_H - 3}
                width={Math.min(tab.length * 5.4, 64)}
                height="2"
                rx="1"
                fill="currentColor"
              />
            ) : null}
          </g>
        );
      })}
      {status ? (
        <g>
          <rect
            x={VB_W - 96}
            y={CHROME_H + 6}
            width="62"
            height="14"
            rx="7"
            fill={toneFill}
          />
          <circle cx={VB_W - 86} cy={CHROME_H + 13} r="2.6" fill={toneText} />
          <text x={VB_W - 79} y={CHROME_H + 16.5} fontSize="8.5" fill={toneText}>
            {status.text}
          </text>
        </g>
      ) : null}
      <circle
        cx={VB_W - 20}
        cy={CHROME_H + 13}
        r="7"
        fill="currentColor"
        opacity="0.28"
      />
    </g>
  );
}

/** A run of skeleton lines - texture that stays legible at any render size. */
function Lines({ x, y, widths, gap = 7, height = 3, fill = INK.line, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      {widths.map((width, index) => (
        <rect
          key={index}
          x={x}
          y={y + index * gap}
          width={width}
          height={height}
          rx={height / 2}
          fill={fill}
        />
      ))}
    </g>
  );
}

function Panel({ x, y, width, height, fill = INK.panel, stroke = INK.lineSoft, rx = 6 }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      fill={fill}
      stroke={stroke}
    />
  );
}

/* --------------------------------------------------- 1. WatchTower console */

const CLUSTER_NODES = Array.from({ length: 10 }, (_, index) => ({
  row: Math.floor(index / 5),
  col: index % 5,
  degraded: index === 7,
}));

const ORCHESTRATION = [
  { y: 68, label: "Agent", meta: "Claude Desktop" },
  { y: 104, label: "MCP Server", meta: "12 tools" },
  { y: 140, label: "Collectors", meta: "K8s . logs . deploys" },
];

// Correlation candidates the console ranks. Deliberately generic surface
// names and relative bar widths - no fabricated production data.
const SUSPECTS = [
  { label: "recent deploy", width: 62 },
  { label: "config change", width: 42 },
  { label: "dependency", width: 26 },
];

function IncidentConsole() {
  return (
    <>
      {/* Open incident */}
      <rect
        x="12"
        y="32"
        width="180"
        height="26"
        rx="6"
        fill="rgba(248,113,113,0.12)"
        stroke="rgba(248,113,113,0.4)"
      />
      <circle className="cv-blink" cx="26" cy="45" r="4" fill={INK.danger} />
      <text x="37" y="48.5" fontSize="10.5" fill="#FCA5A5" fontWeight="600">
        Incident open
      </text>
      <text
        x="118"
        y="48.5"
        fontSize="9"
        fill={INK.faint}
        fontFamily="ui-monospace, monospace"
      >
        triage
      </text>

      {/* Cluster health */}
      <Panel x="12" y="64" width="180" height="60" />
      <text x="22" y="79" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        CLUSTER
      </text>
      {CLUSTER_NODES.map(({ row, col, degraded }, index) => (
        <rect
          key={index}
          x={22 + col * 32}
          y={86 + row * 20}
          width="26"
          height="14"
          rx="3"
          fill={degraded ? "rgba(248,113,113,0.22)" : "rgba(148,163,184,0.10)"}
          stroke={degraded ? INK.danger : INK.line}
          className={degraded ? "cv-blink" : undefined}
        />
      ))}

      {/* Suspect ranking - what the agent correlated, in order */}
      <Panel x="12" y="130" width="180" height="82" />
      <text x="22" y="145" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        SUSPECT RANKING
      </text>
      {SUSPECTS.map((suspect, index) => (
        <g key={suspect.label}>
          <text x="22" y={162 + index * 18} fontSize="8" fill={INK.faint}>
            {index + 1}
          </text>
          <text x="32" y={162 + index * 18} fontSize="9.5" fill={INK.text}>
            {suspect.label}
          </text>
          <rect x="112" y={155 + index * 18} width="68" height="5" rx="2.5" fill={INK.lineSoft} />
          <rect
            x="112"
            y={155 + index * 18}
            width={suspect.width}
            height="5"
            rx="2.5"
            fill="currentColor"
            opacity={0.9 - index * 0.22}
          />
        </g>
      ))}

      {/* Agent / MCP orchestration */}
      <Panel x="204" y="32" width="184" height="124" />
      <text x="214" y="47" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        MCP ORCHESTRATION
      </text>
      <line x1="228" y1="68" x2="228" y2="140" stroke={INK.line} strokeWidth="1.5" />
      {ORCHESTRATION.map((step, index) => (
        <g key={step.label}>
          <circle
            cx="228"
            cy={step.y}
            r="5"
            fill={INK.bg}
            stroke="currentColor"
            strokeWidth="2"
            className="cv-node"
            style={{ animationDelay: `${index * 0.45}s` }}
          />
          <text x="242" y={step.y - 1} fontSize="10.5" fill={INK.text} fontWeight="500">
            {step.label}
          </text>
          <text x="242" y={step.y + 10} fontSize="8.5" fill={INK.faint}>
            {step.meta}
          </text>
        </g>
      ))}
      {/* Signal travelling down the orchestration spine */}
      <circle className="cv-drop" cx="228" cy="68" r="2.6" fill="currentColor" />

      {/* AI investigation state */}
      <Panel x="204" y="164" width="184" height="48" />
      <text x="214" y="179" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        INVESTIGATION
      </text>
      <circle className="cv-blink" cx="219" cy="195" r="4" fill="currentColor" />
      <text x="230" y="198.5" fontSize="10" fill={INK.text}>
        Correlating signals
      </text>
      <rect x="214" y="204" width="164" height="3" rx="1.5" fill={INK.lineSoft} />
      <rect className="cv-progress" x="214" y="204" width="104" height="3" rx="1.5" fill="currentColor" />

      {/* Approval gate */}
      <rect
        x="12"
        y="218"
        width={W - 24}
        height="30"
        rx="7"
        fill="rgba(52,211,153,0.08)"
        stroke="rgba(52,211,153,0.32)"
      />
      <path
        d="M30 224 l9 3.4 v5.8 c0 4.8 -3.6 8.6 -9 10.1 c-5.4 -1.5 -9 -5.3 -9 -10.1 v-5.8z"
        fill="rgba(52,211,153,0.18)"
        stroke={INK.ok}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M26.5 233.5 l2.6 2.4 l5 -5.2"
        fill="none"
        stroke={INK.ok}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="48" y="232" fontSize="10.5" fill={INK.text} fontWeight="500">
        Human approval required
      </text>
      <text x="48" y="242.5" fontSize="8.5" fill={INK.faint}>
        HMAC signed before any cluster action
      </text>
    </>
  );
}

/* ------------------------------------------------ 2. Real-time search rank */

// Rows two and three trade places once the live click signal lands.
const RESULT_ROWS = [
  { y: 92, w: 128, cls: "" },
  { y: 118, w: 150, cls: "cv-rank-down" },
  { y: 144, w: 112, cls: "cv-rank-up" },
  { y: 170, w: 138, cls: "" },
];

function SearchRanking() {
  return (
    <>

      {/* Search bar */}
      <rect
        x="12"
        y="38"
        width="230"
        height="26"
        rx="13"
        fill={INK.panelAlt}
        stroke={INK.line}
      />
      <circle cx="28" cy="51" r="4.6" fill="none" stroke={INK.dim} strokeWidth="1.6" />
      <line
        x1="31.5"
        y1="54.5"
        x2="35"
        y2="58"
        stroke={INK.dim}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="42" y="47" width="86" height="4" rx="2" fill={INK.line} />
      <rect className="cv-caret" x="132" y="44" width="1.6" height="12" fill="currentColor" />

      {/* Ranked results */}
      <text x="14" y="80" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        RANKED RESULTS
      </text>
      {RESULT_ROWS.map((row, index) => (
        <g key={index} className={row.cls}>
          <rect
            x="12"
            y={row.y}
            width="230"
            height="22"
            rx="5"
            fill={INK.panel}
            stroke={INK.lineSoft}
          />
          <rect x="20" y={row.y + 6} width="10" height="10" rx="2.5" fill="currentColor" opacity="0.5" />
          <rect x="38" y={row.y + 7} width={row.w} height="3.4" rx="1.7" fill={INK.line} />
          <rect x="38" y={row.y + 14} width={row.w * 0.55} height="2.6" rx="1.3" fill={INK.lineSoft} />
          <rect
            x="218"
            y={row.y + 7}
            width="16"
            height="8"
            rx="4"
            fill="currentColor"
            opacity={0.24 - index * 0.04}
          />
        </g>
      ))}

      {/* Live click / event stream */}
      <Panel x="254" y="38" width="134" height="88" />
      <text x="264" y="54" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        CLICK STREAM
      </text>
      {[0, 1, 2, 3, 4].map((index) => (
        <circle
          key={index}
          className="cv-event"
          cx="268"
          cy={68 + index * 12}
          r="2.6"
          fill="currentColor"
          style={{ animationDelay: `${index * 0.5}s` }}
        />
      ))}
      <Lines x="280" y={66} widths={[64, 48, 72, 40, 58]} gap={12} height={3} />

      {/* Streaming pipeline */}
      <Panel x="254" y="134" width="134" height="80" />
      <text x="264" y="150" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        PIPELINE
      </text>
      <line x1="272" y1="170" x2="272" y2="200" stroke={INK.line} strokeWidth="1.5" />
      {["Kafka", "Flink", "Redis"].map((label, index) => (
        <g key={label}>
          <circle
            cx="272"
            cy={170 + index * 15}
            r="4"
            fill={INK.bg}
            stroke="currentColor"
            strokeWidth="1.8"
            className="cv-node"
            style={{ animationDelay: `${index * 0.4}s` }}
          />
          <text x="284" y={173 + index * 15} fontSize="10" fill={INK.text}>
            {label}
          </text>
        </g>
      ))}
      <circle className="cv-drop-short" cx="272" cy="170" r="2.4" fill="currentColor" />

      <Lines x="12" y="200" widths={[96, 62]} gap={8} opacity={0.45} />
    </>
  );
}

/* ------------------------------------------------- 3. RAG assistant (USDA) */

function RagAssistant() {
  return (
    <>

      {/* Query box */}
      <rect
        x="12"
        y="38"
        width={W - 24}
        height="30"
        rx="8"
        fill={INK.panelAlt}
        stroke={INK.line}
      />
      <text x="24" y="57" fontSize="10.5" fill={INK.dim}>
        Which rural housing programs am I eligible for?
      </text>
      <rect x="352" y="45" width="34" height="16" rx="8" fill="currentColor" opacity="0.85" />
      <path
        d="M363 53 h8 m0 0 l-3 -3 m3 3 l-3 3"
        stroke={INK.bg}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Embedding lattice + retrieval arcs */}
      <text x="14" y="86" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        RETRIEVAL
      </text>
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={22 + col * 16}
            cy={100 + row * 16}
            r="3"
            fill="currentColor"
            opacity={0.25 + ((row + col) % 3) * 0.2}
          />
        ))
      )}
      {[0, 1, 2].map((index) => (
        <path
          key={index}
          className="cv-retrieve"
          style={{ animationDelay: `${index * 0.6}s` }}
          d={`M58 ${108 + index * 16} C 82 ${108 + index * 16}, 82 ${106 + index * 34}, 106 ${
            106 + index * 34
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="4 5"
        />
      ))}

      {/* Retrieved program cards */}
      <text x="106" y="86" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        PROGRAMS
      </text>
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <Panel x="106" y={94 + index * 34} width="118" height="28" />
          <rect
            x="114"
            y={102 + index * 34}
            width={72 - index * 10}
            height="3.4"
            rx="1.7"
            fill={INK.line}
          />
          <rect x="114" y={110 + index * 34} width="46" height="2.6" rx="1.3" fill={INK.lineSoft} />
          <rect x="194" y={106 + index * 34} width="22" height="4" rx="2" fill={INK.lineSoft} />
          <rect
            x="194"
            y={106 + index * 34}
            width={22 - index * 6}
            height="4"
            rx="2"
            fill="currentColor"
          />
        </g>
      ))}

      {/* Grounded answer */}
      <Panel x="236" y="78" width="152" height="122" />
      <text x="246" y="94" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        GROUNDED ANSWER
      </text>
      <Lines x="246" y={104} widths={[130, 118, 132, 96, 124, 82]} gap={10} height={3.4} />
      <rect
        x="246"
        y="172"
        width="70"
        height="16"
        rx="8"
        fill="rgba(52,211,153,0.12)"
        stroke="rgba(52,211,153,0.35)"
      />
      <path
        d="M255 180 l2.4 2.4 l4.6 -5"
        fill="none"
        stroke={INK.ok}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text x="267" y="183" fontSize="8.5" fill={INK.ok}>
        cited
      </text>

      <Lines x="12" y="212" widths={[104, 70]} gap={8} opacity={0.45} />
    </>
  );
}

/* ----------------------------------------------------- 4. SpeakUp live Q&A */

const WAVE_BARS = [8, 16, 26, 14, 32, 20, 38, 22, 30, 12, 24, 18, 34, 10, 22, 28, 14, 20];

function LiveQa() {
  return (
    <>

      {/* Live pill */}
      <rect
        x="12"
        y="36"
        width="58"
        height="18"
        rx="9"
        fill="rgba(248,113,113,0.14)"
        stroke="rgba(248,113,113,0.4)"
      />
      <circle className="cv-blink" cx="24" cy="45" r="3.2" fill={INK.danger} />
      <text x="33" y="48.5" fontSize="9.5" fill="#FCA5A5" fontWeight="600">
        LIVE
      </text>

      {/* Voice waveform */}
      <Panel x="12" y="62" width="212" height="74" />
      <text x="22" y="78" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        VOICE QUESTION
      </text>
      <g transform="translate(22, 112)">
        {WAVE_BARS.map((height, index) => (
          <rect
            key={index}
            className="cv-wave"
            style={{ animationDelay: `${(index % 6) * 0.16}s` }}
            x={index * 11}
            y={-height / 2}
            width="5"
            height={height}
            rx="2.5"
            fill="currentColor"
            opacity={0.45 + (index % 4) * 0.15}
          />
        ))}
      </g>

      {/* Question feed with live votes */}
      <text x="14" y="154" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        QUESTION FEED
      </text>
      {[0, 1].map((index) => (
        <g key={index}>
          <Panel x="12" y={162 + index * 34} width="212" height="28" />
          <path
            d={`M26 ${182 + index * 34} l6 -8 l6 8 z`}
            fill="currentColor"
            opacity={index === 0 ? 0.9 : 0.4}
          />
          <rect
            x="50"
            y={170 + index * 34}
            width={130 - index * 24}
            height="3.4"
            rx="1.7"
            fill={INK.line}
          />
          <rect x="50" y={178 + index * 34} width={86 - index * 18} height="2.6" rx="1.3" fill={INK.lineSoft} />
          <rect x="188" y={170 + index * 34} width="26" height="13" rx="6.5" fill="currentColor" opacity="0.22" />
        </g>
      ))}

      {/* Live activity column */}
      <Panel x="236" y="36" width="152" height="178" />
      <text x="246" y="52" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        LIVE ACTIVITY
      </text>
      {[0, 1, 2, 3, 4].map((index) => (
        <g key={index}>
          <circle
            className="cv-event"
            style={{ animationDelay: `${index * 0.55}s` }}
            cx="252"
            cy={70 + index * 26}
            r="6"
            fill="currentColor"
            opacity="0.3"
          />
          <rect x="266" y={66 + index * 26} width={92 - index * 8} height="3.4" rx="1.7" fill={INK.line} />
          <rect x="266" y={74 + index * 26} width="52" height="2.6" rx="1.3" fill={INK.lineSoft} />
        </g>
      ))}
      <rect x="246" y="192" width="86" height="14" rx="7" fill={INK.panelAlt} stroke={INK.line} />
      <text x="254" y="202" fontSize="8.5" fill={INK.dim}>
        99+ languages
      </text>
    </>
  );
}

/* -------------------------------------------------- 5. CNN-GRU ML dashboard */

const SERIES = "M0 46 L18 38 L36 42 L54 26 L72 32 L90 18 L108 24 L126 12 L144 20 L162 8";

const MODEL_STAGES = [
  { x: 24, label: "Sequences" },
  { x: 116, label: "CNN" },
  { x: 208, label: "GRU + Attn" },
  { x: 300, label: "Risk + Grade" },
];

function MlDashboard() {
  return (
    <>

      {/* Activity sequence */}
      <Panel x="12" y="38" width="216" height="104" />
      <text x="22" y="54" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        ACTIVITY SEQUENCE
      </text>
      <g transform="translate(30, 66)">
        {[0, 1, 2, 3].map((index) => (
          <line
            key={index}
            x1="0"
            y1={index * 18}
            x2="180"
            y2={index * 18}
            stroke={INK.lineSoft}
            strokeWidth="1"
          />
        ))}
        <path d={`${SERIES} L162 54 L0 54 Z`} fill="currentColor" opacity="0.12" />
        <path
          className="cv-trace"
          d={SERIES}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="162" cy="8" r="3.2" fill="currentColor" />
      </g>

      {/* Risk score ring */}
      <Panel x="240" y="38" width="148" height="104" />
      <text x="250" y="54" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        RISK SCORE
      </text>
      <g transform="translate(286, 100)">
        <circle r="28" fill="none" stroke={INK.lineSoft} strokeWidth="7" />
        <circle
          className="cv-ring"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="176"
          strokeDashoffset="62"
          transform="rotate(-90)"
        />
      </g>
      <g transform="translate(330, 74)">
        {["low", "medium", "high"].map((label, index) => (
          <g key={label}>
            <rect x="0" y={index * 16} width="8" height="8" rx="2" fill="currentColor" opacity={0.9 - index * 0.3} />
            <text x="13" y={index * 16 + 7.5} fontSize="8.5" fill={INK.dim}>
              {label}
            </text>
          </g>
        ))}
      </g>

      {/* Model flow */}
      <Panel x="12" y="152" width={W - 24} height="62" />
      <text x="22" y="168" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        MODEL
      </text>
      {MODEL_STAGES.map((stage, index) => (
        <g key={stage.label}>
          <rect
            x={stage.x}
            y="178"
            width="76"
            height="24"
            rx="6"
            fill={INK.panelAlt}
            stroke="currentColor"
            strokeOpacity="0.35"
            className="cv-node"
            style={{ animationDelay: `${index * 0.4}s` }}
          />
          <text x={stage.x + 38} y="193" fontSize="9.5" fill={INK.text} textAnchor="middle">
            {stage.label}
          </text>
          {index < MODEL_STAGES.length - 1 ? (
            <path
              d={`M${stage.x + 80} 190 h8 m0 0 l-3 -3 m3 3 l-3 3`}
              stroke={INK.faint}
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
          ) : null}
        </g>
      ))}

      {/* Prediction result row */}
      <Panel x="12" y="220" width={W - 24} height="28" />
      <text x="22" y="238" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        PREDICTION
      </text>
      <rect x="86" y="227" width="76" height="14" rx="7" fill="currentColor" opacity="0.85" />
      <text x="124" y="237" fontSize="9" fill={INK.bg} textAnchor="middle" fontWeight="600">
        risk tier
      </text>
      <rect x="172" y="227" width="62" height="14" rx="7" fill={INK.panelAlt} stroke={INK.line} />
      <text x="203" y="237" fontSize="9" fill={INK.dim} textAnchor="middle">
        grade
      </text>
      <rect x="248" y="232" width="130" height="4" rx="2" fill={INK.lineSoft} />
      <rect x="248" y="232" width="92" height="4" rx="2" fill="currentColor" opacity="0.7" />
    </>
  );
}

/* ------------------------------------------------------- 6. Pathly redirect */

const REDIRECT_STOPS = [
  { x: 46, label: "Click" },
  { x: 148, label: "FastAPI" },
  { x: 250, label: "Redis" },
  { x: 354, label: "MySQL" },
];

const CLICK_BARS = [10, 16, 12, 22, 18, 26, 20, 30, 24, 32, 27, 34, 30, 38];

function LinkRedirect() {
  return (
    <>

      {/* Short link -> destination */}
      <rect
        x="12"
        y="40"
        width="150"
        height="28"
        rx="8"
        fill={INK.panelAlt}
        stroke="currentColor"
        strokeOpacity="0.45"
      />
      <text x="24" y="58" fontSize="10.5" fill={INK.text} fontFamily="ui-monospace, monospace">
        pth.ly/
      </text>
      <rect x="66" y="49" width="52" height="9" rx="4.5" fill="currentColor" opacity="0.45" />
      <path
        d="M174 54 h30 m0 0 l-5 -5 m5 5 l-5 5"
        stroke={INK.faint}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Panel x="216" y="40" width="172" height="28" />
      <Lines x="228" y={50} widths={[124, 78]} gap={9} height={3.4} />

      {/* Redirect path */}
      <Panel x="12" y="80" width={W - 24} height="66" />
      <text x="22" y="96" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        REDIRECT PATH
      </text>
      <line x1="46" y1="122" x2="354" y2="122" stroke={INK.line} strokeWidth="1.5" />
      <circle className="cv-slide" cx="46" cy="122" r="3" fill="currentColor" />
      {REDIRECT_STOPS.map((stop, index) => (
        <g key={stop.label}>
          <circle
            cx={stop.x}
            cy="122"
            r="5"
            fill={INK.bg}
            stroke="currentColor"
            strokeWidth="2"
            className="cv-node"
            style={{ animationDelay: `${index * 0.35}s` }}
          />
          <text x={stop.x} y="139" fontSize="9" fill={INK.dim} textAnchor="middle">
            {stop.label}
          </text>
        </g>
      ))}
      <rect
        x="282"
        y="100"
        width="62"
        height="14"
        rx="7"
        fill="rgba(52,211,153,0.12)"
        stroke="rgba(52,211,153,0.32)"
      />
      <text x="291" y="110" fontSize="8.5" fill={INK.ok}>
        cache hit
      </text>

      {/* Click analytics */}
      <Panel x="12" y="158" width={W - 24} height="56" />
      <text x="22" y="174" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        CLICK ANALYTICS
      </text>
      <g transform="translate(24, 206)">
        {CLICK_BARS.map((height, index) => (
          <rect
            key={index}
            x={index * 26}
            y={-height}
            width="14"
            height={height}
            rx="3"
            fill="currentColor"
            opacity={0.25 + index * 0.045}
          />
        ))}
      </g>
    </>
  );
}

/* ------------------------------------------------------ 7. CareerLens funnel */

const FUNNEL_STAGES = [
  { label: "Applied", width: 196 },
  { label: "Screen", width: 150 },
  { label: "Interview", width: 104 },
  { label: "Offer", width: 62 },
];

function JobFunnel() {
  return (
    <>

      {/* Application funnel */}
      <Panel x="12" y="38" width="222" height="128" />
      <text x="22" y="54" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        APPLICATION FUNNEL
      </text>
      {FUNNEL_STAGES.map((stage, index) => (
        <g key={stage.label} className="cv-grow" style={{ animationDelay: `${index * 0.16}s` }}>
          <rect
            x="22"
            y={64 + index * 25}
            width={stage.width}
            height="17"
            rx="4"
            fill="currentColor"
            opacity={0.85 - index * 0.16}
          />
          <text x="30" y={76 + index * 25} fontSize="9.5" fill={INK.bg} fontWeight="600">
            {stage.label}
          </text>
        </g>
      ))}

      {/* Captured roles */}
      <Panel x="246" y="38" width="142" height="128" />
      <text x="256" y="54" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        CAPTURED ROLES
      </text>
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect
            x="256"
            y={62 + index * 34}
            width="122"
            height="28"
            rx="6"
            fill={INK.panelAlt}
            stroke={INK.lineSoft}
          />
          <rect x="264" y={70 + index * 34} width="12" height="12" rx="3" fill="currentColor" opacity="0.45" />
          <rect x="284" y={71 + index * 34} width={78 - index * 12} height="3.4" rx="1.7" fill={INK.line} />
          <rect x="284" y={79 + index * 34} width="44" height="2.6" rx="1.3" fill={INK.lineSoft} />
        </g>
      ))}

      {/* Activity trend */}
      <Panel x="12" y="178" width={W - 24} height="60" />
      <text x="22" y="194" fontSize="9" fill={INK.faint} letterSpacing="0.08em">
        ACTIVITY TREND
      </text>
      <g transform="translate(24, 200)">
        <path
          className="cv-trace"
          d="M0 26 L40 20 L80 24 L120 12 L160 16 L200 8 L240 12 L280 4 L344 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="344" cy="8" r="3.2" fill="currentColor" />
      </g>
    </>
  );
}

/* ----------------------------------------------------------------- registry */

const VISUALS = {
  "incident-console": IncidentConsole,
  "search-ranking": SearchRanking,
  "rag-assistant": RagAssistant,
  "live-qa": LiveQa,
  "ml-dashboard": MlDashboard,
  "link-redirect": LinkRedirect,
  "job-funnel": JobFunnel,
};

// Product framing per cover. Labels describe the project's own domain and
// never assert data the project has not produced.
const CHROME = {
  "incident-console": {
    app: "watchtower",
    right: "incident response",
    tabs: ["Overview", "Incidents", "Runbooks"],
    active: 1,
    status: { text: "1 open", tone: "danger" },
  },
  "search-ranking": {
    app: "search-ranking",
    right: "streaming",
    tabs: ["Search", "Signals", "Pipeline"],
    active: 0,
    status: { text: "live", tone: "ok" },
  },
  "rag-assistant": {
    app: "rural-development",
    right: "grounded answers",
    tabs: ["Ask", "Programs", "Sources"],
    active: 0,
    status: { text: "grounded", tone: "ok" },
  },
  "live-qa": {
    app: "speakup",
    right: "live room",
    tabs: ["Questions", "Polls", "Moderation"],
    active: 0,
    status: { text: "live", tone: "danger" },
  },
  "ml-dashboard": {
    app: "performance",
    right: "cnn-gru",
    tabs: ["Cohort", "Model", "Risk"],
    active: 2,
    status: { text: "scored", tone: "ok" },
  },
  "link-redirect": {
    app: "pathly",
    right: "cache-aside",
    tabs: ["Links", "Analytics", "Settings"],
    active: 0,
    status: { text: "cached", tone: "ok" },
  },
  "job-funnel": {
    app: "careerlens",
    right: "pipeline analytics",
    tabs: ["Funnel", "Roles", "Insights"],
    active: 0,
    status: { text: "synced", tone: "ok" },
  },
};

/* --------------------------------------------------------------- component */

// Default matches the frame viewBox, so "slice" has nothing to crop and the
// title bar and toolbar always render whole.
export default function ProjectCover({ project, ratio = `${VB_W} / ${VB_H}` }) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { margin: "0px 0px -8% 0px" });
  const [imageFailed, setImageFailed] = useState(!project.image);

  const Visual = VISUALS[project.visualType];
  const useDrawn = imageFailed || !project.image;

  return (
    <div
      ref={ref}
      className="project-cover"
      data-active={!reducedMotion && inView ? "true" : "false"}
      style={{ aspectRatio: ratio }}
    >
      {!useDrawn ? (
        /* Real screenshot. next/image would route a missing local file through
           the optimizer and return a 500 rather than firing onError, which is
           what makes the graceful fallback below possible. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={project.image}
          alt={project.imageAlt || project.title}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="project-cover__img"
        />
      ) : Visual ? (
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="project-cover__svg"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="0" y="0" width={VB_W} height={VB_H} fill={INK.bg} />
          <AppFrame {...(CHROME[project.visualType] || {})} />
          {/* Composition is authored in its own 400x250 space and dropped
              into the frame's content area. */}
          <g transform={`translate(${RAIL}, ${CHROME_H})`}>
            <Visual />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
