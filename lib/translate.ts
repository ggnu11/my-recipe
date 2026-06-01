export async function translateToJa(texts: string[]): Promise<string[]> {
  const filtered = texts.map((t) => t.trim());
  if (filtered.every((t) => !t)) return filtered;

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts: filtered }),
  });

  if (!res.ok) throw new Error("Translation failed");

  const data = await res.json();
  return data.translations;
}
