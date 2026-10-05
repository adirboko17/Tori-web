import { useEffect, useRef } from "react";
import { INK, Tori, ToriDefs, ToriIcon } from "./Tori";
import { playScene } from "./motion";
import "./feature-art.css";

/** Motion art for the six features, in the style of the original videos:
    Tori points at a light UI while the feature plays out on a 6s loop.
    Each scene is a 260x260 viewBox, so it fills its square tile exactly. */

const PANEL = "#eef1f4";
const CELL = "#e9ecef";
const BAR = "#dfe3e8";
const SOFT = "#d9dde2";

function Scene({ id, children }) {
  const ref = useRef(null);
  useEffect(() => playScene(ref.current), []);
  return (
    <svg ref={ref} className="fs" viewBox="0 0 260 260" aria-hidden="true">
      <defs>
        <ToriDefs id={id} />
        <linearGradient id={id + "-green"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9ff4c" />
          <stop offset="1" stopColor="#14e6b4" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

function Check({ x, y, size = 1, color = INK, width = 2.4, ...rest }) {
  return (
    <path
      d={`M${x - 3.6 * size} ${y + 0.2 * size}l${2.6 * size} ${2.6 * size} ${5 * size}-${5.4 * size}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    />
  );
}

/** Short green lines popping out around a point when something lands. */
function Burst({ x, y, r = 14, at }) {
  return (
    <g data-fx="burst" data-at={at} data-still="hide">
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const a = (angle * Math.PI) / 180;
        return (
          <path
            key={angle}
            d={`M${x + Math.cos(a) * r} ${y + Math.sin(a) * r}L${x + Math.cos(a) * (r + 7)} ${y + Math.sin(a) * (r + 7)}`}
            stroke="#12d68f"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/** A dotted path that marches toward its arrowhead. */
function Arrow({ d, head, at }) {
  return (
    <g data-fx="show" data-at={at}>
      <path d={d} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0 6" data-fx="flow" />
      <path d={head} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Bell({ x, y, s = 1, color = "#fff" }) {
  return (
    <path
      d={`M${x - 6 * s} ${y + 3 * s}h${12 * s}l${-1.4 * s}-${2 * s}v${-3.4 * s}a${4.6 * s} ${4.6 * s} 0 0 0-${9.2 * s} 0v${3.4 * s}z M${x - 1.8 * s} ${y + 5.6 * s}a${1.9 * s} ${1.9 * s} 0 0 0 ${3.6 * s} 0`}
      fill={color}
      stroke={color}
      strokeWidth={0.8 * s}
      strokeLinejoin="round"
    />
  );
}

function Sparkle({ x, y, delay = 0 }) {
  return (
    <path
      d={`M${x} ${y - 7}q1.5 5.5 7 7q-5.5 1.5-7 7q-1.5-5.5-7-7q5.5-1.5 7-7z`}
      fill="#c9ff4c"
      stroke={INK}
      strokeWidth="1.6"
      strokeLinejoin="round"
      data-fx="twinkle"
      data-delay={delay}
    />
  );
}

/** 01: a client asks, Tori types, answers, and the slot lands in the calendar. */
function AiAgent() {
  return (
    <Scene id="fs1">
      <rect x="114" y="12" width="134" height="150" rx="18" fill={PANEL} />
      <rect x="16" y="20" width="92" height="74" rx="16" fill={PANEL} />
      <rect x="124" y="24" width="114" height="152" rx="16" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <ToriIcon id="fs1" x={212} y={33} size={16} />
      <rect x="168" y="38" width="38" height="6" rx="3" fill={BAR} />
      <circle cx="160" cy="41" r="3" fill="#12d68f" />
      <path d="M124 57H238" stroke="#eceff2" strokeWidth="1.5" />
      <g data-fx="in" data-from="right" data-at="0.3">
        <rect x="170" y="66" width="60" height="26" rx="11" fill={PANEL} />
        <rect x="180" y="73" width="42" height="5" rx="2.5" fill="#d3d8de" />
        <rect x="194" y="82" width="28" height="5" rx="2.5" fill="#d3d8de" />
      </g>
      <g data-fx="window" data-at="1" data-until="2" data-still="hide">
        <rect x="132" y="100" width="40" height="22" rx="11" fill="#dcfbec" />
        <circle cx="143" cy="111" r="2.6" fill={INK} data-fx="dot" />
        <circle cx="152" cy="111" r="2.6" fill={INK} data-fx="dot" data-delay="0.15" />
        <circle cx="161" cy="111" r="2.6" fill={INK} data-fx="dot" data-delay="0.3" />
      </g>
      <g data-fx="in" data-from="left" data-at="2">
        <rect x="132" y="100" width="78" height="26" rx="11" fill="url(#fs1-green)" stroke={INK} strokeWidth="1.6" />
        <circle cx="146" cy="113" r="7" fill="#fff" />
        <Check x={146} y={112.5} size={0.9} width={2} />
        <rect x="158" y="106" width="42" height="5" rx="2.5" fill="rgba(20,20,20,.28)" />
        <rect x="158" y="115" width="28" height="4" rx="2" fill="rgba(20,20,20,.18)" />
      </g>
      <g data-fx="in" data-from="down" data-at="2.7">
        <rect x="132" y="136" width="98" height="30" rx="15" fill={INK} />
        <rect x="141" y="144" width="14" height="13" rx="3" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M141 148.5h14" stroke="#fff" strokeWidth="1.6" />
        <text className="fs-num" x="186" y="156" fontSize="13" fill="#c9ff4c">
          16:00
        </text>
        <circle cx="217" cy="151" r="7" fill="#c9ff4c" />
        <Check x={217} y={150.5} size={0.8} width={2} />
      </g>
      <rect x="26" y="34" width="72" height="52" rx="10" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M44 28v10M80 28v10" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      {[34, 54, 74].flatMap((x) => [48, 66].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="16" height="13" rx="3" fill={CELL} />))}
      <g data-fx="in" data-at="3.3">
        <rect x="54" y="66" width="16" height="13" rx="3" fill="url(#fs1-green)" stroke={INK} strokeWidth="1.4" />
        <Check x={62} y={72} size={0.7} width={1.8} />
      </g>
      <Burst x={62} y={72} at={3.3} />
      <Arrow d="M128 148C102 142 76 120 66 96" head="M60 103L65 93L72 101" at={2.9} />
      <Tori id="fs1" x={20} y={150} point="up" openAt={3.3} hopAt={3.3} />
      <Sparkle x={26} y={132} />
      <Sparkle x={104} y={138} delay={0.7} />
    </Scene>
  );
}

/** 02: a reminder lands on the calendar day, then another, and she confirms. */
function Reminders() {
  const cells = [];
  for (const y of [86, 108, 130, 152]) for (const x of [138, 161, 184, 207]) cells.push([x, y]);
  return (
    <Scene id="fs2">
      <rect x="118" y="44" width="130" height="152" rx="18" fill={PANEL} />
      <rect x="14" y="12" width="120" height="62" rx="16" fill={PANEL} />
      <rect x="128" y="64" width="110" height="120" rx="14" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <path d="M152 56v16M214 56v16" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="19" height="17" rx="4" fill={CELL} />
      ))}
      <g data-fx="in" data-at="1.5">
        <rect x="161" y="108" width="19" height="17" rx="4" fill="url(#fs2-green)" stroke={INK} strokeWidth="1.4" />
        <Bell x={170.5} y={115.5} s={0.62} />
      </g>
      <Burst x={170.5} y={116.5} r={15} at={1.5} />
      <g data-fx="in" data-at="3">
        <circle cx="182" cy="107" r="8" fill={INK} />
        <Check x={182} y={106.5} size={0.85} color="#c9ff4c" width={2.2} />
      </g>
      <Burst x={182} y={107} r={12} at={3} />
      <g data-fx="float">
        <g data-fx="in" data-from="left" data-at="0.3">
          <rect x="24" y="22" width="98" height="38" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
          <rect x="32" y="30" width="22" height="22" rx="7" fill="url(#fs2-green)" stroke={INK} strokeWidth="1.4" />
          <g data-fx="wiggle" data-at="0.8" style={{ transformOrigin: "50% 15%" }}>
            <Bell x={43} y={40} s={0.8} color={INK} />
          </g>
          <rect x="62" y="33" width="50" height="6" rx="3" fill={BAR} />
          <rect x="62" y="45" width="34" height="5" rx="2.5" fill={CELL} />
        </g>
      </g>
      <g data-fx="float" data-delay="0.8">
        <g data-fx="in" data-from="left" data-at="2.4">
          <rect x="24" y="68" width="92" height="34" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
          <rect x="32" y="75" width="20" height="20" rx="6.5" fill={INK} />
          <circle cx="42" cy="85" r="5.5" fill="none" stroke="#c9ff4c" strokeWidth="1.8" />
          <path d="M42 82v3l2 1.5" stroke="#c9ff4c" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="60" y="78" width="46" height="6" rx="3" fill={BAR} />
          <rect x="60" y="89" width="30" height="5" rx="2.5" fill={CELL} />
        </g>
      </g>
      <Arrow d="M124 44C146 46 160 64 166 94" head="M160 88L166 99L173 89" at={1} />
      <Tori id="fs2" x={18} y={150} point="side" openAt={3} hopAt={3} />
    </Scene>
  );
}

function Person({ x, y, fill }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8.5" fill={fill} stroke={INK} strokeWidth="1.4" />
      <circle cx={x} cy={y - 2.2} r="2.6" fill={INK} />
      <path d={`M${x - 4.4} ${y + 5}a4.4 3.8 0 0 1 8.8 0z`} fill={INK} />
    </g>
  );
}

/** 03: a slot is cancelled; Tori hands it to the first one on the waitlist. */
function Waitlist() {
  const slots = [];
  for (const y of [50, 78, 106, 134]) for (const x of [132, 186]) slots.push([x, y]);
  return (
    <Scene id="fs3">
      <rect x="112" y="10" width="136" height="168" rx="18" fill={PANEL} />
      <rect x="16" y="26" width="84" height="62" rx="16" fill={PANEL} />
      <rect x="122" y="22" width="116" height="148" rx="14" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <rect x="132" y="32" width="56" height="7" rx="3.5" fill={BAR} />
      {slots.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="44" height="22" rx="6" fill={CELL} />
          <rect x={x + 7} y={y + 8} width="24" height="6" rx="3" fill="#d3d8de" />
        </g>
      ))}
      <g data-fx="window" data-at="0.4" data-until="2.7" data-still="hide">
        <rect x="186" y="78" width="44" height="22" rx="6" fill="#fff" stroke="#ff5a5f" strokeWidth="1.8" strokeDasharray="4 3" />
        <circle cx="228" cy="79" r="6.5" fill="#ff5a5f" />
        <path d="M225.6 76.6l4.8 4.8M230.4 76.6l-4.8 4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <g data-fx="fly" data-at="1.6" data-dx="-100" data-dy="82" data-arc="42" data-dur="0.9">
        <rect x="186" y="78" width="44" height="22" rx="6" fill="url(#fs3-green)" stroke={INK} strokeWidth="1.6" />
        <circle cx="198" cy="89" r="6" fill="#fff" />
        <Check x={198} y={88.5} size={0.75} width={1.9} />
        <rect x="208" y="87" width="15" height="4.5" rx="2.25" fill="rgba(20,20,20,.3)" />
      </g>
      <Burst x={208} y={89} r={20} at={2.65} />
      <g data-fx="float">
        <rect x="26" y="36" width="66" height="42" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
        <rect x="34" y="43" width="30" height="5" rx="2.5" fill={BAR} />
        <g data-fx="hide" data-at="1.5">
          <Person x={41} y={62} fill="#ffd6e8" />
        </g>
        <Person x={59} y={62} fill="#d6e6ff" />
        <Person x={77} y={62} fill="#fff1c2" />
        <circle cx="41" cy="62" r="11.5" fill="none" stroke="#12d68f" strokeWidth="2.5" data-fx="window" data-at="0.9" data-until="1.5" data-still="hide" />
      </g>
      <Tori id="fs3" x={16} y={150} point="up" openAt={2.7} hopAt={2.7} />
    </Scene>
  );
}

/** 04: the next appointment pops onto the home screen as a widget. */
function Widget() {
  const icons = [];
  for (const y of [104, 130, 156, 182, 208]) for (const x of [152, 179, 206]) icons.push([x, y]);
  return (
    <Scene id="fs4">
      <rect x="128" y="8" width="120" height="198" rx="18" fill={PANEL} />
      <rect x="14" y="34" width="84" height="62" rx="16" fill={PANEL} />
      <rect x="140" y="16" width="98" height="230" rx="20" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="174" y="24" width="30" height="7" rx="3.5" fill={INK} />
      {icons.map(([x, y], i) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="20" height="20" rx="6" fill={CELL} data-fx="in" data-at={0.15 + i * 0.04} />
      ))}
      <rect x="150" y="44" width="78" height="48" rx="12" fill="none" stroke="#cfd4da" strokeWidth="1.5" strokeDasharray="4 3" />
      <g data-fx="in" data-at="1.2">
        <rect x="150" y="44" width="78" height="48" rx="12" fill="#fff" stroke={INK} strokeWidth="2.4" />
        <ToriIcon id="fs4" x={204} y={51} size={18} />
        <rect x="158" y="54" width="38" height="6" rx="3" fill={BAR} />
        <text className="fs-num" x="182" y="84" fontSize="16" fill={INK}>
          17:00
        </text>
      </g>
      <Burst x={189} y={68} r={34} at={1.2} />
      <g data-fx="in" data-at="2.2">
        <circle cx="228" cy="45" r="9" fill="url(#fs4-green)" stroke={INK} strokeWidth="1.6" />
        <Check x={228} y={44.5} size={0.85} width={2} />
      </g>
      <g data-fx="float">
        <g data-fx="in" data-from="left" data-at="0.4">
          <rect x="24" y="46" width="64" height="38" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
          <rect x="32" y="54" width="22" height="22" rx="7" fill="url(#fs4-green)" stroke={INK} strokeWidth="1.4" />
          <rect x="35.5" y="59" width="15" height="13" rx="2.5" fill="none" stroke={INK} strokeWidth="1.6" />
          <path d="M35.5 63h15" stroke={INK} strokeWidth="1.4" />
          <rect x="60" y="58" width="22" height="5" rx="2.5" fill={BAR} />
          <rect x="60" y="68" width="16" height="5" rx="2.5" fill={CELL} />
        </g>
      </g>
      <Arrow d="M90 64C108 58 124 60 142 66" head="M135 60L145 67L135 73" at={0.9} />
      <Tori id="fs4" x={18} y={150} point="up" openAt={1.4} hopAt={2.2} />
    </Scene>
  );
}

/** 05: the ten nearest slots light up, one tap books one, the stopwatch runs. */
function QuickSlots() {
  const chips = [];
  for (const y of [56, 90, 124, 158, 192]) for (const x of [186, 142]) chips.push([x, y]);
  return (
    <Scene id="fs5">
      <rect x="120" y="14" width="128" height="198" rx="18" fill={PANEL} />
      <rect x="12" y="16" width="100" height="94" rx="18" fill={PANEL} />
      <rect x="130" y="24" width="108" height="214" rx="18" fill="#fff" stroke={INK} strokeWidth="2.8" />
      <rect x="142" y="38" width="54" height="7" rx="3.5" fill={BAR} />
      {chips.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="40" height="28" rx="8" fill={CELL} />
          <g data-fx="show" data-at={0.3 + i * 0.1}>
            <rect x={x} y={y} width="40" height="28" rx="8" fill="url(#fs5-green)" />
            <rect x={x + 8} y={y + 12} width="18" height="4.5" rx="2.25" fill="rgba(20,20,20,.3)" />
          </g>
        </g>
      ))}
      <g data-fx="press" data-at="2.35">
        <g data-fx="in" data-at="2.5">
          <rect x="186" y="90" width="40" height="28" rx="8" fill={INK} />
          <circle cx="198" cy="104" r="6" fill="#c9ff4c" />
          <Check x={198} y={103.5} size={0.75} width={1.9} />
          <rect x="208" y="102" width="12" height="4.5" rx="2.25" fill="#c9ff4c" />
        </g>
      </g>
      <Burst x={206} y={104} r={24} at={2.5} />
      <g data-fx="float">
        <path d="M18 52h16M14 62h16M20 72h14" stroke="#12d68f" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <rect x="56" y="24" width="12" height="7" rx="2" fill={INK} />
      <circle cx="62" cy="62" r="27" fill="#fff" stroke={INK} strokeWidth="3" />
      <circle
        cx="62"
        cy="62"
        r="18"
        fill="none"
        stroke="#5cf28c"
        strokeWidth="8"
        pathLength="1"
        strokeDasharray="1"
        transform="rotate(-90 62 62)"
        data-fx="draw"
        data-at="0.2"
        data-dur="2.2"
      />
      <path d="M62 62V46" stroke={INK} strokeWidth="3" strokeLinecap="round" data-fx="spin" style={{ transformOrigin: "50% 100%" }} />
      <circle cx="62" cy="62" r="3.5" fill={INK} />
      <path d="M98 22l-8 14h7l-5 12 12-16h-7l5-10z" fill="#c9ff4c" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" data-fx="pulse" />
      <Tori id="fs5" x={16} y={150} point="side" openAt={2.6} hopAt={2.6} />
    </Scene>
  );
}

/** 06: the health form fills itself in, gets signed and approved. */
function Health() {
  const rows = [76, 102, 128];
  return (
    <Scene id="fs6">
      <rect x="116" y="10" width="132" height="200" rx="18" fill={PANEL} />
      <rect x="12" y="18" width="94" height="96" rx="18" fill={PANEL} />
      <rect x="128" y="18" width="106" height="228" rx="20" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="166" y="26" width="30" height="7" rx="3.5" fill={INK} />
      <rect x="140" y="44" width="18" height="18" rx="6" fill="url(#fs6-green)" stroke={INK} strokeWidth="1.4" />
      <path d="M149 48.5v9M144.5 53h9" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="164" y="47" width="56" height="6" rx="3" fill={BAR} />
      <rect x="164" y="56" width="36" height="4.5" rx="2.25" fill={CELL} />
      {rows.map((y, i) => (
        <g key={y}>
          <rect x="140" y={y} width="16" height="16" rx="5" fill="#fff" stroke={INK} strokeWidth="2" />
          <rect x="140" y={y} width="16" height="16" rx="5" fill="url(#fs6-green)" stroke={INK} strokeWidth="2" data-fx="show" data-at={0.6 + i * 0.4} />
          <Check x={148} y={y + 7.6} size={0.8} width={2.2} pathLength="1" strokeDasharray="1" data-fx="draw" data-at={0.65 + i * 0.4} data-dur="0.3" />
          <rect x="164" y={y + 2} width="58" height="5" rx="2.5" fill={BAR} />
          <rect x="164" y={y + 10} width="38" height="4" rx="2" fill={CELL} />
        </g>
      ))}
      <rect x="138" y="156" width="86" height="46" rx="10" fill="#f6f7f9" stroke="#e1e5ea" strokeWidth="1.5" />
      <path
        d="M150 186c6-18 12 8 18-2s6-14 12 0 8 10 14-4 6 6 12 2"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        data-fx="draw"
        data-at="1.9"
        data-dur="1"
      />
      <g data-fx="in" data-at="3">
        <circle cx="216" cy="204" r="16" fill="url(#fs6-green)" stroke={INK} strokeWidth="2" />
        <Check x={216} y={203} size={1.25} width={2.8} />
      </g>
      <Burst x={216} y={204} r={22} at={3} />
      <g data-fx="float">
        <g data-fx="in" data-from="left" data-at="0.3">
          <rect x="20" y="28" width="76" height="34" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
          <rect x="28" y="38" width="28" height="5" rx="2.5" fill={BAR} />
          <rect x="28" y="48" width="18" height="4" rx="2" fill={CELL} />
          <rect x="62" y="38" width="26" height="15" rx="7.5" fill="#e1e5ea" />
          <rect x="62" y="38" width="26" height="15" rx="7.5" fill="url(#fs6-green)" stroke={INK} strokeWidth="1.2" data-fx="show" data-at="1.2" />
          <circle cx="69.5" cy="45.5" r="5.5" fill="#fff" stroke={INK} strokeWidth="1.2" data-fx="hide" data-at="1.2" />
          <circle cx="80.5" cy="45.5" r="5.5" fill="#fff" stroke={INK} strokeWidth="1.2" data-fx="show" data-at="1.2" />
        </g>
      </g>
      <g data-fx="float" data-delay="1">
        <g data-fx="in" data-from="left" data-at="0.6">
          <rect x="26" y="72" width="66" height="32" rx="12" fill="#fff" stroke={SOFT} strokeWidth="1.5" />
          <circle cx="42" cy="88" r="9" fill={INK} />
          <path d="M42 83v10M37 88h10" stroke="#c9ff4c" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="56" y="82" width="28" height="5" rx="2.5" fill={BAR} />
          <rect x="56" y="91" width="18" height="4" rx="2" fill={CELL} />
        </g>
      </g>
      <Tori id="fs6" x={14} y={150} point="up" openAt={3.1} hopAt={3.1} />
    </Scene>
  );
}

export const FEATURE_ART = [AiAgent, Reminders, Waitlist, Widget, QuickSlots, Health];
