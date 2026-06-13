import React from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type ButtonProps = PressableProps & {
  title: string;
  onPress?: () => void;
  theme?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
};

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: "#DA6728",
    borderColor: "#DA6728",
  },
  secondary: {
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
  },
  tertiary: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  textPrimary: { color: "#fff" },
  textSecondary: { color: "#000" },
  textTertiary: { color: "#1f2937" },
});

export function Button({
  title,
  onPress,
  theme = "primary",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => [
        styles.pressable,
        theme === "primary" && styles.primary,
        theme === "secondary" && styles.secondary,
        theme === "tertiary" && styles.tertiary,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text
        style={[
          styles.text,
          theme === "primary" && styles.textPrimary,
          theme === "secondary" && styles.textSecondary,
          theme === "tertiary" && styles.textTertiary,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
