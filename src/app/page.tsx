"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CATEGORY_ICONS, 
  CATEGORY_LABELS, 
  type Bill, 
} from "@/types";
import { format, differenceInDays } from "date-fns";
import { Plus, Calendar, LayoutDashboard, Search } from "lucide-react";
import { AddBillDialog } from "@/components/add-bill-dialog";
import { BillCard } from "@/components/bill-card";
import { calculateMonthlyEquivalent, DEMO_BILLS } from "@/lib/bill-data";

function getDaysUntilDue(dueDate: Date): number {
  return differenceInDays(dueDate, new Date());
}

function getUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return "bg-red-500";
  if (daysUntil <= 3) return "bg-orange-500";
  if (daysUntil <= 7) return "bg-yellow-500";
  return "bg-green-500";
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
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/alternatives">
                <Search className="h-4 w-4" />
                Find savings
              </Link>
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </div>
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
