import { useTheme } from './ThemeContext';

const brandPrimary = '#DA6728';

export const useThemeColors = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    icon: isDark ? 'white' : 'black',
    bg: isDark ? '#0A0A0A' : '#F4F4F5',
    invert: isDark ? '#000000' : '#ffffff',
    secondary: isDark ? '#262626' : '#ffffff',
    state: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    faded: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255, 255, 255, 0.9)',
    sheet: isDark ? '#262626' : '#ffffff',
    highlight: '#FF2056',
    lightDark: isDark ? '#262626' : 'white',
    border: isDark ? '#404040' : '#E2E8F0',
    text: isDark ? 'white' : 'black',
    textMuted: isDark ? '#9BA1A6' : '#64748B',
    placeholder: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    switch: isDark ? 'rgba(255,255,255,0.4)' : '#ccc',
    chatBg: isDark ? '#262626' : '#efefef',
    /** Tab bar — matches app theme, not system appearance */
    tabTint: isDark ? '#FFFFFF' : brandPrimary,
    tabLabel: isDark ? '#9BA1A6' : '#475569',
    /** Light: match screen bg (#F4F4F5) so the edge isn’t a warm/cool clash with a slate-tinted border */
    tabBarSurface: isDark ? 'rgba(20, 22, 24, 0.82)' : 'rgba(244, 244, 245, 0.94)',
    /** Light: solid neutral hairline (slate @ 8% on cream read as “dirty”; zinc-200 is stable on gray bg) */
    tabBarBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E4E4E7',
    tabPillActive: isDark ? 'rgba(218, 103, 40, 0.26)' : 'rgba(218, 103, 40, 0.14)',
    tabBlurIntensity: isDark ? 52 : 64,
    /** Light: softer lift so top border + shadow don’t read as a double line */
    tabShadowOpacity: isDark ? 0.4 : 0.05,
    headerSurface: isDark ? '#0A0A0A' : '#F5F0EB',
    primary: brandPrimary,
    isDark
  };
};

export default useThemeColors;