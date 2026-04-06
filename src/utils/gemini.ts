const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// インメモリキャッシュ: key = "${lang}:${query}"
const summaryCache = new Map<string, string>();

export interface GeminiSummaryResult {
  text: string;
  error?: never;
}
export interface GeminiSummaryError {
  text?: never;
  error: string;
}
export type GeminiResult = GeminiSummaryResult | GeminiSummaryError;

/**
 * 検索クエリと上位結果スニペットを渡して Gemini に要約させる。
 * 同じクエリの結果はインメモリキャッシュから返す。
 */
export async function fetchGeminiSummary(
  query: string,
  snippets: string[],
  apiKey: string,
  language: 'ja' | 'en' = 'ja',
): Promise<GeminiResult> {
  if (!apiKey) return { error: 'API key is not set.' };

  const cacheKey = `${language}:${query}`;
  const cached = summaryCache.get(cacheKey);
  if (cached) return { text: cached };

  const contextBlock = snippets
    .slice(0, 5)
    .map((s, i) => `[${i + 1}] ${s}`)
    .join('\n');

  const prompt =
    language === 'ja'
      ? `あなたは優秀な検索アシスタントです。\n以下の検索クエリと検索結果スニペットをもとに、日本語で簡潔な要約（3〜5文）を作成してください。\n事実のみを述べ、余分な前置きは不要です。\n\n検索クエリ: ${query}\n\n検索結果スニペット:\n${contextBlock}`
      : `You are a helpful search assistant.\nBased on the search query and snippets below, write a concise summary (3-5 sentences) in English.\nState only facts, no preamble needed.\n\nSearch query: ${query}\n\nSnippets:\n${contextBlock}`;

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || `HTTP ${res.status}`;
      return { error: msg };
    }

    const json = await res.json();
    const text: string =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) return { error: 'Empty response from Gemini.' };

    summaryCache.set(cacheKey, text.trim());
    return { text: text.trim() };
  } catch (e: any) {
    return { error: e?.message || 'Network error.' };
  }
}

/** 要約キャッシュを全消去（必要なら呼び出す） */
export function clearSummaryCache(): void {
  summaryCache.clear();
}
