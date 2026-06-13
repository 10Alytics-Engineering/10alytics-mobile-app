import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const billingInfoQueryKey = ["billing", "info"] as const;
export const paymentPlansQueryKey = ["billing", "payment-plans"] as const;

/** Read-only billing summary: next payment, saved card, payment history. */
export function useBillingInfo() {
  return useQuery({
    queryKey: billingInfoQueryKey,
    staleTime: 60_000,
    queryFn: async () => {
      const result = await apiClient.getBillingInfo();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data?.data ?? null;
    },
  });
}

/** Read-only list of the user's invoices / payment plans. */
export function usePaymentPlans() {
  return useQuery({
    queryKey: paymentPlansQueryKey,
    staleTime: 60_000,
    queryFn: async () => {
      const result = await apiClient.getUserPaymentPlans();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data?.data ?? [];
    },
  });
}
