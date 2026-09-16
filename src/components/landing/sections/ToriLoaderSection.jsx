export default function ToriLoaderSection() {
  return (
    <div
      className="tori-loader"
      data-ref="loaderRef"
      data-act="skipLoader"
      data-ev="click"
      role="status"
      aria-live="polite"
      aria-label="טוען את תורי"
    >
      <span className="tori-wipe" aria-hidden="true">
        <span></span>
      </span>

      <div className="tori-loader-inner">
        <div className="tori-loader-art">
          <img
            className="tori-loader-fallback"
            src="/assets/brand/tori-mark.png"
            alt=""
          />
          <video
            data-ref="loaderVideoRef"
            muted={true}
            playsInline={true}
            autoPlay={true}
            preload="auto"
            aria-hidden="true"
          >
            <source src="/assets/video/tori-loader.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="tori-loader-track" aria-hidden="true">
          <span className="tori-loader-fill" data-ref="loaderBarRef"></span>
        </div>

        <div className="tori-loader-meta">
          <span className="tori-loader-cap">{"מכינים לך את תורי"}</span>
          <span className="tori-loader-pct" data-ref="loaderPctRef">
            {"0%"}
          </span>
        </div>
      </div>

      <span className="tori-loader-skip" aria-hidden="true">
        {"הקישו לדילוג"}
      </span>
    </div>
  );
}
