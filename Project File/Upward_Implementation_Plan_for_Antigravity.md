**UPWARD**

Unit Sales Management Platform

Implementation Plan & Technical Blueprint

Prepared for: Antigravity Development Team

Based on Product Specification v2.1 – Unified Sales Blueprint Edition

February 2026

**CONFIDENTIAL**

**Table of Contents**

# Executive Brief for Antigravity

This document is the complete technical implementation plan for building Upward, a multi-country real estate unit sales management platform. It is designed to give your engineering team everything needed to build a working, demo-ready product without ambiguity. Every database table, API endpoint, frontend page, business logic rule, and calculation formula is specified below.

### WHAT UPWARD DOES

- Records and manages real estate unit sales across USA, Canada, and India with full regulatory compliance per country

- Manages buyers (individual, joint, corporate), brokers (individual and firm), and complex multi-model commission structures

- Tracks both incoming payments (buyer installments / receivables) and outgoing payments (broker commissions / payables)

- Uses an AI document intelligence engine to auto-extract sale information from uploaded contracts (PDF/images)

- Integrates with Yardi ERP for pushing payables/receivables and pulling property/unit inventory

- Integrates with Procore for construction-stage-aware upgrade eligibility

- Provides a real-time analytics dashboard with KPIs, sales performance, inventory analytics, partner leaderboards, and YoY comparisons

- Manages the full unit lifecycle: booking, change orders, milestone funding, closing statement generation, PDI/snag, possession handover, and warranty tracking

### DEMO-READY PRODUCT SCOPE

For the demo-ready build, the following modules must be fully functional with real UI, working APIs, seeded data, and end-to-end flows:

| **Priority** | **Module**            | **Demo Requirement**                                                    |
|--------------|-----------------------|-------------------------------------------------------------------------|
| P0 (Must)    | Auth & RBAC           | Login, MFA, 6 roles, route guards, permission checks                    |
| P0 (Must)    | Properties & Units    | CRUD, status management, fees/charges, closing info, dates, lease info  |
| P0 (Must)    | Buyers                | Full profiles, KYC tracking, joint buyers, NSF history, risk badges     |
| P0 (Must)    | Brokers & Commissions | Profiles, 10 commission models, calculation engine, split logic         |
| P0 (Must)    | Sales Recording       | Manual sale entry, multi-step form, status lifecycle, compliance checks |
| P0 (Must)    | Payments              | Buyer installment schedules, broker commission payments, aging tracking |
| P0 (Must)    | Country Compliance    | USA/Canada/India rules engine, RERA escrow, FINTRAC, FIRPTA, tax calcs  |
| P1 (High)    | AI Document Engine    | Upload, OCR, extraction, split-screen review, correction logging        |
| P1 (High)    | Yardi Integration     | FinPayables CSV push, receivables sync, inventory pull, sync dashboard  |
| P1 (High)    | Analytics Dashboard   | KPIs, charts, partner leaderboard, YoY comparison, drill-down           |
| P1 (High)    | Lifecycle Module      | Booking, upgrades, closing statement, PDI/snag, possession gates        |
| P2 (Med)     | AI Self-Learning      | Correction feedback loop, retraining triggers, model versioning         |
| P2 (Med)     | Scheduled Reports     | Email delivery, PDF/Excel export engine                                 |
| P2 (Med)     | Migration Buddy       | Legacy ETL pipeline with validation                                     |

# Technical Architecture

## Confirmed Technology Stack

| **Layer**    | **Technology**                                                  | **Rationale**                                                                 |
|--------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------|
| Frontend     | Next.js 14+ (App Router) with TypeScript                        | SSR, file-based routing, API routes, React Server Components                  |
| UI Library   | Tailwind CSS + shadcn/ui + Radix primitives                     | Rapid dev, accessible components, consistent design system                    |
| Charts       | Recharts (primary) + Apache ECharts (complex viz)               | Recharts for standard charts; ECharts for heatmaps, treemaps, funnels         |
| State Mgmt   | Zustand (global) + React Query / TanStack Query (server)        | Zustand for UI state; React Query for caching, pagination, optimistic updates |
| Backend      | Node.js with NestJS (TypeScript)                                | Enterprise patterns: modules, DI, guards, interceptors, pipes, decorators     |
| ORM          | Prisma with PostgreSQL                                          | Type-safe queries, migrations, schema-first, JSON field support               |
| Database     | PostgreSQL 16+                                                  | JSONB for compliance_metadata, partitioning, materialized views, pg_cron      |
| Cache        | Redis 7+                                                        | Session store, API cache (5-min TTL), rate limiting, job queues               |
| Queue        | BullMQ (Redis-backed)                                           | Async AI processing, Yardi sync jobs, report generation, email delivery       |
| Search       | PostgreSQL Full-Text Search (Phase 1) / Elasticsearch (Phase 2) | FTS for demo; Elasticsearch for production scale                              |
| File Storage | AWS S3 (with presigned URLs)                                    | Encrypted document storage, versioning, lifecycle policies                    |
| OCR / AI     | AWS Textract (OCR) + OpenAI GPT-4o / Claude API (extraction)    | Textract for bounding boxes; LLM for semantic extraction                      |
| Auth         | NextAuth.js + custom RBAC middleware                            | JWT sessions, OAuth providers, MFA via TOTP, role-permission matrix           |
| Real-time    | Socket.io (WebSocket)                                           | Dashboard live updates, sync status, notification push                        |
| Email        | Nodemailer + SendGrid / AWS SES                                 | Transactional emails, scheduled report delivery                               |
| Monitoring   | Sentry (errors) + Datadog / Grafana (APM)                       | Error tracking, performance monitoring, alerting                              |
| CI/CD        | GitHub Actions                                                  | Automated testing, linting, build, deploy to AWS                              |
| Hosting      | AWS (ECS Fargate or EKS)                                        | Containerized, auto-scaling, multi-region capable                             |
| CDN          | CloudFront                                                      | Static assets, chart images, exported reports                                 |

## Service Architecture

Upward follows a modular monolith architecture in Phase 1 (demo) with clear service boundaries that can be extracted into microservices later. Each NestJS module encapsulates its own controllers, services, DTOs, and Prisma queries.

| **NestJS Module**  | **Owns**                                                                                                                                  | **Key Dependencies**                                        |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| AuthModule         | Users, Roles, Permissions, Sessions, MFA                                                                                                  | Redis (sessions), JWT                                       |
| PropertyModule     | Properties, Units, UnitFees, UnitClosing, UnitDates, UnitLease                                                                            | ComplianceModule (country rules)                            |
| BuyerModule        | Buyers, JointBuyers, KYCDocuments, NSFEvents, NSFFines                                                                                    | ComplianceModule (KYC rules)                                |
| BrokerModule       | Brokers, BrokerFirms, CommissionConfigs                                                                                                   | None                                                        |
| SalesModule        | Sales, SaleDocuments                                                                                                                      | PropertyModule, BuyerModule, BrokerModule, ComplianceModule |
| CommissionModule   | Commissions, CommissionPayments                                                                                                           | SalesModule, BrokerModule                                   |
| PaymentModule      | PaymentSchedules, Installments                                                                                                            | SalesModule, BuyerModule                                    |
| ComplianceModule   | CountryRules, TaxConfigs, FINTRACRecords, FIRPTANotices                                                                                   | None (standalone rules engine)                              |
| AIModule           | Documents, AIExtractions, AICorrections, ModelVersions                                                                                    | SalesModule, BuyerModule, BrokerModule (record creation)    |
| YardiModule        | YardiSyncLogs, YardiVendorMap, YardiPropertyMap                                                                                           | CommissionModule, PaymentModule                             |
| InventoryModule    | YardiProperties, YardiUnits, InventorySyncJobs, ChangeLog                                                                                 | YardiModule (sync)                                          |
| AnalyticsModule    | Aggregations, DashboardConfigs, ScheduledReports                                                                                          | All modules (read-only queries)                             |
| LifecycleModule    | FinCENReports, TarionRegistrations, RERAAccounts, Upgrades, ClosingStatements, PDIs, Defects, PossessionGates, Warranties, WarrantyClaims | SalesModule, PropertyModule, PaymentModule                  |
| NotificationModule | Notifications, EmailTemplates, EmailLogs                                                                                                  | All modules (event-driven)                                  |
| MigrationModule    | MigrationRecords, ValidationReports                                                                                                       | All modules (data import)                                   |
| AuditModule        | AuditLogs                                                                                                                                 | All modules (interceptor-based logging)                     |

## Project Folder Structure

The following is the recommended monorepo folder structure:

upward/

├─ apps/

│ ├─ web/ (Next.js frontend)

│ │ ├─ app/ (App Router pages)

│ │ │ ├─ (auth)/ Login, register, forgot-password

│ │ │ ├─ dashboard/ Analytics dashboard

│ │ │ ├─ properties/ Property list, detail, unit grid

│ │ │ ├─ sales/ Sale recording, AI upload, review

│ │ │ ├─ buyers/ Buyer list, profile, NSF

│ │ │ ├─ brokers/ Broker list, profile, commissions

│ │ │ ├─ payments/ Payables, receivables

│ │ │ ├─ inventory/ Yardi inventory explorer

│ │ │ ├─ integrations/ Yardi sync, Procore status

│ │ │ ├─ reports/ Report generation

│ │ │ └─ admin/ User mgmt, config, AI settings

│ │ ├─ components/ Shared UI components

│ │ ├─ lib/ API client, utils, hooks

│ │ └─ styles/ Global styles, Tailwind config

│ └─ api/ (NestJS backend)

│ ├─ src/modules/ One folder per NestJS module

│ ├─ src/common/ Guards, interceptors, pipes

│ ├─ src/prisma/ Prisma client, migrations

│ └─ prisma/schema.prisma

├─ packages/shared/ Shared types, enums, constants

└─ docker-compose.yml PostgreSQL, Redis, MinIO

# Complete Database Schema

Every table below must be created in the PostgreSQL database. All tables include standard audit columns (created_at, updated_at, created_by, updated_by) unless noted. All monetary fields use DECIMAL(15,2). All tables with country-specific data include a compliance_metadata JSONB column for extensible region-specific fields.

> **JSONB Pattern:** Tables marked with [JSONB] include a compliance_metadata JSONB column. The frontend dynamically renders form fields based on the property country code, and the AI extraction targets are also driven by country. New regulatory fields can be added without schema migration.

## Core Entity Tables

#### users

All platform users. Passwords stored as bcrypt hashes. MFA via TOTP.

| **Column**            | **Type**     | **Null?** | **Constraints / Notes**                                                             |
|-----------------------|--------------|-----------|-------------------------------------------------------------------------------------|
| id                    | UUID         | NO        | PK, default gen_random_uuid()                                                       |
| email                 | VARCHAR(255) | NO        | UNIQUE, lowercase, trimmed                                                          |
| password_hash         | VARCHAR(255) | NO        | bcrypt hash                                                                         |
| first_name            | VARCHAR(100) | NO        |                                                                                     |
| last_name             | VARCHAR(100) | NO        |                                                                                     |
| role                  | ENUM         | NO        | super_admin, property_admin, sales_manager, finance_manager, broker_portal, auditor |
| phone                 | VARCHAR(30)  | YES       | With country code                                                                   |
| mfa_enabled           | BOOLEAN      | NO        | Default false                                                                       |
| mfa_secret            | VARCHAR(255) | YES       | TOTP secret, encrypted at rest                                                      |
| status                | ENUM         | NO        | active, inactive, suspended                                                         |
| last_login_at         | TIMESTAMPTZ  | YES       |                                                                                     |
| assigned_property_ids | UUID\[\]     | YES       | Array of property IDs this user can access                                          |

#### properties [JSONB]

Real estate developments/buildings. One row per property. Partitioned by country.

| **Column**          | **Type**     | **Null?** | **Constraints / Notes**                                                |
|---------------------|--------------|-----------|------------------------------------------------------------------------|
| id                  | UUID         | NO        | PK                                                                     |
| property_name       | VARCHAR(255) | NO        |                                                                        |
| property_type       | ENUM         | NO        | residential, commercial, mixed_use, industrial                         |
| address_line_1      | VARCHAR(255) | NO        |                                                                        |
| address_line_2      | VARCHAR(255) | YES       |                                                                        |
| city                | VARCHAR(100) | NO        |                                                                        |
| state_province      | VARCHAR(100) | NO        |                                                                        |
| postal_code         | VARCHAR(20)  | NO        |                                                                        |
| country             | ENUM         | NO        | USA, CAN, IND                                                          |
| total_units         | INTEGER      | NO        |                                                                        |
| developer_name      | VARCHAR(255) | NO        | Legal entity name                                                      |
| developer_tax_id    | VARCHAR(50)  | NO        | EIN / BN / PAN-GSTIN                                                   |
| registration_number | VARCHAR(100) | YES       | RERA number (India)                                                    |
| status              | ENUM         | NO        | pre_launch, active, sold_out, archived                                 |
| timezone            | VARCHAR(50)  | NO        | IANA timezone string                                                   |
| compliance_metadata | JSONB        | YES       | Country-specific: rera_project_completion_date, rera_escrow_bank, etc. |

#### units [JSONB]

Individual sellable units within a property. FK to properties.

| **Column**          | **Type**      | **Null?** | **Constraints / Notes**                                    |
|---------------------|---------------|-----------|------------------------------------------------------------|
| id                  | UUID          | NO        | PK                                                         |
| property_id         | UUID          | NO        | FK → properties.id, ON DELETE CASCADE                      |
| unit_number         | VARCHAR(50)   | NO        | Developer-assigned (e.g., A-101)                           |
| unit_type           | ENUM          | NO        | studio, 1bhk, 2bhk, 3bhk, penthouse, office, retail, other |
| floor_number        | INTEGER       | YES       |                                                            |
| carpet_area         | DECIMAL(10,2) | NO        | Primary area in sq ft or sq m                              |
| built_up_area       | DECIMAL(10,2) | YES       |                                                            |
| super_built_up_area | DECIMAL(10,2) | YES       | Required for India (RERA)                                  |
| base_price          | DECIMAL(15,2) | NO        | List price in local currency                               |
| price_per_sqft      | DECIMAL(10,2) | NO        | Calculated: base_price / carpet_area                       |
| status              | ENUM          | NO        | available, reserved, sold, blocked                         |
| parking_included    | BOOLEAN       | NO        | Default false                                              |
| parking_slots       | INTEGER       | YES       |                                                            |
| amenities           | TEXT\[\]      | YES       | Array of amenity tags                                      |
| floor_plan_url      | VARCHAR(500)  | YES       | S3 URL to floor plan PDF/image                             |
| compliance_metadata | JSONB         | YES       | Country-specific fields                                    |

#### unit_fees

Detailed fee structure per unit. All monetary fields in local currency.

| **Column**              | **Type**      | **Null?** | **Constraints / Notes**                         |
|-------------------------|---------------|-----------|-------------------------------------------------|
| id                      | UUID          | NO        | PK                                              |
| unit_id                 | UUID          | NO        | FK → units.id, UNIQUE (one fee record per unit) |
| purchase_price_incl_tax | DECIMAL(15,2) | NO        | Total price including HST/GST                   |
| tax_amount              | DECIMAL(15,2) | NO        | Broken-out tax amount                           |
| purchase_price_excl_tax | DECIMAL(15,2) | NO        | Calculated: incl_tax - tax_amount               |
| upgrades                | DECIMAL(15,2) | YES       | Buyer-selected upgrades cost                    |
| cap_amendment           | DECIMAL(15,2) | YES       | Ontario dev charge cap amendment                |
| parkland_levies         | DECIMAL(15,2) | YES       | Municipal parkland levy                         |
| general_admin_fee       | DECIMAL(15,2) | YES       |                                                 |
| mortgage_discharge_fee  | DECIMAL(15,2) | YES       |                                                 |
| tarion_enrollment_fee   | DECIMAL(15,2) | YES       | Ontario warranty enrollment                     |
| mortgage_app_fee        | DECIMAL(15,2) | YES       |                                                 |
| realty_tax              | DECIMAL(15,2) | YES       | Property tax adjustment                         |
| utility_security        | DECIMAL(15,2) | YES       |                                                 |
| submetering_charge      | DECIMAL(15,2) | YES       |                                                 |
| occupancy_fees          | DECIMAL(15,2) | YES       | Monthly interim occupancy (Canada)              |
| common_expense          | DECIMAL(15,2) | YES       | Monthly condo maintenance                       |
| bulletin_19_charge      | DECIMAL(15,2) | YES       | Tarion Bulletin 19 (Ontario)                    |
| assignment_fee          | DECIMAL(15,2) | YES       |                                                 |
| deposit_received        | DECIMAL(15,2) | NO        | Total deposit collected                         |
| schedule_d_pct          | DECIMAL(5,2)  | YES       | Schedule D percentage                           |

#### unit_closing_info

Closing-related credits, penalties, and legal fees per unit.

| **Column**                    | **Type**      | **Null?** | **Constraints / Notes**          |
|-------------------------------|---------------|-----------|----------------------------------|
| id                            | UUID          | NO        | PK                               |
| unit_id                       | UUID          | NO        | FK → units.id, UNIQUE            |
| credit_on_closing             | DECIMAL(15,2) | YES       | Negative value = credit to buyer |
| credit_deposit_interest       | DECIMAL(15,2) | YES       | Interest earned on deposits      |
| penalty_mls_listing           | DECIMAL(15,2) | YES       | Unauthorized MLS listing penalty |
| penalty_assignment_no_consent | DECIMAL(15,2) | YES       |                                  |
| leasing_fee                   | DECIMAL(15,2) | YES       |                                  |
| misc_legal_fee                | DECIMAL(15,2) | YES       |                                  |
| misc_legal_description        | TEXT          | YES       | Free-text description            |

#### unit_critical_dates

Milestone dates for the unit sale lifecycle.

| **Column**              | **Type** | **Null?** | **Constraints / Notes**                 |
|-------------------------|----------|-----------|-----------------------------------------|
| id                      | UUID     | NO        | PK                                      |
| unit_id                 | UUID     | NO        | FK → units.id, UNIQUE                   |
| target_closing_date     | DATE     | NO        | From purchase agreement                 |
| contract_date           | DATE     | NO        | Agreement execution date                |
| approval_date           | DATE     | YES       | Board/developer approval                |
| final_sales_date        | DATE     | YES       | Legally completed; triggers Sold status |
| firm_occupancy_date     | DATE     | YES       | Pre-construction Canada                 |
| actual_occupancy_date   | DATE     | YES       | Actual possession date                  |
| interim_occupancy_start | DATE     | YES       | Canada pre-construction                 |
| registration_date       | DATE     | YES       | Land registry registration              |

#### unit_lease_info

Lease and assignment rights per unit.

| **Column**                  | **Type**      | **Null?** | **Constraints / Notes** |
|-----------------------------|---------------|-----------|-------------------------|
| id                          | UUID          | NO        | PK                      |
| unit_id                     | UUID          | NO        | FK → units.id, UNIQUE   |
| right_to_lease              | ENUM          | YES       | yes, no, conditional    |
| unit_leased                 | ENUM          | YES       | yes, no, unknown        |
| lease_start_date            | DATE          | YES       |                         |
| lease_end_date              | DATE          | YES       |                         |
| monthly_lease_amount        | DECIMAL(15,2) | YES       |                         |
| tenant_name                 | VARCHAR(255)  | YES       |                         |
| limited_right_assignment    | ENUM          | YES       | yes, no, conditional    |
| assignment_fee              | DECIMAL(15,2) | YES       |                         |
| assignment_consent_required | BOOLEAN       | YES       |                         |

## Buyer & KYC Tables

#### buyers [JSONB]

Buyer profiles. Supports individual, joint, corporate, trust types.

| **Column**           | **Type**     | **Null?** | **Constraints / Notes**                              |
|----------------------|--------------|-----------|------------------------------------------------------|
| id                   | UUID         | NO        | PK                                                   |
| buyer_type           | ENUM         | NO        | individual, joint, corporate, trust                  |
| first_name           | VARCHAR(100) | NO        |                                                      |
| middle_name          | VARCHAR(100) | YES       |                                                      |
| last_name            | VARCHAR(100) | NO        |                                                      |
| date_of_birth        | DATE         | YES       | Required for individuals                             |
| nationality          | VARCHAR(3)   | NO        | ISO 3166-1 alpha-3                                   |
| residency_status     | ENUM         | NO        | resident, non_resident, foreign_national             |
| email                | VARCHAR(255) | NO        |                                                      |
| phone                | VARCHAR(30)  | NO        | With country code                                    |
| alternate_phone      | VARCHAR(30)  | YES       |                                                      |
| mailing_address      | TEXT         | NO        | Full address                                         |
| tax_id_usa           | VARCHAR(20)  | YES       | SSN or ITIN, encrypted                               |
| sin_canada           | VARCHAR(20)  | YES       | Encrypted                                            |
| pan_india            | VARCHAR(10)  | YES       | Format: AAAAA9999A                                   |
| aadhaar_india        | VARCHAR(12)  | YES       | 12-digit, encrypted                                  |
| passport_number      | VARCHAR(50)  | YES       | For non-residents                                    |
| company_name         | VARCHAR(255) | YES       | If corporate                                         |
| company_registration | VARCHAR(100) | YES       | CIN / Corp Number / EIN                              |
| authorized_signatory | VARCHAR(255) | YES       |                                                      |
| kyc_verified         | BOOLEAN      | NO        | Default false, must be true before sale confirmation |
| aml_flag             | BOOLEAN      | NO        | Default false, auto-set by compliance rules          |
| notes                | TEXT         | YES       |                                                      |
| compliance_metadata  | JSONB        | YES       | FINTRAC KYC fields, RERA details, etc.               |

#### joint_buyers

Links co-buyers to a primary buyer for joint purchases.

| **Column**           | **Type**     | **Null?** | **Constraints / Notes**               |
|----------------------|--------------|-----------|---------------------------------------|
| id                   | UUID         | NO        | PK                                    |
| primary_buyer_id     | UUID         | NO        | FK → buyers.id                        |
| co_buyer_id          | UUID         | NO        | FK → buyers.id                        |
| ownership_percentage | DECIMAL(5,2) | NO        | Must sum to 100% across all co-buyers |
| is_primary           | BOOLEAN      | NO        | Only one true per group               |

#### kyc_documents

Identity and address proof documents uploaded for buyers.

| **Column**    | **Type**     | **Null?** | **Constraints / Notes**                         |
|---------------|--------------|-----------|-------------------------------------------------|
| id            | UUID         | NO        | PK                                              |
| buyer_id      | UUID         | NO        | FK → buyers.id                                  |
| document_type | ENUM         | NO        | id_proof, address_proof, photo, tax_form, other |
| file_url      | VARCHAR(500) | NO        | S3 presigned URL                                |
| file_name     | VARCHAR(255) | NO        | Original filename                               |
| verified      | BOOLEAN      | NO        | Default false                                   |
| verified_by   | UUID         | YES       | FK → users.id                                   |
| verified_at   | TIMESTAMPTZ  | YES       |                                                 |

#### nsf_events

Non-Sufficient Funds (bounced payment) history per buyer.

| **Column**          | **Type**      | **Null?** | **Constraints / Notes**                         |
|---------------------|---------------|-----------|-------------------------------------------------|
| id                  | UUID          | NO        | PK                                              |
| buyer_id            | UUID          | NO        | FK → buyers.id                                  |
| sale_id             | UUID          | NO        | FK → sales.id                                   |
| installment_id      | UUID          | YES       | FK → installments.id                            |
| payment_reference   | VARCHAR(100)  | NO        | Original check/payment ref                      |
| payment_method      | ENUM          | NO        | check, ach, eft, pre_auth_debit, echeck, upi    |
| original_amount     | DECIMAL(15,2) | NO        |                                                 |
| nsf_date            | DATE          | NO        |                                                 |
| bank_name           | VARCHAR(255)  | YES       |                                                 |
| bank_reason_code    | VARCHAR(50)   | YES       | e.g., R01, R09                                  |
| fine_amount         | DECIMAL(15,2) | NO        |                                                 |
| fine_calc_method    | ENUM          | NO        | flat_fee, percentage, per_property              |
| fine_status         | ENUM          | NO        | pending, invoiced, paid, waived, in_collections |
| fine_paid_date      | DATE          | YES       |                                                 |
| fine_payment_ref    | VARCHAR(100)  | YES       |                                                 |
| fine_waiver_reason  | TEXT          | YES       | Required if waived                              |
| fine_approved_by    | UUID          | NO        | FK → users.id                                   |
| resubmission_date   | DATE          | YES       |                                                 |
| resubmission_status | ENUM          | YES       | pending, cleared, returned_again                |
| notes               | TEXT          | YES       |                                                 |
| yardi_sync_status   | ENUM          | NO        | not_synced, synced, error                       |

#### nsf_configs

NSF fine rules per property or global.

| **Column**                   | **Type**      | **Null?** | **Constraints / Notes**                                           |
|------------------------------|---------------|-----------|-------------------------------------------------------------------|
| id                           | UUID          | NO        | PK                                                                |
| property_id                  | UUID          | YES       | FK → properties.id, NULL = global default                         |
| default_fine_amount          | DECIMAL(15,2) | NO        | Flat fee per NSF                                                  |
| fine_percentage              | DECIMAL(5,2)  | YES       | Alternative: % of bounced amount                                  |
| fine_calc_method             | ENUM          | NO        | flat_fee, percentage                                              |
| grace_period_days            | INTEGER       | NO        | Default 5                                                         |
| max_events_before_escalation | INTEGER       | NO        | Default 3                                                         |
| auto_escalation_action       | ENUM          | NO        | none, flag_buyer, block_payments, notify_manager, trigger_default |

## Broker & Commission Tables

#### brokers

Broker and brokerage firm profiles.

| **Column**               | **Type**     | **Null?** | **Constraints / Notes**                        |
|--------------------------|--------------|-----------|------------------------------------------------|
| id                       | UUID         | NO        | PK                                             |
| broker_type              | ENUM         | NO        | individual, firm                               |
| name                     | VARCHAR(255) | NO        | Legal name                                     |
| license_number           | VARCHAR(100) | NO        |                                                |
| license_state_province   | VARCHAR(100) | NO        |                                                |
| license_expiry           | DATE         | NO        | Auto-alert 30 days before                      |
| tax_id                   | VARCHAR(50)  | NO        | EIN/SSN/BN/SIN/PAN/GSTIN, encrypted            |
| email                    | VARCHAR(255) | NO        |                                                |
| phone                    | VARCHAR(30)  | NO        |                                                |
| bank_name                | VARCHAR(255) | NO        |                                                |
| bank_account_number      | VARCHAR(100) | NO        | Encrypted                                      |
| routing_transit_ifsc     | VARCHAR(50)  | NO        |                                                |
| payment_method           | ENUM         | NO        | wire, check, ach, eft, neft_rtgs               |
| tax_form_url             | VARCHAR(500) | YES       | W-9, T4A, Form 16A                             |
| commission_agreement_url | VARCHAR(500) | NO        | Signed agreement                               |
| status                   | ENUM         | NO        | active, inactive, suspended, terminated        |
| parent_firm_id           | UUID         | YES       | FK → brokers.id (self-ref for firm membership) |

#### commission_configs

Flexible commission structures per broker/firm/property/deal.

| **Column**             | **Type**      | **Null?** | **Constraints / Notes**                                                                                  |
|------------------------|---------------|-----------|----------------------------------------------------------------------------------------------------------|
| id                     | UUID          | NO        | PK                                                                                                       |
| broker_id              | UUID          | YES       | FK → brokers.id (NULL = property-wide default)                                                           |
| property_id            | UUID          | YES       | FK → properties.id (NULL = all properties)                                                               |
| model                  | ENUM          | NO        | flat_pct, tiered_pct, flat_fee, hybrid, split, override, tiered_value, gci_cap, team_cascade, buyer_paid |
| commission_basis       | ENUM          | NO        | sale_price, net_sale_price, custom                                                                       |
| rate                   | DECIMAL(8,4)  | YES       | Percentage (e.g., 3.0000 for 3%)                                                                         |
| flat_amount            | DECIMAL(15,2) | YES       | Flat fee amount                                                                                          |
| tiers                  | JSONB         | YES       | Array of {min, max, rate} for tiered models                                                              |
| split_firm_pct         | DECIMAL(5,2)  | YES       | Firm share percentage                                                                                    |
| split_agent_pct        | DECIMAL(5,2)  | YES       | Agent share percentage                                                                                   |
| override_rate          | DECIMAL(5,2)  | YES       | Override to managing broker                                                                              |
| gci_cap_amount         | DECIMAL(15,2) | YES       | Annual GCI cap before split shift                                                                        |
| gci_post_cap_agent_pct | DECIMAL(5,2)  | YES       | Agent % after cap reached                                                                                |
| cascade_config         | JSONB         | YES       | { franchise_fee_pct, brokerage_split, team_split, lead_source_rules }                                    |
| effective_from         | DATE          | NO        |                                                                                                          |
| effective_to           | DATE          | YES       | NULL = no end date                                                                                       |
| priority               | INTEGER       | NO        | Higher priority wins on conflicts                                                                        |

## Sales & Commission Transaction Tables

#### sales [JSONB]

Core sale transaction records. One row per unit sale.

| **Column**              | **Type**      | **Null?** | **Constraints / Notes**                                                    |
|-------------------------|---------------|-----------|----------------------------------------------------------------------------|
| id                      | UUID          | NO        | PK                                                                         |
| property_id             | UUID          | NO        | FK → properties.id                                                         |
| unit_id                 | UUID          | NO        | FK → units.id                                                              |
| buyer_id                | UUID          | NO        | FK → buyers.id                                                             |
| broker_id               | UUID          | YES       | FK → brokers.id                                                            |
| sale_date               | DATE          | NO        | Agreement execution date                                                   |
| agreement_type          | ENUM          | NO        | sale_deed, agreement_to_sell, purchase_agreement                           |
| sale_price              | DECIMAL(15,2) | NO        | Total agreed amount                                                        |
| currency                | ENUM          | NO        | USD, CAD, INR                                                              |
| discount_amount         | DECIMAL(15,2) | YES       | Default 0                                                                  |
| net_sale_price          | DECIMAL(15,2) | NO        | Calculated: sale_price - discount                                          |
| stamp_duty              | DECIMAL(15,2) | YES       |                                                                            |
| registration_fee        | DECIMAL(15,2) | YES       |                                                                            |
| gst_hst_tax             | DECIMAL(15,2) | YES       |                                                                            |
| total_transaction_value | DECIMAL(15,2) | NO        | Calculated: net + taxes + fees                                             |
| payment_terms           | TEXT          | YES       |                                                                            |
| sale_document_url       | VARCHAR(500)  | NO        | S3 URL                                                                     |
| status                  | ENUM          | NO        | draft, pending_review, confirmed, cancelled, completed                     |
| source                  | ENUM          | NO        | manual, ai_extraction                                                      |
| compliance_metadata     | JSONB         | YES       | Country-specific: ucd_closing_data, fintrac_receipt_of_funds, rera_details |

#### commissions

Calculated commission records per sale.

| **Column**            | **Type**      | **Null?** | **Constraints / Notes**                    |
|-----------------------|---------------|-----------|--------------------------------------------|
| id                    | UUID          | NO        | PK                                         |
| sale_id               | UUID          | NO        | FK → sales.id                              |
| broker_id             | UUID          | NO        | FK → brokers.id                            |
| commission_config_id  | UUID          | NO        | FK → commission_configs.id                 |
| commission_basis      | ENUM          | NO        | sale_price, net_sale_price, custom         |
| basis_amount          | DECIMAL(15,2) | NO        | The amount used for calculation            |
| rate_applied          | DECIMAL(8,4)  | YES       |                                            |
| gross_commission      | DECIMAL(15,2) | NO        |                                            |
| split_to_firm         | DECIMAL(15,2) | YES       |                                            |
| split_to_agent        | DECIMAL(15,2) | YES       |                                            |
| override_amount       | DECIMAL(15,2) | YES       |                                            |
| tax_withholding       | DECIMAL(15,2) | NO        | TDS (India), withholding (USA/Canada)      |
| net_payable           | DECIMAL(15,2) | NO        | gross - tax_withholding                    |
| status                | ENUM          | NO        | pending, approved, paid, on_hold, disputed |
| payment_due_date      | DATE          | YES       |                                            |
| calculation_breakdown | JSONB         | NO        | Full calculation trace for audit           |

#### commission_payments

Actual payment records for broker commissions (payables).

| **Column**             | **Type**      | **Null?** | **Constraints / Notes**                        |
|------------------------|---------------|-----------|------------------------------------------------|
| id                     | UUID          | NO        | PK                                             |
| commission_id          | UUID          | NO        | FK → commissions.id                            |
| broker_id              | UUID          | NO        | FK → brokers.id                                |
| amount                 | DECIMAL(15,2) | NO        |                                                |
| currency               | ENUM          | NO        | USD, CAD, INR                                  |
| payment_method         | ENUM          | NO        | wire, check, ach, eft, neft_rtgs               |
| payment_date           | DATE          | NO        |                                                |
| reference_number       | VARCHAR(100)  | YES       |                                                |
| bank_account_last4     | VARCHAR(4)    | YES       |                                                |
| tax_withholding_amount | DECIMAL(15,2) | YES       |                                                |
| invoice_number         | VARCHAR(100)  | YES       |                                                |
| status                 | ENUM          | NO        | scheduled, processing, completed, failed, void |
| yardi_sync_status      | ENUM          | NO        | not_synced, synced, error                      |
| yardi_transaction_id   | VARCHAR(100)  | YES       |                                                |
| approved_by            | UUID          | NO        | FK → users.id                                  |
| notes                  | TEXT          | YES       |                                                |

## Payment (Receivables) Tables

#### payment_schedules

Buyer payment schedule (receivables) per sale.

| **Column**            | **Type**      | **Null?** | **Constraints / Notes**               |
|-----------------------|---------------|-----------|---------------------------------------|
| id                    | UUID          | NO        | PK                                    |
| sale_id               | UUID          | NO        | FK → sales.id                         |
| buyer_id              | UUID          | NO        | FK → buyers.id                        |
| total_sale_amount     | DECIMAL(15,2) | NO        |                                       |
| down_payment_amount   | DECIMAL(15,2) | NO        |                                       |
| down_payment_due_date | DATE          | YES       |                                       |
| num_installments      | INTEGER       | NO        |                                       |
| frequency             | ENUM          | NO        | monthly, quarterly, milestone, custom |
| installment_amount    | DECIMAL(15,2) | YES       | For equal installments                |
| interest_rate         | DECIMAL(5,4)  | YES       |                                       |
| interest_method       | ENUM          | YES       | actual_360, actual_365, thirty_360    |
| status                | ENUM          | NO        | draft, active, completed, defaulted   |
| source                | ENUM          | NO        | manual, ai_generated                  |

#### installments

Individual installment records within a payment schedule.

| **Column**           | **Type**      | **Null?** | **Constraints / Notes**                              |
|----------------------|---------------|-----------|------------------------------------------------------|
| id                   | UUID          | NO        | PK                                                   |
| schedule_id          | UUID          | NO        | FK → payment_schedules.id                            |
| installment_number   | INTEGER       | NO        | Sequence (1, 2, 3...)                                |
| due_date             | DATE          | NO        |                                                      |
| amount_due           | DECIMAL(15,2) | NO        |                                                      |
| amount_received      | DECIMAL(15,2) | NO        | Default 0                                            |
| receipt_date         | DATE          | YES       |                                                      |
| payment_method       | ENUM          | YES       | wire, check, ach, upi, neft, credit_card             |
| receipt_reference    | VARCHAR(100)  | YES       |                                                      |
| late_fee             | DECIMAL(15,2) | YES       |                                                      |
| status               | ENUM          | NO        | upcoming, due, paid, overdue, partially_paid, waived |
| milestone_id         | UUID          | YES       | FK → construction_milestones.id (India CLP)          |
| yardi_sync_status    | ENUM          | NO        | not_synced, synced, error                            |
| yardi_transaction_id | VARCHAR(100)  | YES       |                                                      |

## AI Document Intelligence Tables

#### documents

Uploaded sale documents for AI processing.

| **Column**              | **Type**     | **Null?** | **Constraints / Notes**                                             |
|-------------------------|--------------|-----------|---------------------------------------------------------------------|
| id                      | UUID         | NO        | PK                                                                  |
| sale_id                 | UUID         | YES       | FK → sales.id (linked after extraction)                             |
| property_id             | UUID         | YES       |                                                                     |
| file_url                | VARCHAR(500) | NO        | S3 URL                                                              |
| file_name               | VARCHAR(255) | NO        |                                                                     |
| file_type               | ENUM         | NO        | pdf, image, docx                                                    |
| page_count              | INTEGER      | YES       |                                                                     |
| country                 | ENUM         | YES       | Detected or specified                                               |
| document_type           | ENUM         | YES       | closing_disclosure, purchase_agreement, rera_agreement, etc.        |
| processing_status       | ENUM         | NO        | uploaded, processing, extracted, review_pending, approved, rejected |
| processing_started_at   | TIMESTAMPTZ  | YES       |                                                                     |
| processing_completed_at | TIMESTAMPTZ  | YES       |                                                                     |

#### ai_extractions

AI extraction results per document.

| **Column**       | **Type**     | **Null?** | **Constraints / Notes**                         |
|------------------|--------------|-----------|-------------------------------------------------|
| id               | UUID         | NO        | PK                                              |
| document_id      | UUID         | NO        | FK → documents.id                               |
| model_version    | VARCHAR(50)  | NO        | Model version used                              |
| field_name       | VARCHAR(100) | NO        | e.g., buyer_name, sale_price, broker_license    |
| extracted_value  | TEXT         | YES       | Raw extracted text                              |
| normalized_value | TEXT         | YES       | Cleaned/formatted value                         |
| confidence       | DECIMAL(5,4) | NO        | 0.0000 to 1.0000                                |
| bounding_box     | JSONB        | YES       | { page, x, y, width, height } normalized 0-1000 |
| status           | ENUM         | NO        | extracted, confirmed, corrected, rejected       |
| corrected_value  | TEXT         | YES       | If user corrected                               |
| corrected_by     | UUID         | YES       | FK → users.id                                   |
| corrected_at     | TIMESTAMPTZ  | YES       |                                                 |

#### ai_corrections

Paired training data for the self-learning pipeline.

| **Column**       | **Type**     | **Null?** | **Constraints / Notes**                             |
|------------------|--------------|-----------|-----------------------------------------------------|
| id               | UUID         | NO        | PK                                                  |
| extraction_id    | UUID         | NO        | FK → ai_extractions.id                              |
| document_id      | UUID         | NO        | FK → documents.id                                   |
| field_name       | VARCHAR(100) | NO        |                                                     |
| original_value   | TEXT         | YES       | What AI extracted                                   |
| corrected_value  | TEXT         | NO        | What human verified                                 |
| original_bbox    | JSONB        | YES       | Original bounding box                               |
| corrected_bbox   | JSONB        | YES       | Corrected bounding box                              |
| document_type    | VARCHAR(50)  | NO        | Template/format identifier                          |
| image_region_url | VARCHAR(500) | YES       | Cropped image of relevant area                      |
| used_in_training | BOOLEAN      | NO        | Default false, set true when consumed by retraining |

#### model_versions

Model registry for versioning and rollback.

| **Column**          | **Type**     | **Null?** | **Constraints / Notes**                               |
|---------------------|--------------|-----------|-------------------------------------------------------|
| id                  | UUID         | NO        | PK                                                    |
| version             | VARCHAR(20)  | NO        | e.g., v1.0, v1.1, v2.0                                |
| status              | ENUM         | NO        | training, candidate, production, retired, rolled_back |
| training_data_count | INTEGER      | NO        | Number of samples used                                |
| precision           | DECIMAL(5,4) | YES       | Evaluation metric                                     |
| recall              | DECIMAL(5,4) | YES       |                                                       |
| f1_score            | DECIMAL(5,4) | YES       |                                                       |
| promoted_at         | TIMESTAMPTZ  | YES       | When moved to production                              |
| model_artifact_url  | VARCHAR(500) | NO        | S3 path to model weights                              |

## Yardi Integration & Inventory Tables

#### yardi_sync_logs

Log of every Yardi sync attempt for payables/receivables.

| **Column**           | **Type**     | **Null?** | **Constraints / Notes**                         |
|----------------------|--------------|-----------|-------------------------------------------------|
| id                   | UUID         | NO        | PK                                              |
| sync_type            | ENUM         | NO        | payable, receivable, inventory                  |
| direction            | ENUM         | NO        | push, pull                                      |
| entity_type          | VARCHAR(50)  | NO        | commission_payment, installment, property, unit |
| entity_id            | UUID         | NO        | Polymorphic FK                                  |
| status               | ENUM         | NO        | pending, success, error, retrying               |
| error_message        | TEXT         | YES       |                                                 |
| retry_count          | INTEGER      | NO        | Default 0                                       |
| yardi_transaction_id | VARCHAR(100) | YES       |                                                 |
| payload              | JSONB        | YES       | Sent/received data snapshot                     |
| synced_at            | TIMESTAMPTZ  | YES       |                                                 |

#### yardi_vendor_map

Maps Upward brokers to Yardi vendor codes.

| **Column**        | **Type**     | **Null?** | **Constraints / Notes** |
|-------------------|--------------|-----------|-------------------------|
| id                | UUID         | NO        | PK                      |
| broker_id         | UUID         | NO        | FK → brokers.id, UNIQUE |
| yardi_vendor_code | VARCHAR(50)  | NO        |                         |
| yardi_vendor_name | VARCHAR(255) | YES       |                         |

#### yardi_property_map

Maps Upward properties to Yardi property/entity codes.

| **Column**          | **Type**    | **Null?** | **Constraints / Notes**                 |
|---------------------|-------------|-----------|-----------------------------------------|
| id                  | UUID        | NO        | PK                                      |
| property_id         | UUID        | NO        | FK → properties.id, UNIQUE              |
| yardi_property_code | VARCHAR(50) | NO        |                                         |
| yardi_entity_code   | VARCHAR(50) | YES       |                                         |
| gl_code_commissions | VARCHAR(50) | NO        | GL code for commission expenses         |
| gl_code_revenue     | VARCHAR(50) | NO        | GL code for sale revenue                |
| consolidation_flag  | BOOLEAN     | NO        | Consolidate multiple payouts per broker |
| ap_accrual_code     | VARCHAR(50) | YES       | Liability account mapping               |

#### yardi_inventory_properties

Read-only mirror of Yardi property inventory.

| **Column**               | **Type**      | **Null?** | **Constraints / Notes** |
|--------------------------|---------------|-----------|-------------------------|
| id                       | UUID          | NO        | PK                      |
| yardi_property_code      | VARCHAR(50)   | NO        | UNIQUE                  |
| property_name            | VARCHAR(255)  | NO        |                         |
| property_type            | VARCHAR(50)   | NO        |                         |
| full_address             | TEXT          | NO        |                         |
| country                  | ENUM          | NO        | USA, CAN, IND           |
| total_units              | INTEGER       | NO        |                         |
| available_units          | INTEGER       | NO        |                         |
| reserved_units           | INTEGER       | NO        |                         |
| sold_units               | INTEGER       | NO        |                         |
| property_status          | ENUM          | NO        | active, inactive        |
| developer_name           | VARCHAR(255)  | YES       |                         |
| year_built_or_completion | VARCHAR(10)   | YES       |                         |
| total_inventory_value    | DECIMAL(18,2) | YES       | Sum of list prices      |
| last_synced_at           | TIMESTAMPTZ   | NO        |                         |

#### yardi_inventory_units

Read-only mirror of Yardi unit inventory.

| **Column**          | **Type**      | **Null?** | **Constraints / Notes**                         |
|---------------------|---------------|-----------|-------------------------------------------------|
| id                  | UUID          | NO        | PK                                              |
| yardi_property_id   | UUID          | NO        | FK → yardi_inventory_properties.id              |
| yardi_unit_code     | VARCHAR(50)   | NO        | UNIQUE                                          |
| unit_number         | VARCHAR(50)   | NO        |                                                 |
| unit_type           | VARCHAR(50)   | NO        |                                                 |
| floor_number        | INTEGER       | YES       |                                                 |
| area_sqft           | DECIMAL(10,2) | YES       |                                                 |
| list_price          | DECIMAL(15,2) | YES       |                                                 |
| price_per_sqft      | DECIMAL(10,2) | YES       |                                                 |
| status              | ENUM          | NO        | available, reserved, sold, blocked, under_offer |
| bedroom_count       | INTEGER       | YES       |                                                 |
| bathroom_count      | INTEGER       | YES       |                                                 |
| parking_included    | BOOLEAN       | YES       |                                                 |
| view_orientation    | VARCHAR(100)  | YES       |                                                 |
| last_status_change  | TIMESTAMPTZ   | YES       |                                                 |
| days_on_market      | INTEGER       | YES       | Calculated                                      |
| previous_sale_price | DECIMAL(15,2) | YES       |                                                 |
| last_synced_at      | TIMESTAMPTZ   | NO        |                                                 |

#### inventory_sync_jobs

Tracks each inventory sync execution.

| **Column**        | **Type**    | **Null?** | **Constraints / Notes**             |
|-------------------|-------------|-----------|-------------------------------------|
| id                | UUID        | NO        | PK                                  |
| sync_method       | ENUM        | NO        | api, csv, manual                    |
| status            | ENUM        | NO        | running, completed, failed, partial |
| records_processed | INTEGER     | NO        |                                     |
| records_created   | INTEGER     | NO        |                                     |
| records_updated   | INTEGER     | NO        |                                     |
| records_errored   | INTEGER     | NO        |                                     |
| started_at        | TIMESTAMPTZ | NO        |                                     |
| completed_at      | TIMESTAMPTZ | YES       |                                     |
| error_details     | JSONB       | YES       |                                     |

#### inventory_change_log

Delta changes per sync cycle.

| **Column**  | **Type**     | **Null?** | **Constraints / Notes**     |
|-------------|--------------|-----------|-----------------------------|
| id          | UUID         | NO        | PK                          |
| sync_job_id | UUID         | NO        | FK → inventory_sync_jobs.id |
| entity_type | ENUM         | NO        | property, unit              |
| entity_id   | UUID         | NO        |                             |
| field_name  | VARCHAR(100) | NO        |                             |
| old_value   | TEXT         | YES       |                             |
| new_value   | TEXT         | YES       |                             |

## Lifecycle Module Tables (Module 11)

#### fincen_reports

FinCEN 2026 Residential Real Estate Rule tracking (USA).

| **Column**              | **Type**     | **Null?** | **Constraints / Notes**                              |
|-------------------------|--------------|-----------|------------------------------------------------------|
| id                      | UUID         | NO        | PK                                                   |
| sale_id                 | UUID         | NO        | FK → sales.id                                        |
| triggered               | BOOLEAN      | NO        | Auto-set when entity buyer + cash payment            |
| beneficial_owners       | JSONB        | NO        | Array of { name, id_type, id_number, ownership_pct } |
| entity_type             | ENUM         | NO        | llc, trust, corporation, partnership, other          |
| source_of_funds         | TEXT         | YES       |                                                      |
| source_of_funds_doc_url | VARCHAR(500) | YES       |                                                      |
| status                  | ENUM         | NO        | not_required, pending, filed, acknowledged           |
| filing_reference        | VARCHAR(100) | YES       |                                                      |
| filing_date             | DATE         | YES       |                                                      |

#### tarion_registrations

Tarion 45-day warranty registration tracking (Canada/Ontario).

| **Column**              | **Type**      | **Null?** | **Constraints / Notes**                              |
|-------------------------|---------------|-----------|------------------------------------------------------|
| id                      | UUID          | NO        | PK                                                   |
| sale_id                 | UUID          | NO        | FK → sales.id                                        |
| unit_id                 | UUID          | NO        | FK → units.id                                        |
| tarion_home_id          | VARCHAR(50)   | NO        | Auto-generated                                       |
| registration_code       | VARCHAR(50)   | YES       | Issued upon registration                             |
| registration_deadline   | DATE          | NO        | contract_date + 45 days                              |
| registration_status     | ENUM          | NO        | not_started, pending, registered, expired, escalated |
| warranty_coverage_start | DATE          | YES       | Typically possession date                            |
| warranty_1yr_expiry     | DATE          | YES       | Coverage start + 1 year                              |
| warranty_2yr_expiry     | DATE          | YES       | Coverage start + 2 years                             |
| warranty_7yr_expiry     | DATE          | YES       | Coverage start + 7 years                             |
| enrollment_fee          | DECIMAL(15,2) | YES       |                                                      |
| bulletin_19_compliant   | BOOLEAN       | YES       |                                                      |

#### rera_account_configs

India RERA 3-Account system per property.

| **Column**                 | **Type**     | **Null?** | **Constraints / Notes**    |
|----------------------------|--------------|-----------|----------------------------|
| id                         | UUID         | NO        | PK                         |
| property_id                | UUID         | NO        | FK → properties.id, UNIQUE |
| collection_account_bank    | VARCHAR(255) | NO        |                            |
| collection_account_number  | VARCHAR(50)  | NO        | Encrypted                  |
| collection_account_ifsc    | VARCHAR(20)  | NO        |                            |
| separate_account_bank      | VARCHAR(255) | NO        | 70% ring-fenced            |
| separate_account_number    | VARCHAR(50)  | NO        | Encrypted                  |
| separate_account_ifsc      | VARCHAR(20)  | NO        |                            |
| transaction_account_bank   | VARCHAR(255) | NO        | 30% operations             |
| transaction_account_number | VARCHAR(50)  | NO        | Encrypted                  |
| transaction_account_ifsc   | VARCHAR(20)  | NO        |                            |

#### unit_upgrades

Buyer-requested change orders / upgrades.

| **Column**               | **Type**      | **Null?** | **Constraints / Notes**                                                 |
|--------------------------|---------------|-----------|-------------------------------------------------------------------------|
| id                       | UUID          | NO        | PK                                                                      |
| unit_id                  | UUID          | NO        | FK → units.id                                                           |
| buyer_id                 | UUID          | NO        | FK → buyers.id                                                          |
| sale_id                  | UUID          | YES       | FK → sales.id                                                           |
| category                 | ENUM          | NO        | structural, electrical, plumbing, finishes, fixtures, appliances, other |
| description              | TEXT          | NO        |                                                                         |
| selected_option          | VARCHAR(255)  | YES       |                                                                         |
| cost                     | DECIMAL(15,2) | NO        |                                                                         |
| payment_status           | ENUM          | NO        | unpaid, paid, refunded                                                  |
| payment_date             | DATE          | YES       |                                                                         |
| payment_reference        | VARCHAR(100)  | YES       |                                                                         |
| procore_stage_at_request | VARCHAR(50)   | YES       | Auto from Procore                                                       |
| procore_work_order_id    | VARCHAR(50)   | YES       |                                                                         |
| status                   | ENUM          | NO        | requested, approved, in_progress, completed, cancelled                  |
| closing_statement_line   | BOOLEAN       | NO        | Default true                                                            |

#### closing_statements

Auto-generated financial reconciliation at closing.

| **Column**        | **Type**      | **Null?** | **Constraints / Notes**     |
|-------------------|---------------|-----------|-----------------------------|
| id                | UUID          | NO        | PK                          |
| sale_id           | UUID          | NO        | FK → sales.id, UNIQUE       |
| total_debits      | DECIMAL(15,2) | NO        | Sum of all buyer charges    |
| total_credits     | DECIMAL(15,2) | NO        | Sum of all credits/deposits |
| net_cash_to_close | DECIMAL(15,2) | NO        | debits - credits            |
| status            | ENUM          | NO        | draft, finalized            |
| generated_pdf_url | VARCHAR(500)  | YES       | S3 URL to PDF               |
| finalized_by      | UUID          | YES       | FK → users.id               |
| finalized_at      | TIMESTAMPTZ   | YES       |                             |

#### closing_line_items

Individual debit/credit entries on a closing statement.

| **Column**           | **Type**      | **Null?** | **Constraints / Notes**                                        |
|----------------------|---------------|-----------|----------------------------------------------------------------|
| id                   | UUID          | NO        | PK                                                             |
| closing_statement_id | UUID          | NO        | FK → closing_statements.id                                     |
| line_type            | ENUM          | NO        | debit, credit                                                  |
| category             | VARCHAR(100)  | NO        | contract_price, upgrade, deposit, tax, fee, credit, adjustment |
| description          | VARCHAR(255)  | NO        | Human-readable line description                                |
| amount               | DECIMAL(15,2) | NO        | Always positive; type determines sign                          |
| source_entity        | VARCHAR(50)   | YES       | Table/field this was sourced from                              |
| source_id            | UUID          | YES       | FK to source record                                            |
| sort_order           | INTEGER       | NO        | Display order on statement                                     |

#### deposit_interest

Interest on Deposit calculation (Canada).

| **Column**           | **Type**      | **Null?** | **Constraints / Notes**                      |
|----------------------|---------------|-----------|----------------------------------------------|
| id                   | UUID          | NO        | PK                                           |
| sale_id              | UUID          | NO        | FK → sales.id                                |
| deposit_amount       | DECIMAL(15,2) | NO        |                                              |
| interest_rate        | DECIMAL(8,6)  | NO        | Annual rate                                  |
| deposit_held_from    | DATE          | NO        |                                              |
| deposit_held_to      | DATE          | YES       | Auto-set on closing                          |
| accrued_interest     | DECIMAL(15,2) | NO        | Calculated                                   |
| calculation_method   | ENUM          | NO        | simple, compound_semi, provincial_prescribed |
| loan_approval_status | ENUM          | YES       | pending, approved, declined, waived          |
| lender_name          | VARCHAR(255)  | YES       |                                              |
| pre_approval_expiry  | DATE          | YES       |                                              |

#### pdi_inspections

Pre-Delivery Inspection records.

| **Column**            | **Type**     | **Null?** | **Constraints / Notes** |
|-----------------------|--------------|-----------|-------------------------|
| id                    | UUID         | NO        | PK                      |
| unit_id               | UUID         | NO        | FK → units.id           |
| sale_id               | UUID         | NO        | FK → sales.id           |
| buyer_id              | UUID         | NO        | FK → buyers.id          |
| inspection_date       | DATE         | NO        |                         |
| inspector_name        | VARCHAR(255) | YES       |                         |
| total_defects         | INTEGER      | NO        | Calculated count        |
| critical_count        | INTEGER      | NO        | Calculated              |
| all_critical_resolved | BOOLEAN      | NO        | Gate condition          |

#### pdi_defects

Individual defect items from a PDI.

| **Column**        | **Type**     | **Null?** | **Constraints / Notes**                                                                                       |
|-------------------|--------------|-----------|---------------------------------------------------------------------------------------------------------------|
| id                | UUID         | NO        | PK                                                                                                            |
| pdi_id            | UUID         | NO        | FK → pdi_inspections.id                                                                                       |
| category          | ENUM         | NO        | structural, plumbing, electrical, hvac, finishes, fixtures, paint, flooring, windows_doors, appliances, other |
| severity          | ENUM         | NO        | critical, major, minor, observation                                                                           |
| description       | TEXT         | NO        |                                                                                                               |
| location          | VARCHAR(255) | YES       | Room/area                                                                                                     |
| photo_urls        | TEXT\[\]     | YES       | Array of S3 URLs                                                                                              |
| resolution_status | ENUM         | NO        | open, in_progress, resolved, disputed, deferred_warranty                                                      |
| resolution_date   | DATE         | YES       |                                                                                                               |
| resolution_notes  | TEXT         | YES       |                                                                                                               |
| assigned_to       | VARCHAR(255) | YES       |                                                                                                               |
| is_warranty_claim | BOOLEAN      | NO        | Default false; true for post-possession claims                                                                |

#### possession_gate_log

Tracks pass/fail of each possession condition.

| **Column**                | **Type**      | **Null?** | **Constraints / Notes**       |
|---------------------------|---------------|-----------|-------------------------------|
| id                        | UUID          | NO        | PK                            |
| unit_id                   | UUID          | NO        | FK → units.id                 |
| oc_uploaded               | BOOLEAN       | NO        | Occupancy Certificate present |
| oc_document_url           | VARCHAR(500)  | YES       |                               |
| balance_due_zero          | BOOLEAN       | NO        | All payments received         |
| outstanding_balance       | DECIMAL(15,2) | YES       | Remaining amount if not zero  |
| critical_snags_resolved   | BOOLEAN       | NO        | All critical defects resolved |
| unresolved_critical_count | INTEGER       | YES       |                               |
| gate_passed               | BOOLEAN       | NO        | All three conditions met      |
| possession_transferred_at | TIMESTAMPTZ   | YES       |                               |
| transferred_by            | UUID          | YES       | FK → users.id                 |

#### warranty_periods

Auto-calculated warranty periods per unit from possession.

| **Column**                   | **Type** | **Null?** | **Constraints / Notes**    |
|------------------------------|----------|-----------|----------------------------|
| id                           | UUID     | NO        | PK                         |
| unit_id                      | UUID     | NO        | FK → units.id              |
| country                      | ENUM     | NO        | USA, CAN, IND              |
| possession_date              | DATE     | NO        |                            |
| materials_labour_expiry      | DATE     | YES       | 1yr (Canada)               |
| mechanical_electrical_expiry | DATE     | YES       | 2yr (Canada)               |
| structural_expiry            | DATE     | YES       | 7yr (Canada), 5yr (India)  |
| tarion_year_end_form_due     | DATE     | YES       | Canada: 30 days before 1yr |

#### warranty_claims

Post-possession defect claims during warranty.

| **Column**         | **Type** | **Null?** | **Constraints / Notes**                       |
|--------------------|----------|-----------|-----------------------------------------------|
| id                 | UUID     | NO        | PK                                            |
| unit_id            | UUID     | NO        | FK → units.id                                 |
| warranty_period_id | UUID     | NO        | FK → warranty_periods.id                      |
| claim_date         | DATE     | NO        |                                               |
| category           | ENUM     | NO        | Same as pdi_defects categories                |
| severity           | ENUM     | NO        | critical, major, minor                        |
| description        | TEXT     | NO        |                                               |
| photo_urls         | TEXT\[\] | YES       |                                               |
| status             | ENUM     | NO        | open, in_progress, resolved, disputed, denied |
| resolution_date    | DATE     | YES       |                                               |
| resolution_notes   | TEXT     | YES       |                                               |

## Analytics & System Tables

#### analytics_aggregations

Pre-computed daily/monthly rollups for dashboard KPIs.

| **Column**              | **Type**      | **Null?** | **Constraints / Notes**                       |
|-------------------------|---------------|-----------|-----------------------------------------------|
| id                      | UUID          | NO        | PK                                            |
| period_type             | ENUM          | NO        | daily, monthly, quarterly, yearly             |
| period_date             | DATE          | NO        | First day of period                           |
| dimension_type          | ENUM          | NO        | property, country, broker, unit_type, overall |
| dimension_value         | VARCHAR(100)  | NO        | Property ID, country code, broker ID, etc.    |
| total_revenue           | DECIMAL(18,2) | NO        |                                               |
| units_sold              | INTEGER       | NO        |                                               |
| avg_sale_price          | DECIMAL(15,2) | NO        |                                               |
| avg_days_to_close       | DECIMAL(8,2)  | YES       |                                               |
| total_commissions       | DECIMAL(18,2) | NO        |                                               |
| outstanding_receivables | DECIMAL(18,2) | NO        |                                               |
| collection_rate         | DECIMAL(5,4)  | NO        | Amount received / amount due                  |
| inventory_available     | INTEGER       | YES       |                                               |
| inventory_value         | DECIMAL(18,2) | YES       |                                               |
| absorption_rate         | DECIMAL(5,4)  | YES       | Units sold / total available                  |

#### dashboard_configs

User-specific dashboard personalization.

| **Column**      | **Type** | **Null?** | **Constraints / Notes**               |
|-----------------|----------|-----------|---------------------------------------|
| id              | UUID     | NO        | PK                                    |
| user_id         | UUID     | NO        | FK → users.id, UNIQUE                 |
| pinned_widgets  | JSONB    | YES       | Array of widget IDs                   |
| default_filters | JSONB    | YES       | { country, property_ids, date_range } |
| saved_views     | JSONB    | YES       | Named filter presets                  |

#### scheduled_reports

User-configured recurring report delivery.

| **Column**  | **Type**     | **Null?** | **Constraints / Notes**                |
|-------------|--------------|-----------|----------------------------------------|
| id          | UUID         | NO        | PK                                     |
| user_id     | UUID         | NO        | FK → users.id                          |
| report_type | VARCHAR(100) | NO        | e.g., sales_summary, receivables_aging |
| filters     | JSONB        | NO        | Saved filter state                     |
| format      | ENUM         | NO        | pdf, excel, csv                        |
| frequency   | ENUM         | NO        | daily, weekly, monthly                 |
| recipients  | TEXT\[\]     | NO        | Array of email addresses               |
| next_run_at | TIMESTAMPTZ  | NO        |                                        |
| last_run_at | TIMESTAMPTZ  | YES       |                                        |
| status      | ENUM         | NO        | active, paused, deleted                |

#### audit_logs

Immutable audit trail for every data mutation.

| **Column**   | **Type**     | **Null?** | **Constraints / Notes**            |
|--------------|--------------|-----------|------------------------------------|
| id           | UUID         | NO        | PK                                 |
| entity_type  | VARCHAR(50)  | NO        | Table name                         |
| entity_id    | UUID         | NO        | Row ID                             |
| action       | ENUM         | NO        | create, read, update, delete       |
| old_value    | JSONB        | YES       | Previous state (for update/delete) |
| new_value    | JSONB        | YES       | New state (for create/update)      |
| user_id      | UUID         | NO        | FK → users.id                      |
| ip_address   | INET         | YES       |                                    |
| user_agent   | VARCHAR(500) | YES       |                                    |
| performed_at | TIMESTAMPTZ  | NO        | Default now()                      |

#### migration_records

Legacy data migration tracking (Migration Buddy).

| **Column**        | **Type**     | **Null?** | **Constraints / Notes** |
|-------------------|--------------|-----------|-------------------------|
| id                | UUID         | NO        | PK                      |
| batch_id          | UUID         | NO        | Import batch identifier |
| entity_type       | VARCHAR(50)  | NO        | Target table            |
| entity_id         | UUID         | YES       | Created record ID       |
| legacy_system_id  | VARCHAR(100) | NO        | Original ID from legacy |
| source_data       | JSONB        | NO        | Raw imported data       |
| validation_status | ENUM         | NO        | passed, warning, failed |
| validation_errors | JSONB        | YES       | Array of error messages |
| imported_at       | TIMESTAMPTZ  | NO        |                         |

## Database Indexes & Materialized Views

The following indexes and materialized views are critical for performance:

### REQUIRED INDEXES

| **Table**              | **Index**                     | **Type**                                         | **Purpose**                    |
|------------------------|-------------------------------|--------------------------------------------------|--------------------------------|
| sales                  | idx_sales_property_date       | BTREE (property_id, sale_date)                   | Dashboard date-range queries   |
| sales                  | idx_sales_status              | BTREE (status)                                   | Filter by sale status          |
| sales                  | idx_sales_buyer               | BTREE (buyer_id)                                 | Buyer sale history             |
| sales                  | idx_sales_broker              | BTREE (broker_id)                                | Broker performance queries     |
| installments           | idx_installments_due          | BTREE (due_date, status)                         | Overdue payment queries        |
| installments           | idx_installments_schedule     | BTREE (schedule_id)                              | Schedule lookups               |
| commissions            | idx_commissions_broker_status | BTREE (broker_id, status)                        | Broker commission queries      |
| ai_extractions         | idx_extractions_doc           | BTREE (document_id)                              | Document extraction lookups    |
| ai_extractions         | idx_extractions_confidence    | BTREE (confidence)                               | Low-confidence exception queue |
| audit_logs             | idx_audit_entity              | BTREE (entity_type, entity_id)                   | Entity audit trail             |
| audit_logs             | idx_audit_date                | BTREE (performed_at)                             | Date-range audit queries       |
| nsf_events             | idx_nsf_buyer                 | BTREE (buyer_id)                                 | Buyer NSF history              |
| yardi_inventory_units  | idx_inv_units_status          | BTREE (status)                                   | Inventory status queries       |
| yardi_inventory_units  | idx_inv_units_prop            | BTREE (yardi_property_id)                        | Property inventory             |
| analytics_aggregations | idx_agg_period                | BTREE (period_type, period_date, dimension_type) | Dashboard KPI queries          |

### MATERIALIZED VIEWS

- mv_sales_summary: Pre-computed daily/monthly sales totals by property, country, broker. Refresh: every 5 minutes via pg_cron.

- mv_partner_rankings: Top brokers/firms ranked by revenue, units, commission. Refresh: hourly.

- mv_inventory_status: Current inventory availability by property with days-on-market. Refresh: on inventory sync completion.

- mv_receivables_aging: Outstanding buyer payments bucketed by 30/60/90/120+ days. Refresh: every 15 minutes.

- mv_yoy_comparison: Year-over-year metrics by month for revenue, units, avg price. Refresh: daily.

# Complete API Endpoint Specification

All endpoints follow RESTful conventions. Base URL: /api/v1. All responses use the envelope: { success: boolean, data: T, error?: string, meta?: { page, limit, total } }. Authentication via Bearer JWT. Rate limit: 1000 req/min per user; 100 req/min for AI endpoints.

## Authentication & Users

| **Endpoint**               | **Description**                               | **Method** | **Auth**    |
|----------------------------|-----------------------------------------------|------------|-------------|
| POST /auth/login           | Authenticate user, return JWT + refresh token | POST       | Public      |
| POST /auth/refresh         | Refresh JWT using refresh token               | POST       | Public      |
| POST /auth/mfa/setup       | Generate TOTP secret and QR code              | POST       | Bearer      |
| POST /auth/mfa/verify      | Verify TOTP code                              | POST       | Bearer      |
| POST /auth/logout          | Invalidate session                            | POST       | Bearer      |
| POST /auth/forgot-password | Send password reset email                     | POST       | Public      |
| POST /auth/reset-password  | Reset password with token                     | POST       | Public      |
| GET /users                 | List all users (paginated)                    | GET        | Super Admin |
| POST /users                | Create new user                               | POST       | Super Admin |
| GET /users/:id             | Get user by ID                                | GET        | Super Admin |
| PUT /users/:id             | Update user                                   | PUT        | Super Admin |
| PATCH /users/:id/status    | Activate/deactivate user                      | PATCH      | Super Admin |
| GET /users/me              | Get current user profile                      | GET        | Bearer      |

## Properties & Units

| **Endpoint**                  | **Description**                                             | **Method** | **Auth**    |
|-------------------------------|-------------------------------------------------------------|------------|-------------|
| GET /properties               | List properties (filterable by country, status, search)     | GET        | All roles   |
| POST /properties              | Create new property                                         | POST       | Admin+      |
| GET /properties/:id           | Get property detail with unit summary                       | GET        | All roles   |
| PUT /properties/:id           | Update property                                             | PUT        | Admin+      |
| DELETE /properties/:id        | Soft-delete property                                        | DELETE     | Super Admin |
| GET /properties/:id/units     | List units for property (filterable by status, type, floor) | GET        | All roles   |
| POST /properties/:id/units    | Create unit                                                 | POST       | Admin+      |
| GET /units/:id                | Get unit detail (includes fees, closing, dates, lease)      | GET        | All roles   |
| PUT /units/:id                | Update unit                                                 | PUT        | Admin+      |
| PATCH /units/:id/status       | Change unit status (Available/Reserved/Sold/Blocked)        | PATCH      | Sales+      |
| GET /units/:id/fees           | Get unit fee structure                                      | GET        | All roles   |
| PUT /units/:id/fees           | Create or update unit fees                                  | PUT        | Admin+      |
| GET /units/:id/closing-info   | Get closing info                                            | GET        | All roles   |
| PUT /units/:id/closing-info   | Create or update closing info                               | PUT        | Admin+      |
| GET /units/:id/critical-dates | Get critical dates                                          | GET        | All roles   |
| PUT /units/:id/critical-dates | Create or update critical dates                             | PUT        | Admin+      |
| GET /units/:id/lease-info     | Get lease info                                              | GET        | All roles   |
| PUT /units/:id/lease-info     | Create or update lease info                                 | PUT        | Admin+      |

## Buyers

| **Endpoint**                                  | **Description**                                            | **Method** | **Auth** |
|-----------------------------------------------|------------------------------------------------------------|------------|----------|
| GET /buyers                                   | List buyers (search, filter by type, KYC status, country)  | GET        | Sales+   |
| POST /buyers                                  | Create buyer profile                                       | POST       | Sales+   |
| GET /buyers/:id                               | Get buyer detail (includes KYC, NSF summary, sale history) | GET        | Sales+   |
| PUT /buyers/:id                               | Update buyer                                               | PUT        | Sales+   |
| POST /buyers/:id/kyc-documents                | Upload KYC document                                        | POST       | Sales+   |
| PATCH /buyers/:id/kyc-documents/:docId/verify | Mark KYC doc as verified                                   | PATCH      | Finance+ |
| PATCH /buyers/:id/kyc-status                  | Set buyer KYC verified flag                                | PATCH      | Finance+ |
| GET /buyers/:id/joint-buyers                  | Get co-buyers for joint purchase                           | GET        | Sales+   |
| POST /buyers/:id/joint-buyers                 | Add co-buyer                                               | POST       | Sales+   |
| GET /buyers/:id/nsf-events                    | List NSF events for buyer                                  | GET        | Finance+ |
| POST /buyers/:id/nsf-events                   | Record new NSF event                                       | POST       | Finance+ |
| GET /nsf-events/:id                           | Get NSF event detail                                       | GET        | Finance+ |
| PATCH /nsf-events/:id                         | Update NSF event (resubmission, notes)                     | PATCH      | Finance+ |
| PATCH /nsf-events/:id/fine                    | Pay or waive fine                                          | PATCH      | Finance+ |
| GET /properties/:id/nsf-config                | Get NSF configuration for property                         | GET        | Admin+   |
| PUT /properties/:id/nsf-config                | Set NSF fine rules for property                            | PUT        | Admin+   |

## Sales

| **Endpoint**            | **Description**                                                          | **Method** | **Auth** |
|-------------------------|--------------------------------------------------------------------------|------------|----------|
| GET /sales              | List sales (filterable by property, buyer, broker, status, date, source) | GET        | Sales+   |
| POST /sales             | Create manual sale record (draft)                                        | POST       | Sales+   |
| GET /sales/:id          | Get sale detail (includes commission, schedule, compliance)              | GET        | Sales+   |
| PUT /sales/:id          | Update sale record                                                       | PUT        | Sales+   |
| PATCH /sales/:id/status | Advance sale status (draft → pending → confirmed → completed)            | PATCH      | Sales+   |
| POST /sales/:id/cancel  | Cancel sale with reason                                                  | POST       | Admin+   |

## Brokers & Commissions

| **Endpoint**                          | **Description**                                                 | **Method** | **Auth** |
|---------------------------------------|-----------------------------------------------------------------|------------|----------|
| GET /brokers                          | List brokers (search, filter by type, status, license)          | GET        | Sales+   |
| POST /brokers                         | Create broker profile                                           | POST       | Admin+   |
| GET /brokers/:id                      | Get broker detail (includes commission config, sales, payments) | GET        | Sales+   |
| PUT /brokers/:id                      | Update broker                                                   | PUT        | Admin+   |
| GET /brokers/:id/commission-configs   | Get commission structures for broker                            | GET        | Sales+   |
| POST /brokers/:id/commission-configs  | Create commission config                                        | POST       | Admin+   |
| PUT /commission-configs/:id           | Update commission config                                        | PUT        | Admin+   |
| GET /commissions                      | List commissions (filter by broker, status, property, date)     | GET        | Finance+ |
| GET /commissions/:id                  | Get commission detail with calculation breakdown                | GET        | Finance+ |
| PATCH /commissions/:id/status         | Approve, hold, dispute commission                               | PATCH      | Finance+ |
| POST /commissions/:id/payments        | Create commission payment                                       | POST       | Finance+ |
| GET /commission-payments              | List all commission payments                                    | GET        | Finance+ |
| PATCH /commission-payments/:id/status | Update payment status                                           | PATCH      | Finance+ |

## Payment Schedules & Installments

| **Endpoint**                            | **Description**                                | **Method** | **Auth** |
|-----------------------------------------|------------------------------------------------|------------|----------|
| GET /payment-schedules                  | List schedules (filter by buyer, sale, status) | GET        | Finance+ |
| POST /payment-schedules                 | Create payment schedule                        | POST       | Finance+ |
| GET /payment-schedules/:id              | Get schedule with all installments             | GET        | Finance+ |
| PUT /payment-schedules/:id              | Update schedule                                | PUT        | Finance+ |
| GET /payment-schedules/:id/installments | List installments                              | GET        | Finance+ |
| PATCH /installments/:id                 | Record payment against installment             | PATCH      | Finance+ |
| POST /installments/:id/send-reminder    | Send payment reminder email to buyer           | POST       | Finance+ |

## AI Document Engine

| **Endpoint**                     | **Description**                                               | **Method** | **Auth**    |
|----------------------------------|---------------------------------------------------------------|------------|-------------|
| POST /ai/documents               | Upload document(s) for AI processing (multipart)              | POST       | Sales+      |
| GET /ai/documents                | List uploaded documents with processing status                | GET        | Sales+      |
| GET /ai/documents/:id            | Get document detail with extraction results                   | GET        | Sales+      |
| GET /ai/extractions/:id          | Get extraction detail for review                              | GET        | Sales+      |
| PATCH /ai/extractions/:id        | Correct extraction field (triggers correction log)            | PATCH      | Sales+      |
| POST /ai/extractions/:id/approve | Approve extraction, create sale/commission/schedule records   | POST       | Sales+      |
| POST /ai/extractions/:id/reject  | Reject extraction with reason                                 | POST       | Sales+      |
| GET /ai/metrics                  | AI performance dashboard data (accuracy, corrections, trends) | GET        | Admin+      |
| GET /ai/models                   | List model versions with evaluation metrics                   | GET        | Admin+      |
| POST /ai/models/retrain          | Trigger manual retraining                                     | POST       | Super Admin |

## Yardi Integration

| **Endpoint**                                     | **Description**                            | **Method** | **Auth** |
|--------------------------------------------------|--------------------------------------------|------------|----------|
| POST /integrations/yardi/sync                    | Trigger payables/receivables sync to Yardi | POST       | Finance+ |
| GET /integrations/yardi/sync                     | Get sync status and history                | GET        | Finance+ |
| GET /integrations/yardi/sync/:id                 | Get specific sync job detail               | GET        | Finance+ |
| POST /integrations/yardi/sync/:id/retry          | Retry failed sync records                  | POST       | Finance+ |
| GET /integrations/yardi/vendor-map               | List broker-to-Yardi vendor mappings       | GET        | Admin+   |
| PUT /integrations/yardi/vendor-map/:brokerId     | Set Yardi vendor code for broker           | PUT        | Admin+   |
| GET /integrations/yardi/property-map             | List property-to-Yardi mappings            | GET        | Admin+   |
| PUT /integrations/yardi/property-map/:propertyId | Set Yardi codes and GL mappings            | PUT        | Admin+   |
| POST /integrations/yardi/generate-csv            | Generate FinPayables CSV for batch         | POST       | Finance+ |

## Inventory (Yardi Mirror)

| **Endpoint**                        | **Description**                              | **Method** | **Auth**  |
|-------------------------------------|----------------------------------------------|------------|-----------|
| GET /inventory/properties           | List synced inventory properties (read-only) | GET        | All roles |
| GET /inventory/properties/:id       | Get inventory property detail                | GET        | All roles |
| GET /inventory/properties/:id/units | List inventory units (filterable)            | GET        | All roles |
| POST /inventory/sync                | Trigger inventory sync from Yardi            | POST       | Admin+    |
| GET /inventory/sync                 | Get sync job history                         | GET        | Admin+    |
| GET /inventory/changelog            | Get delta changes per sync                   | GET        | Admin+    |

## Analytics Dashboard

| **Endpoint**                            | **Description**                                                     | **Method** | **Auth**  |
|-----------------------------------------|---------------------------------------------------------------------|------------|-----------|
| GET /analytics/kpis                     | Executive KPIs (revenue, units, commissions, receivables, etc.)     | GET        | All roles |
| GET /analytics/sales                    | Sales performance chart data (trends, velocity, pipeline, price)    | GET        | All roles |
| GET /analytics/inventory                | Inventory analytics (portfolio overview, aging, heatmap, forecast)  | GET        | All roles |
| GET /analytics/partners                 | Top partner rankings with performance metrics                       | GET        | All roles |
| GET /analytics/yoy                      | Year-over-year comparison data                                      | GET        | All roles |
| GET /analytics/financial                | Financial overview (receivables aging, cash flow, commission ratio) | GET        | Finance+  |
| POST /analytics/export                  | Export dashboard view as PDF/Excel/CSV/PNG                          | POST       | All roles |
| GET /analytics/scheduled-reports        | List user scheduled reports                                         | GET        | All roles |
| POST /analytics/scheduled-reports       | Create scheduled report                                             | POST       | All roles |
| PUT /analytics/scheduled-reports/:id    | Update scheduled report                                             | PUT        | All roles |
| DELETE /analytics/scheduled-reports/:id | Delete scheduled report                                             | DELETE     | All roles |
| GET /analytics/dashboard-config         | Get user dashboard personalization                                  | GET        | All roles |
| PUT /analytics/dashboard-config         | Save pinned widgets and default filters                             | PUT        | All roles |

## Lifecycle Module (Module 11)

| **Endpoint**                               | **Description**                          | **Method** | **Auth** |
|--------------------------------------------|------------------------------------------|------------|----------|
| GET /sales/:id/fincen-report               | Get FinCEN report status for sale        | GET        | Sales+   |
| POST /sales/:id/fincen-report              | Create FinCEN report                     | POST       | Sales+   |
| PATCH /sales/:id/fincen-report             | Update FinCEN report (file, acknowledge) | PATCH      | Sales+   |
| GET /sales/:id/tarion                      | Get Tarion registration for sale         | GET        | Sales+   |
| POST /sales/:id/tarion                     | Create Tarion registration               | POST       | Sales+   |
| PATCH /sales/:id/tarion                    | Update Tarion registration status        | PATCH      | Sales+   |
| GET /properties/:id/rera-accounts          | Get RERA 3-account config                | GET        | Admin+   |
| PUT /properties/:id/rera-accounts          | Configure RERA accounts                  | PUT        | Admin+   |
| GET /units/:id/upgrades                    | List upgrades for unit                   | GET        | Sales+   |
| POST /units/:id/upgrades                   | Create upgrade/change order              | POST       | Sales+   |
| PUT /upgrades/:id                          | Update upgrade                           | PUT        | Sales+   |
| DELETE /upgrades/:id                       | Cancel upgrade                           | DELETE     | Sales+   |
| GET /units/:id/construction-stage          | Get current Procore construction stage   | GET        | Sales+   |
| GET /sales/:id/closing-statement           | Generate/get closing statement           | GET        | Finance+ |
| POST /sales/:id/closing-statement/finalize | Finalize closing statement, generate PDF | POST       | Finance+ |
| GET /sales/:id/deposit-interest            | Calculate/get IOD                        | GET        | Finance+ |
| PATCH /sales/:id/deposit-interest          | Update IOD parameters                    | PATCH      | Finance+ |
| GET /units/:id/pdi                         | List PDI inspections for unit            | GET        | Sales+   |
| POST /units/:id/pdi                        | Create PDI inspection                    | POST       | Sales+   |
| GET /pdi/:id/defects                       | List defects for PDI                     | GET        | Sales+   |
| POST /pdi/:id/defects                      | Add defect item                          | POST       | Sales+   |
| PATCH /defects/:id                         | Update defect status/resolution          | PATCH      | Sales+   |
| GET /units/:id/possession-check            | Run possession gate validation           | GET        | Sales+   |
| POST /units/:id/possession-transfer        | Execute possession transfer              | POST       | Admin+   |
| GET /units/:id/warranty                    | Get warranty periods and claims          | GET        | Sales+   |
| POST /units/:id/warranty-claims            | File warranty claim                      | POST       | Sales+   |
| PATCH /warranty-claims/:id                 | Update warranty claim status             | PATCH      | Sales+   |

## Reports & Audit

| **Endpoint**         | **Description**                                          | **Method** | **Auth** |
|----------------------|----------------------------------------------------------|------------|----------|
| GET /reports/:type   | Generate report (sales_summary, receivables_aging, etc.) | GET        | Sales+   |
| POST /reports/export | Export report as PDF/Excel/CSV                           | POST       | Sales+   |
| GET /audit-logs      | Search audit trail (by entity, user, date, action)       | GET        | Auditor+ |

## Migration

| **Endpoint**                         | **Description**                                    | **Method** | **Auth**    |
|--------------------------------------|----------------------------------------------------|------------|-------------|
| POST /admin/migration/import         | Upload and trigger legacy data import              | POST       | Super Admin |
| GET /admin/migration/import/:batchId | Get import batch status and validation report      | GET        | Super Admin |
| POST /admin/migration/validate       | Run validation on imported data without committing | POST       | Super Admin |

# Frontend Pages & Components

Every page below must be implemented in Next.js App Router. Each page description includes the route, key components, API calls, and interactive behavior. All pages are protected by the RBAC middleware and render based on user role.

## Global Components

- AppShell: Left sidebar navigation (collapsible) + top header with user avatar, notifications bell, global search. Sidebar shows modules grouped by category, highlighted based on current route.

- DataTable: Reusable table component with sorting, filtering, pagination (cursor-based), column visibility toggle, row selection, bulk actions, CSV/Excel export button.

- FormBuilder: Dynamic form generator that reads field definitions and country rules to render the correct inputs, validations, and conditional fields per country.

- ConfirmDialog: Modal for destructive actions (delete, cancel sale, void payment).

- StatusBadge: Color-coded pills for all status enums (sale status, payment status, sync status, KYC, NSF risk).

- FileUpload: Drag-and-drop upload component with progress bar, file type validation, S3 presigned URL upload.

- SplitScreen: Resizable two-panel layout used for AI review screen (document left, form right).

- ChartCard: Wrapper for Recharts/ECharts with title, filter dropdowns, drill-down click handler, export button.

- KPICard: Large number display with trend arrow, period comparison, click to drill down.

- CountryFlag: Renders country flag icon next to property/buyer records.

- CurrencyDisplay: Formats currency per locale (USD \$1,000.00 / CAD C\$1,000.00 / INR ₹10,00,000.00).

- DateDisplay: Formats dates per country convention (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD).

## Page Inventory

### AUTHENTICATION

| **Route**        | **Page Description**                                                                      | **Key Components**      |
|------------------|-------------------------------------------------------------------------------------------|-------------------------|
| /login           | Email + password login form. MFA code step if enabled. Redirect to /dashboard on success. | LoginForm, MFACodeInput |
| /forgot-password | Email input, sends reset link.                                                            | ForgotPasswordForm      |
| /reset-password  | New password form with token validation.                                                  | ResetPasswordForm       |

### DASHBOARD & ANALYTICS

| **Route**            | **Page Description**                                                                                                                                                                                                                                                                                              | **Key Components**                                                                      |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| /dashboard           | Executive summary: KPI strip (revenue, units sold, inventory, avg price, days to close, commissions, receivables, collection rate). Below: Sales Trend Line, Sales by Country, Pipeline Funnel, Top 5 Partners mini-table. All charts interactive with drill-down. Global filters: country, property, date range. | KPIStrip, SalesTrendChart, CountryBarChart, PipelineFunnel, PartnerMiniTable, FilterBar |
| /dashboard/sales     | Deep sales analytics: Sales Trend Line (dual-axis), Sales Velocity/Absorption, Price Per SqFt scatter, Discount Analysis, Sale Source breakdown (Manual vs AI). Filters persist across tabs.                                                                                                                      | All chart components from Dashboard Section 2                                           |
| /dashboard/inventory | Inventory analytics: Portfolio Treemap, Inventory by Unit Type, Aging Report, Floor Heatmap, Price vs Inventory scatter, Forecast. Data from Yardi mirror.                                                                                                                                                        | TreemapChart, FloorHeatmap, AgingBarChart, ForecastWidget                               |
| /dashboard/partners  | Full partner leaderboard: Top 5/10/All toggle. Ranked table with sparklines. Partner comparison bar chart, trend lines, market share donut, conversion rate, commission efficiency.                                                                                                                               | LeaderboardTable, ComparisonChart, TrendLineChart, DonutChart                           |
| /dashboard/yoy       | Year-over-year: Dual-line revenue overlay, units sold side-by-side bars, avg price trend, growth summary table, seasonal heatmap, cumulative sales curve. Configurable comparison year.                                                                                                                           | YoYRevenueChart, YoYUnitsChart, GrowthTable, SeasonalHeatmap, CumulativeCurve           |
| /dashboard/financial | Financial overview: Revenue vs Collections, Commission Cost Ratio, Receivables Aging Waterfall, Tax Obligations, Cash Flow Projection (90-day).                                                                                                                                                                   | DualAxisChart, WaterfallChart, CashFlowTimeline                                         |

### PROPERTIES & UNITS

| **Route**             | **Page Description**                                                                                                                                                                          | **Key Components**                                                               |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| /properties           | Property list: DataTable with columns (Name, Type, City, Country, Total Units, Sold/Available ratio bar, Status badge). Filters: country, status, search. Click row → property detail.        | DataTable, CountryFlag, StatusBadge, ProgressBar                                 |
| /properties/:id       | Property detail: Header (name, address, status, key stats). Tabs: Units, Sales, Brokers, Compliance, Fees Config, Analytics. Units tab shows unit grid.                                       | PropertyHeader, TabNav, UnitGrid                                                 |
| /properties/:id/units | Unit grid view: Color-coded cards by status (green=Available, yellow=Reserved, red=Sold, gray=Blocked). Filter by floor, type, status. Click card → unit detail. Optional floor-plan overlay. | UnitGridView, FloorPlanOverlay, UnitCard                                         |
| /units/:id            | Unit detail: Tabbed view with General Info, Fees & Charges, Closing Info, Critical Dates, Lease Info, Sale History, Upgrades, PDI/Snags, Documents. Each tab is a form that saves via PUT.    | UnitDetailTabs, FeeForm, ClosingForm, DatesForm, LeaseForm, UpgradeList, PDIList |

### SALES

| **Route**  | **Page Description**                                                                                                                                                                                                                                                                                                                                                           | **Key Components**                                                                                 |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| /sales     | Sales list: DataTable with columns (Sale ID, Property, Unit, Buyer, Broker, Sale Price, Status, Date, Source). Filters: property, status, date range, source. Quick-action buttons for status transitions.                                                                                                                                                                     | DataTable, StatusBadge, QuickActions                                                               |
| /sales/new | Multi-step sale recording form: Step 1: Select property + unit (shows unit card with price/status). Step 2: Select or create buyer (search existing or inline create). Step 3: Select broker (optional). Step 4: Sale terms (price, discount, taxes auto-calculated by country). Step 5: Document upload. Step 6: Review & submit. Country-specific fields appear dynamically. | MultiStepForm, UnitSelector, BuyerSearch, BrokerSelector, TaxCalculator, FileUpload, ReviewSummary |
| /sales/:id | Sale detail: Header with key info. Tabs: Details, Commission, Payment Schedule, Compliance, Documents, Audit Trail. Compliance tab shows country-specific checklist (FIRPTA, FINTRAC, RERA).                                                                                                                                                                                   | SaleDetailHeader, TabNav, ComplianceChecklist, CommissionSummary, PaymentTimeline                  |

### AI DOCUMENT PROCESSING

| **Route**            | **Page Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                | **Key Components**                                                                              |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| /sales/ai-upload     | Document upload page: Large drag-and-drop zone. Batch upload support. Shows processing queue with status (Uploaded, Processing, Ready for Review). Property/country selector.                                                                                                                                                                                                                                                                                       | FileUpload, ProcessingQueue, PropertySelector                                                   |
| /sales/ai-review/:id | AI Review split-screen: LEFT: Document viewer (PDF/image) with zoomable pages. Color-coded bounding boxes overlaid on detected fields (green \>90%, yellow 70-90%, red \<70%). RIGHT: Extracted data form with confidence % per field. Click field → highlights bounding box on document. Click document area → assign to field. Approve/Correct/Reject actions per field. Bulk approve for high-confidence. Bottom: action bar (Approve All, Create Sale, Reject). | DocumentViewer, BoundingBoxOverlay, ExtractionForm, ConfidenceIndicator, FieldLinker, ActionBar |
| /ai/metrics          | AI performance dashboard: Accuracy trend line over time, most corrected fields bar chart, confidence calibration curve, processing time trend, per-template accuracy table, retraining cycle history.                                                                                                                                                                                                                                                               | AccuracyTrendChart, CorrectedFieldsBar, CalibrationCurve, TemplateAccuracyTable                 |

### BUYERS

| **Route**   | **Page Description**                                                                                                                                                                                               | **Key Components**                                                              |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| /buyers     | Buyer list: DataTable with NSF Risk Badge (Green/Yellow/Red) visible inline. Columns: Name, Type, Email, KYC Status, NSF Risk, Total Sales. Filters: KYC status, risk level, type, search.                         | DataTable, NSFRiskBadge, KYCStatusBadge                                         |
| /buyers/:id | Buyer profile: Header with contact info + NSF Risk Badge + KYC status. Tabs: Profile, KYC Documents, Purchase History, Payment Schedules, NSF History, Fines. NSF tab shows timeline of events with fine tracking. | BuyerHeader, TabNav, KYCDocList, PurchaseHistoryTable, NSFTimeline, FineTracker |
| /buyers/new | Buyer creation form: Dynamic fields based on buyer type (Individual/Joint/Corporate/Trust) and country. KYC document upload section. Joint buyer section to add co-buyers with ownership %.                        | DynamicBuyerForm, JointBuyerPanel, KYCUploader                                  |

### BROKERS & COMMISSIONS

| **Route**        | **Page Description**                                                                                                                                                                                | **Key Components**                                           |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| /brokers         | Broker list: DataTable with license expiry alerts (red badge if \<30 days). Columns: Name, Type, License, Status, Total Sales, Total Commission.                                                    | DataTable, LicenseExpiryAlert                                |
| /brokers/:id     | Broker profile: Header with key info. Tabs: Profile, Commission Config (shows all active commission structures with model type, rates, tiers), Sales History, Payment History, Performance Metrics. | BrokerHeader, CommissionConfigList, SalesTable, PaymentTable |
| /commissions     | Commission management: DataTable of all commissions. Filter by broker, status, property, date. Bulk approve action. Create payment action for approved commissions.                                 | DataTable, BulkApproveBar, CreatePaymentModal                |
| /commissions/:id | Commission detail: Full calculation breakdown showing how the commission was computed (which model, which rates, tier applied, split calculation). Payment history.                                 | CalculationBreakdown, PaymentHistoryTable                    |

### PAYMENTS

| **Route**               | **Page Description**                                                                                                                                                     | **Key Components**                                                         |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| /payments/payables      | Broker commission payments: DataTable of payment records. Filter by broker, status, date. Shows Yardi sync status. Batch payment creation.                               | DataTable, YardiSyncBadge, BatchPaymentModal                               |
| /payments/receivables   | Buyer installment tracking: DataTable of all installment records across all buyers. Filter by status (overdue, upcoming, due), buyer, property. Aging view toggle.       | DataTable, AgingToggle, RecordPaymentModal                                 |
| /payments/schedules/:id | Payment schedule detail: Visual timeline of installments with status indicators. NSF alert banner if buyer has NSF history. Record payment action. Send reminder action. | InstallmentTimeline, NSFAlertBanner, RecordPaymentForm, SendReminderButton |

### YARDI INTEGRATION & INVENTORY

| **Route**                   | **Page Description**                                                                                                                                                                                                              | **Key Components**                                                        |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| /integrations/yardi         | Yardi sync dashboard: Pending/Synced/Failed counts. Sync history table. Retry controls. Connection health check. Last sync timestamp. Manual trigger button.                                                                      | SyncStatusCards, SyncHistoryTable, RetryButton, HealthIndicator           |
| /integrations/yardi/mapping | Yardi mapping config: Two tables – Vendor Mapping (Broker → Yardi Vendor) and Property Mapping (Property → Yardi Code + GL codes). Inline editing.                                                                                | VendorMapTable, PropertyMapTable, InlineEditCell                          |
| /inventory                  | Inventory Explorer: Property list from Yardi mirror with availability stats (available/reserved/sold counts + progress bar). Click property → unit grid. Status filters, search, floor heatmap toggle. Days-on-market indicators. | InventoryPropertyList, InventoryUnitGrid, FloorHeatmap, DaysOnMarketBadge |
| /inventory/sync             | Inventory sync monitor: Last sync time per property. Record count comparison (Yardi vs Upward). Delta change log. Error queue with retry. Force-sync button.                                                                      | SyncMonitorTable, DeltaChangeLog, ErrorQueue, ForceSyncButton             |

### LIFECYCLE (MODULE 11)

| **Route**                    | **Page Description**                                                                                                                                                                                                   | **Key Components**                                            |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| /sales/:id/lifecycle         | Lifecycle tracker: Visual stepper showing progress through phases (Booking → Change Orders → Funding → Closing Statement → PDI → Possession → Warranty). Each phase expandable with status details.                    | LifecycleStepper, PhaseDetailPanel                            |
| /units/:id/upgrades          | Upgrade management: List of buyer upgrades with Procore stage gate indicator showing which categories are available/locked. Add upgrade form respects construction stage.                                              | UpgradeList, StageGateIndicator, AddUpgradeForm               |
| /sales/:id/closing-statement | Closing statement view: Auto-generated table of all debits and credits. Editable adjustment lines. Country-specific template (TRID CD / Statement of Adjustments / RERA format). Generate PDF button. Finalize action. | ClosingStatementTable, AdjustmentEditor, GeneratePDFButton    |
| /units/:id/pdi               | PDI inspection: Defect list with photo gallery per defect. Add defect form with category, severity, location, photo upload. Status tracking. Possession gate indicator at top (3 conditions with pass/fail).           | DefectList, DefectForm, PhotoGallery, PossessionGateIndicator |
| /units/:id/warranty          | Warranty dashboard: Warranty periods with countdown timers. Claims list. File new claim form. Tarion Year-End Form reminder (Canada).                                                                                  | WarrantyPeriodCards, ClaimsList, NewClaimForm                 |

### REPORTS & ADMIN

| **Route**        | **Page Description**                                                                                                                                              | **Key Components**                                  |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| /reports         | Reports hub: List of available report types with description. Click to configure filters and generate. Export options (PDF/Excel/CSV). Scheduled reports section. | ReportCatalog, ReportConfigForm, ScheduleReportForm |
| /admin/users     | User management: DataTable of all users. Create, edit, activate/deactivate. Role assignment. Property access assignment.                                          | UserDataTable, UserForm, RoleSelector               |
| /admin/config    | System configuration: Country tax rates, NSF defaults, commission defaults, Yardi connection settings, AI confidence thresholds, notification templates.          | ConfigTabs, TaxRateEditor, ThresholdSliders         |
| /admin/migration | Migration Buddy: Upload legacy data file. Run validation. View validation report (passed/warnings/failed). Commit import. Batch history.                          | FileUpload, ValidationReport, ImportProgress        |

# Business Logic & Calculation Formulas

Every calculation, rule, and workflow that the backend must implement. These are the core algorithms that make Upward work.

## Commission Calculation Engine

The commission engine is the most complex calculation in the system. It must support 10 distinct models and execute in the following order:

### COMMISSION CALCULATION ALGORITHM

1.  Resolve the applicable CommissionConfig: Search by (broker_id + property_id) first, then (broker_id + NULL property), then (NULL broker + property_id) for property default. Use highest priority if multiple match. Check effective_from/to date range.

2.  Determine the basis_amount: If basis = 'sale_price', use sale.sale_price. If 'net_sale_price', use sale.net_sale_price. If 'custom', use manually entered amount.

### MODEL-SPECIFIC CALCULATIONS

| **Model**             | **Formula / Logic**                                                                      | **Pseudocode**                                                                                                                     |
|-----------------------|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Flat Percentage       | Gross = basis_amount × rate                                                              | gross = basis \* (rate / 100)                                                                                                      |
| Tiered Percentage     | Each tier applies its rate to the amount within that band                                | for tier in tiers: applicable = min(basis, tier.max) - tier.min; gross += applicable \* tier.rate / 100                            |
| Flat Fee              | Gross = flat_amount (ignores sale price)                                                 | gross = flat_amount                                                                                                                |
| Hybrid                | Gross = flat_amount + (basis_amount × rate)                                              | gross = flat_amount + (basis \* rate / 100)                                                                                        |
| Split Commission      | Calculate gross first (using underlying model), then split between firm and agent        | firm_share = gross \* split_firm_pct / 100; agent_share = gross \* split_agent_pct / 100                                           |
| Override              | Additional amount to managing broker on top of agent commission                          | override = basis \* override_rate / 100 (added to firm/managing broker)                                                            |
| Tiered Property Value | Different rates on different price tranches (e.g., 7% on first \$100K, 2.5% on rest)     | Same logic as tiered percentage but tranches based on property value ranges                                                        |
| GCI Cap               | Track broker YTD GCI. Before cap: use standard split. After cap: shift to post-cap split | if broker_ytd_gci \< gci_cap: apply normal split; else: agent_pct = gci_post_cap_agent_pct                                         |
| Team Cascade          | Deduct franchise fee from gross, then apply brokerage split, then team split             | net1 = gross \* (1 - franchise_pct/100); firm = net1 \* firm_pct; net2 = net1 - firm; team_lead = net2 \* team_pct if team_sourced |
| Buyer-Paid (Post-NAR) | Separate from seller commission. Tracked independently as buyer expense.                 | buyer_commission = basis \* buyer_rate; stored in separate commission record with payer='buyer'                                    |

1.  After gross calculation, apply tax withholding: India TDS = 5% of gross commission if broker is resident, 20% if non-resident. USA = per W-9 backup withholding (28%) if missing. Canada = no automatic withholding.

2.  Net Commission Payable = Gross Commission - Tax Withholding

3.  Store full calculation_breakdown in JSONB: { model, basis_amount, rate, tiers_applied, gross, firm_share, agent_share, override, tax_rate, tax_amount, net_payable }

## Tax Calculation Engine

Tax calculations are triggered automatically when a sale is created or updated. The system applies country-specific rules based on the property location.

### USA TAX CALCULATIONS

- State Transfer Tax: Configurable per state. Formula: net_sale_price × state_transfer_tax_rate. Example: NY = 0.4%, CA = \$1.10 per \$1,000.

- FIRPTA Withholding: Auto-detect if buyer.residency_status = 'foreign_national'. Amount = sale_price × 15%. Generate FIRPTA notice document.

- 1099-S Data: For all completed sales, generate data export with seller name, SSN/EIN, sale proceeds, property address.

### CANADA TAX CALCULATIONS

- GST/HST on New Homes: Federal 5% GST + provincial HST where applicable. Ontario = 13% combined. BC = 5% GST only (12% on services). Quebec = 5% GST + 9.975% QST.

- Provincial Land Transfer Tax: Tiered calculation. Ontario example: 0.5% on first \$55,000 + 1% on \$55K-\$250K + 1.5% on \$250K-\$400K + 2% on \$400K-\$2M + 2.5% above \$2M. Toronto adds municipal LTT at same tiers.

- BC Property Transfer Tax: 1% on first \$200K + 2% on \$200K-\$2M + 3% above \$2M.

- Non-Resident Withholding: Section 116 = 25% of sale price. Auto-detect non-resident status.

- Foreign Buyer Ban Check: If buyer is non-citizen/non-PR AND property is residential AND foreign-controlled corp (3%+ foreign equity), BLOCK sale unless admin override with documentation.

### INDIA TAX CALCULATIONS

- Stamp Duty: Configurable per state. Maharashtra = 5% (6% Mumbai). Karnataka = 5%. Delhi = 4-6%. Formula: net_sale_price × state_stamp_duty_rate.

- Registration Charges: Typically 1% of property value. Formula: net_sale_price × 0.01.

- TDS (Section 194-IA): If sale_price \> INR 50,00,000 (50 lakh), TDS = 1% of total consideration. Generate Form 26QB data. Formula: if sale_price \> 5000000 then tds = sale_price × 0.01.

- GST on Under-Construction: If project has no OC: Affordable housing = 1%, Non-affordable = 5%. No ITC. Completed units with OC = 0% GST.

- RERA 70/30 Split: Every incoming payment auto-splits. 70% to Separate Account (construction), 30% to Transaction Account (operations). GL code routing enforced at DB layer.

- RERA 10% Advance Cap: System blocks deposit recording above 10% of unit price before agreement execution date. Formula: if deposit_total \> unit_base_price × 0.10 AND agreement_date is NULL, REJECT.

- RERA Delay Penalty: SBI MCLR + 2% annual interest on delayed possession. Formula: penalty = (sale_price × (sbi_mclr + 0.02) / 365) × days_delayed.

## Payment Schedule Generation

### NORTH AMERICAN FIXED AMORTIZATION

When the agreement specifies a financed purchase with interest:

- Actual/360: Daily rate = annual_rate / 360. Interest per period = balance × daily_rate × actual_days_in_period.

- Actual/365: Daily rate = annual_rate / 365. Interest per period = balance × daily_rate × actual_days_in_period.

- 30/360: Assumes 30-day months, 360-day year. Monthly rate = annual_rate / 12. Interest = balance × monthly_rate.

- Monthly Payment (standard): PMT = P × \[r(1+r)^n\] / \[(1+r)^n - 1\] where P = principal, r = period rate, n = total periods.

### INDIA RERA CONSTRUCTION-LINKED PLAN (CLP)

- Extract milestone events from payment annexure (e.g., '15% upon foundation slab completion'). Create conditional installment records linked to construction_milestones.

- When developer marks milestone complete in Procore: System triggers batch demand letter generation for all buyers in that construction phase. Each buyer gets an installment record with status changed from 'upcoming' to 'due'.

- Every payment received auto-splits 70/30: Record two GL entries – 70% to RERA Separate Account, 30% to Transaction Account.

### INTEREST ON DEPOSIT (IOD) CALCULATION – CANADA

- Simple Interest: IOD = deposit_amount × annual_rate × (days_held / 365)

- Compound Semi-Annual: IOD = deposit_amount × (1 + rate/2)^(2 × years) - deposit_amount

- Provincial Prescribed Rate: Use Bank of Canada overnight rate minus spread (per agreement). Recalculate on each rate change.

- IOD is credited to buyer at closing as a negative line item on the Statement of Adjustments.

## Closing Statement Auto-Assembly

The closing statement is auto-generated by pulling data from multiple source tables:

### FORMULA

**Net Cash to Close = (Contract Price + Upgrades + Taxes + Fees + Prorations) – (Deposits Paid + IOD Credits + Other Credits)**

### LINE ITEM SOURCES

| **Line Item**           | **Source Table/Field**                                  | **Type** |
|-------------------------|---------------------------------------------------------|----------|
| Contract Price          | sales.sale_price                                        | Debit    |
| Discount                | sales.discount_amount                                   | Credit   |
| Upgrades/Extras         | SUM(unit_upgrades.cost) WHERE payment_status = 'paid'   | Debit    |
| HST/GST/Sales Tax       | sales.gst_hst_tax (auto-calculated)                     | Debit    |
| Stamp Duty              | sales.stamp_duty (India)                                | Debit    |
| Registration Fee        | sales.registration_fee (India)                          | Debit    |
| State Transfer Tax      | Calculated per state rules (USA/Canada)                 | Debit    |
| Tarion Enrollment Fee   | unit_fees.tarion_enrollment_fee (Canada)                | Debit    |
| General Admin Fee       | unit_fees.general_admin_fee                             | Debit    |
| Realty Tax Proration    | unit_fees.realty_tax (prorated from closing date)       | Debit    |
| Utility Security        | unit_fees.utility_security                              | Debit    |
| Common Expense          | unit_fees.common_expense (first month/advance)          | Debit    |
| Deposits Paid           | SUM(installments.amount_received) WHERE status = 'paid' | Credit   |
| Interest on Deposits    | deposit_interest.accrued_interest (Canada)              | Credit   |
| Credit on Closing       | unit_closing_info.credit_on_closing                     | Credit   |
| Credit Deposit Interest | unit_closing_info.credit_deposit_interest               | Credit   |
| FinCEN Filing Fee       | If fincen_report.triggered (USA)                        | Debit    |
| Mortgage Discharge Fee  | unit_fees.mortgage_discharge_fee                        | Debit    |

## FINTRAC 24-Hour × $10K Rule (Canada)

The system must implement a 24-hour rolling aggregation algorithm per buyer entity:

1.  On every incoming payment from a buyer, query all payments from the same buyer_id within the last 24 hours.

2.  Sum the cash portion of those payments (cash, wire, EFT, pre-authorized debit).

3.  If the aggregate reaches or exceeds \$10,000 CAD: Auto-flag the transaction. Halt further payment processing for this buyer. Generate a Large Cash Transaction Report (LCTR) for mandatory human review and FINTRAC submission.

4.  The LCTR must capture: transaction date, total amount, cash portion, method of receipt, currency exchange rates (if foreign currency), full account details, and buyer identification.

## NSF Fine Calculation

- Flat Fee Method: fine_amount = nsf_config.default_fine_amount (e.g., \$250 USD, \$300 CAD, INR 2,000)

- Percentage Method: fine_amount = bounced_payment_amount × nsf_config.fine_percentage / 100

- Escalation Logic: Count buyer NSF events. If count \>= nsf_config.max_events_before_escalation, trigger auto_escalation_action (flag buyer / block payments / notify manager / trigger default notice).

- NSF Risk Badge: 0 events = Green, 1-2 = Yellow, 3+ = Red. Displayed on buyer profile header and in all buyer lists.

## Possession Gate Logic

Three mandatory conditions, ALL must be TRUE to enable possession transfer:

1.  OC Uploaded: Check possession_gate_log.oc_uploaded = true AND oc_document_url IS NOT NULL

2.  Balance Due Zero: Query payment_schedule + installments for the sale. Calculate: total_due = SUM(installments.amount_due) + SUM(unit_upgrades.cost WHERE paid). total_received = SUM(installments.amount_received). PASS only if total_received \>= total_due.

3.  Critical Snags Resolved: Query pdi_defects WHERE pdi_id = current PDI AND severity = 'critical'. Count WHERE resolution_status != 'resolved'. If count \> 0, FAIL.

## Analytics KPI Calculations

| **KPI**                   | **Formula**                                                                                   | **Refresh** |
|---------------------------|-----------------------------------------------------------------------------------------------|-------------|
| Total Revenue             | SUM(sales.net_sale_price) WHERE status IN ('confirmed','completed') AND sale_date IN period   | 5 min       |
| Units Sold                | COUNT(sales) WHERE status IN ('confirmed','completed') AND sale_date IN period                | 5 min       |
| Inventory Remaining       | COUNT(yardi_inventory_units) WHERE status = 'available'                                       | On sync     |
| Average Sale Price        | AVG(sales.net_sale_price) for confirmed/completed sales in period                             | 5 min       |
| Average Days to Close     | AVG(sales.sale_date - units.first_available_date) for completed sales                         | Daily       |
| Total Commissions Payable | SUM(commissions.net_payable) WHERE status IN ('pending','approved')                           | 5 min       |
| Outstanding Receivables   | SUM(installments.amount_due - installments.amount_received) WHERE status IN ('due','overdue') | 5 min       |
| Collection Rate           | (SUM received / SUM due) × 100 for current period installments                                | 5 min       |
| Absorption Rate           | (Units sold this month / Total available at month start) × 100                                | Daily       |
| Commission Cost Ratio     | (Total commissions / Total revenue) × 100                                                     | Daily       |
| YoY Revenue Growth        | ((Current year revenue - Prior year revenue) / Prior year revenue) × 100                      | Daily       |

## Yardi FinPayables CSV Generation

When commissions are approved for payment, the system generates a CSV file in Yardi FinPayables format:

| **CSV Column**  | **Source**                                                    | **Notes**                |
|-----------------|---------------------------------------------------------------|--------------------------|
| VendorCode      | yardi_vendor_map.yardi_vendor_code                            | Mapped from broker       |
| VendorName      | brokers.name                                                  |                          |
| VendorTaxID     | brokers.tax_id                                                | Decrypted at export time |
| InvoiceNumber   | commission_payments.invoice_number                            |                          |
| InvoiceDate     | commission_payments.payment_date                              | YYYY-MM-DD               |
| InvoiceAmount   | commission_payments.amount                                    | Decimal, 2 places        |
| DueDate         | commissions.payment_due_date                                  |                          |
| PropertyCode    | yardi_property_map.yardi_property_code                        |                          |
| UnitCode        | units.unit_number                                             |                          |
| GLAccount       | yardi_property_map.gl_code_commissions                        |                          |
| Description     | 'Commission: Sale ' + sales.id + ' Unit ' + units.unit_number |                          |
| ConsolidateFlag | yardi_property_map.consolidation_flag                         | Y or N                   |

# Sprint Delivery Plan

14-week plan to demo-ready product. Two-week sprints. Each sprint delivers testable, shippable functionality. Assumes a team of 2 frontend, 2-3 backend, 1 AI/ML, 1 DevOps, 1 QA.

## Sprint 1-2: Foundation (Weeks 1-4)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                                      | **Owner**        | **Acceptance Criteria**                                                                           |
|--------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------------------------------------------------------------------------------------------------|
| 1      | Sprint 1   | Project setup: monorepo, Next.js, NestJS, Prisma, PostgreSQL, Redis, Docker Compose. Auth module: login, JWT, refresh, logout, MFA setup/verify. User CRUD. RBAC middleware with 6 roles. Route guards on frontend. Seed script with demo users.                                      | Backend + DevOps | Login works with MFA. Role-based routes enforced. Swagger docs auto-generated.                    |
| 2      | Sprint 2   | Property CRUD with all fields + compliance_metadata JSONB. Unit CRUD with status management. Unit Fees, Closing Info, Critical Dates, Lease Info sub-resources. Country-aware form rendering (dynamic fields based on country). Property list page, unit grid page, unit detail tabs. | Full stack       | Create property in each country. Units show color-coded status. All sub-tabs save/load correctly. |

## Sprint 3-4: Buyers & Compliance (Weeks 5-8)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                      | **Owner**          | **Acceptance Criteria**                                                                                                                                               |
|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 3      | Sprint 3   | Buyer CRUD with all fields + JSONB. Joint buyer linking with ownership %. KYC document upload to S3 with verification flow. NSF event recording, fine calculation, risk badges. NSF config per property. Buyer list, profile, NSF timeline pages.                     | Full stack         | Create buyer of each type. KYC upload and verify works. NSF fine auto-calculates. Risk badge shows correctly.                                                         |
| 4      | Sprint 4   | Country compliance rules engine: tax rate configs, FIRPTA auto-detect, FINTRAC 24hr rule, RERA 10% cap, foreign buyer ban check. Tax calculation service (all formulas from Business Logic section). Compliance validation on sale creation. Compliance checklist UI. | Backend + Frontend | Create sale in each country: taxes auto-calculate. FIRPTA notice generated for foreign US buyer. RERA 10% cap blocks excess deposit. FINTRAC aggregation flags \$10K. |

## Sprint 5-6: Sales & Commissions (Weeks 9-12)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                              | **Owner**  | **Acceptance Criteria**                                                                                                   |
|--------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------|
| 5      | Sprint 5   | Sale transaction CRUD with multi-step form. Commission config for all 10 models. Commission calculation engine (full algorithm). Commission auto-generation on sale confirmation. Sales list, sale detail, sale recording form.                                               | Full stack | Record sale end-to-end. Commission auto-calculates for each model type. Calculation breakdown shows in detail view.       |
| 6      | Sprint 6   | Broker CRUD with license expiry alerts. Commission approval workflow (pending → approved → paid). Commission payment creation. Payment schedule generation (fixed amortization + milestone CLP). Installment tracking with payment recording. Payables and receivables pages. | Full stack | Approve commission, create payment. Generate buyer schedule. Record installment payment. Overdue items flagged correctly. |

## Sprint 7-8: AI Engine (Weeks 13-16)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                    | **Owner**     | **Acceptance Criteria**                                                                                                                                                        |
|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 7      | Sprint 7   | Document upload pipeline (S3 + BullMQ queue). OCR integration (AWS Textract). LLM extraction service (GPT-4o/Claude). Extraction results stored in ai_extractions with bounding boxes and confidence scores. AI upload page with processing queue.  | AI + Backend  | Upload PDF, OCR runs, LLM extracts fields. Results stored with confidence scores. Processing queue shows status updates.                                                       |
| 8      | Sprint 8   | AI review split-screen: document viewer with bounding box overlays. Extracted data form with confidence indicators. Field correction with correction logging. Approve flow: auto-create sale + commission + schedule records. AI metrics dashboard. | AI + Frontend | Review screen shows document with color-coded boxes. Correct a field: logs to ai_corrections. Approve: sale record created automatically. Metrics chart shows accuracy trends. |

## Sprint 9-10: Yardi Integration & Inventory (Weeks 17-20)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                           | **Owner**          | **Acceptance Criteria**                                                                                                                                           |
|--------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 9      | Sprint 9   | Yardi vendor/property mapping config. FinPayables CSV generation. Payables sync service (push to SFTP or manual download). Receivables sync. Sync logging and monitoring dashboard. Retry mechanism for failed syncs.                                                      | Backend + Frontend | Generate CSV in FinPayables format. Sync dashboard shows pending/success/failed. Retry works. CSV validates against Yardi schema.                                 |
| 10     | Sprint 10  | Yardi inventory pull service. Inventory mirror tables with change detection. Incremental sync with delta logging. Inventory explorer page with unit grid and floor heatmap. Sync monitor with force-sync. Procore construction stage API integration (for upgrade gating). | Backend + Frontend | Full inventory sync completes \<10 min. Incremental sync \<60 sec. Explorer shows real-time data. Delta log tracks changes. Procore stage shows in upgrade forms. |

## Sprint 11-12: Analytics Dashboard (Weeks 21-24)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                                                               | **Owner**          | **Acceptance Criteria**                                                                                                                             |
|--------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| 11     | Sprint 11  | Analytics data pipeline: materialized views (5 views), pg_cron refresh jobs. Redis caching for dashboard queries. KPI endpoint. Executive dashboard page with KPI strip + 4 primary charts. Sales performance charts (trends, velocity, pipeline funnel, price analysis). Interactive filters with drill-down. | Backend + Frontend | Dashboard loads \<3 sec. KPIs refresh within 5 min. Charts interactive with click drill-down. Filters persist.                                      |
| 12     | Sprint 12  | Partner leaderboard (Top 5/10/All with rankings). YoY comparison module (all 8 chart types). Financial overview (receivables aging, cash flow projection). Inventory analytics. Dashboard personalization (pin/unpin widgets, saved filters). Export engine (PDF/Excel/CSV). Scheduled reports.                | Full stack         | Leaderboard ranks correctly by revenue/units/commission. YoY calculates growth %. Export matches on-screen data. Scheduled report delivers on time. |

## Sprint 13-14: Lifecycle & Polish (Weeks 25-28)

| **\#** | **Sprint** | **Deliverables**                                                                                                                                                                                                                                                                                | **Owner**       | **Acceptance Criteria**                                                                                                                                                        |
|--------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 13     | Sprint 13  | Module 11: FinCEN report tracking (USA). Tarion 45-day registration (Canada). RERA 3-Account config (India). Upgrade/change order module with Procore stage gating. Closing statement auto-assembly with PDF generation. IOD calculation (Canada).                                              | Full stack      | FinCEN auto-triggers for entity+cash. Tarion deadline tracked. RERA accounts enforce 70/30. Upgrades locked by construction stage. Closing statement auto-assembles correctly. |
| 14     | Sprint 14  | PDI/Snag module with defect tracking and photo upload. Possession logic gate (3 conditions). Warranty period auto-calculation. Warranty claims. End-to-end integration testing. Performance optimization. Security hardening. Demo seed data for all 3 countries. Demo walkthrough preparation. | Full stack + QA | PDI creates defects with photos. Possession blocked if conditions unmet. Warranty dates auto-calculated. Full E2E flow works for all 3 countries. Load test passes.            |

## Demo Seed Data Requirements

The seed script must create the following for a compelling demo:

- 3 Properties: One in each country (e.g., 'Skyline Tower NYC' USA, 'Harbour Condos Toronto' Canada, 'Prestige Heights Mumbai' India).

- 50+ units per property with varied types, floors, prices, and statuses (mix of Available, Reserved, Sold, Blocked).

- 20+ buyers: Mix of individual, joint, corporate, trust. Some with complete KYC, some pending. Include 2-3 with NSF history.

- 10+ brokers: Mix of individual and firm. Multiple commission models configured. Include one with GCI Cap model, one with Team Cascade.

- 30+ completed sales with commissions calculated and payments in various statuses.

- Payment schedules with installments: some fully paid, some partially paid, some overdue.

- 3-5 AI-processed documents with extraction results at varying confidence levels.

- Yardi inventory mirror data with realistic days-on-market and price distributions.

- Historical sales data for 2 prior years to power YoY analytics.

- Analytics aggregation data pre-computed for dashboard charts.

- Lifecycle data: 1 FinCEN report (USA), 1 Tarion registration (Canada), 1 RERA sale with milestone payments (India).

- PDI with 5+ defects of varying severity for one unit nearing possession.

## Environment & Deployment

| **Environment** | **Purpose**                  | **Infrastructure**                                                                                                                 |
|-----------------|------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Local Dev       | Developer machines           | Docker Compose: PostgreSQL 16, Redis 7, MinIO (S3-compatible), NestJS (hot reload), Next.js (hot reload)                           |
| Staging         | QA testing, demo preparation | AWS: ECS Fargate (2 services: web + api), RDS PostgreSQL, ElastiCache Redis, S3, CloudFront                                        |
| Production      | Live deployment              | AWS: ECS Fargate (auto-scaling), RDS PostgreSQL Multi-AZ, ElastiCache Redis cluster, S3 with versioning, CloudFront, WAF, Route 53 |

## Testing Strategy

| **Test Type**     | **Tool**               | **Coverage Target** | **Scope**                                                                                           |
|-------------------|------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| Unit Tests        | Jest + @nestjs/testing | 80%+                | All services, calculation engines, compliance rules, tax formulas                                   |
| Integration Tests | Jest + Supertest       | Key flows           | API endpoint tests with test database. Sale creation E2E, commission calculation, payment recording |
| E2E Tests         | Playwright             | Critical paths      | Login, create sale, AI review, approve commission, generate closing statement, possession transfer  |
| Load Tests        | k6 / Artillery         | Performance SLAs    | 200 concurrent users, dashboard load \<3s, AI processing \<30s, Yardi sync 500+ records \<5min      |
| Security          | OWASP ZAP + manual     | OWASP Top 10        | SQL injection, XSS, CSRF, auth bypass, PII exposure, field-level encryption verification            |

# Summary Metrics

This implementation plan covers the complete Upward platform:

| **Category**          | **Count** | **Details**                                                                |
|-----------------------|-----------|----------------------------------------------------------------------------|
| Database Tables       | 42        | Core entities, compliance, lifecycle, analytics, audit                     |
| Materialized Views    | 5         | Sales summary, partner rankings, inventory, receivables aging, YoY         |
| Database Indexes      | 15+       | Performance-critical query paths                                           |
| API Endpoints         | 120+      | RESTful, versioned, paginated, with audit logging                          |
| Frontend Pages        | 35+       | Next.js App Router with dynamic forms and interactive charts               |
| Commission Models     | 10        | Flat, tiered, hybrid, split, override, GCI cap, cascade, buyer-paid        |
| Tax Calculation Rules | 15+       | USA state transfer, FIRPTA, Canada GST/HST/LTT, India stamp/TDS/GST        |
| Chart Types           | 30+       | Line, bar, scatter, donut, funnel, heatmap, treemap, waterfall, sparkline  |
| Report Types          | 20+       | Sales, commissions, receivables, inventory, compliance, AI, NSF            |
| Countries Supported   | 3         | USA, Canada (Ontario focus), India                                         |
| Integration Points    | 3         | Yardi (payables + receivables + inventory), Procore (construction), FinCEN |
| Sprints to Demo       | 14        | 28 weeks with full functionality across all modules                        |

**END OF IMPLEMENTATION PLAN**

Upward Implementation Plan for Antigravity | Prepared February 2026 | Confidential
