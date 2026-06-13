import { useColorScheme as useRNColorScheme } from "react-native";
import { useTheme } from "@/contexts/theme-context";

export function useColorScheme() {
  const { theme } = useTheme();
  const systemScheme = useRNColorScheme();

  return theme ?? systemScheme ?? "light";
}
