import fs from 'node:fs';
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, s) => fs.writeFileSync(file, s);
let file = 'src/components/onboarding/Onboarding.jsx';
let s = read(file);
s = s.replace('תשלום מאובטח. החיוב הראשון היום, ואחריו כל חודש באותו תאריך.', 'זו סביבת הדגמה — פרטי כרטיס אינם נאספים ולא מתבצע חיוב. אפשר לשמור את העסק ולהיכנס לממשק הניהול.')
 .replace('מוצפן ומאובטח · PCI DSS', 'תשלום יופעל לאחר חיבור לספק סליקה')
 .replace(' בדרך לחנויות', 'העסק שלך מוכן להדגמה')
 .replace('קיבלנו הכל. תוך 72 שעות האפליקציה תהיה באוויר ב־App Store וב־Google Play, ונשלח לך קישור להורדה ב־SMS ובמייל. בינתיים, אפשר להיכנס לממשק הניהול ולערוך שירותים, צבעים וכל דבר אחר.', 'הפרטים והשירותים נשמרו בדפדפן הזה. אפשר להיכנס לממשק הניהול ולנסות את האפליקציה. לא בוצע חיוב ולא נשלחה בקשה לחנויות.')
 .replace('קראתי את הסכם השירות ואני מאשר/ת את תנאיו בשם העסק.', 'קראתי את נוסח הסכם השירות להדגמה. האישור כאן אינו יוצר מנוי או התחייבות.')
 .replace('aria-label="שדה תשלום להמחשה בלבד"', 'aria-label="שם בעל הכרטיס — להמחשה בלבד"');
write(file, s);

file = 'src/components/application/app-customer.jsx'; s = read(file);
s = s.replace('import React from "react";', 'import React from "react";\nimport { useAppStore } from "./app-store";\nimport { bookingDays, dateKey, formatDate, slotAvailable, phoneSchema } from "@/lib/booking";');
const loginStart = s.indexOf('function LoginScreen');
const loginEnd = s.indexOf('/* ---------- 2.', loginStart);
s = s.slice(0,loginStart) + read('scripts/partials/login.txt') + '\n' + s.slice(loginEnd);
s = s.replace('function HomeScreen({ onBook, onOpenAppt }) {', 'function HomeScreen({ onBook, onOpenAppt }) {\n const { business, appointments } = useAppStore();\n const next = appointments.find((a) => a.status === "confirmed" || a.status === "pending");\n const SERVICES = business.services;\n const TENANT = business;');
s = s.replace('date="מחר · 11:30"', 'date={next ? `${formatDate(next.date)} · ${next.time}` : "היומן שלך פנוי"}').replace('count={1}', 'count={appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length}');
s = s.replace('title="בניית ציפורניים"', 'title={next?.service || "קביעת תור ראשון"}');
s = s.replace('function BookScreen({ onBack, onConfirmed, renderBar }) {', `function BookScreen({ onBack, onConfirmed, renderBar }) {
 const store = useAppStore();
 const SERVICES = store.business.services;
 const DAYS = React.useMemo(() => bookingDays(), []);
 const [error, setError] = React.useState("");
 const [note, setNote] = React.useState("");`);
s = s.replace('React.useState("s1")', 'React.useState(SERVICES[0].id)').replace('React.useState(10)', 'React.useState(DAYS[0].date)').replace('React.useState("11:30")', 'React.useState("09:00")');
s = s.replace('onClick={() => setSheet(true)}', 'disabled={!slot || !slotAvailable(store.appointments, day, slot, svc.mins)} onClick={() => setSheet(true)}');
s = s.replace('[slot, renderBar]', '[slot, renderBar, day, svc.mins, store.appointments]');
s = s.replace('const on = day === d.n', 'const on = day === d.date').replace('onClick={() => setDay(d.n)}', 'onClick={() => { setDay(d.date); setSlot(""); setError(""); }}');
s = s.replace('onSelect={() => setService(s.id)}', 'onSelect={() => { setService(s.id); setSlot(""); }}');
s = s.replace('const taken = TAKEN.includes(t)', 'const taken = !slotAvailable(store.appointments, day, t, svc.mins)');
s = s.replaceAll('{day} בספטמבר', '{formatDate(day)}');
s = s.replace('setSheet(false);\n                  onConfirmed();', `try {
                    store.book({ id: crypto.randomUUID(), date: day, time: slot, service: svc.name, mins: svc.mins, price: svc.price, name: store.profile.name, status: "confirmed", note });
                    setSheet(false); onConfirmed(slot);
                  } catch (e) { setError(e.message); }`);
s = s.replace('<Sheet\n          title="אישור התור"', '<Sheet\n          title="אישור התור"');
s = s.replace('label="הערה לסטודיו (אופציונלי)"', 'value={note} onChange={(e) => setNote(e.target.value)} label="הערה לסטודיו (אופציונלי)"');
s = s.replace('<Switch label="תזכורת שעתיים לפני" defaultChecked />', '<Switch label="תזכורת שעתיים לפני" defaultChecked />\n            {error && <p role="alert" style={{color: "var(--text-danger)"}}>{error}</p>}');
const apptStart = s.indexOf('function ApptScreen');
const apptEnd = s.indexOf('/* ---------- 5.', apptStart);
s = s.slice(0, apptStart) + read('scripts/partials/appointments.txt') + '\n' + s.slice(apptEnd);
const profileStart = s.indexOf('function ProfileScreen');
const profileEnd = s.indexOf('export {', profileStart);
s = s.slice(0, profileStart) + read('scripts/partials/profile.txt') + '\n' + s.slice(profileEnd);
write(file, s);
