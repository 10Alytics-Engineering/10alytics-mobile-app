import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/theme-colors";
import { useBillingInfo } from "@/hooks/use-billing";
import type { BillingHistoryItem } from "@/lib/api-client";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number, currency?: string | null): string {
  const code = (currency ?? "").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code ? `${code} ` : ""}${amount.toFixed(2)}`;
  }
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("complete")) return "#16A34A";
  if (s.includes("overdue") || s.includes("fail")) return "#EF4444";
  return "#CA8A04";
}

function HistoryRow({ item }: { item: BillingHistoryItem }) {
  const color = statusColor(item.status);
  return (
    <View className="mt-2 flex-row items-center rounded-xl bg-secondary/60 px-3 py-3">
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="receipt-outline" size={20} color={ACCENT} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text" numberOfLines={1}>
          {item.course ?? item.invoiceNo}
        </Text>
        <Text className="mt-0.5 text-xs text-text opacity-60" numberOfLines={1}>
          {item.invoiceNo}
          {item.paymentPlan ? ` • Installment ${item.paymentPlan}` : ""} •{" "}
          {formatDate(item.paymentDate)}
        </Text>
      </View>
      <View className="ml-2 items-end">
        <Text className="font-outfit-bold text-sm text-text">
          {formatAmount(item.amountPaid, item.currency)}
        </Text>
        <Text className="mt-0.5 text-xs font-semibold" style={{ color }}>
          {item.status}
        </Text>
      </View>
    </View>
  );
}

export function BillingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { data, isPending, isError, error, refetch, isFetching } =
    useBillingInfo();

  const history = data?.paymentHistory ?? [];
  const card = data?.billingInfo;
  const hasCard = card && card.last4Digits && card.last4Digits !== "Unknown";

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center border-b border-border/40 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-secondary/80"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text className="flex-1 font-outfit-bold text-lg text-text" numberOfLines={1}>
          Billing
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-outfit-bold text-base text-text">
            Couldn&apos;t load billing
          </Text>
          <Text className="mt-1 text-center text-sm text-text opacity-60">
            {error instanceof Error ? error.message : "Something went wrong"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-xl bg-text px-4 py-2 active:opacity-80"
          >
            <Text className="font-semibold text-invert">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
        >
          {/* Next payment */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: ACCENT_SOFT }}
          >
            <Text className="text-xs font-semibold uppercase" style={{ color: ACCENT }}>
              {data?.isPaymentDatePastDue ? "Payment overdue" : "Next payment"}
            </Text>
            <Text className="mt-2 font-outfit-bold text-3xl text-text">
              {data?.upcomingBillId
                ? formatAmount(data.upcomingBillAmount ?? 0)
                : "All settled"}
            </Text>
            <Text className="mt-1 text-sm text-text opacity-70">
              {data?.upcomingBillId
                ? `Due ${formatDate(data.nextPaymentDate)}`
                : "You have no upcoming payments."}
            </Text>
          </View>

          {/* Saved card */}
          <Text className="mb-2 mt-6 font-outfit-bold text-base text-text">
            Payment Method
          </Text>
          <View className="flex-row items-center rounded-2xl bg-secondary/60 px-4 py-4">
            <View
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: ACCENT_SOFT }}
            >
              <Ionicons name="card-outline" size={22} color={ACCENT} />
            </View>
            <View className="ml-3 flex-1">
              {hasCard ? (
                <>
                  <Text className="font-outfit-bold text-sm text-text">
                    {card?.cardType} •••• {card?.last4Digits}
                  </Text>
                  <Text className="mt-0.5 text-xs text-text opacity-60">
                    Expires {card?.expiryDate}
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-text opacity-60">
                  No saved card on file
                </Text>
              )}
            </View>
          </View>

          {/* History */}
          <Text className="mb-1 mt-6 font-outfit-bold text-base text-text">
            Payment History
          </Text>
          {history.length === 0 ? (
            <Text className="mt-2 text-sm text-text opacity-60">
              No payments yet.
            </Text>
          ) : (
            history.map((item) => <HistoryRow key={item.id} item={item} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}
