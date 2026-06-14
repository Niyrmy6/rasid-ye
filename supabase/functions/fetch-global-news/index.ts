/**
 * Fetches Google News RSS server-side so the browser never hits third-party CORS proxies.
 * Local news still comes from the `news` table; this function is global/external only.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';

type GlobalNewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
};

const RSS_FEEDS: Record<string, string> = {
  ar: 'https://news.google.com/rss/search?q=الأمراض+الصحة&hl=ar&gl=AE&ceid=AE:ar',
  en: 'https://news.google.com/rss/search?q=health+disease+outbreak&hl=en-US&gl=US&ceid=US:en',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function extractTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(block);
  if (cdata) return cdata[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  return plain ? plain[1].trim() : '';
}

function parseRss(xml: string): GlobalNewsItem[] {
  const items: GlobalNewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const description = stripHtml(extractTag(block, 'description'));
    if (title && link) {
      items.push({ title, link, pubDate, description, thumbnail: '' });
    }
  }
  return items;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    let lang = 'ar';
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      lang = body.lang === 'en' ? 'en' : 'ar';
    }

    const rssUrl = RSS_FEEDS[lang] ?? RSS_FEEDS.ar;
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Rasidna/1.0 (Health News Aggregator)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!res.ok) {
      console.error('RSS upstream failed:', res.status, rssUrl);
      return jsonResponse({ items: [], error: 'RSS fetch failed' }, 502);
    }

    const items = parseRss(await res.text()).slice(0, 30);
    return jsonResponse({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('fetch-global-news error:', message);
    return jsonResponse({ items: [], error: message }, 500);
  }
});
