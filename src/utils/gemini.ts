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

export interface FactCheckResult {
  /** true = 問題なし、false = 修正あり */
  ok: boolean;
  /** ok=false の場合に修正済みテキスト */
  corrected?: string;
  error?: string;
}

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

/**
 * AI要約テキストを Gemini でファクトチェックする。
 * - ok=true  → 問題なし（元テキストをそのまま使う）
 * - ok=false → corrected に修正済みテキストが入る
 */
export async function fetchGeminiFactCheck(
  summaryText: string,
  query: string,
  snippets: string[],
  apiKey: string,
  language: 'ja' | 'en' = 'ja',
): Promise<FactCheckResult> {
  if (!apiKey) return { ok: true }; // APIキー未設定なら素通し

  const contextBlock = snippets
    .slice(0, 5)
    .map((s, i) => `[${i + 1}] ${s}`)
    .join('\n');

  const prompt =
    language === 'ja'
      ? `あなたはファクトチェッカーです。以下の「AI要約」が、提供した「検索結果スニペット」に基づいて事実的に正確かどうか確認してください。\n\n判定ルール:\n- 問題がなければ、最初の行に「OK」とだけ書いてください。\n- 誤り・誇張・根拠のない主張がある場合は、最初の行に「CORRECTED」と書き、2行目以降に修正済みの要約（日本語）を書いてください。余分な説明は不要です。\n\n検索クエリ: ${query}\n\n検索結果スニペット:\n${contextBlock}\n\nAI要約:\n${summaryText}`
      : `You are a fact-checker. Check whether the "AI Summary" below is factually accurate based on the provided "Search Snippets".\n\nRules:\n- If there are no issues, write only "OK" on the first line.\n- If there are errors, exaggerations, or unsupported claims, write "CORRECTED" on the first line, then write the corrected summary (in English) from the second line onward. No extra explanation needed.\n\nSearch query: ${query}\n\nSearch Snippets:\n${contextBlock}\n\nAI Summary:\n${summaryText}`;

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || `HTTP ${res.status}`;
      return { ok: true, error: msg }; // エラー時は元テキストを維持
    }

    const json = await res.json();
    const rawText: string = (json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();

    if (!rawText) return { ok: true };

    const firstLine = rawText.split('\n')[0].trim().toUpperCase();
    if (firstLine === 'OK') {
      return { ok: true };
    } else if (firstLine === 'CORRECTED') {
      const corrected = rawText.split('\n').slice(1).join('\n').trim();
      return { ok: false, corrected: corrected || summaryText };
    }

    // 判定行が想定外の場合は OK として扱う
    return { ok: true };
  } catch (e: any) {
    return { ok: true, error: e?.message || 'Network error.' };
  }
}

/** 要約キャッシュを全消去（必要なら呼び出す） */
export function clearSummaryCache(): void {
  summaryCache.clear();
}
