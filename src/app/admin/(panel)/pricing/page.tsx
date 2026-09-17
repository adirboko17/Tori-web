"use client";

import { useEffect, useState, type ChangeEvent } from "react";

export default function AdminPricingPage() {
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((res) => res.json())
      .then((data) => {
        setPrice(String(data.monthlyPriceIls ?? ""));
        setTotal(Number(data.total ?? 0));
      })
      .catch(() => setError("טעינת המחיר נכשלה."));
  }, []);

  async function save() {
    setError("");
    setSaved("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyPriceIls: Number(price) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "שמירת המחיר נכשלה.");
      setPrice(String(data.monthlyPriceIls));
      setTotal(Number(data.total));
      setSaved("המחיר עודכן ויופיע באתר ובתשלום החודשי.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת המחיר נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <p className="admin-kicker">מנוי</p>
        <h1 className="admin-title">מחיר חודשי</h1>
        <p className="admin-lead">
          זה המחיר לפני מע״מ שמוצג באתר ומשמש להוראת הקבע.
        </p>
      </div>
      <section className="admin-card">
        <label className="admin-field">
          מחיר לחודש ₪
          <input
            type="number"
            dir="ltr"
            value={price}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPrice(event.target.value);
              setSaved("");
            }}
          />
        </label>
        <p className="admin-note">
          כולל מע״מ: {total == null ? "…" : `${total} ₪`}
        </p>
        {error ? <p className="admin-error">{error}</p> : null}
        {saved ? <p className="admin-note">{saved}</p> : null}
        <button
          type="button"
          className="admin-btn"
          disabled={loading}
          onClick={() => void save()}
        >
          {loading ? "שומרים…" : "שמירת מחיר"}
        </button>
      </section>
    </>
  );
}
