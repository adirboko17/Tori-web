import test from "node:test";
import assert from "node:assert/strict";
import { addAppointment, bookingDays, cancelAppointment, dateKey, phoneSchema, priceSummary, serviceSchema, slotAvailable } from "../src/lib/booking.ts";
import type { Appointment } from "../src/lib/booking.ts";

const appointment: Appointment = { id: "a", date: "2026-09-16", time: "11:30", name: "לקוחה לדוגמה", service: "תספורת", mins: 60, price: 120, status: "confirmed", note: "" };
test("prevents overlapping services, including partial overlap", () => {
  assert.equal(slotAvailable([appointment], appointment.date, "11:00", 45), false);
  assert.equal(slotAvailable([appointment], appointment.date, "12:00", 45), false);
  assert.throws(() => addAppointment([appointment], { ...appointment, id: "b", time: "12:00" }));
});
test("adjacent appointments and separate dates are allowed", () => {
  assert.equal(slotAvailable([appointment], appointment.date, "10:30", 60), true);
  assert.equal(slotAvailable([appointment], appointment.date, "12:30", 45), true);
  assert.equal(slotAvailable([appointment], "2026-09-17", "11:30", 60), true);
});
test("cancellation preserves history and releases the time", () => {
  const result = cancelAppointment([appointment], "a");
  assert.equal(result[0].status, "cancelled");
  assert.equal(appointment.status, "confirmed");
  assert.equal(slotAvailable(result, appointment.date, "11:30", 60), true);
});
test("booking stores the chosen date, time, price and service", () => {
  const result = addAppointment([], appointment);
  assert.deepEqual(result[0], appointment);
});
test("SMS totals retain agorot instead of rounding to whole shekels", () => {
  assert.deepEqual(priceSummary(0), { sms: 0, subtotal: 299, vat: 53.82, total: 352.82 });
  assert.deepEqual(priceSummary(1), { sms: 399, subtotal: 698, vat: 125.64, total: 823.64 });
  assert.equal(priceSummary(2).total, 1177.64);
});
test("booking dates cross month and year boundaries, excluding Saturday", () => {
  const days = bookingDays(new Date(2026, 11, 30, 12));
  assert.equal(days[0].date, "2026-12-31");
  assert.equal(days[1].date, "2027-01-01");
  assert.equal(days.length, 6);
  assert.ok(days.every((d) => new Date(d.date + "T12:00:00").getDay() !== 6));
});
test("date keys preserve local calendar dates", () => {
  assert.equal(dateKey(new Date(2026, 0, 1, 0, 1)), "2026-01-01");
});
test("phone validation accepts formatting and rejects incomplete input", () => {
  assert.equal(phoneSchema.parse("050-000-0000"), "0500000000");
  assert.equal(phoneSchema.safeParse("050").success, false);
  assert.equal(phoneSchema.safeParse("letters").success, false);
});
test("services require a useful duration and a nonnegative price", () => {
  const valid = { id: "s1", name: "תספורת", mins: 45, price: 0 };
  assert.equal(serviceSchema.safeParse(valid).success, true);
  assert.equal(serviceSchema.safeParse({ ...valid, mins: 0 }).success, false);
  assert.equal(serviceSchema.safeParse({ ...valid, price: -1 }).success, false);
  assert.equal(serviceSchema.safeParse({ ...valid, name: " " }).success, false);
});
