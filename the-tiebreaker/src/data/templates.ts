import { DecisionTemplate } from '../types';

export const PRESET_TEMPLATES: DecisionTemplate[] = [
  {
    id: 'template-saas-pricing',
    title: 'Freemium vs Flat $20/mo SaaS Pricing',
    category: 'Product & Pricing',
    description: 'Decide whether to launch with a freemium acquisition model or a flat $20/month premium subscription.',
    dilemma: 'Should I offer my software for free with paid features, or charge a flat $20/month premium plan?',
    options: [
      { title: 'Freemium (Free Tier + Paid Add-ons)', description: 'Maximum user growth, viral top-of-funnel acquisition, higher server costs, 2-5% conversion rate.' },
      { title: 'Flat $20/month Premium Plan', description: 'Immediate predictable MRR, higher initial barrier to entry, self-qualifying high-intent customers, lower support burden.' }
    ],
    suggestedFactors: ['Top-of-Funnel User Acquisition Rate', 'Initial Monthly Recurring Revenue (MRR)', 'Server & Infrastructure Overhead Costs', 'Customer Conversion & Support Effort', 'Long-term Lifetime Value (LTV)']
  },
  {
    id: 'template-job-offer',
    title: 'Startup vs Corporate Job Offer',
    category: 'Career & Work',
    description: 'Decide whether to take a high-equity, fast-paced startup role or a stable, well-compensated corporate position.',
    dilemma: 'Should I join a Series-B startup offering $140k + 0.15% equity or stay/join an established enterprise company offering $170k + 401k match and steady work hours?',
    options: [
      { title: 'Series-B Tech Startup', description: 'Faster career growth, high equity upside, broader scope, higher risk & longer hours.' },
      { title: 'Established Corporate Firm', description: 'Higher base salary, stability, predictable work-life balance, slower promotion cadence.' }
    ],
    suggestedFactors: ['Compensation & Financial Upside', 'Work-Life Balance', 'Career Growth Rate', 'Job Security', 'Culture & Autonomy']
  },
  {
    id: 'template-tech-stack',
    title: 'React SPA vs Next.js SSR vs Remix',
    category: 'Tech & Architecture',
    description: 'Select the best frontend framework architecture for a new customer-facing SaaS web app.',
    dilemma: 'Which architecture should our team adopt for our new B2B web application: Client-side React Vite SPA, Next.js App Router, or Remix/React Router v7?',
    options: [
      { title: 'Vite + React SPA', description: 'Simple setup, fast client navigation, cheap static hosting, manual SEO/SSR setup.' },
      { title: 'Next.js App Router', description: 'Built-in SSR/SSG, rich ecosystem, server components, steeper learning curve & complex serverless deployments.' },
      { title: 'Remix Framework', description: 'Web standards focused, progressive enhancement, elegant data loaders, smaller community.' }
    ],
    suggestedFactors: ['Developer Velocity', 'SEO Requirements', 'Hosting & Deployment Complexity', 'Ecosystem Support', 'Performance & Initial Load']
  },
  {
    id: 'template-housing',
    title: 'Rent City Apartment vs Buy Suburban House',
    category: 'Housing & Living',
    description: 'Evaluate renting a walk score 95 apartment downtown versus buying a 3-bedroom house in the suburbs.',
    dilemma: 'Should I continue renting a 2-bedroom downtown apartment close to nightlife and office ($3,200/mo) or buy a starter home in the suburbs with a 30-min commute ($4,100/mo mortgage/tax/HOA)?',
    options: [
      { title: 'Rent Downtown Apartment', description: 'Zero maintenance, walkability, short commute, no equity building, rising rent risk.' },
      { title: 'Buy Suburban House', description: 'Equity growth, space, yard, freedom to renovate, property taxes, long commute, maintenance costs.' }
    ],
    suggestedFactors: ['Monthly Cash Flow', 'Long-term Financial Equity', 'Commute & Travel Time', 'Lifestyle & Amenities', 'Maintenance & Stress']
  },
  {
    id: 'template-car-purchase',
    title: 'Buy Electric EV vs Hybrid Car',
    category: 'Buying & Products',
    description: 'Compare transitioning to a full Battery Electric Vehicle vs a Plug-In Hybrid Electric Vehicle.',
    dilemma: 'I need a new primary commuter car. Should I get a Tesla Model Y / Hyundai Ioniq 5 (Pure EV) or a Toyota RAV4 Prime / Honda CR-V (Plug-in Hybrid)?',
    options: [
      { title: 'Full Battery EV', description: 'Zero gas costs, high acceleration, lower maintenance, reliance on public charging networks on long trips.' },
      { title: 'Plug-In Hybrid (PHEV)', description: 'Gas safety net for road trips, short EV range for daily commutes, dual powertrain maintenance.' }
    ],
    suggestedFactors: ['Total Cost of Ownership', 'Range & Road Trip Convenience', 'Home Charging Feasibility', 'Environmental Impact', 'Resale & Depreciation']
  },
  {
    id: 'template-relocation',
    title: 'Relocate to New City vs Stay Put',
    category: 'Life & Personal',
    description: 'Weigh moving across the country for a fresh start versus building on existing social roots.',
    dilemma: 'Should I move from my hometown in Ohio to Seattle/Austin for better tech networking and nature, or stay near family and friends where cost of living is lower?',
    options: [
      { title: 'Relocate across the country', description: 'New experiences, networking, career opportunities, nature access, higher cost of living, starting social life from scratch.' },
      { title: 'Stay in current city', description: 'Strong family support network, affordable housing, familiar routines, potential feeling of stagnation.' }
    ],
    suggestedFactors: ['Cost of Living Impact', 'Family & Friend Proximity', 'Career & Networking Potential', 'Lifestyle & Outdoor Access', 'Emotional Comfort']
  }
];
