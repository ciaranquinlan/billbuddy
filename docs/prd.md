# BillBuddy — Product Requirements Document

> **Status:** Draft
> **Author:** Ciarán Quinlan
> **Date:** 2026-02-13
> **Version:** 1.0

---

## 1. Overview

### 1.1 Problem Statement

Australian households juggle multiple utility providers (energy, internet, mobile, insurance, water, health) with:
- Different billing cycles and payment dates
- No centralised view of total household spend
- Manual effort to track when contracts expire or compare competitive rates
- Missed savings from not switching providers when better deals are available
- No visibility into spend trends over time

**The opportunity:** A single app that tracks all household bills, surfaces upcoming payments, identifies when you're overpaying, and proactively finds competitive quotes from Australian providers.

### 1.2 Target Users

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| Household Manager | Person responsible for paying household bills (often one partner in a couple) | Single view of all bills, payment reminders, spend tracking |
| Budget-Conscious Consumer | Someone actively trying to reduce household expenses | Comparison quotes, contract expiry alerts, savings opportunities |
| Time-Poor Professional | Working adult who doesn't have time to manually compare providers | Automated quote fetching, proactive notifications |

### 1.3 Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Bills tracked | 100% of household utilities | User adds all providers |
| Payment visibility | 2 weeks lookahead | Dashboard shows upcoming payments |
| Savings identified | $500+/year | Comparison quotes show potential savings |
| Comparison coverage | 5+ categories | Energy, internet, mobile, insurance, health |

---

## 2. Solution

### 2.1 Proposed Solution

**BillBuddy** — A web app (mobile-first PWA) that:
1. Lets you add your current providers and bill amounts
2. Shows a unified dashboard of all household bills
3. Tracks payment due dates and sends reminders
4. Integrates with Australian comparison services to fetch competitive quotes
5. Alerts you when better deals are available or contracts are expiring

### 2.2 Key Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Bill Dashboard | P0 | Unified view of all bills, amounts, due dates, providers |
| Add/Edit Bills | P0 | Manual entry of bill details (provider, amount, cycle, due date) |
| Payment Calendar | P0 | Calendar view showing when bills are due |
| Spend Summary | P1 | Monthly/yearly totals, trends, category breakdown |
| Quote Finder | P2 | Link out to comparison sites (scraping descoped) |
| Contract Expiry Tracking | P1 | Track when contracts end, alert before renewal |
| Payment Reminders | P1 | Push notifications / email before due dates |
| Bill History | P2 | Track bill amounts over time, see increases |
| Provider Ratings | P2 | Show customer satisfaction scores for alternatives |
| PDF Upload | P2 | Extract bill details from uploaded PDFs |
| Multi-user | P2 | Share household with partner |

### 2.3 User Flows

**Flow 1: Initial Setup**
1. User signs up / logs in
2. User adds their first bill (selects category → provider → enters amount, due date, billing cycle)
3. Repeat for all household bills
4. User sees populated dashboard

**Flow 2: Check Upcoming Bills**
1. User opens app
2. Dashboard shows bills due in next 14 days
3. User can mark as "paid" when done

**Flow 3: Find Better Deal**
1. User taps "Find better deal" on a bill (e.g., Electricity - AGL)
2. App fetches quotes from comparison service (e.g., Energy Made Easy, iSelect)
3. Shows current spend vs alternatives
4. User can click through to switch provider

**Flow 4: Contract Expiry Alert**
1. System detects contract is expiring in 30 days
2. Sends notification: "Your Telstra internet contract expires in 30 days. We found 3 cheaper plans."
3. User reviews options

---

## 3. Technical Considerations

### 3.1 Architecture

- **Frontend:** Next.js PWA (mobile-first, installable)
- **Backend:** Next.js API routes
- **Database:** Postgres (Vercel Postgres or Neon)
- **Auth:** NextAuth.js with magic link / Google OAuth
- **Notifications:** Web push + email (Resend)

### 3.2 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind 4, shadcn/ui
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** Vercel Postgres
- **Hosting:** Vercel
- **Runtime:** Bun

### 3.3 Integrations

**MVP:** None — pure tracker, no external integrations.

**v2 Candidates:**
| Integration | Purpose | API/Method |
|-------------|---------|------------|
| Energy Made Easy | Electricity/gas quotes | Government API (free, explore) |
| Comparison sites | Multi-category | Link out only (no scraping) |

**Descoped:** Web scraping of comparison sites. Legal/maintenance risks outweigh benefits for MVP. Revisit if user demand proves the tracker concept.

### 3.4 Data Model

```
User
├── id, email, name, createdAt

Household
├── id, name, ownerId
├── members: User[]

Bill
├── id, householdId
├── category: enum (electricity, gas, water, internet, mobile, health_insurance, car_insurance, roadside, subscription)
├── provider: string (e.g., "AGL", "Telstra")
├── amount: decimal
├── billingCycle: enum (weekly, fortnightly, monthly, quarterly, yearly)
├── dueDate: date (next due date)
├── contractExpiry: date (optional)
├── notes: string
├── history: BillHistory[]

BillHistory
├── id, billId
├── amount, date, paidAt

Quote
├── id, billId
├── provider, amount, fetchedAt, url
```

---

## 4. Constraints

### 4.1 Timeline

- **Week 1:** Core dashboard, bill CRUD, auth
- **Week 2:** Payment calendar, reminders, spend summary
- **Week 3:** Polish, PWA, notifications
- **Week 4:** Buffer / v2 features if ahead

### 4.2 Budget

- Hosting: Vercel free tier initially
- Database: Vercel Postgres free tier (60 hours compute)
- No paid APIs for MVP

### 4.3 Technical Constraints

- Comparison APIs may not be publicly available → fallback to link-outs
- No direct bill fetching from providers (would require bank integrations like Basiq)
- Manual entry required for MVP

---

## 5. Security & Privacy

### 5.1 Data Handling

- Bill amounts and due dates stored in database
- No bank account or credit card details stored
- No provider login credentials stored
- Data encrypted at rest (Vercel Postgres default)

### 5.2 Authentication

- Magic link email auth (passwordless) — primary
- Google OAuth — secondary option
- Session-based auth with secure cookies

### 5.3 Security Considerations

| Risk | Mitigation |
|------|------------|
| Data breach exposing bill amounts | Encrypt sensitive fields, minimal data retention |
| Fake comparison quotes | Only use official/verified sources, show source attribution |
| Phishing via fake "switch provider" links | All external links clearly labeled, go to official sites |
| Account takeover | Magic link auth reduces password risks, add 2FA option |

---

## 6. Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| How to keep bill amounts accurate? | Resolved | Manual updates — user enters new amount when bill arrives |
| How useful are generic quotes without usage data? | Resolved | Good enough — users know their usage, can input it |
| How to handle direct debit bills? | Resolved | Not applicable — household pays per bill manually |
| How to get comparison quotes? | Resolved | Web scraping of comparison sites (iSelect, Compare the Market, etc.) |
| Multi-provider mobile — one category or separate? | Resolved | Separate entries per phone line |
| Scope — what counts as a "bill"? | Resolved | Include subscriptions (Netflix, streaming, internet services) |
| Multi-household support (e.g., investment property bills)? | Open | v2 feature, MVP is single household |

---

## 7. Adversarial Review Summary

*Completed 2026-02-13*

### 7.1 Challenges Raised

1. **Web scraping legal/maintenance risk** — Comparison sites prohibit scraping, actively block bots
2. **Value prop vs spreadsheet** — Without embedded quotes, differentiation is weak
3. **Competitive landscape** — Frollo, WeMoney, Pocketbook all do this with bank integrations
4. **Manual update fatigue** — Users won't keep data fresh without prompts
5. **Scope creep** — 8 P0+P1 features is too much for MVP

### 7.2 Resolutions

1. **Descoped scraping to v2** — MVP links out to comparison sites only
2. **Leaned into tracker value** — Calendar, reminders, spend trends are the MVP differentiator
3. **"No bank connection" positioning** — Privacy-first angle vs competitors
4. **Added bill reminder prompts** — "Time to update your electricity bill?" when due date approaches
5. **Cut MVP scope** — Dashboard, calendar, reminders, spend summary only

### 7.3 Surviving Requirements

- Bill dashboard with unified view ✅
- Payment calendar ✅
- Due date reminders ✅
- Manual bill entry (no scraping/bank feeds) ✅
- Subscription tracking ✅
- PWA for mobile ✅

---

## Appendix

### A. Current Providers (Ciarán's Household)

| Category | Provider | Notes |
|----------|----------|-------|
| Internet | Telstra | |
| Electricity | AGL | |
| Gas | AGL | Same provider as electricity |
| Water | Sydney Water | |
| Health Insurance | GU Health | |
| Mobile | Woolworths Mobile | Line 1 |
| Mobile | Telstra | Line 2 |
| Car Insurance | AAMI | |
| Roadside Assistance | NRMA | |
| Subscription | Netflix | Streaming |
| Subscription | (others TBD) | User to add |

### B. Australian Comparison Resources

- **Energy Made Easy** (energymadeeasy.gov.au) — Government energy comparison
- **iSelect** — Multi-category comparison
- **Compare the Market** — Multi-category
- **Canstar** — Product ratings and comparison
- **Finder** — Comparison across categories
- **Service NSW** — Rebate eligibility checker

### C. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-13 | Ciarán Quinlan | Initial draft |
