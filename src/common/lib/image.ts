import { getImage } from "astro:assets";

// `inferSize` refetches the image on every call, and one thumbnail appears on
// thousands of pages: uncached, this took the build from 1 to 14 minutes.
const cache = new Map<string, Promise<string>>();
const failures = new Map<string, number>();

// Build only. Any failure (host not in `image.remotePatterns`, a dead link, a
// format sharp can't read) keeps the original URL: one bad image must not
// fail the build and hold back every other article.
export function optimizeImage(src: string | undefined, width: number) {
  if (!src) return Promise.resolve(undefined);
  const key = `${width} ${src}`;
  let image = cache.get(key);
  if (!image) {
    image = getImage({ src, width, inferSize: true, format: "webp" }).then(
      (result) => result.src,
      () => {
        // A fetch can fail transiently, so a later page retries it. A dead link
        // fails every time: after 3 tries, keep the fallback instead of
        // refetching it on every page again.
        const count = (failures.get(key) ?? 0) + 1;
        failures.set(key, count);
        if (count < 3) cache.delete(key);
        return src;
      },
    );
    cache.set(key, image);
  }
  return image;
}
