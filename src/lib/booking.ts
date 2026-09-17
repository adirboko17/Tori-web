import { z } from "zod";

export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^05\d{8}$/, "צריך להזין מספר נייד ישראלי תקין."));
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(100),
  mins: z.number().int().min(5).max(480),
  price: z.number().min(0).max(100000),
  icon: z.string().default("sparkles"),
});
export const appointmentSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string(),
  service: z.string(),
  mins: z.number().positive(),
  price: z.number().nonnegative(),
  status: z.enum(["confirmed", "pending", "cancelled", "done"]),
  note: z.string().default(""),
});
export type Appointment = z.infer<typeof appointmentSchema>;
export type Service = z.infer<typeof serviceSchema>;

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function bookingDays(today = new Date()) {
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + index + 1,
      12,
    );
    return {
      date: dateKey(date),
      d: date.toLocaleDateString("he-IL", { weekday: "short" }),
      n: date.getDate(),
      free: date.getDay() === 6 ? 0 : 7,
    };
  })
    .filter((d) => d.free > 0)
    .slice(0, 6);
}
export function formatDate(key: string) {
  return new Date(key + "T12:00:00").toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
  });
}
const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function slotAvailable(
  appointments: Appointment[],
  date: string,
  time: string,
  duration: number,
) {
  const start = minutes(time);
  return !appointments.some(
    (a) =>
      a.date === date &&
      a.status !== "cancelled" &&
      start < minutes(a.time) + a.mins &&
      start + duration > minutes(a.time),
  );
}
export function addAppointment(
  appointments: Appointment[],
  candidate: Appointment,
) {
  const appointment = appointmentSchema.parse(candidate);
  if (
    !slotAvailable(
      appointments,
      appointment.date,
      appointment.time,
      appointment.mins,
    )
  )
    throw new Error("השעה הזו כבר תפוסה. בחרו שעה אחרת.");
  return [...appointments, appointment].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
}
export function cancelAppointment(appointments: Appointment[], id: string) {
  return appointments.map((a) =>
    a.id === id ? { ...a, status: "cancelled" as const } : a,
  );
}
export function priceSummary(monthlyPriceIls = 299) {
  const sms = 0;
  const subtotal = monthlyPriceIls;
  return {
    sms,
    subtotal,
    vat: Math.round(subtotal * 18) / 100,
    total: Math.round(subtotal * 118) / 100,
  };
}
