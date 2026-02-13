# BillBuddy 💰

Track all your household bills in one place. Never miss a payment again.

## Features

- **Bill Dashboard** — Unified view of all bills, amounts, due dates
- **Payment Calendar** — See upcoming bills at a glance
- **Spend Summary** — Monthly/yearly totals and trends
- **Bill Categories** — Electricity, gas, water, internet, mobile, insurance, subscriptions
- **Due Date Reminders** — Know what's due soon
- **Compare Deals** — Quick links to Australian comparison sites

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Database:** PostgreSQL (Vercel Postgres)
- **Auth:** NextAuth.js with magic link
- **Runtime:** Bun

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Initialize database
bunx prisma db push

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Australian Comparison Sites

- **Energy:** [Energy Made Easy](https://www.energymadeeasy.gov.au/)
- **Internet:** [Finder](https://www.finder.com.au/internet)
- **Mobile:** [Finder](https://www.finder.com.au/mobile-phone-plans)
- **Health Insurance:** [Private Health](https://www.privatehealth.gov.au/)
- **Car Insurance:** [Finder](https://www.finder.com.au/car-insurance)

## Roadmap

- [x] MVP: Dashboard, bill tracking, reminders
- [ ] Payment notifications (email/push)
- [ ] Bill history and trends
- [ ] PDF upload for bill extraction
- [ ] Multi-user households
- [ ] Energy Made Easy API integration

## License

MIT
