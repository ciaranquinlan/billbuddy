"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CATEGORY_ICONS, 
  CATEGORY_LABELS, 
  CYCLE_LABELS,
  type Bill, 
  type BillCategory 
} from "@/types";
import { format, differenceInDays, addDays, isBefore, isAfter } from "date-fns";
import { Plus, Calendar, LayoutDashboard, TrendingUp, Settings } from "lucide-react";
import { AddBillDialog } from "@/components/add-bill-dialog";
import { BillCard } from "@/components/bill-card";

// Demo data - replace with real data from API
const DEMO_BILLS: Bill[] = [
  {
    id: "1",
    householdId: "1",
    category: "electricity",
    provider: "AGL",
    amount: 285.50,
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
    amount: 95.00,
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
    amount: 99.00,
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
    amount: 180.00,
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
    amount: 35.00,
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
    amount: 65.00,
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
    amount: 320.00,
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
    amount: 85.00,
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
    amount: 199.00,
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

function getDaysUntilDue(dueDate: Date): number {
  return differenceInDays(dueDate, new Date());
}

function getUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return "bg-red-500";
  if (daysUntil <= 3) return "bg-orange-500";
  if (daysUntil <= 7) return "bg-yellow-500";
  return "bg-green-500";
}

function calculateMonthlyEquivalent(amount: number, cycle: string): number {
  switch (cycle) {
    case "weekly": return amount * 4.33;
    case "fortnightly": return amount * 2.17;
    case "monthly": return amount;
    case "quarterly": return amount / 3;
    case "yearly": return amount / 12;
    default: return amount;
  }
}

export default function Home() {
  const [bills, setBills] = useState<Bill[]>(DEMO_BILLS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sortedBills = [...bills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const upcomingBills = sortedBills.filter(
    (bill) => getDaysUntilDue(bill.dueDate) >= 0 && getDaysUntilDue(bill.dueDate) <= 14
  );

  const totalMonthly = bills.reduce(
    (sum, bill) => sum + calculateMonthlyEquivalent(bill.amount, bill.billingCycle),
    0
  );

  const totalYearly = totalMonthly * 12;

  const handleAddBill = (newBill: Omit<Bill, "id" | "createdAt" | "updatedAt">) => {
    const bill: Bill = {
      ...newBill,
      id: String(bills.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBills([...bills, bill]);
    setIsAddDialogOpen(false);
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-semibold">BillBuddy</h1>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Estimate</CardDescription>
              <CardTitle className="text-3xl">${totalMonthly.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Yearly Estimate</CardDescription>
              <CardTitle className="text-3xl">${totalYearly.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bills Due (14 days)</CardDescription>
              <CardTitle className="text-3xl">{upcomingBills.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Upcoming Bills */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Bills
            </CardTitle>
            <CardDescription>Bills due in the next 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bills due in the next 14 days 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill) => {
                  const daysUntil = getDaysUntilDue(bill.dueDate);
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {CATEGORY_ICONS[bill.category]}
                        </span>
                        <div>
                          <p className="font-medium">
                            {bill.provider}
                            {bill.description && (
                              <span className="text-gray-500 ml-1">
                                ({bill.description})
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {CATEGORY_LABELS[bill.category]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${bill.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            {format(bill.dueDate, "d MMM")}
                          </p>
                        </div>
                        <Badge
                          className={`${getUrgencyColor(daysUntil)} text-white`}
                        >
                          {daysUntil === 0
                            ? "Today"
                            : daysUntil === 1
                            ? "Tomorrow"
                            : `${daysUntil} days`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              All Bills
            </CardTitle>
            <CardDescription>
              {bills.length} bills tracked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onDelete={handleDeleteBill}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddBillDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddBill}
      />
    </main>
  );
}
