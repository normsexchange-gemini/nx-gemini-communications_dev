# NormsExchange Evolution Ledger & Agent Lineage

> **Protocol Version**: `nx-communications v0.2.0`  
> **Contract Version**: `nx-sourcing-contract v0.1.0`  
> **Environment ID**: `normsexchange-gemini`  
> **Repository Target**: `https://github.com/normsexchange-gemini/nx-gemini-communications_dev`  
> **Primary Maintainer / Operator**: Ray (`ray@webcustoms.com`)  

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
[Epoch 5: Self-Replication, Lineage Blueprint & Cloning Engine] (CURRENT)
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

### Epoch 5: Agent Cloning & Lineage Blueprint (Current)
* **Context**: Creating reproducible instructions (`AGENTS.md`), persistent evolution history (`EVOLUTION.md`), and UI-level cloning tools so new agents can immediately resume operations without loss of institutional memory.

---

## 🛠️ Cloned Agent Quickstart Checklist

When creating a new clone or branch of this agent:

1. **Verify Database Health**:
   ```bash
   curl http://localhost:3000/api/database/status
   ```
2. **Review Active Outbox Queue**:
   Check `outbox/index.json` and ensure no pending contract envelopes are stalled.
3. **Execute Linter & Build**:
   ```bash
   npm run lint && npm run build
   ```
4. **Preserve Protocol Headers**:
   Always tag outbound payload envelopes with `schema_version: "0.2.0"` and `protocol: "nx-communications"`.
