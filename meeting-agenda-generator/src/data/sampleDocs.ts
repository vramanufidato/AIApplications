import { SampleDoc } from '../types';

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'product-launch',
    name: 'Q3 Product Launch Plan.md',
    type: 'markdown',
    description: 'Product specification & rollout strategy for AI Analytics V2',
    content: `# Q3 Product Launch Plan: AI Analytics V2

## Overview
We are launching AI Analytics V2 on September 15. The core feature set includes real-time natural language query parsing, custom visualization dashboarding, and automated insight generation.

## Key Goals
- Reach 50,000 active users within 30 days post-launch.
- Maintain sub-200ms query latency for 99% of requests.
- Achieve 85% conversion rate for beta enterprise triallists.

## Launch Phases
1. **Internal Beta (Aug 20)**: Internal testing with engineering and product teams.
2. **Customer Advisory Board Preview (Aug 28)**: 15 design partner accounts.
3. **Public GA Release (Sep 15)**: Full marketing campaign rollout across web and press.

## Critical Technical Requirements & Open Risks
- Lead Architect (David Chen): Need to finalize DB indexing strategy for vector search to avoid memory pressure during peak query loads.
- Security Lead (Sarah Jenkins): SOC2 compliance audit documentation needs signoff before Aug 25.
- UX Designer (Elena Rostova): Onboarding flow user testing revealed friction on workspace team permissions setup. Redesigning by Aug 22.

## Marketing & PR Strategy
- Product Marketing Manager (Marcus Vance): Coordinating TechCrunch launch feature and launch video.
- Customer Success Lead (Priya Patel): Training CS agents on new features and tier migration pathways.

## Discussion Items for Upcoming Team Alignment
1. Go/No-Go criteria definition for Beta phase.
2. Resource allocation between feature bug fixes vs performance optimization.
3. Pricing model final validation for Enterprise tier add-ons.`
  },
  {
    id: 'engineering-retro',
    name: 'Sprint 42 Architecture Review & Retro.docx',
    type: 'docx',
    description: 'Engineering retrospective and infrastructure upgrade discussion',
    content: `Sprint 42 Retrospective & Platform Migration Review

Date: August 2026
Prepared by: DevOps & Core Infrastructure Group

1. Current State Assessment
During Sprint 42, our primary API gateway experienced two 12-minute latency spikes due to database connection pool exhaustion. While client retry logic prevented severe data loss, customer feedback highlighted performance bottlenecks during peak operating hours.

2. Infrastructure Modernization Proposal
Lead DevOps Engineer (Alex Rivera) proposes migrating our transactional services to read-replica database clusters and introducing an Redis caching layer for authorization tokens.

Key Stakeholders Impacted:
- Infrastructure Team (Alex Rivera): Deployment setup and fallback triggers.
- Core Services Team (Priya Sharma): Updating API endpoints to leverage new connection pools.
- QA Automation Lead (Tom Miller): Integration test suite validation for failover scenarios.
- Product Manager (Jordan Lee): Alignment on feature downtime window during database migration.

3. Action Items Required
- Benchmark Redis token cache memory footprint under simulated 10k RPS load.
- Schedule database maintenance window with minimal customer impact (target: Sunday 02:00 UTC).
- Establish automated alerting thresholds for database replica lag (>5 seconds trigger PagerDuty).

4. Key Decisions Needed in Alignment Meeting
- Approve proposed $1,200/month infrastructure budget increase for Redis cluster.
- Finalize downtime communication protocol for enterprise clients.
- Decide whether to defer non-critical feature work in Sprint 43 to prioritize infra stability.`
  },
  {
    id: 'quarterly-budget',
    name: '2027 Marketing Budget & Strategy.txt',
    type: 'text',
    description: 'Cross-functional budget distribution and campaign priorities',
    content: `2027 Executive Budget & Strategic Marketing Overview

Document Purpose: Align executive leadership on proposed marketing spend, channel ROI targets, and hiring requirements for 2027 fiscal year.

Key Participants & Department Leads:
- Chief Marketing Officer (Rachel Greenfield): Strategic direction & channel mix.
- VP of Sales (James Sterling): Lead volume commitments & enterprise pipeline sync.
- Chief Financial Officer (Michael Chang): Budget capping & ROI metrics approval.
- Content Strategy Director (Aisha Khan): Organic traffic growth and content distribution.

Proposed Budget Allocations ($2.4M Total):
1. Paid Acquisition (Google Ads, LinkedIn, Meta): $950,000 (Target CAC: $320)
2. Events & Developer Conferences: $450,000 (Key events: Cloud Summit, AI Expo)
3. Content & SEO Agency Retainer: $300,000
4. Headcount Additions (2 Performance Marketers, 1 Brand Lead): $500,000
5. Tools & Analytics Software Subscriptions: $200,000

Open Decisions & Alignment Points:
- CFO concerns regarding Paid Acquisition spend before testing conversion efficiency on new landing pages.
- Sales request for higher budget allocation toward targeted Account-Based Marketing (ABM) for Fortune 500 prospects.
- Content team request to produce a bi-weekly video podcast targeting tech founders.`
  }
];
