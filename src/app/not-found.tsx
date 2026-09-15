import Link from "next/link";
import Image from "next/image";
export default function NotFound() {
  return (
    <main className="message-page">
      <Image
        src="/assets/brand/tori-app-icon.png"
        width="72"
        height="72"
        alt="tori"
      />
      <h1>העמוד הזה לא נמצא.</h1>
      <p>אפשר לחזור לדף הבית ולהתחיל משם.</p>
      <Link className="tori-btn tori-btn--primary" href="/">
        חזרה לדף הבית ←
      </Link>
    </main>
  );
}
