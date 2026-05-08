import type { Bill, BillCategory, BillingCycle } from "@/types";
import { calculateMonthlyEquivalent } from "@/lib/bill-data";

const AER_BASE_URL = "https://cdr.energymadeeasy.gov.au";
const ENERGY_RETAILERS = ["agl", "originenergy", "energyaustralia", "redenergy", "alintaenergy"];
const DEFAULT_POSTCODE = "2000";
const DEFAULT_ELECTRICITY_KWH_PER_MONTH = 390;
const DEFAULT_GAS_MJ_PER_MONTH = 1_800;
const DEFAULT_DAYS_PER_MONTH = 30.4375;

type EnergyFuelType = "ELECTRICITY" | "GAS";

interface AerPlanSummary {
  planId: string;
  fuelType: EnergyFuelType;
  brandName: string;
  displayName: string;
  customerType: string;
  lastUpdated?: string;
  geography?: {
    includedPostcodes?: string[];
    excludedPostcodes?: string[];
  };
}

interface AerPlanDetail extends AerPlanSummary {
  electricityContract?: EnergyContract;
  gasContract?: EnergyContract;
}

interface EnergyContract {
  tariffPeriod?: EnergyTariffPeriod[];
  additionalFeeInformation?: string;
}

interface EnergyTariffPeriod {
  dailySupplyCharge?: string;
  singleRate?: EnergySingleRate;
  timeOfUseRates?: EnergyTimedRate[];
}

interface EnergySingleRate {
  dailySupplyCharge?: string;
  rates?: EnergyRate[];
}

interface EnergyTimedRate {
  type?: string;
  rates?: EnergyRate[];
}

interface EnergyRate {
  unitPrice?: string;
  measureUnit?: string;
}

interface AerPlansResponse {
  data?: {
    plans?: AerPlanSummary[];
  };
}

interface AerPlanResponse {
  data?: AerPlanDetail;
}

export interface EnergyAlternative {
  id: string;
  category: Extract<BillCategory, "electricity" | "gas">;
  provider: string;
  planName: string;
  amount: number;
  billingCycle: BillingCycle;
  monthlyCost: number;
  monthlySavings: number;
  yearlySavings: number;
  source: string;
  sourceUrl: string;
  lastUpdated?: string;
  assumptions: string;
}

export interface EnergyAlternativeResult {
  bill: Bill;
  currentMonthlyCost: number;
  alternatives: EnergyAlternative[];
  error?: string;
}

function getFuelType(category: BillCategory): EnergyFuelType | null {
  if (category === "electricity") return "ELECTRICITY";
  if (category === "gas") return "GAS";
  return null;
}

function isEnergyCategory(
  category: BillCategory,
): category is Extract<BillCategory, "electricity" | "gas"> {
  return category === "electricity" || category === "gas";
}

function getUsageAssumption(fuelType: EnergyFuelType): number {
  if (fuelType === "ELECTRICITY") return DEFAULT_ELECTRICITY_KWH_PER_MONTH;
  return DEFAULT_GAS_MJ_PER_MONTH;
}

function formatAssumptions(fuelType: EnergyFuelType): string {
  if (fuelType === "ELECTRICITY") {
    return `${DEFAULT_ELECTRICITY_KWH_PER_MONTH} kWh/month and ${DEFAULT_DAYS_PER_MONTH.toFixed(1)} supply days/month.`;
  }

  return `${DEFAULT_GAS_MJ_PER_MONTH.toLocaleString()} MJ/month and ${DEFAULT_DAYS_PER_MONTH.toFixed(1)} supply days/month.`;
}

function getPlanUrl(retailer: string, planId?: string): string {
  const planPath = planId ? `/${encodeURIComponent(planId)}` : "";
  return `${AER_BASE_URL}/${retailer}/cds-au/v1/energy/plans${planPath}`;
}

function includesPostcode(plan: AerPlanSummary, postcode: string): boolean {
  const includedPostcodes = plan.geography?.includedPostcodes;
  const excludedPostcodes = plan.geography?.excludedPostcodes ?? [];

  if (excludedPostcodes.includes(postcode)) return false;
  if (!includedPostcodes || includedPostcodes.length === 0) return true;

  return includedPostcodes.includes(postcode);
}

function parseAmount(value?: string): number | null {
  if (!value) return null;

  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : null;
}

function getDailySupplyCharge(tariffPeriod: EnergyTariffPeriod): number {
  return (
    parseAmount(tariffPeriod.dailySupplyCharge) ??
    parseAmount(tariffPeriod.singleRate?.dailySupplyCharge) ??
    0
  );
}

function getUsageRate(tariffPeriod: EnergyTariffPeriod): number | null {
  const singleRate = tariffPeriod.singleRate?.rates?.[0]?.unitPrice;
  const parsedSingleRate = parseAmount(singleRate);

  if (parsedSingleRate !== null) return parsedSingleRate;

  const timeOfUseRates = tariffPeriod.timeOfUseRates
    ?.flatMap((rate) => rate.rates ?? [])
    .map((rate) => parseAmount(rate.unitPrice))
    .filter((rate): rate is number => rate !== null && rate > 0);

  if (!timeOfUseRates || timeOfUseRates.length === 0) return null;

  return timeOfUseRates.reduce((sum, rate) => sum + rate, 0) / timeOfUseRates.length;
}

function estimateMonthlyCost(plan: AerPlanDetail, fuelType: EnergyFuelType): number | null {
  const contract = fuelType === "ELECTRICITY" ? plan.electricityContract : plan.gasContract;
  const tariffPeriod = contract?.tariffPeriod?.[0];

  if (!tariffPeriod) return null;

  const usageRate = getUsageRate(tariffPeriod);
  if (usageRate === null) return null;

  const dailySupplyCharge = getDailySupplyCharge(tariffPeriod);
  const monthlyUsage = getUsageAssumption(fuelType);

  return dailySupplyCharge * DEFAULT_DAYS_PER_MONTH + usageRate * monthlyUsage;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "x-v": "3",
      "x-min-v": "1",
    },
    next: {
      revalidate: 60 * 60 * 12,
    },
  });

  if (!response.ok) {
    throw new Error(`AER request failed with ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}

async function fetchRetailerPlans(
  retailer: string,
  fuelType: EnergyFuelType,
  postcode: string,
): Promise<EnergyAlternative[]> {
  const plansUrl = `${getPlanUrl(retailer)}?type=ALL&page-size=30`;
  const planList = await fetchJson<AerPlansResponse>(plansUrl);
  const planSummaries = planList.data?.plans ?? [];

  const matchingPlans = planSummaries
    .filter((plan) => plan.fuelType === fuelType)
    .filter((plan) => plan.customerType === "RESIDENTIAL")
    .filter((plan) => includesPostcode(plan, postcode))
    .slice(0, 6);

  const details = await Promise.allSettled(
    matchingPlans.map((plan) =>
      fetchJson<AerPlanResponse>(getPlanUrl(retailer, plan.planId)),
    ),
  );

  return details
    .map((result) => (result.status === "fulfilled" ? result.value.data : undefined))
    .filter((plan): plan is AerPlanDetail => Boolean(plan))
    .map((plan): EnergyAlternative | null => {
      const monthlyCost = estimateMonthlyCost(plan, fuelType);
      if (monthlyCost === null) return null;

      return {
        id: plan.planId,
        category: fuelType === "ELECTRICITY" ? "electricity" : "gas",
        provider: plan.brandName,
        planName: plan.displayName,
        amount: monthlyCost,
        billingCycle: "monthly",
        monthlyCost,
        monthlySavings: 0,
        yearlySavings: 0,
        source: "AER Energy Made Easy CDR Product Reference Data",
        sourceUrl: getPlanUrl(retailer, plan.planId),
        lastUpdated: plan.lastUpdated,
        assumptions: formatAssumptions(fuelType),
      };
    })
    .filter((offer): offer is EnergyAlternative => Boolean(offer));
}

export async function findLiveEnergyAlternatives(
  bill: Bill,
  postcode = DEFAULT_POSTCODE,
): Promise<EnergyAlternativeResult | null> {
  const fuelType = getFuelType(bill.category);
  if (!fuelType || !isEnergyCategory(bill.category)) return null;

  const currentMonthlyCost = calculateMonthlyEquivalent(bill.amount, bill.billingCycle);

  try {
    const offersByRetailer = await Promise.allSettled(
      ENERGY_RETAILERS.map((retailer) =>
        fetchRetailerPlans(retailer, fuelType, postcode),
      ),
    );

    const alternatives = offersByRetailer
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .filter((offer) => offer.provider !== bill.provider)
      .map((offer) => {
        const monthlySavings = currentMonthlyCost - offer.monthlyCost;

        return {
          ...offer,
          monthlySavings,
          yearlySavings: monthlySavings * 12,
        };
      })
      .filter((offer) => offer.monthlySavings > 0)
      .sort((a, b) => b.monthlySavings - a.monthlySavings)
      .slice(0, 5);

    return {
      bill,
      currentMonthlyCost,
      alternatives,
    };
  } catch (error) {
    return {
      bill,
      currentMonthlyCost,
      alternatives: [],
      error: error instanceof Error ? error.message : "Could not load energy plans.",
    };
  }
}
