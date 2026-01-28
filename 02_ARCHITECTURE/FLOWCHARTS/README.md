# MCI Architecture Flowcharts
## Layer 2 Documentation — Complete

**Status:** 14/14 COMPLETE
**LTT Impact:** Layer 2 Architecture → 100%
**Date:** 2026-01-28

---

## Overview

This folder contains the 14 architecture flowchart documents that close the Layer 2 gap in the MCI Lifecycle Traceability Tree (LTT).

All diagrams use **Mermaid syntax** embedded in Markdown files. They can be:
- Viewed directly in VS Code with Mermaid extension
- Rendered in GitHub
- Converted to visual diagrams in Eraser.io or other tools

---

## Flowchart Index

### Backend Flowcharts (5)

| Node | Document | Description | CR Impact |
|------|----------|-------------|-----------|
| 2.1 | [2.1_TOKEN_FLOW.md](./2.1_TOKEN_FLOW.md) | Authentication sequence from user input to Kite validation | CR-001, CR-004 |
| 2.2 | [2.2_SCANNER_LOGIC.md](./2.2_SCANNER_LOGIC.md) | 12-point pre-ignition validation sequence | Phase 1 |
| 2.3 | [2.3_IGNITION_SEQUENCE.md](./2.3_IGNITION_SEQUENCE.md) | Engine start sequence with safety gates | Phase 2 |
| 2.4 | [2.4_TELEMETRY_PIPELINE.md](./2.4_TELEMETRY_PIPELINE.md) | Data flow: Engine → WebSocket → Cache → Frontend | Phase 3 |
| 2.5 | [2.5_SHUTDOWN_SEQUENCE.md](./2.5_SHUTDOWN_SEQUENCE.md) | 6-step CR-002 compliant graceful shutdown | **CR-002 SACRED** |

### Frontend Flowcharts (4)

| Node | Document | Description | CR Impact |
|------|----------|-------------|-----------|
| 2.6 | [2.6_COMPONENT_HIERARCHY.md](./2.6_COMPONENT_HIERARCHY.md) | Tree: App.tsx → Phase Components → UXMI Library | CR-005 |
| 2.7 | [2.7_STATE_MANAGEMENT_FLOW.md](./2.7_STATE_MANAGEMENT_FLOW.md) | Zustand store interactions and data flow | All Stores |
| 2.8 | [2.8_ROUTING_FLOW.md](./2.8_ROUTING_FLOW.md) | Phase 0→1→2→3→4 progression with gates | Navigation |
| 2.9 | [2.9_UXMI_STATES.md](./2.9_UXMI_STATES.md) | 7 components × 7 states visualization | **CR-005 SACRED** |

### Integration Flowcharts (4)

| Node | Document | Description | CR Impact |
|------|----------|-------------|-----------|
| 2.10 | [2.10_API_CONTRACT.md](./2.10_API_CONTRACT.md) | Endpoint specs: /auth, /scan, /ignition, /telemetry, /shutdown | Backend↔Frontend |
| 2.11 | [2.11_WEBSOCKET_EVENTS.md](./2.11_WEBSOCKET_EVENTS.md) | Event schema for real-time telemetry | Real-time |
| 2.12 | [2.12_ERROR_PROPAGATION.md](./2.12_ERROR_PROPAGATION.md) | WHAT/WHY/HOW flow through all layers | **CR-003 SACRED** |
| 2.13 | [2.13_DATA_FLOW_LIFECYCLE.md](./2.13_DATA_FLOW_LIFECYCLE.md) | Complete DFD: Broker → Engine → MCI → Dashboard | End-to-End |

### Operations Flowcharts (1)

| Node | Document | Description | INV Impact |
|------|----------|-------------|-----------|
| 2.14 | [2.14_SYSTEM_LIFECYCLE.md](./2.14_SYSTEM_LIFECYCLE.md) | Application launch, shutdown, and state discipline | **INV-002 SACRED** |

---

## SACRED Documents (CR/INV-Linked)

The following flowcharts document Constitutional Requirements and System Invariants:

| ID | Document | Requirement |
|----|----------|-------------|
| CR-002 | 2.5_SHUTDOWN_SEQUENCE.md | 6-step graceful shutdown |
| CR-003 | 2.12_ERROR_PROPAGATION.md | WHAT/WHY/HOW error format |
| CR-005 | 2.9_UXMI_STATES.md | 7-state micro-interactions |
| INV-002 | 2.14_SYSTEM_LIFECYCLE.md | System lifecycle discipline |

CR-001 (Token Validity) and CR-004 (6 AM IST Expiry) are documented in 2.1_TOKEN_FLOW.md.
INV-001 (Daily Credential Continuity) is documented in 2.1_TOKEN_FLOW.md and 2.7_STATE_MANAGEMENT_FLOW.md.

---

## Document Structure

Each flowchart document follows this structure:

1. **Header** — Node ID, category, CR impact, status, version, date
2. **Purpose** — What the document defines
3. **Flow Diagram** — Primary Mermaid flowchart
4. **Sequence Diagram** — Temporal interactions
5. **State Diagram** — State machine (where applicable)
6. **Component Mapping** — File locations and responsibilities
7. **API/Event Contracts** — Request/response formats
8. **Error Handling** — CR-003 compliant error definitions
9. **Integration Points** — Connections to other components

---

## Viewing Mermaid Diagrams

### VS Code
Install the "Markdown Preview Mermaid Support" extension.

### GitHub
Mermaid diagrams render automatically in GitHub markdown preview.

### Eraser.io
Copy the Mermaid code blocks and paste into Eraser.io for visual editing.

### Command Line
Use `mmdc` (Mermaid CLI) to generate images:
```bash
mmdc -i 2.1_TOKEN_FLOW.md -o token_flow.png
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Initial creation of all 13 flowcharts | Claude (AI) |
| 2026-01-28 | Added 2.14_SYSTEM_LIFECYCLE.md (INV-002) | Claude (AI) |

---

*FLOWCHARTS README v1.1 | Layer 2 Architecture | MCI Project*
