"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="message-page">
      <h1>משהו השתבש.</h1>
      <p>אפשר לנסות שוב בעוד רגע.</p>
      <button className="tori-btn tori-btn--primary" onClick={reset}>
        ניסיון נוסף
      </button>
    </main>
  );
}
