import { getImage } from "astro:assets";

// Build only. Any failure (host not in `image.remotePatterns`, a dead link, a
// format sharp can't read) keeps the original URL: one bad image must not
// fail the build and hold back every other article.
export async function optimizeImage(src: string | undefined, width: number) {
  if (!src) return undefined;
  try {
    const image = await getImage({
      src,
      width,
      inferSize: true,
      format: "webp",
    });
    return image.src;
  } catch {
    return src;
  }
}
