/** A tori app flow played inside the phone: each screen takes its turn. */
export default function AppFlow({ screens }) {
  return (
    <div className="ha-screen hf">
      {screens.map((Screen, k) => (
        <div key={k} className="hf-slide" style={{ "--k": k }}>
          <Screen />
        </div>
      ))}
    </div>
  );
}
