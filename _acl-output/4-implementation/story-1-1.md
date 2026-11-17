---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-11-12T13:24:50.691Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: "Story 1.1: Project Baseline, Mock Data Fixtures & Catalog Service"
story_id: "1.1"
epic_id: "1"
project_type: greenfield
created: "2026-11-12"
---

# Story 1.1: Project Baseline, Mock Data Fixtures & Catalog Service

## Overview
As a developer and shopper,  
I want the application to initialize with a decoupled catalog service and bundled mock data fixture,  
So that product data is normalized and reliably accessible for rendering without external network latency.

## Technical Scope & Architecture Contract
- **Architecture Anchors**:
  - `AD-3` (Decoupled Catalog Service Boundary)
  - `ARCH-6` (React 19 + Vite starter template baseline)
- **Target Files**:
  - `src/data/products.json`: Canonical mock dataset with 20 items across categories (`electronics`, `jewelery`, `men's clothing`, `women's clothing`).
  - `src/services/catalogService.js`: Encapsulates catalog ingestion, category normalization, and asynchronous data resolution with error safety.
  - `src/utils/formatters.js`: Currency formatting utility function (`formatCurrency`).

## Acceptance Criteria Checklist
- [ ] **Given** the initial React 19 + Vite application environment,  
  **When** `src/data/products.json` is loaded with 20 items (across Electronics, Jewelery, Men's Clothing, Women's Clothing),  
  **Then** each item contains `id` (string/number), `title`, `price` (number), `description`, `category`, `image` (URL string), and `rating` ({ rate: number, count: number }).
- [ ] **Given** `src/services/catalogService.js`,  
  **When** `fetchProducts()` is invoked,  
  **Then** it returns a Promise resolving to the normalized array of Product objects within simulated 200ms latency.
- [ ] **Given** a data fetching error condition or corrupt payload in `catalogService.js`,  
  **When** retrieval fails,  
  **Then** the service rejects with a structured error object containing a user-friendly message and retry trigger.
- [ ] **Given** `src/utils/formatters.js`,  
  **When** `formatCurrency(29.99)` is invoked,  
  **Then** it returns `"$29.99"` consistently.
