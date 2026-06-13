import type { ImageStyle, StyleProp } from 'react-native';

import { Image } from 'expo-image';

// Deterministic local cover per course slug. Uses bundled .webp art (rendered
// via expo-image) so no SVG transformer is needed alongside uniwind's metro setup.
const COVER_POOL = [
  require('@/assets/courses/data-analysis.webp'),
  require('@/assets/courses/data-engineering.webp'),
  require('@/assets/courses/business-analysis.webp'),
  require('@/assets/courses/devops.webp'),
  require('@/assets/courses/product-design.webp'),
  require('@/assets/courses/fsds.webp'),
  require('@/assets/courses/agile.webp'),
  require('@/assets/courses/cybersecurity.webp'),
];

function slugCoverIndex(slug: string): number {
  if (!slug)
    return 4;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % COVER_POOL.length;
  }
  return Math.abs(hash);
}

export function CourseCoverForSlug({
  slug,
  size = 96,
  style,
}: {
  slug: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const source = COVER_POOL[slugCoverIndex(slug)] ?? COVER_POOL[5];
  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      contentFit="cover"
    />
  );
}
