import * as React from 'react';
import { Uniwind, useUniwind } from 'uniwind';

interface ThemeProviderProps {
  children: React.ReactNode;
}

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

/**
 * Thin adapter over uniwind's theme system so existing screens can keep using
 * `useTheme()`. The actual light/dark application + `dark` root class is handled
 * by uniwind (see `src/app/_layout.tsx` and `src/lib/hooks/use-selected-theme`).
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme: uwTheme } = useUniwind();
  const theme: 'light' | 'dark' = uwTheme === 'light' ? 'light' : 'dark';

  const toggleTheme = React.useCallback(() => {
    Uniwind.setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
