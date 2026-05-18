import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          subscription_tier: "free" | "personal" | "bizfi" | "duo";
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      credit_cards: {
        Row: {
          id: string;
          user_id: string;
          card_name: string;
          last_four: string;
          balance: number;
          credit_limit: number;
          due_date: string;
          apr: number;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["credit_cards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["credit_cards"]["Insert"]>;
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          status: "paid" | "unpaid" | "due_soon" | "overdue";
          category: string;
          auto_pay: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bills"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bills"]["Insert"]>;
      };
      utilities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          month: string;
          category: "electric" | "water" | "gas" | "internet" | "phone";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["utilities"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["utilities"]["Insert"]>;
      };
    };
  };
};
