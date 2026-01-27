/**
 * IRONCLAD E2E Tests: MCI Full Application Flow
 *
 * Browser-level testing for the Mission Control Interface
 * - Phase 0: Token Capture
 * - Phase 1: Pre-Ignition Scan
 * - Phase 2: Ignition Sequence
 * - Phase 3: Mission Control (Running)
 * - Phase 4: Shutdown
 */

import { test, expect } from '@playwright/test';

test.describe('MCI Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Phase 0: Token Capture', () => {
    test('should display token capture form on initial load', async ({ page }) => {
      // Verify we're on the token capture phase using specific selectors
      await expect(page.getByRole('heading', { name: 'Token Capture' })).toBeVisible();

      // Verify phase indicator shows Phase 0
      await expect(page.locator('text=Phase 0')).toBeVisible();

      // Verify form inputs exist (use placeholders or labels)
      await expect(page.locator('input').first()).toBeVisible();
    });

    test('should show header with MCI branding', async ({ page }) => {
      // Verify header content
      await expect(page.getByRole('heading', { name: /MCI/i })).toBeVisible();
      await expect(page.getByText('Mission Control Interface')).toBeVisible();
    });

    test('should have form inputs visible', async ({ page }) => {
      // Check for input fields - at least 2 for API credentials
      const inputs = page.locator('input');
      await expect(inputs).toHaveCount(3); // alpaca key, secret, polygon key
    });
  });

  test.describe('Phase Navigation', () => {
    test('should display phase progress indicator', async ({ page }) => {
      // Phase indicators (numbered circles)
      const phaseIndicators = page.locator('.rounded-full');
      await expect(phaseIndicators.first()).toBeVisible();
    });

    test('should show MCI header branding', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /MCI/i })).toBeVisible();
      await expect(page.getByText('Mission Control Interface')).toBeVisible();
    });

    test('should show footer with version info', async ({ page }) => {
      await expect(page.getByText(/MCI v1.0.0/i)).toBeVisible();
      await expect(page.getByText(/CR-005 Compliant/i)).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper page structure', async ({ page }) => {
      // Basic accessibility checks for landmarks
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab to first focusable element
      await page.keyboard.press('Tab');

      // Should have a focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper heading structure', async ({ page }) => {
      // Should have at least one h1 or h2
      const headings = page.locator('h1, h2');
      await expect(headings.first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Header should still be visible
      await expect(page.getByRole('heading', { name: /MCI/i })).toBeVisible();

      // Form inputs should be accessible
      const inputs = page.locator('input');
      await expect(inputs.first()).toBeVisible();
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // Verify layout adapts
      await expect(page.getByRole('heading', { name: /MCI/i })).toBeVisible();
    });

    test('should adapt to desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      // Verify full desktop layout with subtitle visible
      await expect(page.getByRole('heading', { name: /MCI/i })).toBeVisible();
      await expect(page.getByText('Mission Control Interface')).toBeVisible();
    });
  });

  test.describe('Form Interaction', () => {
    test('should allow typing in input fields', async ({ page }) => {
      // Get first input and type into it
      const firstInput = page.locator('input').first();
      await firstInput.fill('test-value');
      await expect(firstInput).toHaveValue('test-value');
    });

    test('should have a submit button', async ({ page }) => {
      // Look for submit/validate button
      const button = page.locator('button[type="submit"], button:has-text("Validate"), button:has-text("Submit")');
      await expect(button.first()).toBeVisible();
    });
  });

  test.describe('Application State', () => {
    test('should start at Phase 0', async ({ page }) => {
      // Initial phase should be Token Capture (Phase 0)
      const phaseLabel = page.locator('text=/Phase 0/');
      await expect(phaseLabel).toBeVisible();
    });

    test('should display phase labels', async ({ page }) => {
      // Should show current phase name
      const phaseName = page.getByRole('heading', { name: 'Token Capture' });
      await expect(phaseName).toBeVisible();
    });
  });

  test.describe('Error States', () => {
    test('should not crash on initial load', async ({ page }) => {
      // Page should load without errors
      const body = page.locator('body');
      await expect(body).not.toContainText('Error');
      await expect(body).not.toContainText('undefined');
    });

    test('should display footer consistently', async ({ page }) => {
      // Footer should always be present
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('MCI');
    });
  });
});

/**
 * KITE TOKEN FLOW E2E TEST
 * Tests the complete Phase 0 -> Phase 1 transition with real Kite credentials
 * Uses environment variables for credentials (set in .env)
 */
test.describe('Kite Token Flow (Live Integration)', () => {
  // Skip if credentials not set
  test.skip(!process.env.KITE_API_KEY || !process.env.KITE_ACCESS_TOKEN, 'Kite credentials not set');

  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      console.log('[E2E] SessionStorage cleared');
    });
    // Reload to apply cleared state
    await page.reload();
  });

  test('should capture Kite tokens and validate successfully', async ({ page }) => {
    const kiteApiKey = process.env.KITE_API_KEY!;
    const kiteAccessToken = process.env.KITE_ACCESS_TOKEN!;
    const kiteUserId = process.env.KITE_USER_ID!;

    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.text().includes('[TokenStore]')) {
        console.log('Browser:', msg.text());
      }
    });

    // Verify we're at Phase 0 - Token Capture
    await expect(page.getByRole('heading', { name: 'Token Capture' })).toBeVisible();
    await expect(page.locator('text=Phase 0')).toBeVisible();

    // Fill in Kite credentials
    const inputs = page.locator('input');

    // API Key input (first input)
    await inputs.nth(0).fill(kiteApiKey);
    console.log('[E2E] Filled API Key');

    // Access Token input (second input)
    await inputs.nth(1).fill(kiteAccessToken);
    console.log('[E2E] Filled Access Token');

    // User ID input (third input)
    await inputs.nth(2).fill(kiteUserId);
    console.log('[E2E] Filled User ID');

    // Click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Capture")');
    await submitButton.click();
    console.log('[E2E] Submitted form');

    // Wait for validation - should either succeed (Phase 1) or show error
    // Give it up to 10 seconds for the API call
    await page.waitForTimeout(2000);

    // Check for success (Phase 1) or capture error message
    const phase1Visible = await page.locator('text=Phase 1').isVisible().catch(() => false);
    const errorVisible = await page.locator('[class*="error"], [class*="Error"]').isVisible().catch(() => false);

    if (!phase1Visible && errorVisible) {
      // Capture the error message for debugging
      const errorText = await page.locator('[class*="error"], [class*="Error"]').textContent();
      console.error('[E2E] Error displayed:', errorText);
    }

    // If validation succeeded, we should be at Phase 1
    // Check for either Phase 1 indicator or the token timer (which appears after successful validation)
    const tokenTimerVisible = await page.locator('text=/expires|valid/i').isVisible().catch(() => false);

    // Either Phase 1 or token timer should be visible after success
    expect(phase1Visible || tokenTimerVisible).toBeTruthy();
  });

  test('should show validation error for invalid credentials', async ({ page }) => {
    // Use obviously invalid credentials
    const inputs = page.locator('input');

    await inputs.nth(0).fill('invalid_api_key');
    await inputs.nth(1).fill('invalid_access_token');
    await inputs.nth(2).fill('AB1234');

    const submitButton = page.locator('button[type="submit"], button:has-text("Capture")');
    await submitButton.click();

    // Should show error message
    await page.waitForTimeout(3000);
    const errorMessage = page.locator('text=/failed|invalid|expired|error/i');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('should handle stale sessionStorage gracefully on reload', async ({ page }) => {
    // First, set some stale data in sessionStorage
    await page.evaluate(() => {
      const staleData = {
        state: {
          tokenCapturedAt: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
          tokenExpiresAt: Date.now() - 1000, // Already expired
          isTokenValid: true, // But marked as valid (stale!)
        },
        version: 0,
      };
      sessionStorage.setItem('mci-token-storage', JSON.stringify(staleData));
      console.log('[E2E] Set stale sessionStorage data');
    });

    // Reload the page
    await page.reload();

    // The app should still load and render the token capture form
    // (not crash due to stale state)
    await expect(page.getByRole('heading', { name: 'Token Capture' })).toBeVisible({ timeout: 10000 });

    // Form should be interactive
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
  });
});

test.describe('MCI Visual Consistency', () => {
  test('should have consistent color scheme', async ({ page }) => {
    await page.goto('/');

    // Header should have dark background
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify CSS class for dark header
    await expect(header).toHaveClass(/bg-gray-900/);
  });

  test('should display phase indicator circles', async ({ page }) => {
    await page.goto('/');

    // Phase indicator circles should be visible
    const circles = page.locator('.rounded-full');
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(4); // 4 phase circles
  });
});
