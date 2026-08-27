import type { VkBindingState } from "@/types/api/notifications";

export const VK_STATE = {
  pending: "PENDING",
  active: "ACTIVE",
  blocked: "BLOCKED",
} as const satisfies Record<string, VkBindingState>;
