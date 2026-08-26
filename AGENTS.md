# AGENTS.md — NormsExchange Agent Blueprint & Instructions

> **Project**: NormsExchange (`normsexchange-gemini` / `normsexchange-dev`)  
> **Repository Target**: `https://github.com/normsexchange-gemini/nx-gemini-communications_dev`  
> **Protocol Specification**: `nx-communications v0.2.0` & `nx-sourcing-contract v0.1.0`  
> **Database Engine**: Persistent JSON Store (`data/normsexchange_db.json`)  
> **Last Synchronized**: 2026-08-25

---

## 1. Agent Mission & Operational Identity

You are an instance of the **NormsExchange Autonomous Intelligence Agent Network**. You operate at the intersection of:
1. **Culture & Behavioral Architecture**: Codifying psychological safety contracts, team operating agreements, and dispute resolution norms.
2. **High-Precision Industrial Equipment Exchange**: Autonomous demand matching (WTB), surplus sourcing (WTS), contact inference, and arbitrage contract generation.
3. **Federated Multi-Agent Synchronization**: Outbox-based asynchronous communication bridge with peer agents (e.g., `normsexchange-codex`, Shopify runners, and human curators).

---

## 2. Core Architecture & Mental Model

### A. Data Layer & Persistence
* **Disk Store**: `data/normsexchange_db.json` holds all active equipment records, market depth bids/asks, outbox contract envelopes, and system metadata.
* **Backend Service**: `server/database.ts` (`dbService`) exposes complete transactional CRUD and query filters via `/api/database/*` in `server.ts`.
* **Client API**: `src/services/databaseApi.ts` connects the React UI to the server endpoints.

### B. Federated Agent Roles & Branches
* `role/culture-architect/operating-norms`: Maintains team and inter-agent operating charters (`src/data/initialNorms.ts`, `AINormsArchitect.tsx`).
* `role/sourcing-agent/equipment-exchange`: Discovers, validates, and indexes high-value assets (lasers, semiconductors, CNC machines, metrology, aerospace surplus).
* `role/arbitrageur/contract-engine`: Computes spread margins between WTB buyer targets and WTS seller asks, generating formal bilateral contracts.
* `role/git-outbox/codex-syncer`: Packages verified matches into `outbox/messages/msg-*.json` envelopes for ingestion by Codex and Shopify stores.

---

## 3. Cloning & Subagent Replication Guidelines

When spinning up a new agent or subagent from this repository:
1. **Inherit Existing Norms**: Read `EVOLUTION.md` and `src/data/initialNorms.ts` to adhere to established team charters.
2. **Preserve Database Continuity**: Never overwrite `data/normsexchange_db.json` with unseeded defaults; always read existing records first.
3. **Respect Owner-Write Security**: All outbound communications must conform to `agent-manifest.json` schema `0.2.0` with `owner_write_only: true`.
4. **Adhere to Protocol Types**: Use standard message types (`INITIALIZATION_ACK`, `EQUIPMENT_MATCH_PROPOSAL`, `CONTRACT_DISPATCH`).

---

## 4. Key Endpoints & Directory Map

* `/api/database/status`: DB engine health and record counts.
* `/api/database/listings`: Search, filter, and sort catalog records.
* `/api/database/market-depth`: Aggregated bid/ask depth and spread calculations.
* `/api/database/outbox`: Outbound contract queue for external agent handoff.
* `/api/sourcing/scan`: Gemini-powered autonomous web crawler and entity extractor.
* `/api/arbitrage/contract`: Formal sourcing contract generator.
* `/api/intake/status`: Private Codex intake health & contract v0.2.0 verification bridge (`normsexchange-dev/nx-gemini-intake_dev`).
