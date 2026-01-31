# MCI INDEPENDENT VERIFICATION RUNBOOK

## Baby-Steps Guidance for Verification Execution

**Document Purpose:** This runbook guides you, step-by-step, through executing the MCI Independent Verification framework. It assumes no prior context and provides simple, clear instructions.

**Status:** PREPARED — Execution requires Program Director authorization.

---

## TABLE OF CONTENTS

1. [Before You Begin](#before-you-begin)
2. [Getting Authorization](#getting-authorization)
3. [Environment Overview](#environment-overview)
4. [Running GitHub Verification](#running-github-verification)
5. [Running Vercel Verification](#running-vercel-verification)
6. [Running Replit Verification](#running-replit-verification)
7. [Running Claude Code Analysis](#running-claude-code-analysis)
8. [Comparing Results (Convergence)](#comparing-results-convergence)
9. [Completing the Summary](#completing-the-summary)
10. [Submitting for Approval](#submitting-for-approval)

---

## BEFORE YOU BEGIN

### What is this verification?

This verification confirms that the MCI system works correctly across multiple independent environments. By running the same tests in different places, we ensure the system is reliable and not dependent on any single machine or setup.

### What you need:

1. **Authorization Code** — You must have explicit authorization from the Program Director
2. **Access to the repository** — The MCI codebase
3. **Accounts** (depending on which environments you run):
   - GitHub account (for GitHub Actions)
   - Vercel account (for Vercel verification)
   - Replit account (for Replit verification)
   - Claude access (for Claude Code analysis)

### Time estimate:

| Environment | Time |
|-------------|------|
| GitHub Actions | ~10-15 minutes |
| Vercel | ~10-15 minutes |
| Replit | ~15-20 minutes |
| Claude Code | ~30-60 minutes |
| Comparison & Summary | ~15 minutes |
| **Total** | ~1.5-2 hours |

---

## GETTING AUTHORIZATION

### Step 1: Request Authorization

Contact the Program Director and request an authorization code for verification execution.

Provide:
- Your name
- The date you want to run verification
- Which environments you plan to use

### Step 2: Receive Authorization Code

The Program Director will provide you with an authorization code. This code looks something like: `AUTH-2026-01-28-001`

### Step 3: Record Authorization

Write down:
- The authorization code
- The date it was issued
- Any expiry date or conditions

**You cannot proceed without this code.**

---

## ENVIRONMENT OVERVIEW

### What each environment does:

| Environment | Purpose | What It Tests |
|-------------|---------|---------------|
| **GitHub Actions** | Automated CI | Tests run in GitHub's servers |
| **Vercel** | Build verification | Tests run during deployment build |
| **Replit** | Human observation | Tests run where you can watch in real-time |
| **Claude Code** | Static analysis | AI reviews the code logic (no execution) |

### Why multiple environments?

If all environments produce the **same results**, we have high confidence the system works correctly. This is called **convergence**.

---

## RUNNING GITHUB VERIFICATION

### What you need:
- GitHub account with access to the repository
- Repository pushed to GitHub

### Steps:

#### Step 1: Navigate to GitHub Actions

1. Go to your GitHub repository
2. Click the "Actions" tab at the top
3. Find the workflow named "MCI Independent Verification"

#### Step 2: Trigger the Workflow

1. Click on the workflow name
2. Click the "Run workflow" button (on the right)
3. You'll see a form:
   - **Authorization Code:** Enter your code (e.g., `AUTH-2026-01-28-001`)
   - **Environment Label:** Leave as default or enter a custom label
4. Click "Run workflow"

#### Step 3: Wait for Completion

1. The workflow will appear in the list
2. Click on it to watch progress
3. Wait for all steps to complete (green checkmarks)
4. If anything fails (red X), note the error

#### Step 4: Download Results

1. After completion, click on the workflow run
2. Scroll to "Artifacts"
3. Download "verification-results-[run-id]"
4. Unzip the file
5. Find `convergence-hash.txt` — **write down this hash**

#### What you should see:

```
✓ All tests passed
✓ Convergence hash generated
✓ Artifacts uploaded
```

---

## RUNNING VERCEL VERIFICATION

### What you need:
- Vercel account
- Repository connected to Vercel project

### Steps:

#### Step 1: Set Up Environment Variable

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - Name: `MCI_AUTHORIZATION_CODE`
   - Value: Your authorization code
   - Environment: All

#### Step 2: Trigger a Build

1. Push a commit to the repository, OR
2. Click "Redeploy" on the latest deployment

#### Step 3: Watch the Build

1. Go to the Deployments tab
2. Click on the running deployment
3. Watch the build logs
4. Look for test output and convergence hash

#### Step 4: Record Results

From the build logs, find:
- Number of tests passed
- Convergence hash
- Any errors

#### What you should see:

```
✅ Type check passed
✅ All tests passed
✅ Build completed
Convergence Hash: [16-character hash]
```

---

## RUNNING REPLIT VERIFICATION

### What you need:
- Replit account
- Repository imported to Replit

### Steps:

#### Step 1: Import Repository

1. Go to replit.com
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your repository URL
5. Wait for import to complete

#### Step 2: Open Terminal

1. In your Repl, open the Shell/Terminal
2. Navigate to the verification folder:
   ```bash
   cd 99_INDEPENDENT_VERIFICATION/REPLIT
   ```

#### Step 3: Make Script Executable

```bash
chmod +x run.sh
```

#### Step 4: Run Verification

```bash
./run.sh YOUR_AUTHORIZATION_CODE
```

Replace `YOUR_AUTHORIZATION_CODE` with your actual code.

#### Step 5: Observe and Record

1. Watch the tests run in real-time
2. When prompted, press ENTER to continue
3. Note any errors or unusual output
4. At the end, record the convergence hash

#### Step 6: Complete Observer Sign-Off

1. Open `results/verification-report.md`
2. Fill in the observer notes
3. Sign your name and date

#### What you should see:

```
╔══════════════════════════════════════════════════════════════╗
║                  VERIFICATION COMPLETE                       ║
╚══════════════════════════════════════════════════════════════╝

Status:          PASS
Tests Passed:    658
Convergence:     [16-character hash]
```

---

## RUNNING CLAUDE CODE ANALYSIS

### What you need:
- Access to Claude (via cursor.com or claude.ai)
- The repository files

### Steps:

#### Step 1: Prepare Context

Have these files ready:
- `99_INDEPENDENT_VERIFICATION/VERIFICATION_MANIFEST.md`
- `99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/prompt.md`
- `99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/scope.json`

#### Step 2: Start Analysis Session

1. Open Claude
2. Share the verification manifest and prompt
3. Say: "I have Program Director authorization code [YOUR_CODE] to execute this analysis."

#### Step 3: Follow Claude's Analysis

Claude will:
1. Read the manifest
2. Analyze each file in scope
3. Check for invariant bypasses
4. Look for silent failures
5. Generate a report

#### Step 4: Save the Report

1. Copy Claude's analysis report
2. Save it to `99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/results/analysis-report.md`

#### What you should see:

A structured report with:
- Invariant verification results
- Phase contract verification
- Any issues found
- Overall verdict (PASS/FAIL/PARTIAL)

---

## COMPARING RESULTS (CONVERGENCE)

### What is convergence?

All environments should produce the **same convergence hash**. This proves the tests are deterministic and environment-independent.

### Steps:

#### Step 1: Gather All Hashes

| Environment | Convergence Hash |
|-------------|------------------|
| GitHub | ________________ |
| Vercel | ________________ |
| Replit | ________________ |

#### Step 2: Compare

- If all hashes are **identical**: ✅ CONVERGED
- If hashes **differ**: ❌ DIVERGED

#### Step 3: If Diverged

1. Check which environment differs
2. Look at the test output for that environment
3. Find the difference (failed test, different count)
4. Document the deviation
5. Determine root cause

---

## COMPLETING THE SUMMARY

### Steps:

#### Step 1: Open the Template

Open: `99_INDEPENDENT_VERIFICATION/ATTESTATIONS/ENVIRONMENT_VERIFICATION_SUMMARY.md`

#### Step 2: Fill In Each Section

Work through the document, filling in:
- Authorization details
- Execution timeline
- Results for each environment
- Convergence comparison
- Invariant verification table
- Overall result

#### Step 3: Determine Final Status

Based on all results:

| Condition | Status |
|-----------|--------|
| All environments pass, hashes match | **PASS** |
| Some failures but fixable | **CONDITIONAL** |
| Critical failures | **FAIL** |

#### Step 4: Sign the Document

Fill in your name, role, date, and signature.

---

## SUBMITTING FOR APPROVAL

### Steps:

#### Step 1: Gather All Artifacts

Collect:
- [ ] `ENVIRONMENT_VERIFICATION_SUMMARY.md` (filled in)
- [ ] GitHub artifacts (zip file)
- [ ] Vercel build logs (screenshot or export)
- [ ] Replit report (signed)
- [ ] Claude analysis report

#### Step 2: Package for Submission

Create a folder or zip with all artifacts.

#### Step 3: Submit to Program Director

Send the package to the Program Director with:
- Subject: "MCI Independent Verification Results — [DATE]"
- Summary of findings
- Your recommendation (PASS/FAIL/CONDITIONAL)

#### Step 4: Await Determination

The Program Director will:
1. Review all evidence
2. Make a determination
3. Sign the summary document
4. Return with approval or further instructions

---

## TROUBLESHOOTING

### "Tests are failing"

1. Check the error message
2. Look for the failing test name
3. Compare with other environments
4. If only one environment fails, it may be environment-specific

### "Hashes don't match"

1. Compare test counts between environments
2. Check for skipped tests
3. Look for timing-related test failures

### "Cannot run script"

1. Make sure script is executable: `chmod +x run.sh`
2. Check Node.js is installed: `node --version`
3. Verify you're in the right directory

### "Authorization code rejected"

1. Verify you have the correct code
2. Check if the code has expired
3. Contact Program Director for new code

---

## QUICK REFERENCE

### Commands

| Environment | Command |
|-------------|---------|
| GitHub | Trigger via Actions UI |
| Vercel | Push commit or click Redeploy |
| Replit | `./run.sh AUTH_CODE` |
| Claude | Follow prompt.md instructions |

### Expected Results

| Metric | Expected |
|--------|----------|
| Total Tests | 658 |
| Pass Rate | 100% |
| Failed | 0 |
| Exit Code | 0 |

### Key Files

| Purpose | Location |
|---------|----------|
| What to verify | `VERIFICATION_MANIFEST.md` |
| Expected values | `COMMON/expected_outputs.json` |
| Results template | `ATTESTATIONS/ENVIRONMENT_VERIFICATION_SUMMARY.md` |
| This guide | `RUNBOOK.md` |

---

**END OF RUNBOOK**
