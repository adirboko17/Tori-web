import { Icon, StatusBar, TabBar, TORI_THEME, themeStyle } from "./shared";

/** The real tori app home screen, animated. Every business gets its own
    colors, logo, photos and team through props. */

const IMG = "/assets/imagery/";
const TORI_PHOTOS = [
  "work-1.jpg",
  "work-4.jpg",
  "work-2.jpg",
  "work-3.jpg",
  "work-5.jpg",
  "work-6.jpg",
];
const TORI_STAFF = ["אליאן", "יעל", "מאיה", "מיכל", "נועה", "שני"];
const DAYS = ["היום", "יום ו׳", "שבת", "יום א׳", "יום ב׳", "יום ג׳"];
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

function columnsOf(photos) {
  const [p1, p2, p3, p4, p5, p6] = photos;
  return [
    [p1, p2, p3],
    [p4, p5, p6],
    [p3, p6, p2],
  ];
}

function Mosaic({ photos }) {
  return (
    <div className="ha-mosaic" aria-hidden="true">
      <div className="ha-mosaic-grid">
        {columnsOf(photos).map((tiles, c) => (
          <div key={c} className="ha-col" style={{ "--c": c }}>
            <div className="ha-track">
              {[...tiles, ...tiles].map((src, i) => (
                <img
                  key={i}
                  className="ha-tile"
                  src={IMG + src}
                  alt=""
                  decoding="async"
                  style={{ "--t": i }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Island({ staff }) {
  return (
    <div className="ha-island" aria-hidden="true">
      <span className="ha-island-body">
        <span className="ha-island-check">
          <Icon size={11} width={3}>
            <path d="M20 6 9 17l-5-5" />
          </Icon>
        </span>
        <span className="ha-island-text">
          <b>התור נקבע</b>
          <small>{"יום ב׳ · 17:00 · " + staff}</small>
        </span>
      </span>
      {SPARKS.map((a) => (
        <i key={a} className="ha-spark" style={{ "--a": a + "deg" }} />
      ))}
    </div>
  );
}

function Logo({ logo }) {
  if (logo.text) {
    return (
      <span className="ha-logo ha-logo-text" style={{ fontFamily: logo.font }}>
        {logo.text}
      </span>
    );
  }
  return (
    <img
      className="ha-logo ha-logo-img"
      src="/assets/brand/tori-wordmark.png"
      alt="tori"
      decoding="async"
    />
  );
}

function Greeting({ name }) {
  return (
    <div className="ha-greet-wrap">
      <div className="ha-greet">
        <span className="ha-greet-shine" />
        <span className="ha-greet-text">
          <b>{"שלום " + name}</b>
          <small>לחץ כאן כדי לקבוע תור חדש</small>
        </span>
        <span className="ha-greet-plus">
          <i className="ha-ripple" />
          <i className="ha-ripple" style={{ animationDelay: "1s" }} />
          <Icon size={13}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </Icon>
        </span>
        <span className="ha-tap" />
      </div>
      <div className="ha-soon">
        <Icon size={9} width={2.4}>
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </Icon>
        10 התורים הכי קרובים
        <Icon size={9} width={2.6}>
          <path d="m15 18-6-6 6-6" />
        </Icon>
      </div>
    </div>
  );
}

function Staff({ staff }) {
  return (
    <div className="ha-staff">
      <b>מד זמינות תורים</b>
      <small>בחרו איש צוות לצפייה בזמינות</small>
      <div className="ha-avatars">
        <span className="ha-avatar-ring" />
        {staff.map((name, i) => (
          <span key={name} className="ha-avatar" style={{ "--i": i }}>
            <span className="ha-avatar-img">{name[0]}</span>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomeScreen({
  theme = TORI_THEME,
  logo = {},
  photos = TORI_PHOTOS,
  staff = TORI_STAFF,
  user = "איתי",
  delay = 0,
}) {
  return (
    <div className="ha-screen" style={themeStyle(theme, delay)}>
      <Mosaic photos={photos} />
      <StatusBar />
      <Island staff={staff[0]} />
      <Logo logo={logo} />
      <div className="ha-sheet">
        <span className="ha-handle" />
        <Greeting name={user} />
        <Staff staff={staff} />
        <div className="ha-days" aria-hidden="true">
          {DAYS.map((d) => (
            <span key={d} className={d === "יום ב׳" ? "is-on" : undefined}>
              {d}
            </span>
          ))}
        </div>
      </div>
      <TabBar travel />
    </div>
  );
}
