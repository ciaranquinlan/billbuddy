import { addDays } from "date-fns";
import type { Bill, BillingCycle } from "@/types";

// Demo data - replace with real data from API
export const DEMO_BILLS: Bill[] = [
  {
    id: "1",
    householdId: "1",
    category: "electricity",
    provider: "AGL",
    amount: 285.5,
    billingCycle: "quarterly",
    dueDate: addDays(new Date(), 5),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    householdId: "1",
    category: "gas",
    provider: "AGL",
    amount: 95,
    billingCycle: "quarterly",
    dueDate: addDays(new Date(), 5),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    householdId: "1",
    category: "internet",
    provider: "Telstra",
    amount: 99,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 12),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    householdId: "1",
    category: "water",
    provider: "Sydney Water",
    amount: 180,
    billingCycle: "quarterly",
    dueDate: addDays(new Date(), 28),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    householdId: "1",
    category: "mobile",
    provider: "Woolworths Mobile",
    amount: 35,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 8),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    householdId: "1",
    category: "mobile",
    provider: "Telstra",
    description: "Line 2",
    amount: 65,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 15),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    householdId: "1",
    category: "health_insurance",
    provider: "GU Health",
    amount: 320,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 3),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    householdId: "1",
    category: "car_insurance",
    provider: "AAMI",
    amount: 85,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 20),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    householdId: "1",
    category: "roadside",
    provider: "NRMA",
    amount: 199,
    billingCycle: "yearly",
    dueDate: addDays(new Date(), 45),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    householdId: "1",
    category: "subscription",
    provider: "Netflix",
    amount: 22.99,
    billingCycle: "monthly",
    dueDate: addDays(new Date(), 10),
    isAutoPay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function calculateMonthlyEquivalent(
  amount: number,
  cycle: BillingCycle,
): number {
  switch (cycle) {
    case "weekly":
      return amount * 4.33;
    case "fortnightly":
      return amount * 2.17;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
  }
}
