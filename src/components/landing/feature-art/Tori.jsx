/** Tori, the mascot, as the feature videos draw him: a green body with a black
    back for depth, the brand mark (black frame, white face) set into it, and
    thick black limbs. Local units: the green front is 150 x 146. */

export const INK = "#141414";

// the brand mark, measured off the app icon (1071px space)
const MARK_FRAME =
  "M420 234H736A110 110 0 0 1 846 344V660C846 700 830 735 800 757L706 824C690 838 672 850 650 850H332A110 110 0 0 1 222 740V440C222 410 230 392 245 375L345 262C365 242 390 234 420 234Z";

function Mark({ eyeFx = true }) {
  return (
    <>
      <path d={MARK_FRAME} fill={INK} />
      <rect x="333" y="272" width="475" height="478" rx="86" fill="#fff" />
      <path d="M463 398L541 432L470 467" fill="none" stroke={INK} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
      <circle data-fx={eyeFx ? "blink" : undefined} cx="690" cy="431" r="42" fill={INK} />
    </>
  );
}

const ARMS = {
  up: { arm: "M146 76C164 72 174 60 182 46", hand: [185, 40], finger: "M188 34L197 20" },
  side: { arm: "M146 82C162 82 174 80 186 76", hand: [191, 75], finger: "M196 72L212 67" },
};

/** `openAt`: the second in the loop when his smile opens into a laugh.
    `hopAt`: when he jumps for joy. */
export function Tori({ id, x, y, scale = 0.5, point = "side", openAt, hopAt }) {
  const arm = ARMS[point];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="68" cy="198" rx="78" ry="9" fill="#e7eaee" />
      <g data-fx={hopAt ? "hop" : undefined} data-at={hopAt} style={{ transformOrigin: "50% 100%" }}>
        <g data-fx="bob">
          <path d="M2 74C-34 76-38 116-4 116" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <path d="M50 140L46 184M92 140L96 184" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="36" cy="188" rx="22" ry="11" fill={INK} />
          <ellipse cx="106" cy="188" rx="22" ry="11" fill={INK} />
          <rect x="-16" y="14" width="146" height="136" rx="24" fill={INK} />
          <rect x="0" y="0" width="150" height="146" rx="22" fill={`url(#${id}-body)`} stroke={INK} strokeWidth="4.5" />
          <g transform="translate(-18.8 -19.4) scale(0.1776)">
            <Mark />
            <path
              d="M494 592C545 615 640 628 678 541"
              fill="none"
              stroke={INK}
              strokeWidth="38"
              strokeLinecap="round"
              data-fx={openAt ? "hide" : undefined}
              data-at={openAt}
            />
            {openAt ? (
              <path d="M450 520Q575 488 706 512Q700 672 578 672Q458 672 450 520Z" fill={INK} opacity="0" data-fx="show" data-at={openAt} />
            ) : null}
          </g>
          <g data-fx="wave" style={{ transformOrigin: "0% 60%" }}>
            <path d={arm.arm} fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
            <ellipse cx={arm.hand[0]} cy={arm.hand[1]} rx="11" ry="10" fill={INK} />
            <path d={arm.finger} stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Tori's app icon, as it sits on a home screen or in a chat header. */
export function ToriIcon({ id, x, y, size }) {
  const s = (size * 0.66) / 625;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} rx={size * 0.26} fill={`url(#${id}-body)`} stroke={INK} strokeWidth="1.6" />
      <g transform={`translate(${size / 2 - 534 * s} ${size / 2 - 542 * s}) scale(${s})`}>
        <Mark eyeFx={false} />
        <path d="M494 592C545 615 640 628 678 541" fill="none" stroke={INK} strokeWidth="38" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function ToriDefs({ id }) {
  return (
    <linearGradient id={id + "-body"} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#c9ff4c" />
      <stop offset="0.5" stopColor="#5cf28c" />
      <stop offset="1" stopColor="#14e6b4" />
    </linearGradient>
  );
}
