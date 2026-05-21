import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "pressto";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import { useAuthStore } from "@/utils/auth-store";

type SettingItem = {
  icon: string;
  label: string;
  value?: string;
  hasBadge?: boolean;
  onPress?: () => void;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export function ProfileSettingsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isDark = colors.isDark;
  const { logOut } = useAuthStore();

  const handleLogOut = async () => {
    await logOut();
    router.replace("/");
  };

  const sections: SettingSection[] = [
    {
      title: "Account",
      items: [
        { icon: "person", label: "Account Information" },
        { icon: "envelope", label: "Email & Password" },
        { icon: "bell", label: "Notification Preference", hasBadge: true },
      ],
    },
    {
      title: "Billing",
      items: [
        { icon: "doc.text", label: "Billing History" },
        { icon: "creditcard", label: "Payment Methods" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "book", label: "App Language", value: "English" },
        { icon: "display", label: "Appearance", value: "System" },
        { icon: "questionmark.circle", label: "Help & Support" },
      ],
    },
  ];

  const cardBorder = isDark ? "#2A2A2A" : "#E5E7EB";
  const cardBg = isDark ? "#171717" : "#FFFFFF";
  const mutedText = isDark ? "#A1A1AA" : "#6B7280";
  const logoutColor = "#EF4444";

  const Row = ({ item }: { item: SettingItem }) => (
    <PressableScale
      onPress={item.onPress}
      style={{
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View className="flex-row items-center gap-3">
        <View className="relative">
          <SymbolView
            name={item.icon as any}
            size={22}
            tintColor={colors.text}
            type="hierarchical"
          />
          {item.hasBadge && (
            <View
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: logoutColor }}
            />
          )}
        </View>
        <Text className="text-base font-medium" style={{ color: colors.text }}>
          {item.label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {item.value && (
          <Text className="text-base" style={{ color: mutedText }}>
            {item.value}
          </Text>
        )}
        <SymbolView name="chevron.right" size={14} tintColor={mutedText} />
      </View>
    </PressableScale>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg, paddingBottom: insets.bottom }}>
      <View
        className="px-4 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-center">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: colors.text }}
          >
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <Animated.View
            key={`${section.title}-${sectionIndex}`}
            entering={FadeInDown.delay(100 + sectionIndex * 80).springify()}
            className="mb-6"
          >
            <Text
              className="mb-3 text-lg font-bold"
              style={{ color: colors.text }}
            >
              {section.title}
            </Text>
            <View className="gap-3">
              {section.items.map((item) => (
                <Row key={item.label} item={item} />
              ))}
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <PressableScale
            onPress={handleLogOut}
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              borderWidth: 1,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View className="flex-row items-center gap-3">
              <SymbolView
                name="rectangle.portrait.and.arrow.right"
                size={22}
                tintColor={logoutColor}
                type="hierarchical"
              />
              <Text
                className="text-base font-semibold"
                style={{ color: logoutColor }}
              >
                Log Out
              </Text>
            </View>
            <SymbolView name="chevron.right" size={14} tintColor={mutedText} />
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
