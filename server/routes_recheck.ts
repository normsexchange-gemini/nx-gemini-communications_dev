import { dbService } from "./database";

export async function checkRobotsTxt(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const text = await res.text();
    let delay: number | null = null;
    const lines = text.split('\n');
    let applies = true;
    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith('user-agent:')) {
        applies = lower.includes('*') || lower.includes('normsexchange-bot');
      }
      if (applies && lower.startsWith('crawl-delay:')) {
        const val = parseFloat(lower.split(':')[1].trim());
        if (!isNaN(val)) delay = val;
      }
    }
    return delay;
  } catch (e) {
    return null;
  }
}
