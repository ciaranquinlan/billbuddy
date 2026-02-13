export type BillCategory =
  | "electricity"
  | "gas"
  | "water"
  | "internet"
  | "mobile"
  | "health_insurance"
  | "car_insurance"
  | "roadside"
  | "subscription"
  | "other";

export type BillingCycle =
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Bill {
  id: string;
  householdId: string;
  category: BillCategory;
  provider: string;
  description?: string;
  amount: number;
  billingCycle: BillingCycle;
  dueDate: Date;
  contractExpiry?: Date;
  notes?: string;
  isAutoPay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillHistory {
  id: string;
  billId: string;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface Household {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CATEGORY_LABELS: Record<BillCategory, string> = {
  electricity: "Electricity",
  gas: "Gas",
  water: "Water",
  internet: "Internet",
  mobile: "Mobile",
  health_insurance: "Health Insurance",
  car_insurance: "Car Insurance",
  roadside: "Roadside Assistance",
  subscription: "Subscription",
  other: "Other",
};

export const CATEGORY_ICONS: Record<BillCategory, string> = {
  electricity: "⚡",
  gas: "🔥",
  water: "💧",
  internet: "🌐",
  mobile: "📱",
  health_insurance: "🏥",
  car_insurance: "🚗",
  roadside: "🛞",
  subscription: "📺",
  other: "📄",
};

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};
