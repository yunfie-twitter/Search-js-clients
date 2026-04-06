export interface WikiSummary {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  pageUrl: string;
  wikibaseItem?: string;
}

const cache = new Map<string, WikiSummary | null>();

export async function fetchWikiSummary(
  query: string,
  lang: 'ja' | 'en' = 'ja',
): Promise<WikiSummary | null> {
  const key = `${lang}:${query}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}?redirect=true`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) { cache.set(key, null); return null; }
    const data = await res.json();
    if (!data.extract || data.type === 'disambiguation') { cache.set(key, null); return null; }
    const result: WikiSummary = {
      title:       data.title,
      description: data.description,
      extract:     data.extract,
      thumbnail:   data.thumbnail,
      pageUrl:     data.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encoded}`,
      wikibaseItem: data.wikibase_item,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export function clearWikiCache() { cache.clear(); }
