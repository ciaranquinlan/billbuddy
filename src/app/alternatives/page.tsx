import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_BILLS } from "@/lib/bill-data";
import { findLiveEnergyAlternatives } from "@/lib/energy-alternatives";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/types";

const POSTCODE = "2000";

export default async function AlternativesPage() {
  const energyBills = DEMO_BILLS.filter(
    (bill) => bill.category === "electricity" || bill.category === "gas",
  );

  const results = (
    await Promise.all(
      energyBills.map((bill) => findLiveEnergyAlternatives(bill, POSTCODE)),
    )
  ).filter((result) => result !== null);

  const totalMonthlySavings = results.reduce(
    (sum, result) => sum + (result.alternatives[0]?.monthlySavings ?? 0),
    0,
  );
  const totalYearlySavings = totalMonthlySavings * 12;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/" aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Cheaper alternatives</h1>
              <p className="text-sm text-gray-500">
                Live energy plan data for postcode {POSTCODE}
              </p>
            </div>
          </div>
          <Badge variant="outline">AER CDR data</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Potential monthly savings</CardDescription>
              <CardTitle className="text-3xl">
                ${totalMonthlySavings.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Potential yearly savings</CardDescription>
              <CardTitle className="text-3xl">
                ${totalYearlySavings.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bills checked</CardDescription>
              <CardTitle className="text-3xl">{energyBills.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <Search className="mt-0.5 h-5 w-5 text-blue-700" />
            <div className="space-y-1">
              <p className="font-medium text-blue-950">How these savings are calculated</p>
              <p className="text-sm text-blue-900">
                BillBuddy pulls current residential energy plans from the public AER Energy
                Made Easy CDR API, estimates monthly costs from supply and usage rates, then
                compares them with your tracked bill amount. These are estimates, not switch
                quotes. Tariffs, usage, concessions, metering, and postcode can change the final
                price.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.bill.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[result.bill.category]}</span>
                      {result.bill.provider}
                    </CardTitle>
                    <CardDescription>
                      {CATEGORY_LABELS[result.bill.category]} current estimate: $
                      {result.currentMonthlyCost.toFixed(2)}/month
                    </CardDescription>
                  </div>
                  {result.alternatives[0] && (
                    <Badge className="bg-green-600">
                      Save ${result.alternatives[0].monthlySavings.toFixed(2)}/month
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result.error && (
                  <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {result.error}
                  </p>
                )}

                {!result.error && result.alternatives.length === 0 && (
                  <p className="rounded-md border bg-gray-50 p-4 text-sm text-gray-600">
                    No cheaper live energy alternatives were found for this bill with the current
                    postcode and usage assumptions.
                  </p>
                )}

                <div className="grid gap-3">
                  {result.alternatives.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-lg border bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold">{offer.provider}</p>
                          <p className="text-sm text-gray-600">{offer.planName}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            Source: {offer.source}
                            {offer.lastUpdated
                              ? `, updated ${new Date(offer.lastUpdated).toLocaleDateString("en-AU")}`
                              : ""}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-semibold">
                            ${offer.monthlyCost.toFixed(2)}/month
                          </p>
                          <p className="text-sm font-medium text-green-700">
                            Save ${offer.monthlySavings.toFixed(2)}/month
                          </p>
                          <p className="text-xs text-gray-500">
                            ${offer.yearlySavings.toFixed(2)}/year
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 border-t pt-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-gray-500">
                          Assumes {offer.assumptions}
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <a href={offer.sourceUrl} target="_blank" rel="noreferrer">
                            View source
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5" />
              Next data sources
            </CardTitle>
            <CardDescription>
              These bill types need provider adapters or licensed comparison feeds before we can
              show reliable savings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {["Internet and mobile", "Insurance", "Subscriptions"].map((source) => (
                <div key={source} className="rounded-lg border bg-gray-50 p-4">
                  <p className="font-medium">{source}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Planned pipeline source. Do not show live savings until a reliable data feed is
                    wired in.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
