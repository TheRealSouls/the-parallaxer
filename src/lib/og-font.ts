import "server-only";

/**
 * Font data for generated share images.
 *
 * ImageResponse rasterises on the server, so it needs the actual font binary;
 * it cannot use the webfont the browser loads. Google's CSS endpoint is asked
 * for the face and the URL inside the response is followed to the file.
 *
 * The result is cached in module scope, so a warm server fetches each weight
 * once rather than once per share image.
 */

const cache = new Map<string, Promise<ArrayBuffer>>();

export function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const key = `${family}:${weight}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const pending = fetchFont(family, weight);
  cache.set(key, pending);
  // A failed fetch must not be cached, or the first cold start poisons every
  // later image until the server restarts.
  pending.catch(() => cache.delete(key));
  return pending;
}

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;

  const css = await fetch(url, {
    // Without a browser user agent Google returns a woff2 variable font, which
    // the rasteriser cannot read. This asks for a plain TrueType file.
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:1.0) Gecko/20100101 Firefox/1.0" },
  }).then((response) => response.text());

  const source = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!source) throw new Error(`No font file found for ${family} ${weight}`);

  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not download ${family} ${weight}`);
  return response.arrayBuffer();
}
