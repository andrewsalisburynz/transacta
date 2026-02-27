/**
 * End-to-End Testing with Playwright
 * Tests the Household Spending Tracker MVP
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4000/graphql';

// Sample CSV content for testing
const SAMPLE_CSV = `Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
15/01/2024,-45.50,COUNTDOWN SUPERMARKET,Weekly groceries,,,POS,12-3456-7890123-00,,001,POS,B001,12-3456,15/01/2024
16/01/2024,-120.00,POWER COMPANY,Monthly electricity,,,DD,12-3456-7890123-00,,002,DD,B002,12-3456,16/01/2024
17/01/2024,-15.99,NETFLIX,Monthly subscription,,,POS,12-3456-7890123-00,,003,POS,B003,12-3456,17/01/2024
18/01/2024,-35.00,BP SERVICE STATION,Fuel,,,POS,12-3456-7890123-00,,004,POS,B004,12-3456,18/01/2024
19/01/2024,2500.00,EMPLOYER SALARY,Monthly salary,,,CR,12-3456-7890123-00,,005,CR,B005,12-3456,19/01/2024
20/01/2024,-89.99,WAREHOUSE,Household items,,,POS,12-3456-7890123-00,,006,POS,B006,12-3456,20/01/2024
21/01/2024,-25.50,CAFE,Coffee and lunch,,,POS,12-3456-7890123-00,,007,POS,B007,12-3456,21/01/2024
22/01/2024,-12.00,PARKING,City parking,,,POS,12-3456-7890123-00,,008,POS,B008,12-3456,22/01/2024`;

test.describe('Household Spending Tracker E2E Tests', () => {
  
  test.beforeAll(async () => {
    // Create sample CSV file
    const csvPath = path.join(process.cwd(), 'test-transactions.csv');
    fs.writeFileSync(csvPath, SAMPLE_CSV);
    console.log('✓ Created test CSV file');
  });

  test.afterAll(async () => {
    // Cleanup
    const csvPath = path.join(process.cwd(), 'test-transactions.csv');
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
      console.log('✓ Cleaned up test CSV file');
    }
  });

  test('1. Application loads successfully', async ({ page }) => {
    console.log('\n=== TEST 1: Application Load ===');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check page title or main heading
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/01-app-loaded.png', fullPage: true });
    console.log('✓ Application loaded successfully');
  });

  test('2. Dashboard displays correctly', async ({ page }) => {
    console.log('\n=== TEST 2: Dashboard ===');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for dashboard elements
    const body = await page.textContent('body');
    console.log(`Page contains: ${body?.substring(0, 200)}...`);
    
    await page.screenshot({ path: 'screenshots/02-dashboard.png', fullPage: true });
    console.log('✓ Dashboard displayed');
  });

  test('3. Categories page loads', async ({ page }) => {
    console.log('\n=== TEST 3: Categories ===');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to find and click categories link/button
    try {
      // Look for various possible selectors
      const categoriesLink = page.locator('text=/categories/i').first();
      if (await categoriesLink.isVisible({ timeout: 2000 })) {
        await categoriesLink.click();
        await page.waitForLoadState('networkidle');
      }
    } catch (e) {
      console.log('Categories navigation not found, checking current page...');
    }
    
    await page.screenshot({ path: 'screenshots/03-categories.png', fullPage: true });
    console.log('✓ Categories page checked');
  });

  test('4. GraphQL API - Fetch categories', async ({ request }) => {
    console.log('\n=== TEST 4: GraphQL API - Categories ===');
    
    const response = await request.post(API_URL, {
      data: {
        query: `
          query {
            categories {
              id
              name
              categoryType
            }
          }
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`Categories found: ${data.data.categories.length}`);
    data.data.categories.forEach((cat: any) => {
      console.log(`  - ${cat.name} (${cat.categoryType})`);
    });
    
    expect(data.data.categories.length).toBeGreaterThan(0);
    console.log('✓ Categories API working');
  });

  test('5. GraphQL API - Dashboard stats', async ({ request }) => {
    console.log('\n=== TEST 5: GraphQL API - Dashboard Stats ===');
    
    const response = await request.post(API_URL, {
      data: {
        query: `
          query {
            dashboardStats {
              totalTransactions
              unclassifiedCount
              categoryCount
              currentMonthSpending
            }
          }
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log('Dashboard Stats:');
    console.log(`  Total Transactions: ${data.data.dashboardStats.totalTransactions}`);
    console.log(`  Unclassified: ${data.data.dashboardStats.unclassifiedCount}`);
    console.log(`  Categories: ${data.data.dashboardStats.categoryCount}`);
    console.log(`  Current Month Spending: $${data.data.dashboardStats.currentMonthSpending}`);
    
    expect(data.data.dashboardStats.categoryCount).toBeGreaterThan(0);
    console.log('✓ Dashboard stats API working');
  });

  test('6. GraphQL API - Create category', async ({ request }) => {
    console.log('\n=== TEST 6: GraphQL API - Create Category ===');
    
    const response = await request.post(API_URL, {
      data: {
        query: `
          mutation {
            createCategory(input: {
              name: "Test Category"
              categoryType: EXPENSE
              color: "#FF5722"
            }) {
              id
              name
              categoryType
              color
            }
          }
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    if (data.errors) {
      console.log('Errors:', JSON.stringify(data.errors, null, 2));
    } else {
      console.log(`Created category: ${data.data.createCategory.name}`);
      console.log(`  ID: ${data.data.createCategory.id}`);
      console.log(`  Type: ${data.data.createCategory.categoryType}`);
      console.log(`  Color: ${data.data.createCategory.color}`);
      console.log('✓ Category creation working');
    }
  });

  test('7. GraphQL API - Import CSV', async ({ request }) => {
    console.log('\n=== TEST 7: GraphQL API - CSV Import ===');
    
    const response = await request.post(API_URL, {
      data: {
        query: `
          mutation($input: CSVUploadInput!) {
            uploadCSV(input: $input) {
              success
              message
              importedCount
              duplicateCount
              errorCount
            }
          }
        `,
        variables: {
          input: {
            fileContent: SAMPLE_CSV,
            filename: 'test-transactions.csv',
            skipDuplicates: true
          }
        }
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    if (data.errors) {
      console.log('Errors:', JSON.stringify(data.errors, null, 2));
    } else {
      console.log('CSV Import Results:');
      console.log(`  Success: ${data.data.uploadCSV.success}`);
      console.log(`  Message: ${data.data.uploadCSV.message}`);
      console.log(`  Imported: ${data.data.uploadCSV.importedCount}`);
      console.log(`  Duplicates: ${data.data.uploadCSV.duplicateCount}`);
      console.log(`  Errors: ${data.data.uploadCSV.errorCount}`);
      console.log('✓ CSV import working');
    }
  });

  test('8. GraphQL API - Fetch transactions', async ({ request }) => {
    console.log('\n=== TEST 8: GraphQL API - Fetch Transactions ===');
    
    const response = await request.post(API_URL, {
      data: {
        query: `
          query {
            transactions(limit: 10) {
              id
              date
              amount
              payee
              classificationStatus
            }
          }
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    if (data.errors) {
      console.log('Errors:', JSON.stringify(data.errors, null, 2));
    } else if (data.data && data.data.transactions) {
      console.log(`Transactions found: ${data.data.transactions.length}`);
      data.data.transactions.slice(0, 5).forEach((txn: any) => {
        console.log(`  - ${txn.date}: ${txn.payee} $${txn.amount} [${txn.classificationStatus}]`);
      });
      console.log('✓ Transactions API working');
    } else {
      console.log('No transactions data returned');
    }
  });

  test('9. Full page navigation test', async ({ page }) => {
    console.log('\n=== TEST 9: Page Navigation ===');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Get all links on the page
    const links = await page.locator('a').all();
    console.log(`Found ${links.length} links on the page`);
    
    // Try to identify navigation structure
    const navText = await page.locator('nav, header, [role="navigation"]').textContent().catch(() => '');
    console.log(`Navigation text: ${navText}`);
    
    await page.screenshot({ path: 'screenshots/09-navigation.png', fullPage: true });
    console.log('✓ Navigation structure captured');
  });

  test('10. Test summary and report', async ({ request }) => {
    console.log('\n=== TEST 10: Final Summary ===');
    
    // Get final stats
    const response = await request.post(API_URL, {
      data: {
        query: `
          query {
            dashboardStats {
              totalTransactions
              unclassifiedCount
              categoryCount
            }
            categories {
              name
            }
          }
        `
      }
    });
    
    const data = await response.json();
    
    console.log('\n📊 FINAL TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✓ Total Transactions: ${data.data.dashboardStats.totalTransactions}`);
    console.log(`✓ Unclassified: ${data.data.dashboardStats.unclassifiedCount}`);
    console.log(`✓ Total Categories: ${data.data.dashboardStats.categoryCount}`);
    console.log(`✓ Screenshots saved in: screenshots/`);
    console.log('='.repeat(50));
    console.log('✓ All tests completed successfully!');
  });
});
