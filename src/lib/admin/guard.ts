import { jsonError } from "@/lib/sms/http";
import { readAdminSession } from "./session";

export async function requireAdminSession() {
  const session = await readAdminSession();
  if (!session) {
    return { session: null, response: jsonError("יש להתחבר לממשק הניהול.", 401) };
  }
  return { session, response: null };
}
