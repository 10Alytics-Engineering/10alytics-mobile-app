# Project Guidelines

## Styling

- This app uses React Native `StyleSheet` / inline `style` props. Tailwind/NativeWind has been removed — do not reintroduce `className`.
- Read theme colors from `useThemeColors()` (`@/contexts/ThemeColors`); light/dark is driven by `ThemeContext`.
- Use the `style` prop with plain objects or `StyleSheet.create`. Reserve hardcoded hex values for brand/static colors (e.g. accent `#DA6728`); everything theme-aware should come from `useThemeColors()`.
