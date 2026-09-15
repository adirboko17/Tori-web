export default function ToriLoaderSection() {
  return (
    <div
      className="tori-loader"
      data-ref="loaderRef"
      data-act="skipLoader"
      data-ev="click"
      style={{
        position: "fixed",
        inset: "0",
        zIndex: "200",
        display: "grid",
        placeItems: "center",
        background: "#F7F7F7",
        cursor: "pointer",
        transition: "opacity .65s cubic-bezier(.22,.61,.36,1),visibility .65s",
      }}
    >
      <span
        className="tori-wipe"
        style={{
          position: "absolute",
          inset: "0",
          transform: "translateY(102%)",
          background:
            "linear-gradient(135deg,#BFFF51 0%,#6BFF85 42%,#0CFFBE 100%)",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "0",
            bottom: "0",
            width: "42%",
            opacity: "0",
            background:
              "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.65),rgba(255,255,255,0))",
          }}
        ></span>
      </span>
      <div
        className="tori-loader-inner"
        style={{
          position: "relative",
          display: "grid",
          justifyItems: "center",
          gap: "30px",
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: "min(52vw,300px)",
            height: "min(39vw,225px)",
          }}
        >
          <img
            className="tori-loader-fallback"
            src="/assets/brand/tori-mark.png"
            alt="tori"
            style={{
              gridArea: "1/1",
              width: "92px",
              height: "92px",
              transition: "opacity .35s ease",
              animation: "tori-float 2.6s ease-in-out infinite",
            }}
          />
          <video
            data-ref="loaderVideoRef"
            muted={true}
            playsInline={true}
            autoPlay={true}
            preload="auto"
            style={{
              gridArea: "1/1",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: "0",
              transition: "opacity .35s ease",
            }}
          >
            <source src="/assets/video/tori-loader.mp4" type="video/mp4" />
          </video>
        </div>
        <div
          style={{
            width: "min(56vw,220px)",
            height: "4px",
            borderRadius: "999px",
            background: "rgba(23,22,22,.10)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              borderRadius: "999px",
              background: "var(--gradient-brand)",
              transform: "scaleX(0)",
              transformOrigin: "100% 50%",
              animation: "tori-load 3.1s cubic-bezier(.4,0,.2,1) forwards",
            }}
          ></span>
        </div>
      </div>
    </div>
  );
}
