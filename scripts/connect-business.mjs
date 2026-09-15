import fs from 'node:fs';
const file = 'src/components/application/app-business.jsx';
let s = fs.readFileSync(file,'utf8');
s = s.replace('import React from "react";', 'import React from "react";\nimport { useAppStore } from "./app-store";\nimport { dateKey, formatDate, phoneSchema } from "@/lib/booking";');
s = s.replace('function BizHomeScreen({ tenant, onBroadcast, onClients, onDay }) {', 'function BizHomeScreen({ tenant, onBroadcast, onClients, onDay }) {\n const store = useAppStore();\n const today = dateKey(new Date());\n const upcoming = store.appointments.filter((a) => a.date >= today && a.status !== "cancelled");');
s = s.replace('<DateCard weekday="יום חמישי" date="10 בספט׳" count={0} />','<DateCard weekday={new Date().toLocaleDateString("he-IL",{weekday:"long"})} date={formatDate(today)} count={upcoming.length} />')
 .replace('<QuietRow icon="calendar-days">אין תורים קרובים היום</QuietRow>', '<QuietRow icon="calendar-days">{upcoming[0] ? `${upcoming[0].name} · ${formatDate(upcoming[0].date)} · ${upcoming[0].time}` : "אין תורים קרובים היום"}</QuietRow>')
 .replace('count={2}', 'count={store.clients.length}');
const start = s.indexOf('function BizDayScreen');
const end = s.indexOf('export {', start);
s = s.slice(0,start) + ['business-day','business-clients','business-settings'].map((name) => fs.readFileSync(`scripts/partials/${name}.txt`,'utf8')).join('\n\n') + '\n' + s.slice(end);
// Remove export-only sample arrays; application data now comes from the store.
const sampleStart = s.indexOf('const DAY_ROWS');
const sampleEnd = s.indexOf('/* ---------- business home',sampleStart);
s = s.slice(0,sampleStart) + s.slice(sampleEnd);
fs.writeFileSync(file,s);
