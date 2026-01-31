# MCI Market Scope Invariant

**Document ID:** GOV-MSI-001  
**Version:** 1.0  
**Status:** ACTIVE  
**Effective Date:** 2026-01-28  

---

## 1. Purpose

This document establishes the **Market Scope Invariant** for the MCI (Mission Control Interface) application. This invariant defines which market concepts are permitted and which are constitutionally prohibited across all system layers.

---

## 2. Scope

This invariant applies to:

- **Production source code** (`src/`)
- **Test suites** (`**/*.test.ts`, `**/*.test.tsx`)
- **Mock data and fixtures**
- **Configuration files** (`.env`, `*.config.*`)
- **Documentation** (`*.md`, `*.html`)
- **CI/CD pipelines** (`.github/workflows/`)

---

## 3. Constitutional Mandate

> **The MCI system shall express ONLY India-based market concepts.**
>
> References to non-Indian markets, brokers, instruments, environments, or trading models are constitutionally out of scope and MUST NOT appear anywhere in the system.

---

## 4. Prohibited Terms

The following terms are **PROHIBITED** and must not appear in any system layer:

### 4.1 Broker Names

| Term | Reason |
|------|--------|
| `Alpaca` | US broker (out of scope) |
| `alpaca` | US broker (out of scope) |
| `ALPACA` | US broker (out of scope) |

### 4.2 Data Provider Names

| Term | Reason |
|------|--------|
| `Polygon` | US market data provider (out of scope) |
| `polygon` | US market data provider (out of scope) |
| `POLYGON` | US market data provider (out of scope) |

### 4.3 US Stock Symbols

| Term | Reason |
|------|--------|
| `AAPL` | Apple Inc. (US equity) |
| `GOOGL` | Alphabet Inc. (US equity) |
| `MSFT` | Microsoft Corp. (US equity) |
| `AMZN` | Amazon.com Inc. (US equity) |
| `META` | Meta Platforms Inc. (US equity) |
| `TSLA` | Tesla Inc. (US equity) |

### 4.4 US Exchange Names

| Term | Reason |
|------|--------|
| `NYSE` | New York Stock Exchange |
| `NASDAQ` | NASDAQ exchange |

### 4.5 US Trading Modes

| Term | Reason |
|------|--------|
| `paper trading` | US broker concept (not applicable to India) |
| `Paper Trading` | US broker concept (not applicable to India) |
| `paper-api` | US broker API mode |

### 4.6 Currency References

| Term | Context | Reason |
|------|---------|--------|
| `USD` | Currency formatting | Must use INR |
| `en-US` | Locale | Must use en-IN |
| `$` | Currency symbol (in trading context) | Must use ₹ |

---

## 5. Approved Terms

The following terms are **APPROVED** for use throughout the system:

### 5.1 Indian Brokers

| Term | Full Name |
|------|-----------|
| `zerodha` | Zerodha Kite |
| `kite` | Kite API (Zerodha) |
| `icici` | ICICI Direct |
| `hdfc` | HDFC Sky |
| `kotak` | Kotak Neo |

### 5.2 Indian Stock Symbols

| Term | Company |
|------|---------|
| `RELIANCE` | Reliance Industries |
| `TCS` | Tata Consultancy Services |
| `INFY` | Infosys |
| `HDFCBANK` | HDFC Bank |
| `ICICIBANK` | ICICI Bank |
| `SBIN` | State Bank of India |
| `BHARTIARTL` | Bharti Airtel |
| `ITC` | ITC Limited |
| `KOTAKBANK` | Kotak Mahindra Bank |
| `HINDUNILVR` | Hindustan Unilever |
| `LT` | Larsen & Toubro |
| `WIPRO` | Wipro |

### 5.3 Indian Exchanges

| Term | Full Name |
|------|-----------|
| `NSE` | National Stock Exchange |
| `BSE` | Bombay Stock Exchange |

### 5.4 Currency & Locale

| Context | Approved Value |
|---------|----------------|
| Currency Code | `INR` |
| Locale | `en-IN` |
| Currency Symbol | `₹` |

---

## 6. Verification Command

To verify compliance with this invariant, execute:

```bash
# Full verification (source + docs)
grep -riE 'alpaca|polygon|AAPL|GOOGL|MSFT|NYSE|NASDAQ' ./ \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.md" \
  --include="*.json" \
  --exclude-dir="node_modules" \
  --exclude-dir=".git"

# Source code only
grep -riE 'alpaca|polygon|AAPL|GOOGL|MSFT' src/

# Expected result: Zero matches
```

---

## 7. CI Pipeline Gate

Add the following step to `.github/workflows/ci.yml`:

```yaml
- name: Verify Indian-Market-Only Compliance
  run: |
    if grep -riE 'alpaca|polygon|AAPL|GOOGL|MSFT' src/; then
      echo "❌ Out-of-scope references detected in source code"
      exit 1
    fi
    echo "✅ Indian-market-only compliance verified"
```

---

## 8. Remediation Procedure

If a prohibited term is detected:

1. **Identify context** - Is it code, test, or documentation?
2. **Determine intent** - What is the code/doc trying to express?
3. **Replace with approved term** - Use the mapping from Section 5
4. **Verify replacement** - Run verification command
5. **Document change** - Log in remediation record

### 8.1 Standard Replacements

| Prohibited | Replacement |
|------------|-------------|
| `Alpaca` | `[Out-of-Scope-Broker]` or Zerodha/Kite |
| `Polygon` | `[Out-of-Scope-Data-Provider]` or NSE/BSE |
| `AAPL` | `RELIANCE` |
| `GOOGL` | `TCS` |
| `MSFT` | `INFY` |
| `NYSE` | `NSE` |
| `NASDAQ` | `BSE` |
| `USD` | `INR` |
| `en-US` | `en-IN` |

---

## 9. Exception Process

There are **NO EXCEPTIONS** to this invariant.

Any request to introduce out-of-scope concepts must be escalated to the Principal for constitutional review.

---

## 10. Enforcement

- **Automated:** CI pipeline gate fails build on violation
- **Manual:** Code review must verify compliance
- **Periodic:** Monthly audit of all files

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-28 | MCI System | Initial document |

---

**Document Classification:** GOVERNANCE  
**Compliance Level:** MANDATORY  
**Constitutional Reference:** System-Wide Indian Market Semantic Alignment Directive
