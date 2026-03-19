import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import Agile from '@/assets/courses/agile.svg';
import BusinessAnalysis from '@/assets/courses/business-analysis.svg';
import Cybersecurity from '@/assets/courses/cybersecurity.svg';
import DataAnalysis from '@/assets/courses/data-analysis.svg';
import DataEngineering from '@/assets/courses/data-engineering.svg';
import Devops from '@/assets/courses/devops.svg';
import Fsds from '@/assets/courses/fsds.svg';
import ProductDesign from '@/assets/courses/product-design.svg';

const COVER_POOL: ComponentType<SvgProps>[] = [
    DataAnalysis,
    DataEngineering,
    BusinessAnalysis,
    Devops,
    ProductDesign,
    Fsds,
    Agile,
    Cybersecurity,
];

function slugCoverIndex(slug: string): number {
    if (!slug) return 4;
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = (hash + slug.charCodeAt(i) * (i + 1)) % COVER_POOL.length;
    }
    return Math.abs(hash);
}

/** Metro may resolve broken SVG pipeline to a numeric asset id; `??` does not replace those. */
function coerceSvgComponent(
    mod: unknown,
    fallback: ComponentType<SvgProps>,
): ComponentType<SvgProps> {
    if (mod == null || typeof mod === 'number' || typeof mod === 'string') return fallback;
    if (typeof mod === 'function') return mod as ComponentType<SvgProps>;
    if (typeof mod === 'object' && '$$typeof' in (mod as object)) {
        return mod as ComponentType<SvgProps>;
    }
    return fallback;
}

/** Deterministic local SVG cover per course slug (Metro + react-native-svg-transformer). */
export function CourseCoverForSlug({ slug, size = 96 }: { slug: string; size?: number }) {
    const Cover = coerceSvgComponent(COVER_POOL[slugCoverIndex(slug)] ?? Fsds, Fsds);
    return <Cover width={size} height={size} />;
}
