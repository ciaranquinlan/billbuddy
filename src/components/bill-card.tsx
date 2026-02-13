"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CATEGORY_ICONS, 
  CATEGORY_LABELS, 
  CYCLE_LABELS,
  type Bill 
} from "@/types";
import { format, differenceInDays } from "date-fns";
import { MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";

interface BillCardProps {
  bill: Bill;
  onDelete: (id: string) => void;
  onEdit?: (bill: Bill) => void;
}

function getDaysUntilDue(dueDate: Date): number {
  return differenceInDays(dueDate, new Date());
}

function getUrgencyBadge(daysUntil: number) {
  if (daysUntil < 0) {
    return <Badge variant="destructive">Overdue</Badge>;
  }
  if (daysUntil <= 3) {
    return <Badge className="bg-orange-500">Due soon</Badge>;
  }
  if (daysUntil <= 7) {
    return <Badge className="bg-yellow-500 text-black">This week</Badge>;
  }
  return null;
}

const COMPARISON_URLS: Record<string, string> = {
  electricity: "https://www.energymadeeasy.gov.au/",
  gas: "https://www.energymadeeasy.gov.au/",
  internet: "https://www.finder.com.au/internet",
  mobile: "https://www.finder.com.au/mobile-phone-plans",
  health_insurance: "https://www.privatehealth.gov.au/",
  car_insurance: "https://www.finder.com.au/car-insurance",
};

export function BillCard({ bill, onDelete, onEdit }: BillCardProps) {
  const daysUntil = getDaysUntilDue(bill.dueDate);
  const comparisonUrl = COMPARISON_URLS[bill.category];

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[bill.category]}</span>
            <div>
              <h3 className="font-semibold">{bill.provider}</h3>
              {bill.description && (
                <p className="text-sm text-gray-500">{bill.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(bill)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {comparisonUrl && (
                <DropdownMenuItem asChild>
                  <a href={comparisonUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Compare deals
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(bill.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="font-semibold text-lg">${bill.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Cycle</span>
            <span className="text-sm">{CYCLE_LABELS[bill.billingCycle]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Due</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{format(bill.dueDate, "d MMM yyyy")}</span>
              {getUrgencyBadge(daysUntil)}
            </div>
          </div>
          {bill.contractExpiry && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Contract ends</span>
              <span className="text-sm">
                {format(bill.contractExpiry, "d MMM yyyy")}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t">
          <Badge variant="outline">{CATEGORY_LABELS[bill.category]}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
