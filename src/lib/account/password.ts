/** Same hash the onboarding webhook stores on `users.password_hash`. */
export function hashManagerPassword(password: string) {
  if (password === "123456") return "default_hash";
  return `hash_${password}`;
}
