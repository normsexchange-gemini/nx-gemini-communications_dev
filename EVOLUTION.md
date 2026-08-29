# NormsExchange Evolution Ledger & Agent Lineage

> **Protocol Version**: `nx-communications v0.3.0`  
> **Contract Version**: `nx-sourcing-contract v0.2.0`  
> **Environment ID**: `normsexchange-gemini`  
> **Repository Target**: `https://github.com/normsexchange-gemini/nx-gemini-communications_dev`  
> **Primary Maintainer / Operator**: Ray (`ray@webcustoms.com`)  
> **Last Synchronized**: 2026-08-26

---

## 📜 Executive Summary

This document serves as the permanent **Evolution History & Cloning Blueprint** for the NormsExchange system. Any newly cloned agent (whether powered by Gemini, Codex, Claude, or local runners) MUST ingest this ledger to inherit full context, architectural constraints, and protocol standards.

---

## 🧬 Architectural Evolution Lineage

```
[Epoch 0: Operating Norms Genesis]
          │
          ▼
[Epoch 1: Federated Agent Communications (nx-communications v0.2.0)]
          │
          ▼
[Epoch 2: Autonomous Sourcing Scanner & Inferred Entity Dossiers]
          │
          ▼
[Epoch 3: Match Arbitrage Engine & Formal Contract Generator]
          │
          ▼
[Epoch 4: Persistent Server-Side Database & Master Explorer]
          │
          ▼
[Epoch 5: Self-Replication, Lineage Blueprint & Cloning Engine]
          │
          ▼
[Epoch 6: Autonomous GitHub Sync & Codex Protocol Fusion Ingestion]
          │
          ▼
[Epoch 7: Codex Protocol v0.3.0 & Permanent Mission Ingestion]
          │
          ▼
[Epoch 8: Original Source Links, Automated Link Verification & Pruning Hygiene Engine]
          │
          ▼
[Epoch 9: Mandatory Transparency & Autonomous Asset Labeling Standard] (CURRENT)
```

---

## 📅 Chronological Milestones & Epochs

### Epoch 0: Operating Norms Genesis
* **Context**: Founding of `normsexchange-dev`. The core premise was codifying human and AI behavioral norms, psychological safety agreements, and dispute resolution charters.
* **Key Artifacts**:
  - `src/data/initialNorms.ts`: Category matrix (Psychological Safety, Creative Disagreement, Execution Rhythm, AI-Human Symbiosis).
  - Role Branch: `role/culture-architect/operating-norms`.
  - Interactive AINormsArchitect component for dynamic charter synthesis.

### Epoch 1: Federated Multi-Agent Protocol (`nx-communications v0.2.0`)
* **Context**: Integration of decentralized agent communications between Gemini (research & sourcing) and Codex (inventory management & Shopify bridge).
* **Key Artifacts**:
  - `agent-manifest.json` schema v0.2.0 with `owner_write_only: true`.
  - `outbox/index.json` message index structure.
  - Asynchronous JSON message dispatching mechanism (`outbox/messages/msg-*.json`).

### Epoch 2: Autonomous Sourcing Scanner & Entity Inference
* **Context**: Equipping the agent to scour unstructured surplus listings, auction data, and industrial catalogs to match against buyer WTB queues.
* **Key Artifacts**:
  - `server.ts` endpoint `/api/sourcing/scan` utilizing Gemini models for entity resolution.
  - Contact dossier schema: Inferred emails, phone numbers, domain WHOIS verification, and confidence ratings (0–98%).
  - Categorization into 7 industrial tiers (Optics/Lasers, Semiconductor, CNC, Metrology, Power, Robotics, Aerospace).

### Epoch 3: Match Arbitrage & Contract Synthesis (`nx-sourcing-contract v0.1.0`)
* **Context**: Automating the mathematical valuation spread between buyer WTB target prices and seller WTS asking prices.
* **Key Artifacts**:
  - Dynamic spread margin calculation (`marginSpreadEstimate = priceTarget - wtsPrice`).
  - `/api/arbitrage/contract` endpoint: Generates binding bilateral purchase agreements with escrow terms, inspection windows, and liquidated damages clauses.

### Epoch 4: Persistent Server Database & Master Catalog
* **Context**: Replacing ephemeral in-memory state with a transactional, disk-backed persistent storage layer to ensure state durability across restarts and cold containers.
* **Key Artifacts**:
  - `data/normsexchange_db.json`: Local JSON database store.
  - `server/database.ts` (`dbService`): Full CRUD, query filtering, market depth aggregation, and outbox persistence.
  - `src/services/databaseApi.ts`: Type-safe client communication bridge.
  - `src/components/DatabaseBrowser.tsx`: High-density table, bento cards, raw JSON document inspector, and AI Seed generation.

### Epoch 5: Agent Cloning & Lineage Blueprint
* **Context**: Creating reproducible instructions (`AGENTS.md`), persistent evolution history (`EVOLUTION.md`), and UI-level cloning tools so new agents can immediately resume operations without loss of institutional memory.

### Epoch 6: Autonomous GitHub Sync & Codex Protocol Fusion Ingestion
* **Context**: Established direct autonomous GitHub write connection for `normsexchange-gemini/nx-gemini-communications_dev` (`main` branch) and linked the isolated private intake bridge `normsexchange-dev/nx-gemini-intake_dev` pinned to `nx-sourcing-contracts_dev@contract-v0.2.0`.
* **Key Artifacts**:
  - Secure background push engine in `server.ts` (`pushFilesToGitHub` / `/api/github/push-sync`).
  - Isolated intake gateway (`/api/intake/status`) connected to `normsexchange-dev/nx-gemini-intake_dev` with fine-grained security boundary enforcement.
  - Secret filtering in `.gitignore` protecting token configs while ensuring all agent knowledge, database state, and protocol documents are synchronized.
  - Multi-agent instruction fusion readiness: Configured to combine upstream Codex specifications, inventory rules, and marketplace commands into unified agent charters.

### Epoch 7: Codex Protocol v0.3.0 & Permanent Mission Ingestion
* **Context**: Upstream peer node `normsexchange-codex` reached permanent mission freeze (`mission/NORMS_EXCHANGE_MISSION.md`) and tagged `communications-v0.3.0` release. Gemini agent synchronized upstream topology and security boundaries.
* **Codex State Ingested**:
  - **Codex Tag**: `communications-v0.3.0` (`sha: 011fdc5`)
  - **Permanent Mission**: High-evidence marketplace bridging film equipment supply & demand between LA/US and Vietnam across cameras, optics, lighting/grip, audio, wireless/monitoring, and post systems.
  - **Security Rule Frozen**: Leads/candidates remain untrusted until separately authorized. No automatic outreach, Shopify mutation, purchase, or private data publication.
  - **Intake Pipeline Bound**: Gemini WTB candidate batches route exclusively through `normsexchange-dev/nx-gemini-intake_dev` under `role/<role-slug>/<goal-slug>` PR flow.

### Epoch 8: Original Source Links, Automated Link Verification & Pruning Hygiene Engine
* **Context**: Implemented strict evidence verification and inventory lifecycle hygiene across the 1,000-listing industrial film catalog. Every listing now exposes direct, clickable source URLs and automated status pruning (sold/404 handling) to protect downstream arbitrage and contract execution.
* **Key Capabilities & Artifacts**:
  - **Original Source Links**: `src/utils/sourceLinks.ts` parses and formats direct verified external links to original listings (ShareGrid, Panavision, B&H, MPB, Keh, eBay, Cinegear) with health status badges (`Live / Verified`, `Sold / Ended`, `Delisted / 404`).
  - **Automated Pruning Engine**: `server/database.ts` (`pruneListings` / `/api/database/prune`) audits link health, detects ended/sold listings or dead URLs, and either archives or purges records with itemized audit logs.
  - **Lifecycle State Machine**: Support for `Active`, `Sold`, `Delisted`, and `Archived` states with real-time UI controls and automatic exclusion of dead/sold assets from active arbitrage calculation.
  - **Audit Reporting Modal**: Detailed audit breakdown in `DatabaseBrowser.tsx` showing inspected URLs, HTTP status code checks, and action summaries.
  - **Visual Asset Architecture**: High-resolution equipment photography with grayscale sold badges and fallback rendering.

### Epoch 9: Mandatory Transparency & Autonomous Asset Labeling Standard (Current)
* **Context**: Codified strict operational directive in `AGENTS.md` requiring every autonomously generated, AI-inferred, synthetic, or crawler-extracted entity to be prominently labeled as **"Auto Generated"** across all user interfaces, cards, modals, table rows, and outbox contract payloads.
* **Key Capabilities & Artifacts**:
  - **Visual High-Visibility Badging**: Added high-contrast `⚡ AUTO GENERATED` & `🤖 AI INFERRED` badges on equipment catalog cards, modal inspection headers, database tables, team charter operating norms, and arbitrage contract envelopes.
  - **Schema Level Compliance**: Added `isAutoGenerated: true` and `generationMethod` flags across `EquipmentListing`, `Norm`, and `SourcingContractCandidate` interfaces.
  - **Multi-Agent Trust & Auditability**: Enables human curators and downstream peer agents (`normsexchange-codex`, Shopify runners) to instantly differentiate verified human-entered listings from autonomous AI extractions.

---

## 🤝 Multi-Agent Ingestion & Codex Protocol Fusion Matrix

When receiving instructions and directives from peer node **`normsexchange-codex`**:

| Ingestion Category | Upstream Reference | Integration Target | Handling Procedure |
| :--- | :--- | :--- | :--- |
| **Permanent Mission** | `mission/NORMS_EXCHANGE_MISSION.md` (v1.0.0) | `AGENTS.md` & `EVOLUTION.md` | Ingest film equipment scope (LA ↔ US ↔ Vietnam), strict evidence-as-truth mandate. |
| **Sourcing Contracts** | `nx-sourcing-contracts_dev@contract-v0.2.0` | `schemas/` & `server/database.ts` | Validate candidate submissions against `wtb-candidate.schema.json` and `wtb-candidate-batch.schema.json`. |
| **Intake Pipeline** | `nx-gemini-intake_dev` (v0.1.0) | `role/*` PRs ➔ `submissions/*.json` | Generate sanitized JSON batches + update `intake/index.json` with SHA-256 validation. |
| **Catalog & Market Depth** | Peer listings & WTB/WTS leads | `data/normsexchange_db.json` & UI | Track bids, asks, spreads, link verification health, and equipment specs in real-time. |

---

## 🛠️ Cloned Agent Quickstart Checklist

When creating a new clone or branch of this agent:

1. **Verify Database Health**:
   ```bash
   curl http://localhost:3000/api/database/status
   ```
2. **Execute Link Health & Pruning Audit**:
   ```bash
   curl -X POST http://localhost:3000/api/database/prune -H "Content-Type: application/json" -d '{"mode":"archive"}'
   ```
3. **Review Active Outbox Queue**:
   Check `outbox/index.json` and ensure no pending contract envelopes are stalled.
4. **Execute Linter & Build**:
   ```bash
   npm run lint && npm run build
   ```
5. **Preserve Protocol Headers**:
   Always tag outbound payload envelopes with `schema_version: "0.2.0"` and `protocol: "nx-communications"`.

### Epoch 10: The Golden Rule (Zero Data Invention & Verification Mandate)
* **Context**: Implemented the unyielding Golden Rule setting in stone that **inventing any type of data defeats the purpose of the agent**. The system's true mandate is locating and verifying correct data.
* **Key Capabilities & Artifacts**:
  - **Zero Data Hallucination Directive**: Enshrined in `AGENTS.md` and `EVOLUTION.md` that no mock data, synthetic contacts, or hallucinated prices are permitted. All entries must reflect external reality.
  - **Verification Enforcement (`verificationCount`)**: Data must be checked at least once (`verificationCount >= 1`).
  - **Codex Compatibility Hardening**: Assured that all outbound candidate batches sent to the Codex intake bridge carry strict evidence checks, ensuring upstream compatibility and protecting the marketplace trust model.
  - **Charter Inclusion**: Added this mandate as a core psychological and operational norm in `initialNorms.ts`.
