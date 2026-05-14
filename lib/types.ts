export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  dueDay?: number;
  status: "paid" | "unpaid" | "due_soon" | "overdue";
  category: string;
  frequency?: "monthly" | "weekly" | "yearly" | "one-time";
  autoPay?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  last4: string;
  balance: number;
  limit: number;
  dueDate: string;
  dueDay?: number;
  color: string;
  utilization: number;
}

export interface Utility {
  id: string;
  name: string;
  amount: number;
  trend: number;
  color: string;
  category: "electric" | "water" | "gas" | "internet" | "phone" | "other";
}

export type ItemType = "bill" | "card" | "utility";
