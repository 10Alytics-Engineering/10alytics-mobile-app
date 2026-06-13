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

import useThemeColors from "@/contexts/ThemeColors";
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
  const colors = useThemeColors();
  const color = statusColor(item.status);
  return (
    <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 12 }}>
      <View
        style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="receipt-outline" size={20} color={ACCENT} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }} numberOfLines={1}>
          {item.course ?? item.invoiceNo}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }} numberOfLines={1}>
          {item.invoiceNo}
          {item.paymentPlan ? ` • Installment ${item.paymentPlan}` : ""} •{" "}
          {formatDate(item.paymentDate)}
        </Text>
      </View>
      <View style={{ marginLeft: 8, alignItems: "flex-end" }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>
          {formatAmount(item.amountPaid, item.currency)}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, fontWeight: "600", color }}>
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 8, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 18, color: colors.text }} numberOfLines={1}>
          Billing
        </Text>
      </View>

      {isPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 16, color: colors.text }}>
            Couldn&apos;t load billing
          </Text>
          <Text style={{ marginTop: 4, textAlign: "center", fontSize: 14, color: colors.text, opacity: 0.6 }}>
            {error instanceof Error ? error.message : "Something went wrong"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ marginTop: 16, borderRadius: 12, backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ fontWeight: "600", color: colors.invert }}>Try again</Text>
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
            style={{ borderRadius: 16, padding: 20, backgroundColor: ACCENT_SOFT }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase", color: ACCENT }}>
              {data?.isPaymentDatePastDue ? "Payment overdue" : "Next payment"}
            </Text>
            <Text style={{ marginTop: 8, fontWeight: "700", fontSize: 30, color: colors.text }}>
              {data?.upcomingBillId
                ? formatAmount(data.upcomingBillAmount ?? 0)
                : "All settled"}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: colors.text, opacity: 0.7 }}>
              {data?.upcomingBillId
                ? `Due ${formatDate(data.nextPaymentDate)}`
                : "You have no upcoming payments."}
            </Text>
          </View>

          {/* Saved card */}
          <Text style={{ marginBottom: 8, marginTop: 24, fontWeight: "700", fontSize: 16, color: colors.text }}>
            Payment Method
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 16 }}>
            <View
              style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: ACCENT_SOFT }}
            >
              <Ionicons name="card-outline" size={22} color={ACCENT} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              {hasCard ? (
                <>
                  <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>
                    {card?.cardType} •••• {card?.last4Digits}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }}>
                    Expires {card?.expiryDate}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.6 }}>
                  No saved card on file
                </Text>
              )}
            </View>
          </View>

          {/* History */}
          <Text style={{ marginBottom: 4, marginTop: 24, fontWeight: "700", fontSize: 16, color: colors.text }}>
            Payment History
          </Text>
          {history.length === 0 ? (
            <Text style={{ marginTop: 8, fontSize: 14, color: colors.text, opacity: 0.6 }}>
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
