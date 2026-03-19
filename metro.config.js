const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// SVG → react-native-svg components (required for local .svg files; <Image> does not render SVG)
config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
};

// withCssInterop (NativeWind) wraps transformerPath; re-assert SVG + resolver so imports are
// components, not numeric asset IDs (see react-native-svg-transformer + NativeWind).
const merged = withNativeWind(config, { input: './global.css' });

merged.transformer = {
    ...merged.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

const { assetExts: mergedAssetExts, sourceExts: mergedSourceExts } = merged.resolver ?? {};
merged.resolver = {
    ...merged.resolver,
    assetExts: (mergedAssetExts ?? []).filter((ext) => ext !== 'svg'),
    sourceExts: Array.from(new Set([...(mergedSourceExts ?? []), 'svg'])),
};

module.exports = merged;
