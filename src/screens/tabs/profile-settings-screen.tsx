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
        {
          icon: "person",
          label: "Account Information",
          onPress: () => router.push("/edit-profile"),
        },
        { icon: "envelope", label: "Email & Password" },
        {
          icon: "bell",
          label: "Notification Preference",
          hasBadge: true,
          onPress: () => router.push("/notification-preferences"),
        },
      ],
    },
    {
      title: "Billing",
      items: [
        {
          icon: "doc.text",
          label: "Billing History",
          onPress: () => router.push("/billing"),
        },
        {
          icon: "creditcard",
          label: "Payment Methods",
          onPress: () => router.push("/billing"),
        },
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ position: "relative" }}>
          <SymbolView
            name={item.icon as any}
            size={22}
            tintColor={colors.text}
            type="hierarchical"
          />
          {item.hasBadge && (
            <View
              style={{ position: "absolute", right: -2, top: -2, height: 8, width: 8, borderRadius: 9999, backgroundColor: logoutColor }}
            />
          )}
        </View>
        <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>
          {item.label}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {item.value && (
          <Text style={{ fontSize: 16, color: mutedText }}>
            {item.value}
          </Text>
        )}
        <SymbolView name="chevron.right" size={14} tintColor={mutedText} />
      </View>
    </PressableScale>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: insets.bottom }}>
      <View
        style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: insets.top + 8 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Text
            style={{ fontSize: 24, fontWeight: "800", color: colors.text }}
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
            style={{ marginBottom: 24 }}
          >
            <Text
              style={{ marginBottom: 12, fontSize: 18, fontWeight: "700", color: colors.text }}
            >
              {section.title}
            </Text>
            <View style={{ gap: 12 }}>
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <SymbolView
                name="rectangle.portrait.and.arrow.right"
                size={22}
                tintColor={logoutColor}
                type="hierarchical"
              />
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: logoutColor }}
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
