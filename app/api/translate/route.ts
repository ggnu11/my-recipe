import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { texts } = (await req.json()) as { texts: string[] };

  if (!texts || texts.length === 0) {
    return Response.json({ error: "texts required" }, { status: 400 });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "DEEPL_API_KEY not configured" }, { status: 500 });
  }

  // DeepL Free API
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `DeepL-Auth-Key ${apiKey}` },
    body: JSON.stringify({
      text: texts,
      source_lang: "KO",
      target_lang: "JA",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const translations: string[] = data.translations.map(
    (t: { text: string }) => t.text
  );

  return Response.json({ translations });
}
