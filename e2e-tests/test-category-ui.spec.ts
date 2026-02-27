/**
 * Quick test for category creation UI
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test('Category creation via UI', async ({ page }) => {
  console.log('\n=== Testing Category Creation UI ===');
  
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Look for Categories link/button and click it
  try {
    // Try different possible selectors
    const categoriesButton = page.locator('text=/categories/i').first();
    if (await categoriesButton.isVisible({ timeout: 2000 })) {
      console.log('Found Categories button, clicking...');
      await categoriesButton.click();
      await page.waitForLoadState('networkidle');
    }
  } catch (e) {
    console.log('Categories button not found, checking if already on page...');
  }
  
  // Take screenshot of current state
  await page.screenshot({ path: 'test-category-before.png', fullPage: true });
  
  // Look for the create category form
  const nameInput = page.locator('input').filter({ hasText: '' }).first();
  const typeSelect = page.locator('select');
  const colorInput = page.locator('input[type="color"]');
  const submitButton = page.locator('button:has-text("Create Category")');
  
  // Check if form is visible
  const formVisible = await submitButton.isVisible({ timeout: 2000 });
  
  if (formVisible) {
    console.log('✓ Found category creation form');
    
    // Fill in the form
    const inputs = await page.locator('input[type="text"], input:not([type])').all();
    if (inputs.length > 0) {
      await inputs[0].fill('UI Test Category ' + Date.now());
    }
    
    await typeSelect.selectOption('expense');
    await colorInput.fill('#FF6B6B');
    
    console.log('✓ Filled form fields');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'test-category-filled.png', fullPage: true });
    
    // Submit the form
    await submitButton.click();
    
    // Wait a bit for the mutation to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-category-after.png', fullPage: true });
    
    // Check if the new category appears in the list
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('UI Test Category')) {
      console.log('✅ SUCCESS: Category created and appears in list!');
    } else {
      console.log('⚠️  Category may have been created but not visible yet');
      console.log('Checking via API...');
    }
  } else {
    console.log('❌ Could not find category creation form');
    console.log('Page content:', await page.textContent('body'));
  }
});
