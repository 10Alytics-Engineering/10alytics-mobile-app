import type { ImageSourcePropType } from "react-native";

const COVER_POOL: ImageSourcePropType[] = [
  require("@/assets/courses/data-analysis.webp"),
  require("@/assets/courses/data-engineering.webp"),
  require("@/assets/courses/business-analysis.webp"),
  require("@/assets/courses/devops.webp"),
  require("@/assets/courses/product-design.webp"),
  require("@/assets/courses/fsds.webp"),
  require("@/assets/courses/agile.webp"),
  require("@/assets/courses/cybersecurity.webp"),
];

/** Deterministic local cover when the API does not send an image URL. */
export function getCourseCoverForSlug(slug: string): ImageSourcePropType {
  if (!slug) {
    return require("@/assets/courses/fsds.webp");
  }
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % COVER_POOL.length;
  }
  return COVER_POOL[Math.abs(hash)] ?? require("@/assets/courses/fsds.webp");
}
