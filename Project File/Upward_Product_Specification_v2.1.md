# UPWARD

## Unit Sales Management Platform

### Product Requirements & Technical Specification Document

**Multi-Country Real Estate Unit Sales Module**

**USA | Canada | India**

*Version 2.1 – Unified Sales Blueprint Edition*

*February 2026*

**CONFIDENTIAL**

---

# Executive Summary

Upward is a comprehensive web-based Unit Sales Management Platform designed to streamline the end-to-end process of recording, managing, and tracking real estate unit sales across three countries: the United States, Canada, and India. The platform serves property developers, sales teams, brokers, and finance teams by providing a centralized system for managing unit sales, buyer records, broker commissions, payment tracking, and third-party ERP integration with Yardi and Procore.

The platform features a two-way Yardi integration: pushing payables and receivables to Yardi for accounting, and pulling the complete property and unit inventory from Yardi to power a real-time analytics dashboard. This dashboard provides portfolio owners with executive-level visibility into sales performance, inventory health, top sales partner rankings, year-over-year comparisons, and financial forecasting.

The cornerstone of Upward is its AI-powered document intelligence engine, which automatically extracts sale information from uploaded documents, creates payable records for broker commissions, generates buyer payment schedules, and continuously learns from user corrections to improve accuracy over time.

The platform manages the complete unit sales lifecycle from lead commitment through handover and post-closing warranty management. This includes construction-stage-aware change orders via Procore integration, auto-generated localized closing statements (Statement of Adjustments), possession logic gates enforcing occupancy certificate upload, zero balance, and critical snag resolution, and post-possession warranty tracking aligned to Tarion 1-2-7 (Canada), RERA 5-year (India), and state-specific (USA) warranty frameworks.

**Target Users:** Property Developers, Sales Managers, Finance Teams, Brokers, Admin Staff

**Deployment:** Cloud-hosted SaaS web application (responsive for desktop and tablet)

**Countries:** USA, Canada, India

**Integration:** Yardi Voyager / Yardi Breeze (Payables, Receivables, and Inventory sync); Procore (Construction Stage Awareness); FinCEN / RERA / Tarion (Compliance)

# Document Revision History

| **Version** | **Date**     | **Author**   | **Changes**                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-------------|--------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0         | Feb 28, 2026 | Product Team | Initial specification document                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.1         | Feb 28, 2026 | Product Team | Added Module 9: Yardi Inventory Sync and Module 10: Real-Time Analytics Dashboard with sales performance, inventory analytics, partner leaderboard, and YoY comparisons                                                                                                                                                                                                                                                                        |
| 1.2         | Feb 28, 2026 | Product Team | Added Unit Fees/Charges, Closing Info, Critical Dates, Lease Info sections; Added NSF Check History and Fine tracking for buyers                                                                                                                                                                                                                                                                                                               |
| 2.0         | Feb 28, 2026 | Product Team | Definitive Merged Edition: Integrated RESPA/TRID/UCD compliance, NAR settlement decoupled commissions, FINTRAC 24-hour rule and LCTR, RERA 70% escrow and milestone payments, VLM/LayoutLM spatial AI architecture, active learning pipeline, SIPP and FinPayables Yardi integration, multi-tenant JSONB database architecture, data residency, implementation principles, and references                                                      |
| 2.1         | Feb 28, 2026 | Product Team | Unified Sales Blueprint: Added Module 11 End-to-End Unit Sales Lifecycle with FinCEN 2026 cash reporting, Tarion 45-day registration, RERA 3-Account escrow system, Procore construction sync for change orders, milestone-linked funding orchestration, localized Closing Statements (Statement of Adjustments), Handover/PDI/Snag module with possession logic gates, post-closing warranty transition, and Migration Buddy ETL requirements |

# Project Overview

## Vision Statement

To build an intelligent, AI-first unit sales management system that eliminates manual data entry, ensures country-specific regulatory compliance, and provides seamless financial integration with the Yardi ecosystem, reducing sales processing time by up to 80%.

## Business Objectives

1.  Automate unit sale recording through AI-powered document extraction

2.  Ensure compliance with real estate transaction laws in USA, Canada, and India

3.  Centralize buyer information, broker management, and commission tracking

4.  Enable seamless payment management for both payables (broker commissions) and receivables (buyer installments)

5.  Integrate with Yardi to push financial transactions for accounting reconciliation

6.  Build a self-learning AI model that improves extraction accuracy over time

## Scope

### In Scope

- Unit sales recording and management for properties across USA, Canada, and India

- Buyer information management and records

- Broker and broker firm management with configurable commissions

- Commission payable generation and payment processing

- Buyer payment schedule and installment tracking

- AI-powered document upload, extraction, review, and self-learning

- Yardi integration for payables and receivables sync

- Property and unit inventory sync from Yardi for reporting and analytics (read-only mirror)

- Real-time analytics dashboard with sales performance, inventory status, partner rankings, and year-over-year comparisons

- Role-based access control and audit logging

- Country-specific tax and compliance modules

- End-to-end unit sales lifecycle management: booking, change orders (upgrades), milestone-linked funding, closing statement generation, handover, and post-closing warranty tracking

- Procore construction management integration for real-time construction stage awareness and upgrade eligibility gating

- FinCEN 2026 Residential Real Estate Rule compliance for cash/entity transaction reporting (USA)

- Tarion 45-day warranty registration and 1-2-7 year warranty tracking (Canada/Ontario)

- RERA 3-Account system enforcement: Collection, Separate (70%), and Transaction (30%) accounts (India)

- Pre-Delivery Inspection (PDI) / Snag module with possession logic gates

- Migration Buddy ETL pipeline for legacy data import with automated compliance validation

### Out of Scope (Phase 1)

- CRM and lead management

- Marketing automation

- Direct property/inventory management (inventory is synced read-only from Yardi)

- Direct payment gateway integration (payments are recorded, not processed online)

- Mobile native apps (responsive web only in Phase 1)

# User Roles and Permissions

| **Role**           | **Description**                           | **Key Permissions**                                                   |
|--------------------|-------------------------------------------|-----------------------------------------------------------------------|
| Super Admin        | System-level administrator                | Full system access, user management, configuration, AI model settings |
| Property Admin     | Manages a specific property or portfolio  | Manage units, sales, brokers, view reports for assigned properties    |
| Sales Manager      | Oversees sales team and operations        | Record/review sales, manage buyers, approve AI extractions            |
| Finance Manager    | Handles payments and accounting           | Create/approve payments, manage receivables, Yardi sync               |
| Broker Portal User | External broker accessing their dashboard | View own sales, commissions, payment status (read-only)               |
| Auditor            | Read-only access for compliance reviews   | View all records, generate reports, no edit permissions               |

# Functional Requirements

## Module 1: Property and Unit Management

This module manages the property inventory and individual units available for sale.

### Property Information Capture

| **Field**              | **Type**       | **Required** | **Notes**                                      |
|------------------------|----------------|--------------|------------------------------------------------|
| Property ID            | Auto-generated | Yes          | System-assigned unique identifier              |
| Property Name          | Text           | Yes          | Name of the development/building               |
| Property Type          | Dropdown       | Yes          | Residential, Commercial, Mixed-Use, Industrial |
| Address Line 1         | Text           | Yes          | Street address                                 |
| Address Line 2         | Text           | No           | Suite/Floor/Building                           |
| City                   | Text           | Yes          |                                                |
| State / Province       | Text           | Yes          | State (USA), Province (Canada), State (India)  |
| Postal / ZIP Code      | Text           | Yes          | ZIP (USA), Postal Code (Canada/India)          |
| Country                | Dropdown       | Yes          | USA, Canada, India                             |
| Total Units            | Number         | Yes          | Total sellable units                           |
| Developer / Owner Name | Text           | Yes          | Legal entity name                              |
| Developer Tax ID       | Text           | Yes          | EIN (USA), BN (Canada), PAN/GSTIN (India)      |
| Registration Number    | Text           | Conditional  | RERA Number (India), applicable permits        |
| Property Status        | Dropdown       | Yes          | Pre-Launch, Active, Sold Out, Archived         |

### Unit Information Capture

| **Field**            | **Type**       | **Required** | **Notes**                                                 |
|----------------------|----------------|--------------|-----------------------------------------------------------|
| Unit ID              | Auto-generated | Yes          | System-assigned unique identifier                         |
| Unit Number          | Text           | Yes          | Developer-assigned unit number (e.g., A-101)              |
| Unit Type            | Dropdown       | Yes          | Studio, 1BHK, 2BHK, 3BHK, Penthouse, Office, Retail, etc. |
| Floor Number         | Number         | No           |                                                           |
| Carpet Area          | Decimal        | Yes          | In sq ft or sq m (configurable per country)               |
| Built-Up Area        | Decimal        | No           |                                                           |
| Super Built-Up Area  | Decimal        | Conditional  | Required for India (RERA)                                 |
| Base Price           | Currency       | Yes          | List price in local currency                              |
| Price Per Sq Ft/Sq M | Calculated     | Auto         | Base Price / Area                                         |
| Unit Status          | Dropdown       | Yes          | Available, Reserved, Sold, Blocked                        |
| Parking Included     | Boolean        | No           |                                                           |
| Parking Slots        | Number         | Conditional  | If parking included                                       |
| Amenities            | Multi-select   | No           | Balcony, Garden, Pool View, etc.                          |
| Floor Plan Document  | File Upload    | No           | PDF/Image of layout                                       |

### Unit Fees and Charges

Each unit carries a detailed fee structure that must be captured at the time of sale. These fees vary by property, country, and developer policy. All monetary values are stored in the local currency of the property.

| **Field**                            | **Type**    | **Required** | **Notes**                                                                  |
|--------------------------------------|-------------|--------------|----------------------------------------------------------------------------|
| Purchase Price (Incl. HST/GST/Tax)   | Currency    | Yes          | Total purchase price inclusive of applicable sales tax                     |
| HST / GST / Sales Tax Amount         | Currency    | Yes          | Broken out tax amount; auto-calculated based on country/province tax rules |
| Upgrades                             | Currency    | No           | Cost of any buyer-selected upgrades (finishes, appliances, add-ons)        |
| Total Purchase Price (Excl. Tax)     | Calculated  | Auto         | Purchase Price minus HST/GST/Sales Tax                                     |
| CAP Amendment                        | Currency    | No           | Development charge cap amendment fee (Ontario, Canada specific)            |
| Parkland Levies / Cap                | Currency    | No           | Municipal parkland dedication levy; varies by city/municipality            |
| General Admin Fee                    | Currency    | No           | Developer administrative processing fee                                    |
| Admin Fee for Mortgage Discharge     | Currency    | No           | Fee charged for processing mortgage discharge documentation                |
| Tarion Enrollment Fee                | Currency    | Conditional  | Ontario new home warranty enrollment (Canada); varies by unit price tier   |
| Mortgage Application / Insurance Fee | Currency    | No           | Lender-related fees passed to buyer                                        |
| Realty Tax                           | Currency    | No           | Property tax amount or adjustment at closing                               |
| Utility Security Charge              | Currency    | No           | Security deposit or connection fee for utilities                           |
| Submetering Charge                   | Currency    | No           | Cost for individual utility sub-meter installation                         |
| Occupancy Fees                       | Currency    | Conditional  | Monthly fees during interim occupancy (pre-construction Canada)            |
| Common Expense Contributions         | Currency    | Conditional  | Monthly condo maintenance / common area fees; starts at occupancy          |
| Bulletin 19 Charge                   | Currency    | Conditional  | Tarion Bulletin 19 compliance charge (Ontario, Canada)                     |
| Fee for Limited Right of Assignment  | Currency    | No           | Fee charged if buyer is granted limited assignment rights                  |
| Deposit Received by Developer        | Currency    | Yes          | Total deposit amount already collected by the developer/builder            |
| Schedule D Percentage                | Decimal (%) | No           | Percentage from Schedule D of the Agreement of Purchase and Sale           |

### Unit Closing Information

Closing-related financial adjustments and penalty fields captured per unit at or around the closing date.

| **Field**                              | **Type** | **Required** | **Notes**                                                                       |
|----------------------------------------|----------|--------------|---------------------------------------------------------------------------------|
| Credit on Closing                      | Currency | No           | Any credit applied to buyer at closing (recorded as negative/credit amount)     |
| Credit on Deposit Interest             | Currency | No           | Interest earned on buyer deposits, credited at closing                          |
| Credit Direction Note                  | Text     | Info         | System note: A credit is recorded as a negative value reducing buyer obligation |
| Penalty for Listing on MLS             | Currency | No           | Penalty charged to buyer for unauthorized MLS listing of pre-construction unit  |
| Penalty for Assignment Without Consent | Currency | No           | Penalty for unauthorized assignment/transfer of purchase agreement              |
| Leasing Fee                            | Currency | No           | Fee for leasing the unit (if lease-back or rental rights granted)               |
| Miscellaneous Legal Fee                | Currency | No           | Other legal fees not covered above; free-text description field included        |

### Unit Critical Dates

Key milestone dates tracked throughout the unit sale lifecycle. These dates drive workflow notifications, compliance timelines, and occupancy tracking.

| **Field**               | **Type** | **Required** | **Notes**                                                                                   |
|-------------------------|----------|--------------|---------------------------------------------------------------------------------------------|
| Target Closing Date     | Date     | Yes          | Estimated closing date from the purchase agreement                                          |
| Contract Date           | Date     | Yes          | Date the purchase agreement was fully executed by all parties                               |
| Approval Date           | Date     | No           | Date the sale was approved (e.g., board approval for co-ops, developer approval)            |
| Final Sales Date        | Date     | Conditional  | Date the sale is finalized and legally completed; triggers unit status change to Sold       |
| Firm Occupancy Date     | Date     | Conditional  | Confirmed date buyer can take occupancy (common in pre-construction Canada)                 |
| Actual Occupancy Date   | Date     | Conditional  | Date buyer actually took physical occupancy of the unit                                     |
| Interim Occupancy Start | Date     | Conditional  | Start of interim occupancy period (Canada pre-construction); triggers occupancy fee billing |
| Registration Date       | Date     | Conditional  | Date the condo/unit is registered with the land registry                                    |

### Unit Lease Information

Lease-related rights and restrictions for the unit, typically defined in the purchase agreement. These fields track whether the buyer has leasing and assignment rights.

| **Field**                   | **Type** | **Required** | **Notes**                                                                                |
|-----------------------------|----------|--------------|------------------------------------------------------------------------------------------|
| The Right to Lease          | Dropdown | No           | Yes, No, Conditional; whether the buyer has the right to lease the unit to a third party |
| Unit Leased                 | Dropdown | No           | Yes, No, Unknown; current lease status of the unit                                       |
| Lease Start Date            | Date     | Conditional  | If Unit Leased = Yes                                                                     |
| Lease End Date              | Date     | Conditional  | If Unit Leased = Yes                                                                     |
| Monthly Lease Amount        | Currency | Conditional  | If Unit Leased = Yes                                                                     |
| Tenant Name                 | Text     | Conditional  | If Unit Leased = Yes; for records only                                                   |
| Limited Right of Assignment | Dropdown | No           | Yes, No, Conditional; whether buyer can assign purchase agreement to another party       |
| Assignment Fee              | Currency | Conditional  | If assignment right is granted; fee from the Unit Fees section                           |
| Assignment Consent Required | Boolean  | No           | Whether developer consent is needed before assignment                                    |

## Module 2: Unit Sales Recording

This module captures the complete sale transaction when a unit is sold to a buyer. A sale can be recorded manually or automatically via the AI extraction engine (Module 7).

### Sale Transaction Data

| **Field**               | **Type**       | **Required** | **Notes**                                              |
|-------------------------|----------------|--------------|--------------------------------------------------------|
| Sale ID                 | Auto-generated | Yes          | Unique transaction identifier                          |
| Property ID             | Reference      | Yes          | Link to property                                       |
| Unit ID                 | Reference      | Yes          | Link to specific unit                                  |
| Buyer ID                | Reference      | Yes          | Link to buyer record                                   |
| Broker ID               | Reference      | Conditional  | If sale was brokered                                   |
| Sale Date               | Date           | Yes          | Date of agreement execution                            |
| Agreement Type          | Dropdown       | Yes          | Sale Deed, Agreement to Sell, Purchase Agreement       |
| Sale Price              | Currency       | Yes          | Total agreed sale amount                               |
| Currency                | Auto/Manual    | Yes          | USD, CAD, INR (based on property country)              |
| Discount Amount         | Currency       | No           | Any discount applied                                   |
| Net Sale Price          | Calculated     | Auto         | Sale Price minus Discount                              |
| Stamp Duty              | Currency       | Conditional  | Mandatory for India; varies by state/province          |
| Registration Fee        | Currency       | Conditional  | Applicable in India                                    |
| GST / HST / Sales Tax   | Currency       | Conditional  | Based on country tax rules                             |
| Total Transaction Value | Calculated     | Auto         | Net Sale Price + Taxes + Fees                          |
| Payment Terms           | Text           | No           | Summary of payment structure                           |
| Sale Document           | File Upload    | Yes          | Scanned/original sale agreement                        |
| Sale Status             | Dropdown       | Yes          | Draft, Pending Review, Confirmed, Cancelled, Completed |
| Source                  | Dropdown       | Yes          | Manual Entry, AI Extraction                            |
| Created By              | System         | Auto         | User who recorded the sale                             |
| Created Date            | System         | Auto         | Timestamp                                              |

## Module 3: Country-Specific Legal Compliance

Upward must enforce specific business rules and data capture requirements based on the country in which the property is located. The system dynamically adjusts forms, validations, and calculations based on the selected country.

### United States (USA)

US real estate transactions are heavily regulated by RESPA (Real Estate Settlement Procedures Act), TILA (Truth in Lending Act), and the consolidated TILA-RESPA Integrated Disclosure (TRID) rule, which mandates standardized Closing Disclosures and Settlement Statements. The AI extraction engine must be calibrated to parse these documents in alignment with the Uniform Closing Dataset (UCD) v2.0 specifications published by Fannie Mae/Freddie Mac.

**NAR Settlement Impact:** Recent antitrust settlements involving the National Association of Realtors (NAR) have abolished blanket MLS compensation offers and mandate explicit, written buyer-broker agreements prior to property tours. The Upward commission engine must not assume a standardized seller-paid commission split. The database architecture must support fully decoupled commission logic, tracking buyer-paid fees, seller concessions, flat-fee arrangements, and negotiated localized fee structures independently. The AI must be trained to identify compensation addenda within purchase agreements.

| **Compliance Area**       | **Requirement**                                                                       | **System Implementation**                                                                                                                            |
|---------------------------|---------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| RESPA / TRID Compliance   | Standardized Closing Disclosures (CD) and Settlement Statements per TRID rule         | AI extraction aligned to UCD v2.0 schema; capture borrower/seller names, lender entity, loan origination charges, recording fees, escrow disclosures |
| Tax Identification        | Buyer must provide SSN or ITIN; Foreign buyers file IRS Form W-7                      | SSN/ITIN field with format validation; Flag for foreign buyers                                                                                       |
| FIRPTA Withholding        | 15% withholding on sales to foreign persons per IRS rules                             | Auto-detect foreign buyer status; calculate 15% withholding; generate FIRPTA notice                                                                  |
| NAR Decoupled Commissions | Post-NAR settlement: no blanket MLS offers; explicit buyer-broker agreements required | Separate buyer-paid and seller-paid commission fields; buyer-broker agreement upload; independent payable generation per party                       |
| State Transfer Tax        | Varies by state (e.g., NY: 0.4%, CA: \$1.10/\$1000)                                   | Configurable tax rate by state; auto-calculate on sale                                                                                               |
| Title Insurance           | Required in most transactions                                                         | Checkbox to confirm title insurance; record policy number                                                                                            |
| HOA Disclosures           | Required for condo/association units                                                  | HOA disclosure document upload field; estoppel certificate tracking                                                                                  |
| Lead Paint Disclosure     | Required for pre-1978 buildings                                                       | Conditional field triggered by building year                                                                                                         |
| Fair Housing Act          | No discrimination in sales practices                                                  | Audit logging on all sales; equal treatment documentation                                                                                            |
| 1099-S Reporting          | Report real estate sale proceeds to IRS                                               | Generate 1099-S data; export for filing                                                                                                              |
| Referral Fee Restrictions | RESPA prohibits kickbacks and unearned referral fees                                  | Commission audit trail; referral fee documentation; RESPA compliance flags                                                                           |

### Canada

Canadian real estate compliance is governed by the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA), enforced by FINTRAC. Real estate developers, brokers, and sales representatives are legally designated as reporting entities, requiring rigorous KYC protocols and AML record-keeping. The system must capture, encrypt, and securely store specific data points to maintain absolute FINTRAC compliance.

| **Compliance Area**        | **Requirement**                                                                                                                                                                     | **System Implementation**                                                                                                                                            |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tax Identification         | SIN for residents; ITN for non-residents                                                                                                                                            | SIN/ITN field with format validation                                                                                                                                 |
| FINTRAC KYC Verification   | Identity verification through government photo ID, Canadian credit file, or dual-process verification matching two distinct reliable sources                                        | Dual-process ID fields; document upload for each verification method; KYC status tracking per FINTRAC prescribed methods                                             |
| FINTRAC Receipt of Funds   | Every fund transfer requires a Receipt of Funds Record: transaction date, total amount, cash portion, method of receipt, currency exchange rates, full account details              | Auto-generate Receipt of Funds record on every payment; capture all FINTRAC-mandated fields; encrypted storage                                                       |
| FINTRAC 24-Hour \$10K Rule | Any single or aggregated transactions reaching \$10,000 CAD within 24 hours must generate a Large Cash Transaction Report (LCTR)                                                    | 24-hour rolling aggregation algorithm per entity; auto-flag when \$10K threshold is breached; halt processing; generate LCTR for human review and FINTRAC submission |
| Non-Resident Tax           | 25% withholding under Section 116 of Income Tax Act                                                                                                                                 | Auto-detect non-resident status; calculate 25% withholding; generate clearance certificate request                                                                   |
| GST/HST on New Homes       | 5% GST (federal) + provincial HST where applicable; varies by province for real estate services                                                                                     | Provincial GST/HST rate configuration; auto-calculate based on province; separate tax treatment for professional services vs. property                               |
| Provincial Transfer Tax    | Varies: BC Property Transfer Tax (tiered), Ontario Land Transfer Tax, Toronto Municipal LTT                                                                                         | Configurable by province/municipality; tiered rate calculation (e.g., BC: different rates per price tranche)                                                         |
| Foreign Buyer Ban          | Prohibition on Foreign Ownership Act: restricts non-citizens, non-permanent residents, and foreign-controlled corporations (3%+ foreign equity) from acquiring residential property | Foreign buyer flag; corporate beneficial ownership capture; 3% equity threshold check; system block or admin override with documentation                             |
| Anti-Money Laundering      | FINTRAC reporting: beneficial ownership structures, suspicious transaction reporting                                                                                                | Beneficial ownership fields; large cash transaction auto-detection; suspicious transaction flagging; FINTRAC report generation                                       |
| New Home Warranty          | Tarion (ON), NHWP (BC), etc.                                                                                                                                                        | Warranty program tracking by province; certificate upload                                                                                                            |
| Cooling-Off Period         | Ontario: 10 days for pre-construction condos                                                                                                                                        | Auto-calculate cooling-off period; status auto-reverts if cancelled within window                                                                                    |

### India

The Real Estate (Regulation and Development) Act, 2016 (RERA) introduces rigid financial transparency requirements. The Upward system must enforce RERA-specific parameters including escrow account routing, milestone-linked payment schedules, advance payment caps, and structural defect liability tracking. Compliance failures expose developers to severe penalties.

| **Compliance Area**            | **Requirement**                                                                                                                      | **System Implementation**                                                                                                                                                             |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RERA Registration              | Project must be RERA-registered; AI must verify RERA-compliant Sale Agreements                                                       | Mandatory RERA registration number field; carpet area as primary metric; allotment letter tracking; sanctioned layout plan upload; project completion date                            |
| RERA 70% Escrow Account        | 70% of all buyer funds must be deposited in a dedicated escrow account, ring-fenced for land acquisition and construction costs only | Receivables module auto-bifurcates incoming payments 70/30; GL code routing ensures escrow compliance; prevents unauthorized fund co-mingling; escrow bank details stored per project |
| RERA Advance Payment Cap       | Advance payments capped at 10% of unit price before formal agreement execution                                                       | System blocks payment recording above 10% before agreement date; warning alerts for approaching cap                                                                                   |
| RERA Milestone-Linked Payments | Post-advance installments must be tied to verifiable physical construction milestones, not arbitrary dates                           | Construction milestone dashboard; developer triggers milestone globally; batch invoice generation for all buyers in that phase; AI extracts milestone terms from payment annexure     |
| RERA 5-Year Defect Liability   | Developer liable for structural defects for 5 years post-possession                                                                  | Auto-track 5-year liability window per unit from possession date; defect reporting module; automated penalty calculator                                                               |
| RERA Delay Penalty             | Developer must pay interest at SBI MCLR + 2% for project delays beyond committed date                                                | Auto-calculate delay interest using current SBI MCLR rate + 2%; configurable rate updates; buyer-wise penalty computation                                                             |
| PAN Card                       | Mandatory for transactions above INR 10 lakh                                                                                         | PAN field with validation (AAAAA9999A format); mandatory for all sales                                                                                                                |
| Aadhaar / KYC                  | KYC mandatory for anti-money laundering                                                                                              | Aadhaar number field (optional but tracked); KYC document upload                                                                                                                      |
| TDS (Section 194-IA)           | 1% TDS on sale consideration exceeding INR 50 lakh                                                                                   | Auto-calculate TDS when sale price \> 50L; generate Form 26QB data                                                                                                                    |
| Stamp Duty                     | Varies by state (e.g., Maharashtra 5-6%, Karnataka 5%, Delhi 4-6%)                                                                   | State-wise stamp duty rate configuration; auto-calculate based on property state                                                                                                      |
| Registration Charges           | Typically 1% of property value                                                                                                       | Auto-calculate; track registration status                                                                                                                                             |
| GST on Under-Construction      | 1% (affordable) or 5% (non-affordable); No ITC; No GST on completed units with OC                                                    | Project type classification; auto-apply correct GST rate                                                                                                                              |
| Benami Transactions            | Prohibition of Benami Property Transactions Act                                                                                      | Beneficial owner declaration; mismatch alerting                                                                                                                                       |
| FEMA (Foreign Buyers)          | NRIs can buy residential/commercial; Foreign nationals restricted                                                                    | Buyer nationality tracking; FEMA compliance flags                                                                                                                                     |

## Module 4: Buyer Information Management

Comprehensive buyer records must be maintained for legal compliance, payment tracking, and future reference. The system stores both individual and corporate buyer profiles.

### Buyer Profile Data

| **Field**                  | **Type**               | **Required** | **Notes**                                    |
|----------------------------|------------------------|--------------|----------------------------------------------|
| Buyer ID                   | Auto-generated         | Yes          | Unique buyer identifier                      |
| Buyer Type                 | Dropdown               | Yes          | Individual, Joint, Corporate / Entity, Trust |
| First Name                 | Text                   | Yes          |                                              |
| Middle Name                | Text                   | No           |                                              |
| Last Name                  | Text                   | Yes          |                                              |
| Date of Birth              | Date                   | Conditional  | Required for individuals                     |
| Nationality                | Dropdown               | Yes          | ISO country list                             |
| Residency Status           | Dropdown               | Yes          | Resident, Non-Resident, Foreign National     |
| Email                      | Text                   | Yes          | Primary contact email                        |
| Phone Number               | Text                   | Yes          | With country code                            |
| Alternate Phone            | Text                   | No           |                                              |
| Mailing Address            | Text Block             | Yes          | Full address with country                    |
| Tax ID (USA)               | Text                   | Conditional  | SSN or ITIN                                  |
| SIN (Canada)               | Text                   | Conditional  | Social Insurance Number                      |
| PAN (India)                | Text                   | Conditional  | Permanent Account Number                     |
| Aadhaar (India)            | Text                   | Conditional  | 12-digit Aadhaar number                      |
| Passport Number            | Text                   | Conditional  | For non-resident / foreign buyers            |
| Company Name               | Text                   | Conditional  | If Buyer Type is Corporate                   |
| Company Registration       | Text                   | Conditional  | CIN (India), Corp Number (Canada), EIN (USA) |
| Authorized Signatory       | Text                   | Conditional  | For corporate buyers                         |
| KYC Documents              | File Upload (multiple) | Yes          | ID proof, address proof, photo               |
| KYC Verified               | Boolean                | Yes          | Must be verified before sale confirmation    |
| Anti-Money Laundering Flag | System                 | Auto         | Triggered by compliance rules                |
| Notes                      | Text Area              | No           | Internal notes about the buyer               |

### Joint Buyer Handling

For joint purchases, the system must capture complete profiles for all co-buyers. The primary buyer is designated as the main contact. Ownership percentage for each co-buyer is recorded. All co-buyers must complete KYC verification. Payment schedules can be split across co-buyers or consolidated under the primary buyer.

### NSF (Non-Sufficient Funds) Check History and Fines

The system must maintain a complete history of any NSF (bounced) checks associated with a buyer. When a buyer's check or electronic payment is returned due to insufficient funds, the event is logged against their profile along with any resulting fines. This history serves as a risk indicator for the sales and finance teams and may impact future transaction approvals.

### NSF Event Record

| **Field**                    | **Type**       | **Required** | **Notes**                                                                                      |
|------------------------------|----------------|--------------|------------------------------------------------------------------------------------------------|
| NSF Event ID                 | Auto-generated | Yes          | Unique identifier for each NSF occurrence                                                      |
| Buyer ID                     | Reference      | Yes          | Links to the buyer profile                                                                     |
| Sale ID                      | Reference      | Yes          | Links to the associated sale transaction                                                       |
| Installment ID               | Reference      | Conditional  | Links to the specific installment that bounced (if applicable)                                 |
| Check / Payment Reference    | Text           | Yes          | Original check number or payment reference that was returned                                   |
| Payment Method               | Dropdown       | Yes          | Check, ACH, EFT, Pre-Authorized Debit, eCheck, UPI                                             |
| Original Payment Amount      | Currency       | Yes          | Amount of the returned payment                                                                 |
| NSF Date                     | Date           | Yes          | Date the payment was returned / bounced                                                        |
| Bank Name                    | Text           | No           | Buyer's bank that returned the payment                                                         |
| Bank Reference / Reason Code | Text           | No           | Bank-provided reason code for the return (e.g., R01 Insufficient Funds, R09 Uncollected Funds) |
| NSF Fine Amount              | Currency       | Yes          | Fine/penalty charged to the buyer for the NSF event                                            |
| Fine Calculation Method      | Dropdown       | Yes          | Flat Fee, Percentage of Payment, Configurable Per Property                                     |
| Fine Status                  | Dropdown       | Yes          | Pending, Invoiced, Paid, Waived, In Collections                                                |
| Fine Paid Date               | Date           | Conditional  | Date the fine was paid by the buyer                                                            |
| Fine Payment Reference       | Text           | Conditional  | Reference number for fine payment                                                              |
| Fine Waiver Reason           | Text           | Conditional  | If Fine Status = Waived; mandatory reason text                                                 |
| Fine Approved By             | Reference      | Yes          | Finance manager who approved the fine or waiver                                                |
| Resubmission Date            | Date           | No           | Date the original payment was re-submitted after NSF resolution                                |
| Resubmission Status          | Dropdown       | No           | Pending, Cleared, Returned Again                                                               |
| Internal Notes               | Text Area      | No           | Internal notes about the NSF event and resolution                                              |
| Yardi Sync Status            | Dropdown       | Auto         | Not Synced, Synced, Error                                                                      |
| Created Date                 | System         | Auto         | Timestamp when NSF event was recorded                                                          |
| Created By                   | System         | Auto         | User who recorded the event                                                                    |

### NSF Configuration (Per Property / Global)

| **Configuration**                    | **Type**      | **Notes**                                                                             |
|--------------------------------------|---------------|---------------------------------------------------------------------------------------|
| Default NSF Fine Amount              | Currency      | Flat fee charged per NSF event (e.g., \$250 USD, \$300 CAD, INR 2,000)                |
| NSF Fine Percentage (Alternative)    | Decimal (%)   | Percentage of the bounced payment amount as fine (e.g., 2%)                           |
| Fine Calculation Method              | Dropdown      | Flat Fee or Percentage; can be set globally or overridden per property                |
| Grace Period for Resubmission        | Number (Days) | Days allowed for buyer to resolve NSF before escalation (e.g., 5 business days)       |
| Maximum NSF Events Before Escalation | Number        | Threshold after which the buyer is flagged for review (e.g., after 3 NSF events)      |
| Auto-Escalation Action               | Dropdown      | None, Flag Buyer, Block Future Payments, Notify Sales Manager, Trigger Default Notice |
| NSF Notification Template            | Text          | Configurable email/letter template sent to buyer on NSF occurrence                    |

### NSF Dashboard Indicators on Buyer Profile

- Total NSF Count: lifetime count of NSF events for this buyer across all sales

- NSF Risk Badge: Green (0 events), Yellow (1-2 events), Red (3+ events); visible on buyer profile header and in buyer lists

- Total Fines Incurred: cumulative fines charged to the buyer

- Outstanding Fines: unpaid fines balance

- Last NSF Date: date of most recent NSF event

- NSF History Timeline: chronological list of all NSF events with status, fine, and resolution details

- NSF Alert on Payment Receipt: when recording a new payment from a buyer with NSF history, the system displays a warning banner with their NSF risk level

## Module 5: Broker and Commission Management

This module manages broker relationships, commission structures, and payable generation. The system supports both individual brokers and brokerage firms with tiered or custom commission rates.

### Broker Profile Data

| **Field**                | **Type**       | **Required** | **Notes**                                         |
|--------------------------|----------------|--------------|---------------------------------------------------|
| Broker ID                | Auto-generated | Yes          | Unique broker identifier                          |
| Broker Type              | Dropdown       | Yes          | Individual, Firm / Brokerage                      |
| Broker / Firm Name       | Text           | Yes          | Legal name                                        |
| License Number           | Text           | Yes          | Real estate license number                        |
| License State/Province   | Text           | Yes          | Jurisdiction of license                           |
| License Expiry           | Date           | Yes          | Auto-alert 30 days before expiry                  |
| Tax ID                   | Text           | Yes          | EIN/SSN (USA), BN/SIN (Canada), PAN/GSTIN (India) |
| Email                    | Text           | Yes          | Primary contact                                   |
| Phone                    | Text           | Yes          | With country code                                 |
| Bank Name                | Text           | Yes          | For commission payments                           |
| Bank Account Number      | Text           | Yes          | Encrypted storage                                 |
| Routing / Transit / IFSC | Text           | Yes          | Country-specific bank routing code                |
| Payment Method           | Dropdown       | Yes          | Wire, Check, ACH, EFT, NEFT/RTGS                  |
| W-9 / Tax Form           | File Upload    | Conditional  | W-9 (USA), T4A (Canada), Form 16A (India)         |
| Commission Agreement     | File Upload    | Yes          | Signed agreement document                         |
| Status                   | Dropdown       | Yes          | Active, Inactive, Suspended, Terminated           |
| Parent Firm ID           | Reference      | Conditional  | If individual broker belongs to a firm            |

### Commission Structure

Commissions are highly flexible and can be configured per broker, per firm, per property, or per deal. The system supports the following commission models:

| **Commission Model**             | **Description**                                                                                              | **Example**                                                                                      |
|----------------------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Flat Percentage                  | Fixed % of net sale price                                                                                    | 3% of net sale price for all units                                                               |
| Tiered Percentage                | % varies by sale volume or price band                                                                        | 2% up to \$500K, 3% from \$500K-\$1M, 4% above \$1M                                              |
| Flat Fee                         | Fixed dollar/rupee amount per unit sold                                                                      | \$5,000 per unit regardless of price                                                             |
| Hybrid                           | Base fee + percentage                                                                                        | \$2,000 base + 1.5% of sale price                                                                |
| Split Commission                 | Divided between firm and individual agent                                                                    | Firm gets 40%, agent gets 60% of total commission                                                |
| Override Commission              | Additional amount to managing broker/firm                                                                    | 0.5% override to managing broker on all agent sales                                              |
| Tiered Property Value            | Different percentages applied to different tranches of the sale price                                        | 7% on first \$100K, 2.5% on balance (common in BC, Alberta, Canada)                              |
| GCI Cap Model                    | Split ratio shifts after agent reaches annual Gross Commission Income cap                                    | 70/30 split until \$12,000 cap reached, then 90/10 or 100% to agent minus transaction fee        |
| Team Cascading Split             | Gross commission reduced by franchise fee, then brokerage split, then team leader split based on lead source | Franchise 6% deduction, then 70/30 brokerage split, then 50/50 team split for team-sourced leads |
| Buyer-Paid Commission (Post-NAR) | Buyer pays own broker fee per written buyer-broker agreement (US market post-NAR settlement)                 | Buyer pays 2.5% directly; tracked separately from seller concessions                             |

### Commission Calculation Fields

| **Field**                | **Type**           | **Notes**                                  |
|--------------------------|--------------------|--------------------------------------------|
| Sale ID                  | Reference          | Links to the sale transaction              |
| Broker ID                | Reference          | Links to the broker                        |
| Commission Basis         | Dropdown           | Sale Price, Net Sale Price, Custom Amount  |
| Commission Rate / Amount | Decimal / Currency | Percentage or flat amount                  |
| Gross Commission         | Calculated         | Auto-calculated based on model             |
| Split to Firm            | Calculated         | If split commission applies                |
| Split to Agent           | Calculated         | If split commission applies                |
| Tax Withholding          | Calculated         | TDS (India), tax withholding (USA/Canada)  |
| Net Commission Payable   | Calculated         | Gross minus tax withholding                |
| Commission Status        | Dropdown           | Pending, Approved, Paid, On Hold, Disputed |
| Payment Due Date         | Date               | Based on payment terms                     |

## Module 6: Payment Management

The payment module handles both outgoing payments (broker commissions) and incoming payments (buyer installments). All payment records are designed to be pushed to Yardi.

### Broker Commission Payments (Payables)

| **Field**                | **Type**       | **Notes**                                      |
|--------------------------|----------------|------------------------------------------------|
| Payment ID               | Auto-generated | Unique payment identifier                      |
| Commission ID            | Reference      | Links to commission record                     |
| Broker ID                | Reference      | Payee                                          |
| Payment Amount           | Currency       | Amount being paid                              |
| Payment Currency         | Dropdown       | USD, CAD, INR                                  |
| Payment Method           | Dropdown       | Wire, Check, ACH, EFT, NEFT/RTGS               |
| Payment Date             | Date           | Date payment is issued                         |
| Reference / Check Number | Text           | Transaction reference                          |
| Bank Account (last 4)    | Display        | For verification                               |
| Tax Withholding Amount   | Currency       | Withheld at source                             |
| Invoice Number           | Text           | Broker invoice reference                       |
| Payment Status           | Dropdown       | Scheduled, Processing, Completed, Failed, Void |
| Yardi Sync Status        | Dropdown       | Not Synced, Synced, Error                      |
| Yardi Transaction ID     | Text           | Yardi reference after sync                     |
| Approved By              | Reference      | Finance manager who approved                   |
| Notes                    | Text           | Internal notes                                 |

### Buyer Payment Schedule and Installments (Receivables)

| **Field**              | **Type**          | **Notes**                             |
|------------------------|-------------------|---------------------------------------|
| Schedule ID            | Auto-generated    | Unique schedule identifier            |
| Sale ID                | Reference         | Links to sale transaction             |
| Buyer ID               | Reference         | Payer                                 |
| Total Sale Amount      | Currency          | Total amount to be collected          |
| Down Payment Amount    | Currency          | Initial payment                       |
| Down Payment Due Date  | Date              |                                       |
| Number of Installments | Number            | Total installments after down payment |
| Installment Frequency  | Dropdown          | Monthly, Quarterly, Custom            |
| Installment Amount     | Calculated/Manual | Equal or custom amounts               |
| Interest Rate (if any) | Decimal           | For financed units                    |
| Schedule Status        | Dropdown          | Draft, Active, Completed, Defaulted   |

### Individual Installment Records

| **Field**                  | **Type**       | **Notes**                                            |
|----------------------------|----------------|------------------------------------------------------|
| Installment ID             | Auto-generated | Unique installment identifier                        |
| Schedule ID                | Reference      | Parent schedule                                      |
| Installment Number         | Number         | Sequence number (1, 2, 3...)                         |
| Due Date                   | Date           | Expected payment date                                |
| Amount Due                 | Currency       | Installment amount                                   |
| Amount Received            | Currency       | Actual amount paid                                   |
| Receipt Date               | Date           | Date payment was received                            |
| Payment Method             | Dropdown       | Wire, Check, ACH, UPI, NEFT, Credit Card             |
| Receipt / Reference Number | Text           | Payment proof reference                              |
| Late Fee                   | Currency       | If applicable                                        |
| Status                     | Dropdown       | Upcoming, Due, Paid, Overdue, Partially Paid, Waived |
| Yardi Sync Status          | Dropdown       | Not Synced, Synced, Error                            |
| Yardi Transaction ID       | Text           | Yardi reference after sync                           |

## Module 7: AI Document Intelligence Engine

This is the core differentiator and competitive advantage of Upward. Traditional OCR systems are inherently brittle in real estate contexts, relying on fixed templates and rigid coordinate mapping that fail catastrophically with diverse multi-jurisdictional contract layouts. Upward implements a multimodal AI pipeline utilizing advanced Vision Language Models (VLMs) with active learning capabilities, achieving enterprise-grade accuracy for financial operations.

### Foundational Model Architecture: Spatial-Aware Transformers

The document ingestion pipeline utilizes transformer-based document AI models such as the LayoutLM family (LayoutLMv3) or specialized multimodal architectures like NVIDIA Nemotron Parse. Unlike standard LLMs that serialize text and lose structural context, these spatial-aware models incorporate visual features and spatial embeddings, allowing the AI to understand the document precisely as a human reader would.

During preprocessing, the uploaded document is processed by an OCR engine to generate textual tokens alongside their bounding box coordinates, normalized on a standardized 0-1000 scale. The VLM accepts three parallel data inputs:

- Text Embeddings: The semantic meaning of words extracted from the contract

- 2D Position Embeddings: Spatial coordinates indicating precisely where text appears on the page relative to other elements

- Image Embeddings: Visual features derived from a CNN backbone that understands structural layout components such as tables, signatures, stamps, and checkboxes

This multimodal approach empowers the AI to understand semantic relationships through spatial proximity. For example, it can reliably associate a broker name with a commission percentage nested inside a complex closing disclosure table, where traditional text-only parsers routinely fail.

### AI Workflow Overview

The end-to-end AI-powered sale processing workflow consists of five stages: document upload, information extraction, record creation, human review, and model learning.

**Stage 1 – Document Upload:** User uploads a sale document (PDF, scanned image, or Word document). The system identifies the document type, applicable country, and property. Multi-page documents and document batches are supported.

**Stage 2 – Multimodal Extraction:** The VLM executes a jurisdiction-aware inference pass. For US documents, it aligns extraction targets to UCD v2.0 Closing Disclosure schemas. For Canadian documents, it extracts FINTRAC-required KYC fields and receipt-of-funds data. For Indian RERA agreements, it extracts registration numbers, carpet area, and milestone-linked payment annexures. The AI extracts all relevant fields including buyer details, unit details, sale price, payment terms, broker information, and applicable taxes.

**Stage 3 – Automated Record Creation:** Based on extracted data, the system automatically creates: a Sale Transaction record (draft status), Buyer profile (or matches existing buyer), Broker commission payable based on configured rates and cascading split logic, Buyer payment schedule derived from payment terms (fixed amortization for North America, construction-linked milestone plans for India).

**Stage 4 – Human-in-the-Loop (HITL) Review:** All AI-generated records are presented in a split-screen validation view. The original document image is displayed with superimposed, color-coded bounding boxes representing extraction attempts. Users can verify data, drag/resize/correct bounding boxes directly on the image, and amend extracted text. If the VLM softmax output probability for any entity falls below the confidence threshold (default 0.85), the document is immediately routed to an exception queue for mandatory review.

**Stage 5 – Self-Learning Loop:** Every correction captures the precise delta between the AI prediction and the human-verified state: original image region, corrected bounding box coordinates, and verified text. This paired data is stored in a structured feedback_data table, feeding the active learning pipeline for continuous model improvement.

### AI Extraction Fields

The AI engine must extract the following categories of information from sale documents:

| **Category**              | **Fields Extracted**                                                                                                                                                | **Confidence Target** |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| Property & Unit           | Property name, unit number, floor, area, address                                                                                                                    | \>95% after training  |
| Buyer Information         | Full name, address, phone, email, tax IDs, nationality                                                                                                              | \>90% after training  |
| Sale Terms                | Sale price, discounts, net price, currency, agreement date, agreement type                                                                                          | \>95% after training  |
| Tax & Duties              | Stamp duty, GST/HST, registration fees, TDS, transfer tax                                                                                                           | \>85% after training  |
| Payment Terms             | Down payment, installment count, frequency, amounts, due dates                                                                                                      | \>85% after training  |
| Broker Details            | Broker name, firm, license number, commission mentioned                                                                                                             | \>90% after training  |
| Ownership                 | Owner/developer name, entity type, representative                                                                                                                   | \>90% after training  |
| Legal References          | Agreement clause numbers, RERA project number, registration details                                                                                                 | \>80% after training  |
| Unit Fees & Charges       | Purchase price (incl/excl tax), upgrades, admin fees, Tarion enrollment, parkland levies, CAP amendment, submetering, occupancy fees, common expenses, Schedule D % | \>85% after training  |
| Closing Information       | Credits on closing, deposit interest credits, MLS penalties, assignment penalties, leasing fees, legal fees                                                         | \>80% after training  |
| Critical Dates            | Target closing, contract date, approval date, final sales date, firm occupancy, actual occupancy                                                                    | \>90% after training  |
| Lease & Assignment Rights | Right to lease, unit leased status, limited right of assignment, assignment conditions                                                                              | \>85% after training  |

### AI Review Interface Requirements

1.  Split-screen layout: original document on left, extracted data form on right

2.  Each extracted field shows a confidence percentage (color-coded: green \> 90%, yellow 70-90%, red \< 70%)

3.  Clicking any extracted field highlights the corresponding area in the document

4.  Users can click on the document to select text and assign it to a field (manual override)

5.  Bulk approve option for high-confidence extractions

6.  Reject option with reason capture (feeds into learning)

7.  Version comparison if the same unit was previously processed

8.  Audit trail of all review actions

### Self-Learning Model Specifications (Active Learning Pipeline)

The self-learning component is the most critical technical requirement. The AI must autonomously learn from human corrections using an automated active learning pipeline and robust MLOps architecture. The model must demonstrate measurable improvement over time, progressing from 50-70% accuracy on unseen documents to above 95% with HITL integration.

- Correction Logging: Every correction captures the original value, corrected value, field name, document type, document region (bounding box coordinates), verified text, and user ID. This paired data (Original Image + Corrected Bounding Box + Verified Text) is stored in a structured feedback_data SQL table

- Uncertainty Sampling: The retraining dataset explicitly selects cases where the model was historically least confident or failed. These edge cases are prioritized for learning

- Stratified Sampling (Anti-Catastrophic Forgetting): The retraining dataset must be carefully balanced, mixing historical high-confidence extractions with newly corrected edge cases. Training only on failures causes the model to forget previously mastered layouts

- Automated Retraining Triggers: Temporal workflows monitor the ratio of corrected documents to total committed documents. If accuracy drops below baseline for specific entity types, automated retraining is triggered without manual engineering intervention

- Model Evaluation Gauntlet: Each retraining cycle produces a candidate model (e.g., Model V2). The candidate is evaluated against a hidden, standardized test set. Only if it demonstrably outperforms the production model in precision, recall, and F1-score is it promoted to production

- Model Versioning and Rollback: Each retraining creates a new versioned model in the Model Registry. Automatic rollback if the new version degrades performance on any entity category

- Pattern Recognition: After processing 5+ documents of the same format/template, extraction accuracy for that template should exceed 95%

- Field Priority Learning: Based on corrections and usage patterns, the system learns which fields are most important to the organization and prioritizes their extraction accuracy

- Document Region Mapping: The system maps fields to spatial regions of document templates. For known templates, it learns that buyer name comes from section X, sale price from the payment schedule table, etc.

- Feedback Metrics Dashboard: Extraction accuracy trends over time, most corrected fields, confidence calibration curves, processing time reduction, per-template accuracy, retraining cycle history

- Minimum Training Data: Base VLM capabilities from document 1; self-learning improvements measurable after 20+ documents; template-specific accuracy exceeding 95% after 50+ documents of same format

- PII Redaction in HITL: Human reviewers in the review loop should ideally see only the specific bounding box snippets required to correct an extraction failure, not full unredacted legal documents, to limit PII exposure

### AI-Generated Commission Payable Logic

When the AI extracts a sale document, it must automatically create a commission payable based on the following logic:

1.  Identify the broker associated with the sale (from document or from property-broker assignment)

2.  Look up the broker or broker firm commission configuration

3.  Apply the configured commission model (flat %, tiered, flat fee, hybrid, or split)

4.  Calculate gross commission amount based on net sale price

5.  Apply applicable tax withholding (TDS in India, withholding in USA/Canada)

6.  Calculate net commission payable

7.  If split commission, calculate firm share and agent share separately

8.  Create commission payable record in Pending status for review

9.  Flag for manual review if commission rate is not configured or if multiple brokers are involved

### AI-Generated Payment Schedule Logic

The receivables ledger handles complex fund inflows from buyers. The database must support multi-tier amortization schedules with successive segments governed by unique repayment rules. When payment terms are extracted from the document, the AI generates the buyer payment schedule:

1.  Extract total sale price, down payment amount, and installment terms

2.  If explicit payment schedule exists in document, replicate it as-is

3.  If only summary terms exist (e.g., 20% down, balance in 12 monthly installments), calculate the full schedule

4.  For North American fixed amortization: extract principal, term, and interest rate; apply correct interest calculation method (Actual/360, Actual/365, or 30/360) as specified in financing addendum

5.  For Indian RERA Construction-Linked Plans (CLP): extract milestone events (e.g., 15% upon foundation slab completion); the AI must translate narrative milestone triggers from the payment annexure into structured conditional installment records

6.  Support construction milestone global triggering: developer marks a milestone as complete in the project dashboard, which triggers batch invoice generation and receivable ledger updates for all buyers in that construction phase

7.  For RERA: enforce 70% escrow routing on all receivables; split each payment 70/30 in GL code assignments

8.  Calculate interest if mentioned in agreement; support multi-tier schedules with different rates per segment

9.  Generate individual installment records with due dates and amounts

10. Flag schedule as AI-Generated, Draft for mandatory human review

11. Allow user to modify any installment before finalizing

## Module 8: Yardi System Integration

Upward must integrate with Yardi Voyager as a seamless operational layer. All financial transactions (payables for brokers and receivables from buyers) must be synchronized with the client's Yardi ecosystem. The integration follows a phased approach: Phase 1 uses the FinPayables ETL/CSV methodology for rapid deployment; Phase 2 pursues the deep SIPP API integration for enterprise clients.

### Phase 1: FinPayables ETL and CSV Push (Primary)

The primary integration method uses Yardi's native FinPayables CSV format. When an administrator marks a commission batch as Approved for Payment, the system compiles batch data into the FinPayables schema. The integration mapping dashboard must allow administrators to configure the following critical parameters:

- Yardi Vendor Codes: Every broker, agent, or agency in Upward linked to a unique Yardi Vendor ID for correct payment routing

- Yardi Property Codes: All unit sales and financial transactions tied to correct Yardi asset/entity codes

- General Ledger (GL) Codes: Payments categorized with accounting accuracy; mapping of Upward transaction types to Yardi GL codes; support for split distributions (e.g., Return of Capital vs. Promote)

- Consolidation Indicators: Boolean flag instructing Yardi to consolidate multiple payouts to the same broker into a single check, or maintain as distinct line items

- Accounts Payable / Accrual Codes: Correct liability account mapping to ensure balance sheet integrity before fund disbursement

Delivery methods: SFTP secure file transfer (recommended), automated API push (if client Yardi has premium import features enabled), or manual upload via Yardi Administrator console.

### Phase 2: Standard Interface Partnership Program (SIPP)

For deep, real-time API access, Upward can pursue Yardi's SIPP pathway, utilizing SOAP and REST web services for XML/JSON data exchange. SIPP enables real-time vendor querying, tenant ledger synchronization, and immediate GL posting. Note: SIPP requires an annual licensing fee of \$25,000 per interface type, Data Exchange Agreements, and a mandatory beta-testing phase with a pilot client before general release approval. This route is reserved for Phase 2 targeting tier-one enterprise clients.

### Integration Architecture (Common)

- Sync Direction: Primarily one-way (Upward to Yardi) with status read-back; bidirectional for inventory sync (Module 9)

- Authentication: OAuth 2.0 or API key-based (per Yardi implementation)

- Sync Frequency: On-demand (manual trigger) or scheduled (configurable intervals)

- Error Handling: Failed syncs queued for retry; error dashboard for monitoring

- Abstraction Layer: Integration logic abstracted behind a service layer to support both CSV and API methods without code changes

### Payables Sync (Broker Commissions)

| **Upward Field**   | **Yardi Mapping**   | **Notes**                            |
|--------------------|---------------------|--------------------------------------|
| Broker Name / Firm | Vendor Name         | Create vendor in Yardi if not exists |
| Broker Tax ID      | Vendor Tax ID       |                                      |
| Commission Amount  | Invoice Amount      |                                      |
| Payment Due Date   | Invoice Due Date    |                                      |
| Property ID        | Property Code       | Mapping table required               |
| Unit ID            | Unit Code           |                                      |
| Sale Reference     | Invoice Description | Include sale ID and unit number      |
| GL Account Code    | GL Account          | Configurable per property/country    |

### Receivables Sync (Buyer Payments)

| **Upward Field**   | **Yardi Mapping**    | **Notes**                            |
|--------------------|----------------------|--------------------------------------|
| Buyer Name         | Tenant/Customer Name | Create customer record if not exists |
| Installment Amount | Charge Amount        |                                      |
| Due Date           | Charge Date          |                                      |
| Payment Received   | Receipt Amount       |                                      |
| Receipt Date       | Receipt Date         |                                      |
| Property ID        | Property Code        |                                      |
| Unit ID            | Unit Code            |                                      |
| GL Account Code    | Revenue GL Account   | Configurable per property/country    |

### Sync Monitoring Dashboard

- Total records pending sync

- Last sync timestamp and status

- Failed records with error details

- Retry controls for failed transactions

- Sync history log with filter/search

- Yardi connection health check

## Module 9: Property and Unit Inventory Sync from Yardi

Upward maintains a read-only mirror of the property and unit inventory from Yardi. This inventory data is imported or synced periodically from Yardi systems and serves as the foundation for reporting, analytics, and portfolio-level decision making. The data is not editable within Upward; Yardi remains the system of record for inventory management.

### Sync Objectives

- Provide a unified view of the complete property portfolio across all three countries without requiring manual data entry in Upward

- Enable real-time and historical analytics against the full inventory dataset

- Automatically reflect inventory changes (new units, status changes, pricing updates) as they occur in Yardi

- Serve as the reference dataset for sales performance calculations (e.g., sold vs. available, absorption rate, revenue potential)

### Inventory Data Synced from Yardi

The following data is pulled from Yardi and stored in Upward as read-only inventory records:

### Property-Level Inventory Fields

| **Field**                        | **Source (Yardi)**              | **Update Frequency** | **Notes**                                     |
|----------------------------------|---------------------------------|----------------------|-----------------------------------------------|
| Property Code                    | Yardi Property ID               | On sync              | Primary key for mapping                       |
| Property Name                    | Property Name                   | On sync              |                                               |
| Property Type                    | Property Type Code              | On sync              | Mapped to Upward categories                   |
| Full Address                     | Address fields                  | On sync              | Street, City, State/Province, Postal, Country |
| Country                          | Derived from address            | On sync              | USA, Canada, or India                         |
| Total Units                      | Unit count                      | On sync              | Total inventory count                         |
| Available Units                  | Units with Available status     | On sync              | Real-time availability                        |
| Reserved Units                   | Units with Hold/Reserved status | On sync              |                                               |
| Sold Units                       | Units with Sold/Leased status   | On sync              | Completed transactions                        |
| Property Status                  | Active/Inactive flag            | On sync              |                                               |
| Developer / Owner                | Owner entity name               | On sync              |                                               |
| Year Built / Expected Completion | Build year or est. completion   | On sync              | For under-construction tracking               |
| Total Inventory Value            | Sum of unit list prices         | Calculated           | Total portfolio value for this property       |
| Last Yardi Sync Timestamp        | System-generated                | On sync              | When data was last refreshed                  |

### Unit-Level Inventory Fields

| **Field**               | **Source (Yardi)**      | **Update Frequency** | **Notes**                                       |
|-------------------------|-------------------------|----------------------|-------------------------------------------------|
| Unit Code               | Yardi Unit ID           | On sync              | Primary key for mapping                         |
| Unit Number             | Unit Name/Number        | On sync              | Developer-assigned identifier                   |
| Unit Type               | Unit Type Code          | On sync              | Studio, 1BR, 2BR, etc.                          |
| Floor Number            | Floor field             | On sync              |                                                 |
| Area (sq ft / sq m)     | Square footage          | On sync              |                                                 |
| List Price              | Current asking price    | On sync              | Updated when Yardi pricing changes              |
| Price Per Sq Ft         | Calculated              | On sync              | List Price / Area                               |
| Unit Status             | Availability status     | On sync              | Available, Reserved, Sold, Blocked, Under Offer |
| Bedroom Count           | Bedroom config          | On sync              |                                                 |
| Bathroom Count          | Bathroom config         | On sync              |                                                 |
| Parking Included        | Amenity flags           | On sync              |                                                 |
| View / Orientation      | Unit attributes         | On sync              | North, South, Garden, Sea-facing, etc.          |
| Last Status Change Date | Status update timestamp | On sync              | Tracks velocity of status changes               |
| Days on Market          | Calculated              | On sync              | Days since unit first became Available          |
| Previous Sale Price     | Historical transaction  | On sync              | If resale unit                                  |

### Sync Configuration and Rules

| **Configuration**      | **Options**                                                                          | **Default**                       |
|------------------------|--------------------------------------------------------------------------------------|-----------------------------------|
| Sync Method            | Yardi API (real-time webhook), Yardi Scheduled Export (CSV/XML), Manual Upload (CSV) | Yardi API preferred; CSV fallback |
| Sync Frequency         | Real-time (webhook), Every 15 min, Hourly, Daily, Manual                             | Hourly for API; Daily for CSV     |
| Conflict Resolution    | Yardi always wins (read-only mirror)                                                 | No override allowed in Upward     |
| New Property Handling  | Auto-create in Upward, Queue for admin approval                                      | Queue for approval                |
| Deleted/Archived Units | Soft-delete in Upward (retain for historical analytics)                              | Soft-delete                       |
| Data Validation        | Schema validation on sync; reject malformed records                                  | Log errors; continue sync         |
| Sync Scope             | All properties, By country, By property selection                                    | All properties                    |

### Inventory Sync Monitoring

- Last sync timestamp per property with success/failure indicator

- Record count comparison: Yardi source count vs. Upward mirror count

- Delta log: what changed in each sync cycle (new units, status changes, price updates)

- Sync error queue with details and retry capability

- Alert notifications for sync failures exceeding configurable thresholds (e.g., no sync for 24 hours)

- Manual force-sync option for individual properties or full portfolio

## Module 10: Real-Time Analytics Dashboard

The analytics dashboard is the command center for portfolio owners, sales managers, and leadership. It provides real-time visibility into sales performance, inventory status, partner effectiveness, and year-over-year trends. The dashboard is built on top of the synced Yardi inventory data combined with Upward sale transaction records to deliver a unified analytical view.

### Dashboard Design Principles

- Real-time data refresh (within 5 minutes of any transaction or sync event)

- Interactive filters: by country, property, date range, unit type, broker/partner, sale status

- Drill-down capability: click any metric to see underlying records

- Responsive layout: optimized for large desktop monitors but functional on tablets

- Export capability: download any dashboard view as PDF or Excel

- Configurable: users can pin/unpin widgets and set default filters per their role

- Comparison mode: side-by-side views for any two time periods, properties, or partners

### Dashboard Section 1: Executive Summary KPIs

The top-level KPI strip provides instant portfolio health at a glance. All KPIs update in real time and support drill-down.

| **KPI Widget**                 | **Metric**                                       | **Visual**                                             | **Drill-Down**                        |
|--------------------------------|--------------------------------------------------|--------------------------------------------------------|---------------------------------------|
| Total Revenue (Current Period) | Sum of all confirmed net sale prices             | Large number + trend arrow vs. prior period            | Sales list filtered by period         |
| Units Sold (Current Period)    | Count of units with Confirmed/Completed status   | Number + % of total inventory                          | Sales list                            |
| Inventory Remaining            | Total Available units across all properties      | Number + donut chart (sold vs. available vs. reserved) | Unit grid filtered to Available       |
| Average Sale Price             | Mean net sale price across confirmed sales       | Number + trend arrow                                   | Sales list sorted by price            |
| Average Days to Close          | Mean days from unit listing to sale confirmation | Number + sparkline trend                               | Sales sorted by close time            |
| Total Commissions Payable      | Sum of pending + approved commissions            | Number split by Pending/Approved/Paid                  | Commission management screen          |
| Outstanding Receivables        | Total buyer payments due but not yet received    | Number + aging badge (overdue amount)                  | Payment schedules filtered to overdue |
| Collection Rate                | Amount received / Amount due for current period  | Percentage + gauge chart                               | Installment records                   |

### Dashboard Section 2: Sales Performance Analytics

Detailed sales performance charts and graphs for deep analysis.

| **Chart / Widget**               | **Description**                                                                                        | **Interactivity**                                                                    |
|----------------------------------|--------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Sales Trend Line                 | Monthly/quarterly sales count and revenue over time; dual-axis chart (units on left, revenue on right) | Toggle between monthly/quarterly; filter by property/country; hover for exact values |
| Sales by Country                 | Stacked bar chart or map view showing sales volume and revenue split across USA, Canada, India         | Click country to filter entire dashboard; compare mode between countries             |
| Sales by Property                | Horizontal bar chart ranking properties by units sold or revenue                                       | Sort by units or revenue; click to drill into property detail                        |
| Sales Velocity / Absorption Rate | Units sold per month as percentage of total available inventory; tracks how fast inventory is moving   | By property, by unit type; historical trend overlay                                  |
| Pipeline Funnel                  | Visual funnel: Available \> Reserved \> Under Agreement \> Sold \> Completed                           | Click each stage for unit list; conversion rates between stages                      |
| Price Per Sq Ft Analysis         | Scatter plot of actual sale price/sq ft vs. list price/sq ft across units                              | Filter by property, unit type; identify discounting patterns                         |
| Discount Analysis                | Average discount % by property, broker, and unit type                                                  | Highlights where deep discounting is occurring                                       |
| Sale Source Breakdown            | Pie chart: Manual Entry vs. AI Extraction; shows AI adoption rate                                      | Click to see records by source                                                       |

### Dashboard Section 3: Inventory Analytics

Real-time inventory status powered by the Yardi inventory sync.

| **Chart / Widget**           | **Description**                                                                                                   | **Interactivity**                                             |
|------------------------------|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| Portfolio Inventory Overview | Treemap or stacked bar: total units by property, colored by status (Available/Reserved/Sold)                      | Click property to expand; filter by country                   |
| Inventory by Unit Type       | Grouped bar chart: available vs. sold count for each unit type (Studio, 1BHK, 2BHK, etc.)                         | Filter by property; shows demand patterns by type             |
| Inventory Value Summary      | Total unsold inventory value (Available units x list price); total sold value; total portfolio value              | By country, by property; trend over time                      |
| Aging Inventory Report       | Units available for 30+, 60+, 90+, 180+ days without sale; highlights stale inventory                             | Drill into specific units; sortable by days on market         |
| Floor-Level Heatmap          | Visual grid/heatmap per property showing floor-by-floor availability and pricing                                  | Hover for unit details; click to see sale/availability record |
| Price vs. Inventory Scatter  | Bubble chart: x-axis = list price, y-axis = days on market, bubble size = area; identifies overpriced slow movers | Filter by property, unit type                                 |
| New Inventory Added          | Timeline showing when new units were synced from Yardi; tracks pipeline of new listings                           | Monthly/weekly view; by property                              |
| Inventory Forecast           | Projected months to sell out remaining inventory based on current absorption rate                                 | By property; adjustable assumption inputs                     |

### Dashboard Section 4: Top Sales Partners (Brokers and Firms)

This section ranks and analyzes the performance of sales partners, which can be individual brokers or brokerage firms. The default view shows the top 10 partners, expandable to a full leaderboard.

| **Chart / Widget**            | **Description**                                                                                                                                                            | **Interactivity**                                                           |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Top 5 / Top 10 Leaderboard    | Ranked table of sales partners by total revenue generated; shows: Rank, Partner Name, Type (Individual/Firm), Units Sold, Total Revenue, Avg Sale Price, Commission Earned | Toggle between Top 5/10/All; sort by any column; filter by country/property |
| Partner Performance Bar Chart | Horizontal bar chart comparing top partners side-by-side on revenue or units sold                                                                                          | Switch metric (revenue/units/commission); add/remove partners from view     |
| Partner Trend Lines           | Multi-line chart showing each top partner sales trend over the past 12 months                                                                                              | Select up to 5 partners to compare; overlay with total market trend         |
| Partner Market Share          | Pie or donut chart: percentage of total sales attributable to each top partner                                                                                             | By revenue or by units; filter by property/country                          |
| Partner Conversion Rate       | Percentage of reserved/offered units that convert to confirmed sale, by partner                                                                                            | Identifies most effective closers vs. those with high fallout               |
| New vs. Repeat Partners       | Split view: revenue from established partners vs. newly onboarded partners (last 90 days)                                                                                  | Track effectiveness of new partnerships                                     |
| Commission Efficiency         | Revenue generated per dollar of commission paid; identifies cost-effective partnerships                                                                                    | Rank by efficiency ratio; filter by period                                  |
| Partner Activity Timeline     | Chronological view of sales by a selected partner; shows deal frequency and recency                                                                                        | Select any partner; zoom to date range                                      |

### Dashboard Section 5: Year-over-Year Comparison

Comprehensive comparison tools to analyze current year performance against previous years. This section is critical for portfolio owners to understand growth trajectories and identify trends.

| **Chart / Widget**        | **Description**                                                                                                          | **Interactivity**                                                    |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| YoY Revenue Comparison    | Dual-line chart: current year monthly revenue overlaid on previous year; shows growth/decline clearly                    | Select comparison year (Y-1, Y-2, Y-3); filter by property/country   |
| YoY Units Sold Comparison | Side-by-side bar chart: units sold per month, current year vs. comparison year                                           | Cumulative or monthly view; filter by unit type                      |
| YoY Average Price Trend   | Line chart comparing average sale price month-over-month across years                                                    | By property, country, unit type                                      |
| YoY Growth Summary Table  | Summary table: Revenue Growth %, Units Sold Growth %, Avg Price Change %, Absorption Rate Change, Commission Cost Change | Configurable base year; by property/country/partner                  |
| Quarter-over-Quarter View | Same metrics but at quarterly granularity for less granular strategic view                                               | Current quarter vs. same quarter prior year; vs. prior quarter       |
| Seasonal Patterns         | Heatmap showing which months/quarters historically perform best across years                                             | Helps forecast optimal launch windows                                |
| Cumulative Sales Curve    | Running total of sales through the year, current year vs. prior years; shows if ahead or behind pace                     | Projection line based on current velocity to estimate year-end total |
| YoY by Country            | Country-level comparison: how is each market performing relative to last year                                            | Drill into country for property-level breakdown                      |

### Dashboard Section 6: Financial Overview

| **Chart / Widget**          | **Description**                                                                                                              | **Interactivity**                                 |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| Revenue vs. Collections     | Dual-axis chart: confirmed sale revenue vs. actual cash collected over time                                                  | By property/country; highlights collection gap    |
| Commission Cost Ratio       | Commission expense as % of total revenue; trend over time                                                                    | By partner, property; benchmark against targets   |
| Receivables Aging Waterfall | Stacked bar: Current, 30-day, 60-day, 90-day, 120+ day outstanding amounts                                                   | Click aging bucket to see individual installments |
| Tax Obligations Summary     | Country-wise breakdown of stamp duty, GST/HST, TDS, transfer tax collected/payable                                           | Drill into specific tax type by property          |
| Cash Flow Projection        | Forward-looking: expected inflows (buyer installments due) vs. expected outflows (commission payments due) over next 90 days | Adjustable time horizon; by property              |

### Dashboard Technical Requirements

| **Requirement**           | **Specification**                                                                                                                                               |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data Refresh Rate         | Dashboard metrics refresh within 5 minutes of source data change; real-time WebSocket updates for active users                                                  |
| Data Warehouse            | Dedicated analytical data store (PostgreSQL materialized views or a lightweight warehouse like ClickHouse) separate from transactional DB to avoid query impact |
| Pre-Computed Aggregations | Daily/hourly rollup jobs for KPIs, partner rankings, and YoY comparisons to ensure sub-second dashboard load times                                              |
| Caching Layer             | Redis cache for frequently accessed dashboard queries with 5-minute TTL                                                                                         |
| Date Range Support        | Arbitrary date range selection; quick presets: Today, This Week, This Month, This Quarter, This Year, Last Year, Custom                                         |
| Filter Persistence        | User-selected filters persist across sessions; role-based default filters (e.g., Property Admin sees only their properties)                                     |
| Export Options            | Export any chart/table as: PDF (formatted), Excel (data + chart), PNG (chart image), CSV (raw data)                                                             |
| Scheduled Reports         | Users can schedule any dashboard view to be emailed as PDF on a daily/weekly/monthly cadence                                                                    |
| Mobile Responsiveness     | Dashboard responsive on tablet (1024px+); simplified KPI view on mobile; charts stack vertically                                                                |
| Permissions               | Dashboard widgets visible based on user role; Broker Portal users see only their own partner metrics                                                            |

# Non-Functional Requirements

## Performance

- Page load time: under 2 seconds for standard pages

- AI document processing: under 30 seconds for single document extraction

- Search results: under 1 second for any record search

- Concurrent users: support 200+ simultaneous users

- Yardi sync: process 500+ transactions per batch within 5 minutes

- Analytics dashboard: initial load under 3 seconds; chart interactions under 500ms

- Inventory sync from Yardi: full sync under 10 minutes for 10,000+ units; incremental sync under 60 seconds

- YoY comparison queries: pre-computed aggregations ensure sub-second response for any date range

## Security

- Authentication: Multi-factor authentication (MFA) mandatory for all users

- Authorization: Role-based access control (RBAC) with granular permissions

- Data Encryption: AES-256 at rest, TLS 1.3 in transit

- PII Protection: All personally identifiable information encrypted and access-logged

- Sensitive Financial Data: Bank accounts, tax IDs stored with field-level encryption

- Audit Logging: Every create, read, update, delete action logged with user, timestamp, IP

- Session Management: Auto-timeout after 30 minutes of inactivity; concurrent session limits

- Compliance: SOC 2 Type II, GDPR (for any EU data), PIPEDA (Canada), IT Act 2000 (India)

## Scalability

- Horizontal scaling for web and API tiers

- Database designed for partitioning by country/property

- AI processing queue with auto-scaling workers

- CDN for static assets; multi-region deployment capability

## Availability

- Target uptime: 99.9% SLA

- Automated failover for database and application tiers

- Daily automated backups with 30-day retention

- Disaster recovery plan with RPO \< 1 hour, RTO \< 4 hours

## Localization

- Currency display: USD (\$), CAD (C\$), INR (₹) with proper formatting

- Date formats: MM/DD/YYYY (USA), DD/MM/YYYY (India), YYYY-MM-DD (Canada, ISO)

- Area measurements: sq ft (USA/India), sq ft or sq m (Canada, configurable)

- Number formatting: 1,000,000.00 (USA/Canada), 10,00,000.00 (India, Lakhs/Crores)

- Timezone support per property location

# System Architecture Overview

## Technology Stack (Recommended)

| **Layer**                | **Technology**                                | **Rationale**                                                   |
|--------------------------|-----------------------------------------------|-----------------------------------------------------------------|
| Frontend                 | React.js / Next.js with TypeScript            | Component-based, SSR support, strong ecosystem                  |
| UI Framework             | Tailwind CSS + shadcn/ui                      | Rapid, consistent, accessible UI development                    |
| Backend API              | Node.js (NestJS) or Python (FastAPI)          | NestJS for enterprise patterns; FastAPI for AI-heavy workloads  |
| Database                 | PostgreSQL (primary)                          | ACID compliance, JSON support, strong geospatial                |
| Document Storage         | AWS S3 / Azure Blob Storage                   | Scalable, secure document storage with versioning               |
| AI / ML Engine           | Python + LangChain + GPT-4o / Claude API      | LLM-based extraction with OCR pipeline                          |
| OCR Layer                | AWS Textract / Google Document AI / Tesseract | High-accuracy OCR for scanned documents                         |
| Search                   | Elasticsearch                                 | Fast full-text search across all records                        |
| Cache                    | Redis                                         | Session management, API caching, rate limiting                  |
| Queue / Workers          | Bull (Node) / Celery (Python) with Redis      | Async AI processing, Yardi sync jobs                            |
| Authentication           | Auth0 / Keycloak                              | Enterprise SSO, MFA, RBAC                                       |
| Monitoring               | Datadog / Grafana + Prometheus                | APM, logging, alerting                                          |
| CI/CD                    | GitHub Actions / GitLab CI                    | Automated testing and deployment                                |
| Hosting                  | AWS / Azure / GCP                             | Multi-region cloud deployment                                   |
| Charting / Visualization | Recharts / Apache ECharts (frontend)          | Interactive dashboard charts, drill-down, export                |
| Analytics Data Store     | PostgreSQL Materialized Views or ClickHouse   | Pre-aggregated analytics for sub-second queries                 |
| Scheduled Jobs           | pg_cron / AWS EventBridge / node-cron         | Aggregation rollups, inventory sync scheduling, report delivery |
| WebSocket                | Socket.io / AWS AppSync                       | Real-time dashboard updates on data changes                     |

## High-Level Architecture

The system follows a microservices-oriented architecture with the following core services:

1.  API Gateway: Authentication, rate limiting, request routing

2.  Property Service: Property and unit CRUD, status management

3.  Sales Service: Sale transaction recording, lifecycle management

4.  Buyer Service: Buyer profiles, KYC management, joint buyer handling

5.  Broker Service: Broker profiles, commission configuration and calculation

6.  Payment Service: Payables (commissions), receivables (installments), payment processing

7.  AI Engine Service: Document upload, OCR, extraction, review, learning pipeline

8.  Integration Service: Yardi API connector, sync queue, error handling

9.  Inventory Sync Service: Yardi inventory pull, change detection, read-only mirror management, delta logging

10. Compliance Service: Country-specific rules engine, tax calculations, validation

11. Notification Service: Email, in-app notifications for payment reminders, approval requests

12. Analytics and Reporting Service: Aggregation pipeline, dashboard APIs, KPI computation, YoY calculations, partner rankings, scheduled report delivery

# Database Architecture and Data Residency

## Multi-Tenant Data Modeling

To balance data isolation with infrastructure efficiency, Upward uses the Shared Database, Separate Schema architecture. All clients operate on a single PostgreSQL instance, but each client or geographic region is allocated a separate database schema with its own tables. This provides strong data security and logical isolation for handling sensitive KYC documents (FINTRAC), financial disclosures (RESPA), and PII across jurisdictions, while keeping infrastructure costs moderate.

## Dynamic Attributes Pattern (JSONB Implementation)

A fundamental challenge in multi-country software is the divergence of required data fields across jurisdictions. Hardcoding all fields into rigid relational tables creates sparsely populated, bloated structures requiring disruptive schema migrations whenever a jurisdiction updates its laws. Upward solves this with the Dynamic Attributes Pattern leveraging PostgreSQL JSONB columns:

- Base tables (Unit_Sales, Properties, Buyers, Commissions) contain only universally required columns applicable across all jurisdictions (e.g., sale_id, property_id, buyer_id, base_sale_price, transaction_date)

- A localized compliance_metadata JSONB column stores all region-specific data. For India: rera_reg_number, escrow_bank_details, carpet_area. For Canada: fintrac_24hr_flag, foreign_equity_pct, dual_process_id. For USA: ucd_closing_data, buyer_broker_agreement_verified

- The application frontend dynamically generates UI forms and AI extraction targets based purely on the property's country code

- This achieves infinite extensibility: new regulatory fields can be added instantly without database downtime or complex migrations

## Data Residency and Region-Aware Routing

Sensitive PII extracted from contracts must comply with regional data residency requirements. The system employs intelligent region-aware routing:

- Canadian citizen data stored exclusively in Canadian cloud instances (e.g., AWS ca-central-1) to satisfy PIPEDA and federal auditing standards

- Indian data subject to Data Protection Act requirements; storage in India-region instances

- US data compliant with state-level privacy regulations (CCPA for California residents, etc.)

- Documents stored in object storage (S3/R2) encrypted at rest (AES-256) and in transit (TLS 1.3)

- RBAC rigorously enforced on HITL review process; PII redaction/obfuscation ensures reviewers only access specific bounding box snippets, not full unredacted documents

## Core Database Entity Model

The following entities form the backbone of the Upward data model. Each entity maps to the data fields defined in the functional requirements sections above. All entities include a compliance_metadata JSONB column for country-specific fields per the Dynamic Attributes Pattern.

| **Entity**               | **Key Relationships**                                                      | **Partition Strategy**  |
|--------------------------|----------------------------------------------------------------------------|-------------------------|
| Property                 | Has many Units, Sales, Broker Assignments                                  | By country              |
| Unit                     | Belongs to Property; Has one Sale (active)                                 | By property             |
| Buyer                    | Has many Sales, Payment Schedules                                          | By country              |
| Sale                     | Belongs to Property, Unit, Buyer; Has one Commission, one Payment Schedule | By property + date      |
| Broker                   | Has many Sales, Commissions; May belong to Broker Firm                     | By country              |
| Broker Firm              | Has many Brokers                                                           | By country              |
| Commission Config        | Belongs to Broker or Firm; Scoped to Property (optional)                   | By broker               |
| Commission               | Belongs to Sale, Broker; Has many Payments                                 | By sale date            |
| Commission Payment       | Belongs to Commission                                                      | By payment date         |
| Payment Schedule         | Belongs to Sale, Buyer; Has many Installments                              | By sale                 |
| Installment              | Belongs to Payment Schedule                                                | By due date             |
| Unit Fee Detail          | Belongs to Unit; Stores fees, charges, and Schedule D % per unit           | By unit                 |
| Unit Closing Info        | Belongs to Unit/Sale; Credits, penalties, legal fees at closing            | By sale                 |
| Unit Critical Dates      | Belongs to Unit/Sale; Milestone dates from contract to occupancy           | By unit                 |
| Unit Lease Info          | Belongs to Unit; Lease rights, assignment rights, tenant details           | By unit                 |
| NSF Event                | Belongs to Buyer, Sale, Installment; Tracks bounced payments               | By buyer + date         |
| NSF Fine                 | Belongs to NSF Event; Fine amount, status, payment, waiver details         | By NSF event            |
| NSF Configuration        | Belongs to Property (or global); Default fine rules and escalation         | By property             |
| Document                 | Belongs to Sale; Linked to AI Extraction                                   | By upload date          |
| AI Extraction            | Belongs to Document; Has many Field Extractions                            | By document             |
| AI Correction Log        | Belongs to AI Extraction; Used for model training                          | By date                 |
| Yardi Sync Log           | Polymorphic: links to Commission Payment or Installment                    | By sync date            |
| Audit Log                | Polymorphic: any entity                                                    | By date + entity type   |
| Yardi Inventory Property | Read-only mirror from Yardi; Has many Inventory Units                      | By country              |
| Yardi Inventory Unit     | Belongs to Inventory Property; Read-only mirror from Yardi                 | By property             |
| Inventory Sync Job       | Tracks each sync execution: status, records processed, errors              | By sync date            |
| Inventory Change Log     | Records delta changes per sync: field changed, old value, new value        | By sync date + property |
| Analytics Aggregation    | Pre-computed daily/monthly rollups for KPIs, partner rankings, YoY data    | By period + dimension   |
| Dashboard Configuration  | User-specific: pinned widgets, default filters, saved views                | By user                 |
| Scheduled Report         | User-configured: report type, filters, frequency, recipients               | By user                 |

# API Design Guidelines

All APIs follow RESTful conventions with consistent patterns across the platform.

## Core API Endpoints

| **Module**                  | **Endpoint Pattern**                        | **Methods**                             |
|-----------------------------|---------------------------------------------|-----------------------------------------|
| Properties                  | /api/v1/properties                          | GET, POST, PUT, DELETE                  |
| Units                       | /api/v1/properties/{id}/units               | GET, POST, PUT, DELETE                  |
| Buyers                      | /api/v1/buyers                              | GET, POST, PUT, DELETE                  |
| Sales                       | /api/v1/sales                               | GET, POST, PUT, PATCH                   |
| Brokers                     | /api/v1/brokers                             | GET, POST, PUT, DELETE                  |
| Commissions                 | /api/v1/commissions                         | GET, POST, PATCH                        |
| Commission Payments         | /api/v1/commissions/{id}/payments           | GET, POST, PATCH                        |
| Payment Schedules           | /api/v1/payment-schedules                   | GET, POST, PUT                          |
| Installments                | /api/v1/payment-schedules/{id}/installments | GET, PATCH                              |
| Unit Fees                   | /api/v1/units/{id}/fees                     | GET, POST, PUT                          |
| Unit Closing Info           | /api/v1/units/{id}/closing-info             | GET, POST, PUT                          |
| Unit Critical Dates         | /api/v1/units/{id}/critical-dates           | GET, POST, PUT                          |
| Unit Lease Info             | /api/v1/units/{id}/lease-info               | GET, POST, PUT                          |
| NSF Events (by Buyer)       | /api/v1/buyers/{id}/nsf-events              | GET, POST                               |
| NSF Event Detail            | /api/v1/nsf-events/{id}                     | GET, PATCH                              |
| NSF Fines                   | /api/v1/nsf-events/{id}/fine                | GET, PATCH (pay/waive)                  |
| NSF Configuration           | /api/v1/properties/{id}/nsf-config          | GET, PUT                                |
| Document Upload             | /api/v1/ai/documents                        | POST (upload), GET                      |
| AI Extraction               | /api/v1/ai/extractions/{id}                 | GET, PATCH (review)                     |
| AI Extraction Approval      | /api/v1/ai/extractions/{id}/approve         | POST                                    |
| Yardi Sync                  | /api/v1/integrations/yardi/sync             | POST (trigger), GET (status)            |
| Inventory Properties        | /api/v1/inventory/properties                | GET (read-only)                         |
| Inventory Units             | /api/v1/inventory/properties/{id}/units     | GET (read-only, filterable)             |
| Inventory Sync Trigger      | /api/v1/inventory/sync                      | POST (trigger), GET (status/history)    |
| Inventory Change Log        | /api/v1/inventory/changelog                 | GET (delta changes per sync)            |
| Analytics KPIs              | /api/v1/analytics/kpis                      | GET (filtered by date/property/country) |
| Analytics Sales Performance | /api/v1/analytics/sales                     | GET (charts data)                       |
| Analytics Inventory         | /api/v1/analytics/inventory                 | GET (inventory analytics)               |
| Analytics Partners          | /api/v1/analytics/partners                  | GET (top partners, rankings)            |
| Analytics YoY Comparison    | /api/v1/analytics/yoy                       | GET (year-over-year data)               |
| Analytics Financial         | /api/v1/analytics/financial                 | GET (receivables, commissions)          |
| Analytics Export            | /api/v1/analytics/export                    | POST (PDF/Excel/CSV export)             |
| Scheduled Reports           | /api/v1/analytics/scheduled-reports         | GET, POST, PUT, DELETE                  |
| Reports                     | /api/v1/reports/{type}                      | GET                                     |

## API Standards

- All responses in JSON with consistent envelope: { success, data, error, meta }

- Pagination: cursor-based for large datasets, offset-based for admin screens

- Filtering: query parameters for date ranges, status, country, property

- Versioning: URI-based (/v1/, /v2/)

- Rate limiting: 1000 requests/minute per user; 100 requests/minute for AI endpoints

- Webhooks: configurable for sale creation, payment received, sync completion events

# Key UI Screens and Wireframe Descriptions

The following screens represent the primary user interfaces in the Upward platform. These descriptions serve as requirements for the design team.

| **Screen**                  | **Purpose**                         | **Key Elements**                                                                                                                           |
|-----------------------------|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Dashboard                   | Overview of sales activity and KPIs | Sales summary by property/country, revenue charts, pending approvals, AI processing queue, recent activity feed                            |
| Property List               | Browse and manage properties        | Filterable list with status badges, unit count, sold/available ratio, country flag                                                         |
| Unit Grid                   | View all units in a property        | Grid or floor-plan view, color-coded by status, quick-sale action, pricing details                                                         |
| Sale Recording Form         | Manual sale entry                   | Multi-step form: select unit, enter buyer, broker, pricing, tax calc, document upload                                                      |
| AI Upload & Extract         | Document upload and AI processing   | Drag-and-drop upload, processing status, queue position, batch upload support                                                              |
| AI Review Screen            | Review AI-extracted data            | Split-screen: document viewer (left) + extracted form (right), confidence scores, field highlighting, approve/correct actions              |
| Buyer Profile               | Buyer detail view                   | Contact info, KYC status, purchase history, payment schedule summary, NSF risk badge, NSF history timeline, outstanding fines, documents   |
| Buyer NSF History           | NSF event log and fine management   | Chronological NSF event list, fine status/payment tracking, resubmission status, risk indicator, export for collections                    |
| Unit Detail View            | Comprehensive unit record           | All unit info tabs: General, Fees & Charges, Closing Info, Critical Dates, Lease Info, Sale History, Documents                             |
| Broker Profile              | Broker detail view                  | Contact/license info, commission config, sales history, payment history, performance metrics                                               |
| Commission Management       | View and manage commissions         | List of pending/approved/paid commissions, bulk approve, create payment, filter by broker/property                                         |
| Payment Schedule View       | Buyer installment tracking          | Timeline view of installments, NSF alert banner for flagged buyers, status indicators, record payment action, send reminder                |
| Yardi Sync Dashboard        | Integration monitoring              | Pending/synced/failed counts, sync history, retry controls, connection status                                                              |
| Inventory Explorer          | Browse synced Yardi inventory       | Property list with availability stats, unit-level grid view, status filters, search, floor heatmap, days-on-market indicators              |
| Inventory Sync Monitor      | Track inventory sync from Yardi     | Last sync time per property, record counts, delta changes, error log, manual force-sync button                                             |
| Analytics Dashboard         | Executive real-time analytics       | KPI strip, sales trend charts, inventory overview, partner leaderboard, YoY comparison, financial summary; all interactive with drill-down |
| Partner Leaderboard         | Top sales partner rankings          | Top 5/10/All toggle, ranked table with revenue/units/commission, trend sparklines, comparison mode                                         |
| YoY Comparison View         | Year-over-year analysis             | Dual-line charts, growth % tables, seasonal heatmap, cumulative pace tracker; configurable comparison year                                 |
| Reports & Scheduled Reports | Report generation and scheduling    | On-demand reports, scheduled email delivery config, export as PDF/Excel/CSV                                                                |

# Reporting Requirements

## Standard Reports

| **Report Name**            | **Description**                                                                            | **Filters**                                                         |
|----------------------------|--------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Sales Summary              | Total units sold, revenue by period                                                        | Date range, property, country, broker                               |
| Sales Pipeline             | Units by status (available, reserved, sold)                                                | Property, date range                                                |
| Broker Commission Report   | Commissions earned, paid, pending by broker                                                | Broker, date range, property, status                                |
| Receivables Aging          | Outstanding buyer payments by aging bucket                                                 | Property, buyer, aging bucket (30/60/90/120+ days)                  |
| Payables Report            | Outstanding broker payments                                                                | Broker, date range, status                                          |
| Collection Efficiency      | Payment received vs due by period                                                          | Property, date range                                                |
| AI Performance             | Extraction accuracy, corrections, processing time                                          | Date range, document type, field                                    |
| Compliance Report          | KYC status, tax withholding, regulatory flags                                              | Country, property, status                                           |
| Yardi Sync Status          | Sync success/failure rates, pending items                                                  | Date range, sync type, status                                       |
| Audit Trail                | All system actions with user attribution                                                   | Date range, user, action type, entity                               |
| Inventory Status Report    | Complete inventory snapshot: available, reserved, sold units by property                   | Country, property, unit type, status                                |
| Inventory Aging Report     | Units on market for 30+/60+/90+/180+ days without sale                                     | Property, country, days on market threshold                         |
| Absorption Rate Report     | Monthly units sold as % of available inventory per property                                | Property, country, date range                                       |
| Top Partners Report        | Ranked sales partners by revenue, units, commission; with trend data                       | Date range, country, property, partner type (individual/firm)       |
| YoY Sales Comparison       | Side-by-side metrics for current vs. previous year(s)                                      | Comparison year, country, property, granularity (monthly/quarterly) |
| Portfolio Valuation Report | Total inventory value, sold value, unsold value by property and country                    | Country, property, as-of date                                       |
| Sales Velocity Report      | Time from listing to sale by property, unit type, price band                               | Property, date range, unit type                                     |
| Cash Flow Forecast         | Projected inflows (buyer installments) vs outflows (commissions) for next 30/60/90 days    | Property, time horizon                                              |
| NSF Events Report          | All NSF events by buyer, property, and period; includes fine amounts and resolution status | Date range, buyer, property, fine status                            |
| NSF Risk Report            | Buyers flagged with high NSF frequency; escalation recommendations                         | NSF count threshold, property, country                              |
| Outstanding NSF Fines      | Unpaid fines aging report with buyer contact details for collections follow-up             | Fine status, aging bucket, property                                 |
| Unit Fees Summary          | Aggregate fees and charges by property; compares across units for pricing consistency      | Property, fee type, unit type                                       |

## Export Formats

- PDF: Formatted reports with company branding

- Excel (XLSX): Data exports with filters and pivot-ready formatting

- CSV: Raw data exports for custom analysis

## Module 11: End-to-End Unit Sales Lifecycle Process

This module defines the unified, end-to-end unit sales lifecycle integrating the financial, legal, and operational nuances of the USA, Canada, and India markets. It orchestrates the complete flow from lead commitment through handover and post-closing warranty management, incorporating construction-stage awareness via Procore integration and localized closing statement generation.

### Market-Specific Compliance and Warranty Frameworks

Each market imposes distinct regulatory regimes, warranty obligations, and escrow structures that the system must enforce at every stage of the sales lifecycle.

| **Feature**        | **USA**                                                                   | **Canada (Ontario Context)**                                                       | **India**                                                                              |
|--------------------|---------------------------------------------------------------------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Primary Regulation | FinCEN Residential Rule (2026)                                            | Tarion (ONHWP Act)                                                                 | RERA (MahaRERA / State Acts)                                                           |
| Mandatory Warranty | Varies by State (Home Warranty)                                           | Tarion: 1-2-7 Year Coverage                                                        | RERA: 5-Year Structural Warranty                                                       |
| Escrow Logic       | Transaction Security: Settlement-focused                                  | Deposit Protection: Up to \$100K (Condos)                                          | Project Protection: 70% of funds locked for construction                               |
| Key 2026 Rule      | FinCEN reporting for all non-financed (cash) transfers to entities/trusts | 45-Day Registration: Buyers must notify Tarion within 45 days for maximum coverage | 3-Account System: Mandatory Collection, Separate (70%), and Transaction (30%) accounts |

### FinCEN Residential Real Estate Rule (2026 – USA)

Effective 2026, FinCEN's Residential Real Estate Rule mandates reporting for all non-financed (cash) real estate transfers involving legal entities such as trusts, LLCs, corporations, and partnerships. The system must automatically detect when a buyer is a legal entity making a cash purchase (no mortgage financing involved) and trigger the generation of a FinCEN Real Estate Report. This report captures the beneficial ownership structure of the purchasing entity, the source of funds, and transaction details. The system must flag these transactions during the booking/earnest money phase and prevent sale confirmation until the FinCEN report is completed and filed.

| **Field**                   | **Type**           | **Required** | **Notes**                                                                                 |
|-----------------------------|--------------------|--------------|-------------------------------------------------------------------------------------------|
| FinCEN Report Triggered     | Boolean            | Auto         | Auto-set when buyer is entity/trust AND payment method is non-financed (cash/wire)        |
| Beneficial Owner(s)         | Text (multiple)    | Yes          | Full legal names and identifying information of all beneficial owners with 25%+ ownership |
| Entity Type                 | Dropdown           | Yes          | LLC, Trust, Corporation, Partnership, Other                                               |
| Source of Funds Declaration | Text / File Upload | Yes          | Written declaration or supporting documentation of fund origin                            |
| FinCEN Report Status        | Dropdown           | Yes          | Not Required, Pending, Filed, Acknowledged                                                |
| FinCEN Filing Reference     | Text               | Conditional  | Filing confirmation number from FinCEN e-filing system                                    |
| Filing Date                 | Date               | Conditional  | Date the report was submitted to FinCEN                                                   |

### Tarion 45-Day Registration Rule (2026 – Canada/Ontario)

Under the Ontario New Home Warranties Plan Act (ONHWP), buyers of new construction homes must be enrolled with Tarion within 45 days of the purchase agreement to receive maximum warranty coverage under the 1-2-7 year warranty program: 1 year for materials and labour defects, 2 years for mechanical/electrical and building code violations, and 7 years for major structural defects. The system must auto-generate a Tarion Home ID and registration code at the time of sale commitment, track the 45-day deadline, and escalate if registration has not been confirmed within the window.

| **Field**                | **Type**          | **Required** | **Notes**                                                                     |
|--------------------------|-------------------|--------------|-------------------------------------------------------------------------------|
| Tarion Home ID           | Auto-generated    | Yes          | System-generated unique identifier linked to the Tarion enrollment system     |
| Tarion Registration Code | Text              | Yes          | Code issued upon successful Tarion registration                               |
| Registration Deadline    | Date (Calculated) | Auto         | Contract Date + 45 calendar days; system auto-calculates                      |
| Registration Status      | Dropdown          | Yes          | Not Started, Pending, Registered, Expired, Escalated                          |
| Warranty Coverage Start  | Date              | Conditional  | Date Tarion confirms warranty coverage activation (typically possession date) |
| 1-Year Warranty Expiry   | Date (Calculated) | Auto         | Warranty Start + 1 year (materials and labour)                                |
| 2-Year Warranty Expiry   | Date (Calculated) | Auto         | Warranty Start + 2 years (mechanical/electrical/code)                         |
| 7-Year Warranty Expiry   | Date (Calculated) | Auto         | Warranty Start + 7 years (major structural defects)                           |
| Tarion Enrollment Fee    | Currency          | Conditional  | Fee varies by unit price tier; reimbursed to builder at closing               |
| Bulletin 19 Compliance   | Boolean           | Conditional  | Tarion Bulletin 19 compliance confirmed (Ontario)                             |

### India RERA 3-Account System

Under RERA regulations, developers must maintain a 3-account structure for all buyer funds. The system must enforce automatic routing of every incoming payment according to this structure:

1.  **Collection Account:** All buyer payments are initially received into the Collection Account. This is the entry point for all funds.

2.  **Separate Account (70%):** Within the prescribed timeframe, 70% of each collected payment must be transferred to the RERA Separate Account, which is ring-fenced exclusively for land acquisition and direct construction costs. No other disbursements are permitted from this account.

3.  **Transaction Account (30%):** The remaining 30% is transferred to the Transaction Account, which covers developer operational expenses including marketing, administrative costs, and profit margins.

The system must enforce GL code routing at the receivables layer to ensure every payment is automatically split 70/30 upon receipt into the Collection Account, with automated journal entries transferring to the Separate and Transaction accounts. Escrow bank details, account numbers, and IFSC codes for all three accounts must be stored per project. Audit trails must track every transfer between accounts with timestamps and amounts.

### Phase I: Lead to Commitment

The first phase of the sales lifecycle covers the transition from buyer interest to formal commitment, including deposit collection, identity verification, and regulatory reporting triggers.

**Booking / Earnest Money:** The buyer pays an initial deposit to secure the unit. The deposit amount and handling vary by jurisdiction:

- India: Maximum 10% of the unit price is permitted before a registered Agreement for Sale is executed (RERA advance payment cap). The system must block any deposit recording above 10% prior to the agreement date and display warning alerts when approaching the cap.

- USA / Canada: Earnest money is held in a lawyer's trust account or neutral escrow account. The system must record the escrow holder details, trust account reference, and deposit date. For Canadian transactions, interest on deposits must be calculated and tracked as a credit to the buyer at closing.

**KYC and Regulatory Reporting Triggers:** Beyond standard KYC verification (Module 4), specific regulatory reports are triggered at the commitment stage:

- USA (FinCEN): If the buyer is a legal entity (trust, LLC, corporation) making a non-financed (cash) purchase, the system must automatically trigger a FinCEN Real Estate Report. Sale cannot proceed to confirmation until the report is filed.

- Canada (Tarion): The system auto-generates a Tarion Home ID and registration code for the buyer. The 45-day registration countdown begins from the contract date. The system tracks registration status and escalates to the sales manager if the deadline approaches without confirmation.

- India (RERA): The booking is recorded against the RERA-registered project number. The 10% advance cap is enforced. Allotment letter generation is triggered upon deposit receipt.

### Phase II: Change Order (Upgrades) Process

Buyers may request customizations and upgrades to their unit during the construction phase. The system integrates with Procore (construction management platform) to enforce stage-dependent availability of upgrades.

**Procore Construction Stage Sync:** The system queries Procore's API for the current Stage of Completion of the buyer's specific unit or building phase. Based on the construction stage, certain upgrade categories are automatically locked:

| **Construction Stage (Procore)**   | **Upgrades Locked**                                  | **Upgrades Still Available**                       | **System Action**                               |
|------------------------------------|------------------------------------------------------|----------------------------------------------------|-------------------------------------------------|
| Foundation / Below Slab            | None locked                                          | All structural, electrical, plumbing, finishes     | Full upgrade catalog available                  |
| Slab Cast                          | Structural modifications (walls, floor plan changes) | Electrical, plumbing, finishes, appliances         | System disables structural upgrade options      |
| Internal Plastering / MEP Rough-In | Structural + Electrical layout + Plumbing layout     | Finishes, fixtures, appliances, paint colors       | System locks electrical/plumbing customizations |
| Finishing Stage                    | All structural, electrical, plumbing                 | Paint, flooring, countertops, fixtures, appliances | Only cosmetic upgrades available                |
| Completed / OC Issued              | All upgrades locked                                  | None (post-possession renovation only)             | Upgrade portal closed for this unit             |

**Upgrade Billing Logic:** All upgrades require 100% upfront payment through the Upward Upgrade Portal before the upgrade order is submitted to the construction team. Upgrade payments are recorded separately from the unit sale price and are added as 'Credits' (positive line items) to the final Closing Statement / Statement of Adjustments. The system must track: upgrade description, selected option, unit price of upgrade, payment date, payment reference, and Procore work order ID once the upgrade is dispatched to the construction team.

| **Field**                | **Type**       | **Required** | **Notes**                                                               |
|--------------------------|----------------|--------------|-------------------------------------------------------------------------|
| Upgrade ID               | Auto-generated | Yes          | Unique identifier per upgrade request                                   |
| Unit ID                  | Reference      | Yes          | Link to the specific unit                                               |
| Buyer ID                 | Reference      | Yes          | Link to the buyer who requested the upgrade                             |
| Upgrade Category         | Dropdown       | Yes          | Structural, Electrical, Plumbing, Finishes, Fixtures, Appliances, Other |
| Upgrade Description      | Text           | Yes          | Detailed description of the customization                               |
| Selected Option          | Text           | Yes          | Specific option chosen (e.g., 'Quartz countertop – Calacatta Gold')     |
| Upgrade Cost             | Currency       | Yes          | Total cost of the upgrade                                               |
| Payment Status           | Dropdown       | Yes          | Unpaid, Paid, Refunded                                                  |
| Payment Date             | Date           | Conditional  | Date 100% payment was received                                          |
| Payment Reference        | Text           | Conditional  | Transaction reference for upgrade payment                               |
| Procore Stage at Request | Text           | Auto         | Construction stage from Procore at time of request                      |
| Procore Work Order ID    | Text           | Conditional  | Work order reference after dispatch to construction team                |
| Upgrade Status           | Dropdown       | Yes          | Requested, Approved, In Progress, Completed, Cancelled                  |
| Closing Statement Line   | Boolean        | Auto         | Whether this upgrade has been added to the closing statement            |

### Phase III: Milestone-Linked Funding Orchestration

This phase manages the ongoing collection of buyer payments tied to construction progress or financing milestones, with jurisdiction-specific orchestration logic.

**India (RERA Construction-Linked Plan):** When a Procore construction milestone is reached and verified, the system automatically triggers Yardi to generate a Demand Letter for all buyers in that construction phase. Upon payment receipt, funds are automatically routed through the 3-account system: 70% to the RERA Separate Account (land/construction costs only) and 30% to the Transaction Account (developer operations). The milestone-to-demand-to-collection flow is fully automated with human approval gates at the demand letter stage.

**USA / Canada (Closing-Linked):** For North American markets, the business team monitors loan approval status for financed buyers. Deposits held in trust are tracked with full Interest on Deposit (IOD) calculations applied — mandatory in many Canadian jurisdictions. The system must compute accrued interest on buyer deposits from the deposit date through the closing date, using the rate specified in the purchase agreement or the prescribed provincial rate (e.g., Bank of Canada overnight rate minus a spread). Interest on deposits is credited to the buyer as a line item on the Statement of Adjustments.

| **Field**                | **Type**    | **Required** | **Notes**                                                                                         |
|--------------------------|-------------|--------------|---------------------------------------------------------------------------------------------------|
| Interest on Deposit Rate | Decimal (%) | Conditional  | Rate applied to compute IOD; auto-populated from agreement or provincial prescribed rate (Canada) |
| Deposit Amount           | Currency    | Yes          | Total deposit amount held in trust/escrow                                                         |
| Deposit Held From        | Date        | Yes          | Date deposit was received and placed in trust                                                     |
| Deposit Held To          | Date        | Conditional  | Date of closing or return; auto-populated on closing                                              |
| Accrued Interest         | Calculated  | Auto         | Deposit x Rate x (Days Held / 365); credited to buyer at closing                                  |
| IOD Calculation Method   | Dropdown    | Conditional  | Simple Interest, Compound (semi-annual), Provincial Prescribed Rate                               |
| Loan Approval Status     | Dropdown    | Conditional  | Not Applicable, Pending, Conditionally Approved, Fully Approved, Declined                         |
| Lender Name              | Text        | Conditional  | Mortgage lender for financed purchases                                                            |
| Pre-Approval Expiry      | Date        | Conditional  | Date the mortgage pre-approval expires                                                            |

### The Closing Statement (Statement of Adjustments)

The system must auto-generate localized closing statements summarizing the Net Cash to Close for the buyer. The closing statement is the definitive financial reconciliation document that accounts for all credits, debits, adjustments, and prorations between the buyer and developer/seller.

**Universal Calculation Logic:** *Total Contract Value + Upgrades + Prorations + Taxes + Fees – Deposits Paid – Interest on Deposits = Final Balance (Net Cash to Close)*

The system generates the closing statement by assembling all financial components from the sale record, upgrade records, fee schedule, tax calculations, and deposit tracking into a single, jurisdiction-formatted document.

| **Closing Line Item**    | **USA**                         | **Canada**                                 | **India**                   |
|--------------------------|---------------------------------|--------------------------------------------|-----------------------------|
| Contract Price           | Yes                             | Yes                                        | Yes                         |
| Upgrades / Extras        | Yes (added to price)            | Yes (added to price)                       | Yes (added to price)        |
| Deposits Paid (Credit)   | Earnest money credit            | Deposit credit + IOD                       | Booking amount credit       |
| Interest on Deposits     | Rare (state-specific)           | Mandatory (most provinces)                 | Not applicable              |
| Lender's Title Insurance | Yes (buyer cost)                | N/A (title insurance optional)             | N/A                         |
| Recording Fees           | Yes (county recorder)           | N/A                                        | Registration Fee (1%)       |
| FinCEN Filing Fee        | Conditional (cash/entity)       | N/A                                        | N/A                         |
| Tarion Enrollment Fee    | N/A                             | Yes (reimbursed to builder)                | N/A                         |
| Land Transfer Tax        | N/A (state transfer tax)        | Yes (LTT + Municipal LTT where applicable) | N/A                         |
| HST / GST on Purchase    | State sales tax (varies)        | HST on new home (13% ON)                   | GST 1% or 5%                |
| HST / GST on Upgrades    | State sales tax                 | HST on upgrades specifically               | GST on upgrades             |
| Stamp Duty               | N/A                             | N/A                                        | Yes (5-7% by state)         |
| Advance Maintenance      | HOA first month (if applicable) | Common expenses from occupancy             | 1-2 years upfront mandatory |
| Property Tax Proration   | Prorated from closing date      | Prorated from closing date                 | Prorated from possession    |
| Utility Adjustments      | Final meter readings            | Utility deposit / submetering              | Utility security charge     |
| Legal Fees               | Settlement agent / attorney     | Lawyer fees (buyer and seller)             | Advocate and notary fees    |

### Closing Statement Generation Requirements

- The system must assemble all line items from existing records: sale price (Module 2), upgrades (Phase II above), fees and charges (Module 1 Unit Fees), deposits and IOD (Phase III above), tax calculations (Module 3), and closing adjustments (Module 1 Unit Closing Info).

- Closing statement template is country-specific: USA follows the TRID Closing Disclosure format aligned to UCD v2.0; Canada follows the Statement of Adjustments format customary in the applicable province; India follows the demand-cum-allotment format with RERA-compliant breakdowns.

- The statement must be generated as a downloadable PDF and stored as a document attachment to the sale record.

- All calculations must be auditable: each line item must link back to its source record and calculation formula.

- The statement must include a summary section showing Total Debits, Total Credits, and Net Cash to Close (or Net Amount Refundable if credits exceed debits).

### Phase IV: Handover and Post-Closing (Snag Module)

The handover phase transitions the unit from a sold asset to a delivered asset, incorporating pre-delivery inspection, possession logic gates, and warranty activation.

**Pre-Delivery Inspection (PDI):** Before the buyer takes possession, a formal Pre-Delivery Inspection is conducted. The buyer (or their representative) inspects the unit and logs any defects, incomplete items, or deviations from specifications. The PDI module provides a structured form for categorizing and tracking defects.

| **Field**          | **Type**               | **Required** | **Notes**                                                                                                            |
|--------------------|------------------------|--------------|----------------------------------------------------------------------------------------------------------------------|
| PDI ID             | Auto-generated         | Yes          | Unique identifier for the inspection event                                                                           |
| Unit ID            | Reference              | Yes          | Link to the specific unit                                                                                            |
| Sale ID            | Reference              | Yes          | Link to the sale transaction                                                                                         |
| Buyer ID           | Reference              | Yes          | Buyer or authorized representative                                                                                   |
| Inspection Date    | Date                   | Yes          | Date the PDI was conducted                                                                                           |
| Inspector Name     | Text                   | Yes          | Name of person conducting inspection (buyer/rep/agent)                                                               |
| Defect ID          | Auto-generated         | Yes          | Unique ID per defect item within a PDI                                                                               |
| Defect Category    | Dropdown               | Yes          | Structural, Plumbing, Electrical, HVAC, Finishes, Fixtures, Paint, Flooring, Windows/Doors, Appliances, Other        |
| Defect Severity    | Dropdown               | Yes          | Critical (blocks possession), Major (requires fix within 30 days), Minor (cosmetic, track for warranty), Observation |
| Defect Description | Text                   | Yes          | Detailed description of the defect                                                                                   |
| Defect Photo       | File Upload (multiple) | No           | Photos documenting the defect                                                                                        |
| Defect Location    | Text                   | Yes          | Room/area within the unit where defect is located                                                                    |
| Resolution Status  | Dropdown               | Yes          | Open, In Progress, Resolved, Disputed, Deferred to Warranty                                                          |
| Resolution Date    | Date                   | Conditional  | Date the defect was resolved                                                                                         |
| Resolution Notes   | Text                   | Conditional  | Description of how the defect was addressed                                                                          |
| Assigned To        | Reference              | Conditional  | Developer team member or contractor assigned to fix                                                                  |

**Possession Logic Gate:** The system enforces a mandatory logic gate before possession can be transferred to the buyer. Possession is blocked in the ERP until ALL of the following conditions are met:

1.  **Occupancy Certificate (OC) Uploaded:** The developer must upload the Occupancy Certificate (India) or equivalent Certificate of Completion (USA/Canada) to the system. The system verifies the document is present and the upload date is recorded.

2.  **Balance Due is Zero:** All buyer payments must be fully collected. The system checks the payment schedule and confirms that the total amount received equals the total amount due (including any upgrades, fees, and adjustments from the closing statement). Any outstanding balance blocks possession.

3.  **Critical Snags Resolved:** All defects categorized as 'Critical' severity in the PDI must have a Resolution Status of 'Resolved'. Major defects may be deferred to the warranty period at the buyer's written consent, but Critical defects cannot be deferred.

If all three conditions are satisfied, the system enables the Possession Transfer action, which records the Actual Occupancy Date on the unit record, transitions the unit to post-possession status, and activates the warranty tracking module.

### Post-Possession: Warranty Transition

Upon possession, the system transitions the unit from the active sales pipeline to the Customer Service and Warranty mode. The warranty tracking module monitors the applicable warranty periods based on the property's country:

| **Warranty Period**            | **USA**                       | **Canada (Ontario / Tarion)**        | **India (RERA)**                         |
|--------------------------------|-------------------------------|--------------------------------------|------------------------------------------|
| Materials and Labour           | Varies by state / builder     | 1 year from possession               | Part of 5-year structural coverage       |
| Mechanical / Electrical / Code | Varies by state / builder     | 2 years from possession              | Part of 5-year structural coverage       |
| Major Structural Defects       | Varies by state / builder     | 7 years from possession              | 5 years from possession                  |
| Defect Reporting Method        | Builder portal or call center | Tarion portal + builder first        | RERA complaint + builder notification    |
| System Transition              | Yardi Facility Manager        | Yardi Facility Manager + Tarion sync | Yardi Facility Manager + RERA compliance |

- The system auto-calculates warranty expiry dates from the possession date and displays them on the unit record and buyer profile.

- Defect reports submitted during the warranty period are tracked in the same PDI module with a flag indicating 'Post-Possession Warranty Claim'.

- For Canada (Tarion), the system must track the Tarion Year-End Form submission deadlines and remind the buyer to submit warranty claims before each coverage period expires.

- For India (RERA), the system must track the 5-year liability window and auto-calculate delay penalties using SBI MCLR + 2% if the developer fails to address structural defects within the prescribed timeframe.

- The system transitions ongoing facility management to Yardi Facility Manager, syncing the unit record, warranty status, and open defect items for long-term property management.

### Migration Buddy: Legacy Data ETL Requirements

When migrating legacy sales data into the Upward platform from previous systems, the ETL (Extract, Transform, Load) pipeline must handle the following source-to-target mappings and validation rules to ensure data integrity and compliance continuity.

| **Source Field (Legacy)** | **Target Field (Upward)**                           | **Transformation Logic**                                                                        | **Validation Rule**                                                                                    |
|---------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Original_Deposit          | Deposit Amount + Deposit Held From                  | Map to buyer payment schedule as initial deposit; extract date from legacy timestamp            | Amount must be positive; date must precede contract date; for India: must not exceed 10% of sale price |
| Upgrade_Paid_Date         | Upgrade Payment Date + Payment Status               | Map to upgrade record; set Payment Status to 'Paid' if date is present, 'Unpaid' if null        | Date must precede closing date; amount must match upgrade cost in legacy system                        |
| RERA_Milestone_ID         | Installment record linked to construction milestone | Map to milestone-linked installment in payment schedule; link to Procore milestone if available | Verify that 70% of historical payments were routed to the RERA Separate Account; flag discrepancies    |
| Tarion_Reg_Number         | Tarion Registration Code + Status                   | Map to Tarion fields; set status to 'Registered' if code is present                             | Validate code format against Tarion registry; verify registration within 45 days of contract           |
| Deposit_Interest_Accrued  | Accrued Interest (IOD)                              | Recalculate interest using prescribed rate and deposit hold period; compare with legacy value   | Canadian records: auto-calculate IOD and flag if legacy value deviates by more than \$10 or 0.5%       |
| Legacy_Escrow_Split       | RERA 3-Account routing verification                 | For Indian records: verify that historical 70/30 split was maintained                           | Flag any record where Separate Account received less than 70% of total payments                        |
| FinCEN_Flag               | FinCEN Report Status                                | Map to FinCEN tracking fields; set status based on legacy flag value                            | For 2026 records: verify all cash entity purchases have a filed report                                 |

- The Migration Buddy must generate a comprehensive validation report after each ETL run, listing all records that passed validation, records with warnings (minor discrepancies), and records that failed validation (blocked from import until manually resolved).

- For Canadian records: the system must auto-calculate Interest on Deposits for all migrated records and flag any discrepancy between the calculated value and the legacy system's recorded interest.

- For Indian records: the system must verify that 70% of all historical buyer payments were routed to the correct RERA Separate Account and generate a compliance exception report for any shortfall.

- The ETL pipeline must support incremental migration (not just full-load) to allow phased cutover from the legacy system.

- All migrated records must be tagged with a 'Migrated' source flag and the original legacy system record ID for traceability.

### Module 11 API Endpoints

| **Module**            | **Endpoint Pattern**                  | **Methods**                         |
|-----------------------|---------------------------------------|-------------------------------------|
| FinCEN Reports        | /api/v1/sales/{id}/fincen-report      | GET, POST, PATCH                    |
| Tarion Registration   | /api/v1/sales/{id}/tarion             | GET, POST, PATCH                    |
| RERA 3-Account        | /api/v1/properties/{id}/rera-accounts | GET, PUT                            |
| Upgrades              | /api/v1/units/{id}/upgrades           | GET, POST, PUT, DELETE              |
| Procore Stage Sync    | /api/v1/units/{id}/construction-stage | GET (read from Procore)             |
| Closing Statement     | /api/v1/sales/{id}/closing-statement  | GET (generate), POST (finalize)     |
| Interest on Deposit   | /api/v1/sales/{id}/deposit-interest   | GET (calculate), PATCH              |
| PDI / Snag List       | /api/v1/units/{id}/pdi                | GET, POST                           |
| PDI Defect Items      | /api/v1/pdi/{id}/defects              | GET, POST, PATCH                    |
| Possession Gate Check | /api/v1/units/{id}/possession-check   | GET (validates all 3 conditions)    |
| Warranty Tracking     | /api/v1/units/{id}/warranty           | GET, PATCH                          |
| Warranty Claims       | /api/v1/units/{id}/warranty-claims    | GET, POST, PATCH                    |
| Migration ETL         | /api/v1/admin/migration/import        | POST (trigger), GET (status/report) |
| Migration Validation  | /api/v1/admin/migration/validate      | POST (run validation), GET (report) |

### Module 11 Database Entities

| **Entity**             | **Key Relationships**                                                             | **Partition Strategy** |
|------------------------|-----------------------------------------------------------------------------------|------------------------|
| FinCEN Report          | Belongs to Sale; Links to Buyer entity details                                    | By sale date           |
| Tarion Registration    | Belongs to Sale and Unit; Tracks 1-2-7 year warranty dates                        | By property            |
| RERA Account Config    | Belongs to Property; Stores Collection, Separate, Transaction account details     | By property            |
| Unit Upgrade           | Belongs to Unit, Buyer, Sale; Links to Procore work order                         | By unit                |
| Upgrade Payment        | Belongs to Upgrade; Tracks 100% upfront payment                                   | By payment date        |
| Closing Statement      | Belongs to Sale; Assembles all financial components into final document           | By sale                |
| Closing Line Item      | Belongs to Closing Statement; Individual debit/credit entry                       | By closing statement   |
| Deposit Interest (IOD) | Belongs to Sale; Calculates interest on buyer deposits                            | By sale                |
| PDI (Inspection)       | Belongs to Unit, Sale, Buyer; Has many Defect Items                               | By unit                |
| PDI Defect Item        | Belongs to PDI; Tracks individual defect with severity, status, resolution        | By PDI                 |
| Possession Gate Log    | Belongs to Unit; Records pass/fail of each gate condition                         | By unit                |
| Warranty Period        | Belongs to Unit; Auto-calculated from possession date per country                 | By unit                |
| Warranty Claim         | Belongs to Unit, Warranty Period; Tracks post-possession defect reports           | By unit + date         |
| Migration Record       | Polymorphic: links to any migrated entity; Tracks legacy ID and validation status | By import batch        |

# Project Phases and Milestones

## Phase 1: Foundation (Weeks 1–8)

- Project setup: repository, CI/CD, cloud infrastructure, database schema

- Authentication and RBAC implementation

- Property and Unit management module

- Buyer management module with KYC

- Country-specific compliance rules engine (USA, Canada, India)

## Phase 2: Sales and Brokers (Weeks 9–16)

- Sale transaction recording (manual entry)

- Broker and broker firm management

- Commission configuration and calculation engine

- Commission payable creation and approval workflow

## Phase 3: Payments (Weeks 17–22)

- Buyer payment schedule generation

- Installment tracking and recording

- Broker commission payment processing

- Payment dashboards and notifications

## Phase 4: AI Engine (Weeks 23–34)

- OCR pipeline integration (Textract / Document AI)

- LLM-based field extraction engine

- AI review interface (split-screen)

- Automated commission payable generation from AI extraction

- Automated payment schedule generation from AI extraction

- Self-learning feedback loop and correction logging

- Model training pipeline and versioning

- AI accuracy dashboard and metrics

## Phase 5: Yardi Integration and Inventory Sync (Weeks 35–42)

- Yardi payables and receivables integration development and testing

- Yardi inventory sync pipeline: API connector, data mapping, incremental sync

- Inventory data model and read-only mirror with change tracking

- Inventory sync monitoring dashboard and error handling

- Sync scheduling, force-sync, and alert configuration

- UAT with live Yardi environments across all three countries

## Phase 6: Analytics Dashboard (Weeks 43–50)

- Analytics data warehouse setup (materialized views or ClickHouse)

- Pre-computed aggregation pipeline (daily/hourly rollups)

- Executive KPI dashboard with real-time refresh

- Sales performance analytics charts (trend lines, velocity, pipeline funnel, price analysis)

- Inventory analytics (portfolio overview, aging, floor heatmaps, forecast)

- Top sales partner leaderboard and partner comparison tools

- Year-over-year comparison module (revenue, units, pricing, seasonal patterns, cumulative curves)

- Financial overview dashboard (receivables aging, commission cost ratio, cash flow projection)

- Dashboard personalization: pinned widgets, saved filters, scheduled email reports

- Export engine: PDF, Excel, CSV, and PNG chart exports

## Phase 7: Testing, Optimization, and Launch (Weeks 51–56)

- End-to-end integration testing across all modules

- Reporting module finalization and cross-country validation

- Performance optimization and load testing (analytics queries, sync pipelines)

- Security audit and penetration testing

- UAT with real documents and live data from all three countries

- Production deployment and go-live

## Phase 8: Post-Launch (Weeks 57+)

- AI model monitoring and retraining cycles

- Analytics dashboard refinement based on user feedback and usage patterns

- Additional dashboard widgets and custom report builder

- Feature enhancements based on user feedback

- Additional country support (if needed)

- Mobile-responsive optimization

# Recommended Team Structure

| **Role**                       | **Count** | **Responsibilities**                                                    |
|--------------------------------|-----------|-------------------------------------------------------------------------|
| Project Manager / Scrum Master | 1         | Sprint planning, stakeholder communication, delivery tracking           |
| Product Owner                  | 1         | Requirements prioritization, acceptance criteria, user story management |
| Full-Stack Lead Developer      | 1         | Architecture decisions, code reviews, technical leadership              |
| Frontend Developers            | 2         | React UI development, responsive design, review interface               |
| Backend Developers             | 2-3       | API development, business logic, database, compliance engine            |
| AI / ML Engineer               | 2         | OCR pipeline, LLM integration, extraction engine, self-learning model   |
| DevOps / Cloud Engineer        | 1         | Infrastructure, CI/CD, monitoring, security                             |
| QA Engineer                    | 1-2       | Test automation, manual testing, cross-country scenario testing         |
| UI/UX Designer                 | 1         | Wireframes, prototypes, design system, AI review interface UX           |
| Integration Engineer           | 1         | Yardi API integration, data mapping, sync pipeline                      |

# Risk Assessment and Mitigation

| **Risk**                                         | **Impact** | **Probability** | **Mitigation**                                                                                                               |
|--------------------------------------------------|------------|-----------------|------------------------------------------------------------------------------------------------------------------------------|
| AI extraction accuracy below target              | High       | Medium          | Start with LLM + human review; invest in self-learning loop; set minimum confidence thresholds                               |
| Yardi API limitations or version incompatibility | High       | Medium          | Early API discovery sprint; fallback to bulk CSV import; maintain abstraction layer                                          |
| Country-specific compliance complexity           | Medium     | High            | Engage legal consultants per country; build configurable rules engine; regular compliance audits                             |
| Document format variability                      | Medium     | High            | Support multiple OCR engines; template learning; manual entry fallback always available                                      |
| Data security breach (PII exposure)              | Critical   | Low             | Field-level encryption, SOC 2 compliance, penetration testing, access logging                                                |
| Scope creep (feature additions)                  | Medium     | High            | Strict change control process; phased delivery; MVP-first approach                                                           |
| Performance under load (AI processing)           | Medium     | Medium          | Queue-based processing; auto-scaling workers; processing SLA monitoring                                                      |
| Yardi inventory data quality or schema changes   | Medium     | Medium          | Schema validation on sync; delta change logging; alerting on unexpected field changes; graceful degradation                  |
| Analytics dashboard performance at scale         | Medium     | Medium          | Pre-computed aggregations; materialized views; Redis caching; query optimization; CDN for chart assets                       |
| Inventory sync data drift or staleness           | Medium     | Low             | Configurable sync frequency with monitoring; auto-alert on missed syncs; forced sync capability; last-sync timestamp visible |
| YoY comparison accuracy with partial data        | Low        | Medium          | Handle edge cases: new properties, mid-year launches, currency changes; clearly label partial-data comparisons               |

# Acceptance Criteria Summary

## AI Engine Acceptance

- AI must extract buyer name, sale price, and unit number with \>90% accuracy on first run

- After 20+ documents of same format, accuracy must exceed 95% for key fields

- All AI-generated records must be presented for human review before confirmation

- Self-learning must demonstrate measurable improvement visible in the AI metrics dashboard

- Commission payable must be auto-generated within 5 seconds of extraction approval

- Payment schedule must be auto-generated and match document terms with \>90% accuracy

## Integration Acceptance

- Yardi sync must process successfully for 95%+ of transactions on first attempt

- Failed syncs must be queued and retryable from the dashboard

- Payables and receivables in Yardi must reconcile exactly with Upward records

## Inventory Sync Acceptance

- Inventory data in Upward must match Yardi source data with 100% fidelity (read-only mirror)

- Full inventory sync for 10,000+ units must complete within 10 minutes

- Incremental sync must detect and apply changes within 60 seconds

- All changes must be logged in the delta change log with before/after values

- Sync failures must generate alerts and not corrupt existing mirror data

- Inventory data must be strictly read-only in Upward (no edit capability)

## Analytics Dashboard Acceptance

- Dashboard must load within 3 seconds with full KPI strip and primary charts

- All interactive filters must update charts within 500 milliseconds

- Top partner leaderboard must accurately rank by revenue, units, and commissions with real-time data

- YoY comparison must correctly calculate growth percentages and handle properties with partial-year data

- Inventory analytics must reflect the latest Yardi sync data within 5 minutes of sync completion

- All charts must support drill-down to underlying records

- Exports (PDF, Excel, CSV) must match on-screen data exactly

- Scheduled reports must deliver on configured cadence with less than 15 minutes delay

## Compliance Acceptance

- All mandatory fields per country must be enforced (no sale can be confirmed without them)

- Tax calculations must match manual calculations to within rounding tolerance

- KYC verification must be completed before any sale is marked as Confirmed

- Audit trail must be complete and immutable for all transactions

# Glossary of Terms

| **Term**                 | **Definition**                                                                                                                                                           |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Unit                     | An individual sellable property unit (apartment, office, retail space, etc.)                                                                                             |
| Sale                     | The transaction record when a unit is sold to a buyer                                                                                                                    |
| Broker                   | Licensed real estate agent or firm that facilitates a sale                                                                                                               |
| Commission               | Fee paid to a broker based on the sale of a unit                                                                                                                         |
| Payable                  | An outgoing payment obligation (e.g., broker commission)                                                                                                                 |
| Receivable               | An incoming payment expectation (e.g., buyer installment)                                                                                                                |
| Installment              | A scheduled partial payment from a buyer toward the total sale price                                                                                                     |
| RERA                     | Real Estate Regulatory Authority (India)                                                                                                                                 |
| FIRPTA                   | Foreign Investment in Real Property Tax Act (USA)                                                                                                                        |
| TDS                      | Tax Deducted at Source (India)                                                                                                                                           |
| HST / GST                | Harmonized Sales Tax / Goods and Services Tax (Canada / India)                                                                                                           |
| Stamp Duty               | Government tax on property transfer documents                                                                                                                            |
| Yardi                    | Third-party property management and accounting ERP system                                                                                                                |
| OCR                      | Optical Character Recognition (converting scanned images to text)                                                                                                        |
| LLM                      | Large Language Model (AI model used for document understanding)                                                                                                          |
| KYC                      | Know Your Customer (identity verification process)                                                                                                                       |
| PAN                      | Permanent Account Number (Indian tax identifier)                                                                                                                         |
| SIN                      | Social Insurance Number (Canadian tax identifier)                                                                                                                        |
| SSN                      | Social Security Number (US tax identifier)                                                                                                                               |
| FINTRAC                  | Financial Transactions and Reports Analysis Centre (Canada)                                                                                                              |
| Absorption Rate          | The rate at which available units are sold over a given period, expressed as a percentage of total inventory                                                             |
| Inventory Mirror         | A read-only copy of Yardi property/unit data maintained in Upward for analytics purposes                                                                                 |
| YoY                      | Year-over-Year: comparison of a metric between the current year and the same period in the prior year                                                                    |
| Delta Sync               | Incremental sync that transfers only changes since the last sync rather than full data                                                                                   |
| Materialized View        | A pre-computed database query result stored for fast analytics access                                                                                                    |
| KPI                      | Key Performance Indicator: a measurable metric used to evaluate business success                                                                                         |
| Sales Velocity           | The speed at which units are sold, typically measured as units per month                                                                                                 |
| Days on Market           | The number of days a unit has been listed as available without being sold                                                                                                |
| NSF                      | Non-Sufficient Funds: a payment (check or electronic) returned by the bank because the payer's account lacked sufficient funds                                           |
| Tarion                   | Ontario (Canada) new home warranty program that protects buyers of newly built homes                                                                                     |
| Bulletin 19              | A Tarion bulletin in Ontario requiring builders to provide certain warranties and disclosures                                                                            |
| Interim Occupancy        | Period in pre-construction (Canada) when a buyer occupies a unit before the condo is registered; buyer pays occupancy fees                                               |
| Schedule D               | A schedule in a Canadian purchase agreement outlining adjustments and charges at closing                                                                                 |
| CAP Amendment            | Development Charges Cap Amendment fee in Ontario, reflecting changes to municipal development charges                                                                    |
| RESPA                    | Real Estate Settlement Procedures Act (USA) governing real estate transaction disclosures and prohibiting kickbacks                                                      |
| TRID                     | TILA-RESPA Integrated Disclosure rule mandating standardized Closing Disclosures                                                                                         |
| UCD                      | Uniform Closing Dataset (v2.0) standardized schema for US closing disclosures published by Fannie Mae/Freddie Mac                                                        |
| NAR                      | National Association of Realtors (USA); recent antitrust settlement abolished blanket MLS compensation offers                                                            |
| PCMLTFA                  | Proceeds of Crime (Money Laundering) and Terrorist Financing Act (Canada)                                                                                                |
| LCTR                     | Large Cash Transaction Report filed with FINTRAC for transactions of \$10,000 CAD or more                                                                                |
| VLM                      | Vision Language Model; multimodal AI that processes text, spatial position, and visual features simultaneously                                                           |
| LayoutLM                 | Spatial-aware transformer model family for document AI that understands page layout and structure                                                                        |
| HITL                     | Human-in-the-Loop; process where human reviewers validate and correct AI extractions                                                                                     |
| CLP                      | Construction-Linked Plan; Indian payment structure where installments are tied to physical construction milestones                                                       |
| SIPP                     | Standard Interface Partnership Program; Yardi's deep API integration pathway (\$25K/year per interface)                                                                  |
| FinPayables              | Yardi's native CSV format for batch importing accounts payable transactions                                                                                              |
| JSONB                    | Binary JSON data type in PostgreSQL used for flexible, region-specific compliance data storage                                                                           |
| GCI                      | Gross Commission Income; total commission earned before deductions, used in tiered split calculations                                                                    |
| MCLR                     | Marginal Cost of Funds Based Lending Rate set by SBI (India); used as base for RERA delay penalty calculation                                                            |
| FinCEN                   | Financial Crimes Enforcement Network (USA); 2026 Residential Real Estate Rule mandates reporting for non-financed cash transfers to entities/trusts                      |
| PDI                      | Pre-Delivery Inspection; formal inspection conducted by the buyer before taking possession to log defects and deviations                                                 |
| Snag                     | A defect, incomplete item, or deviation from specification identified during Pre-Delivery Inspection                                                                     |
| OC                       | Occupancy Certificate; government-issued certificate confirming a building is fit for habitation (India); equivalent to Certificate of Completion (USA/Canada)           |
| IOD                      | Interest on Deposit; accrued interest on buyer deposits held in trust, credited to the buyer at closing (mandatory in many Canadian jurisdictions)                       |
| Statement of Adjustments | Canadian closing document that reconciles all debits and credits between buyer and seller to determine the net cash to close                                             |
| Closing Statement        | Financial reconciliation document summarizing all transaction components to determine the buyer's final balance at closing                                               |
| Procore                  | Cloud-based construction management platform; integrated with Upward for construction stage awareness and upgrade eligibility enforcement                                |
| Change Order             | A buyer-requested modification or upgrade to the unit during the construction phase; subject to construction-stage availability                                          |
| 3-Account System         | RERA-mandated account structure: Collection Account (receives all payments), Separate Account (70% for construction), Transaction Account (30% for developer operations) |
| Possession Gate          | Logic gate enforcing three conditions before unit handover: OC uploaded, balance due is zero, and critical snags resolved                                                |
| Tarion 1-2-7             | Tarion warranty coverage structure: 1 year for materials/labour, 2 years for mechanical/electrical/code, 7 years for major structural defects                            |
| Tarion Home ID           | System-generated unique identifier linking a buyer to the Tarion enrollment system for warranty registration                                                             |
| Migration Buddy          | ETL pipeline for migrating legacy sales data into Upward with automatic validation, interest recalculation, and escrow compliance verification                           |

# Strategic Implementation Principles

The following non-negotiable principles must guide all engineering and product decisions throughout the development of Upward:

**1. AI Pipeline Primacy:** The spatial-aware VLM architecture (LayoutLM/Nemotron) is the defining competitive advantage. The engineering team must not rely on simple zero-shot LLM prompts alone, as they cannot reliably parse tabular financial data within complex closing disclosures. The integration of spatial embeddings is non-negotiable. The HITL interface must be fully operational at day-one to capture edge cases, fuel the active learning loop, and prevent model degradation.

**2. Compliance as Code:** Regulatory rules cannot be optional UI features. The system must enforce hard stops at the database layer. Examples: prevent contract finalization if Canadian FINTRAC 24-hour limits are breached without an LCTR; block sale confirmation if Indian RERA 70% escrow splits are improperly routed; prevent advance payment recording above 10% before agreement execution in India; auto-generate FIRPTA notices for foreign buyer transactions in USA.

**3. Financial Abstraction:** The commission engine must remain entirely decoupled from traditional assumptions. It must handle post-NAR settlement landscapes where buyer and seller fees are independent, while simultaneously supporting construction-linked milestone triggers for India and tiered property-value splits for Canadian provinces. No hardcoded commission assumptions.

**4. Phased Yardi Integration:** Initial Yardi integration leverages the FinPayables CSV/ETL methodology for rapid deployment and value demonstration without massive upfront costs. The SIPP API integration (\$25K/year per interface) is reserved for Phase 2 targeting tier-one enterprise clients after platform value is proven.

**5. JSONB Extensibility:** The Dynamic Attributes Pattern with JSONB compliance_metadata columns ensures the system can adapt to new regulatory fields in any jurisdiction without database downtime, schema migrations, or code deployment. New country support should require only configuration, not engineering.

**6. Lifecycle-First Orchestration:** The end-to-end sales lifecycle must be treated as a single orchestrated workflow, not a collection of disconnected modules. Construction stage awareness (via Procore sync) must gate upgrade availability in real time. Possession must be physically blocked until the three-condition logic gate passes (OC uploaded, zero balance, critical snags resolved). Closing statements must auto-assemble from all upstream financial records without manual re-entry. The 2026 FinCEN cash reporting rule and Tarion 45-day registration requirement must be enforced as hard compliance stops that cannot be bypassed by any user role.

# References and Regulatory Sources

The following regulatory frameworks, industry standards, and technical references informed this specification:

## Regulatory and Legal

- RESPA (Real Estate Settlement Procedures Act) and TRID (TILA-RESPA Integrated Disclosure) rule – US consumer protection

- Uniform Closing Dataset (UCD) v2.0 – Fannie Mae/Freddie Mac standardized closing data schema

- NAR Antitrust Settlement (2024) – Abolished blanket MLS compensation; mandated buyer-broker agreements

- FINTRAC / PCMLTFA – Canadian AML/KYC requirements for real estate reporting entities

- Prohibition on the Purchase of Residential Property by Non-Canadians Act – Foreign ownership restrictions (3% equity threshold)

- RERA (Real Estate Regulation and Development Act, 2016) – Indian buyer protection, escrow mandates, milestone payments

- Income Tax Act (India) Section 194-IA – TDS on property transactions

- FIRPTA (Foreign Investment in Real Property Tax Act) – US withholding on foreign persons

- PIPEDA – Canadian personal data protection

- Prohibition of Benami Property Transactions Act – India

- FEMA (Foreign Exchange Management Act) – India NRI/foreign national property rules

- FinCEN Residential Real Estate Rule (2026) – Mandatory reporting for non-financed cash transfers to entities/trusts

- Ontario New Home Warranties Plan Act (ONHWP) / Tarion – 1-2-7 year warranty coverage; 45-day registration requirement

- MahaRERA / State RERA Acts – 3-Account system (Collection, Separate 70%, Transaction 30%) for developer fund management

## Technical and Industry

- LayoutLMv3 / Spatial-Aware Transformers – Multimodal document AI architecture

- NVIDIA Nemotron Parse – VLM for complex document extraction

- Active Learning / HITL Pipelines – Self-improving ML system design

- Yardi Voyager SIPP (Standard Interface Partnership Program) – Deep API integration

- Yardi FinPayables CSV Format – Batch import schema for payables

- Multi-Tenant Database Modeling – Shared Database, Separate Schema pattern

- Dynamic Attributes Pattern (JSONB) – Region-aware extensible data modeling

- Multi-Tier Amortization Schedules – Actual/360, Actual/365, 30/360 interest methods

- Procore Construction Management API – Real-time construction stage sync for upgrade eligibility gating

- Yardi Facility Manager – Post-possession warranty and facility management transition

- ETL Migration Pipelines – Legacy data validation, Interest on Deposit recalculation, RERA escrow compliance verification

---

**END OF SPECIFICATION DOCUMENT**

*Upward v2.1 Unified Sales Blueprint | Prepared February 2026 | Confidential*
