export async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, { ...init, headers });
  const data = (await response.json().catch(() => ({}))) as T & {
    ok?: boolean;
    message?: string;
    error?: string;
  };
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || data.error || "הפעולה נכשלה");
  }
  return data;
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("קריאת הקובץ נכשלה"));
    reader.readAsDataURL(file);
  });
}
