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

export interface PlaidAccount {
  account_id:        string;
  name:              string;
  official_name:     string | null;
  mask:              string | null;
  type:              string;
  subtype:           string | null;
  current_balance:   number | null;
  available_balance: number | null;
  limit:             number | null;
}

export interface ConnectedBank {
  institutionId:   string;
  institutionName: string;
  accounts:        PlaidAccount[];
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id:     string;
  name:           string;
  amount:         number;
  date:           string;
  category:       string;
  merchant_name:  string | null;
  pending:        boolean;
}
