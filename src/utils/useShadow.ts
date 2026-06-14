import { Platform, ViewStyle } from 'react-native';

export type ShadowOptions = {
    color?: string;
    offset?: { width: number; height: number };
    opacity?: number;
    radius?: number;
    elevation?: number;
};

export function createShadowStyle({
    color = '#000',
    offset = { width: 0, height: 0 },
    opacity = 0.1,
    radius = 1,
    elevation = 1,
}: ShadowOptions = {}): ViewStyle {
    return Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: offset,
            shadowOpacity: opacity,
            shadowRadius: radius,
        },
        android: {
            elevation,
        },
        default: {},
    }) as ViewStyle;
}

/** @deprecated Prefer `createShadowStyle` — this is not a React hook. */
export const useShadow = createShadowStyle;

export const shadowPresets = {
    small: createShadowStyle({
        elevation: 3,
        radius: 2.5,
        offset: { width: 0, height: 1 },
    }),
    medium: createShadowStyle({
        elevation: 8,
        radius: 5,
        offset: { width: 0, height: 3 },
    }),
    large: createShadowStyle({
        elevation: 15,
        radius: 10.84,
        offset: { width: 0, height: 10 },
    }),
    card: createShadowStyle({
        elevation: 4,
        radius: 3.84,
        offset: { width: 0, height: 2 },
    }),
    // Aliases
    sm: createShadowStyle({ offset: { width: 0, height: 2 }, opacity: 0.15, radius: 4, elevation: 2 }),
    md: createShadowStyle({ offset: { width: 0, height: 4 }, opacity: 0.2, radius: 8, elevation: 4 }),
    lg: createShadowStyle({ offset: { width: 0, height: 8 }, opacity: 0.25, radius: 16, elevation: 8 }),
    xl: createShadowStyle({ offset: { width: 0, height: 12 }, opacity: 0.3, radius: 24, elevation: 12 }),
};
