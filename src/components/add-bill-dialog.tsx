"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  type Bill,
  type BillCategory,
  type BillingCycle,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CYCLE_LABELS,
} from "@/types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface AddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (bill: Omit<Bill, "id" | "createdAt" | "updatedAt">) => void;
}

const CATEGORIES: BillCategory[] = [
  "electricity",
  "gas",
  "water",
  "internet",
  "mobile",
  "health_insurance",
  "car_insurance",
  "roadside",
  "subscription",
  "other",
];

const CYCLES: BillingCycle[] = [
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "yearly",
];

const PROVIDER_SUGGESTIONS: Record<BillCategory, string[]> = {
  electricity: ["AGL", "Origin", "EnergyAustralia", "Red Energy", "Alinta"],
  gas: ["AGL", "Origin", "EnergyAustralia"],
  water: ["Sydney Water", "Hunter Water", "SA Water", "Melbourne Water"],
  internet: ["Telstra", "Optus", "TPG", "Aussie Broadband", "iiNet", "Superloop"],
  mobile: ["Telstra", "Optus", "Vodafone", "Woolworths Mobile", "Aldi Mobile", "Boost"],
  health_insurance: ["Medibank", "Bupa", "HCF", "NIB", "GU Health", "AHM"],
  car_insurance: ["AAMI", "NRMA", "RACV", "Allianz", "Budget Direct", "Youi"],
  roadside: ["NRMA", "RACV", "RACQ", "RAA", "RAC"],
  subscription: ["Netflix", "Stan", "Disney+", "Spotify", "Apple TV+", "Amazon Prime"],
  other: [],
};

export function AddBillDialog({ open, onOpenChange, onAdd }: AddBillDialogProps) {
  const [category, setCategory] = useState<BillCategory>("electricity");
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = () => {
    if (!provider || !amount) return;

    onAdd({
      householdId: "1", // TODO: Get from context
      category,
      provider,
      description: description || undefined,
      amount: parseFloat(amount),
      billingCycle,
      dueDate,
      isAutoPay: false,
    });

    // Reset form
    setCategory("electricity");
    setProvider("");
    setDescription("");
    setAmount("");
    setBillingCycle("monthly");
    setDueDate(new Date());
  };

  const suggestions = PROVIDER_SUGGESTIONS[category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
          <DialogDescription>
            Add a new bill to track. All fields except description are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val as BillCategory);
                setProvider("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span>{CATEGORY_LABELS[cat]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., Telstra"
              list="provider-suggestions"
            />
            <datalist id="provider-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Description (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Line 2, Premium plan"
            />
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Billing Cycle */}
          <div className="grid gap-2">
            <Label htmlFor="cycle">Billing Cycle</Label>
            <Select
              value={billingCycle}
              onValueChange={(val) => setBillingCycle(val as BillingCycle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {CYCLE_LABELS[cycle]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label>Next Due Date</Label>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(dueDate, "PPP")}
            </Button>
            {showCalendar && (
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  if (date) {
                    setDueDate(date);
                    setShowCalendar(false);
                  }
                }}
                className="rounded-md border"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!provider || !amount}>
            Add Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
