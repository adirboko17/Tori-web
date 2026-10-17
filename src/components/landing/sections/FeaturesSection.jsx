import SidesSwitch from "./SidesSwitch";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        position: "relative",
        background: "var(--ink-50)",
        padding: "84px 24px",
        overflow: "hidden",
        borderTop: "1px solid var(--line-subtle)",
      }}
    >
      <div
        data-reveal="1"
        style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "grid",
              justifyItems: "center",
              textAlign: "center",
              gap: "14px",
              marginBottom: "34px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                fontSize: "clamp(30px,4vw,50px)",
                lineHeight: "1.05",
                color: "var(--ink-900)",
                margin: "0",
              }}
            >
              {"שני צדדים,"}
              <br />
              {"אפליקציה "}
              <span className="tori-word">{"אחת."}</span>
            </h2>
            <p
              style={{
                fontSize: "17px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "46ch",
              }}
            >
              {
                "ללקוח - אפליקציה שקובעים בה תור בעשר שניות. לכם - מערכת ניהול מלאה. אותה אפליקציה, שני מסכים."
              }
            </p>
          </div>
          <SidesSwitch />
        </div>
      </div>
    </section>
  );
}
