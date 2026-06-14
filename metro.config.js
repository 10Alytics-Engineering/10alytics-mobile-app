const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

const merged = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});

merged.transformer = {
  ...merged.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

const { assetExts: mergedAssetExts, sourceExts: mergedSourceExts } =
  merged.resolver ?? {};

merged.resolver = {
  ...merged.resolver,
  assetExts: (mergedAssetExts ?? []).filter((ext) => ext !== 'svg'),
  sourceExts: Array.from(new Set([...(mergedSourceExts ?? []), 'svg'])),
};

module.exports = merged;
