/* Every tori capability on the /features page, grouped by who uses it.
   `demo` names its phone recording in /assets/demos (.webm, .mp4 and a .jpg
   first frame); a capability without one shows a placeholder. */

export const SIDES = {
  customer: {
    label: "ללקוח",
    groups: [
      {
        title: "קביעת תור",
        items: [
          { id: "book", demo: "customer/book", icon: "calendar", title: "קביעת תור עצמאית", text: "בוחרים איש צוות, שירות, יום ושעה, והתור נקבע. בלי טלפונים ובלי לחכות לתשובה." },
          { id: "quick", demo: "customer/quick", icon: "zap", title: "תורים זריזים", text: "לוחצים על „10 התורים הכי קרובים”, בוחרים שעה, וזהו." },
          { id: "meter", demo: "customer/meter", icon: "gauge", title: "מד זמינות שבועי", text: "רואים בכל יום כמה מקום יש, לכל איש צוות בנפרד." },
          { id: "waitlist", demo: "customer/waitlist", icon: "hourglass", title: "רשימת המתנה", text: "היום מלא? נרשמים לבוקר או לערב, ומקבלים התראה ברגע שמתפנה תור." },
        ],
      },
      {
        title: "אחרי שקבעתם",
        items: [
          { id: "my-appointments", demo: "customer/my-appointments", icon: "clock", title: "התורים שלי וביטול", text: "כל התורים הקרובים במקום אחד, וביטול בשתי לחיצות." },
          { id: "swap", demo: "customer/swap", icon: "swap", title: "החלפת תור בין לקוחות", text: "מבקשים להחליף, מקבלים הצעה מלקוחה אחרת, והתורים מתחלפים." },
        ],
      },
      {
        title: "העסק בכיס של הלקוח",
        items: [
          { id: "stories", demo: "customer/stories", icon: "stories", title: "גלריה בסגנון סטוריז", text: "לוחצים על עבודה ומחליקים בין העבודות במסך מלא, כמו באינסטגרם." },
          { id: "products", demo: "customer/products", icon: "bag", title: "חלון מוצרים", text: "המוצרים של העסק בקרוסלה, עם כרטיס לכל מוצר." },
        ],
      },
      {
        title: "לפני הטיפול",
        items: [{ id: "health", demo: "customer/health", icon: "clipboard", title: "הצהרת בריאות דיגיטלית", text: "עונים על שאלות כן ולא, חותמים באצבע ושולחים." }],
      },
      {
        title: "כניסה לאפליקציה",
        items: [
          { id: "signup", demo: "customer/signup", icon: "message", title: "הרשמה עם קוד SMS", text: "מכניסים מספר טלפון, הקוד מתמלא לבד, ונכנסים." },
          { id: "face-id", demo: "customer/face-id", icon: "face", title: "הזדהות עם Face ID", text: "נכנסים לאפליקציה במבט אחד, בלי סיסמה." },
        ],
      },
    ],
  },
  business: {
    label: "לעסק",
    groups: [
      {
        title: "העיצוב והתוכן שלכם",
        items: [
          { id: "branding", demo: "business/branding", icon: "palette", title: "עיצוב האפליקציה", text: "בוחרים צבע בגלגל הצבעים, וכל האפליקציה נצבעת בצבע של העסק." },
          { id: "home-design", demo: "business/home-design", icon: "layout", title: "עיצוב מסך הבית", text: "תמונות או וידאו ברקע, לוגו או שם העסק ב-28 פונטים, עם תצוגה מקדימה." },
          { id: "gallery", demo: "business/gallery", icon: "image", title: "ניהול גלריה", text: "מוסיפים עבודה, בוחרים תמונות מהטלפון, והיא מופיעה אצל הלקוחות." },
          { id: "products-admin", demo: "business/products-admin", icon: "bag", title: "ניהול מוצרים", text: "מוסיפים מוצר בשלושה שלבים: תמונה, תצוגה ומחיר." },
        ],
      },
      {
        title: "יומן ותורים",
        items: [
          { id: "day-view", demo: "business/day-view", icon: "calendar", title: "תצוגת יום", text: "כל התורים של היום על ציר השעות, במבט אחד." },
          { id: "views", demo: "business/views", icon: "list", title: "יום, שבוע, חודש או רשימה", text: "עוברים בין תצוגות היומן לפי מה שנוח לכם." },
          { id: "drag", demo: "business/drag", icon: "move", title: "גרירת תור לשעה אחרת", text: "לחיצה ארוכה על תור, גוררים אותו לשעה חדשה, ובוחרים אם לעדכן את הלקוח." },
          { id: "manual-booking", demo: "business/manual-booking", icon: "plus", title: "הוספת תור ידנית", text: "לקוחה התקשרה? לוחצים +, בוחרים לקוחה, שירות ושעה, והתור ביומן." },
          { id: "block-time", demo: "business/block-time", icon: "lock", title: "חסימת זמן", text: "חוסמים שעה ביומן, ולקוחות לא יכולים לקבוע בה." },
          { id: "special-hours", demo: "business/special-hours", icon: "clock", title: "שעות שונות ליום מסוים", text: "פותחים מאוחר או סוגרים מוקדם בתאריך אחד, בלי לשנות את כל השבוע." },
          { id: "calendar-note", demo: "business/calendar-note", icon: "note", title: "תזכורת ביומן", text: "פתק צבעוני ביומן שמזכיר לכם משהו, בלי לחסום תורים." },
          { id: "recurring", demo: "business/recurring", icon: "repeat", title: "תורים קבועים", text: "בוחרים למשל „כל שבועיים”, והיומן מתמלא לבד." },
          { id: "hours", demo: "business/hours", icon: "coffee", title: "שעות עבודה והפסקות", text: "מדליקים ימי עבודה, קובעים שעות ומוסיפים הפסקות." },
          { id: "waitlist-admin", demo: "business/waitlist-admin", icon: "hourglass", title: "ניהול רשימת המתנה", text: "התפנה תור ומישהי ממתינה לו? משבצים אותה בלחיצה אחת." },
        ],
      },
      {
        title: "לקוחות",
        items: [
          { id: "clients", demo: "business/client-card", icon: "search", title: "רשימת לקוחות וחיפוש", text: "כל הלקוחות במקום אחד, ומוצאים כל אחת בחיפוש." },
          { id: "client-card", demo: "business/client-card", icon: "user", title: "כרטיס לקוח", text: "ביקורים, ביטולים, הוצאה ממוצעת וכל ההיסטוריה של הלקוח." },
          { id: "approve", demo: "business/approve", icon: "user-check", title: "אישור לקוחות חדשים", text: "לקוח חדש נרשם? מאשרים אותו בלחיצה אחת." },
          { id: "client-rules", demo: "business/client-rules", icon: "settings", title: "הגבלות לפי לקוח", text: "ימים ושעות מותרים לכל לקוח, ומשך טיפול מותאם במיוחד בשבילו." },
        ],
      },
      {
        title: "Tori, העוזרת החכמה",
        items: [
          { id: "ai-chat", demo: "business/ai-chat", icon: "sparkles", title: "עוזרת AI בצ׳אט", text: "שואלים את Tori „יש מקום מחר בבוקר?”, והיא מציעה, מאשרת וקובעת." },
          { id: "ai-voice", demo: "business/ai-voice", icon: "mic", title: "שיחה קולית עם Tori", text: "מדברים עם Tori בקול, והיא מקשיבה ועונה." },
          { id: "insights", demo: "business/insights", icon: "bulb", title: "תובנות עסקיות", text: "Tori מראה, למשל, לקוחות קבועים שלא חזרו, ומנסחת להם הודעה." },
        ],
      },
      {
        title: "הודעות ותזכורות",
        items: [
          { id: "broadcast", demo: "business/broadcast", icon: "megaphone", title: "הודעות שידור", text: "בוחרים קהל, למשל מי שלא קבע חודש, ושולחים התראה עכשיו או בתזמון." },
          { id: "policy", demo: "business/policy", icon: "bell", title: "מדיניות ותזכורות אוטומטיות", text: "חלון ביטול, תזכורת לפני התור ותזכורת לחזור, הכל אוטומטי." },
          { id: "notifications", demo: "business/notifications", icon: "inbox", title: "התראות ויתרת SMS", text: "כל ההתראות בתיבה אחת עם סינון, ויתרת ה-SMS תמיד מול העיניים." },
        ],
      },
      {
        title: "כסף ומבט על",
        items: [
          { id: "dashboard", demo: "business/dashboard", icon: "chart", title: "דשבורד בעל העסק", text: "היום, התור הבא, קיצורי דרך וגרף שבועי, במסך אחד." },
          { id: "finance", demo: "business/finance", icon: "wallet", title: "הכנסות והוצאות", text: "כמה נכנס, כמה יצא, ומה הרווח הנקי, עם גרף." },
          { id: "receipt", demo: "business/receipt", icon: "receipt", title: "הוספת הוצאה עם קבלה", text: "בוחרים קטגוריה, מצלמים את הקבלה ושומרים." },
        ],
      },
      {
        title: "הגדרות העסק",
        items: [
          { id: "health-forms", demo: "business/health-forms", icon: "clipboard", title: "בונה הצהרת בריאות", text: "בונים שאלון מבלוקים ומחברים אותו לשירות." },
          { id: "services", demo: "business/services", icon: "tag", title: "שירותים ומחירים", text: "מוסיפים שירות עם שם, מחיר ומשך, והוא מופיע ללקוחות." },
          { id: "staff", demo: "business/staff", icon: "users", title: "ניהול עובדים", text: "מוסיפים עובדת עם מספר הטלפון שלה, והיא מקבלת יומן ושירותים משלה." },
          { id: "branches", icon: "map", title: "סניפים", text: "כמה סניפים תחת אפליקציה אחת, ומשייכים כל עובדת לסניף שלה." },
        ],
      },
    ],
  },
};

/** The capabilities of one side, in display order, each with its group title. */
export function featuresOf(side) {
  return SIDES[side].groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.title })));
}
