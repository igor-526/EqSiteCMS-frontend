#!/usr/bin/env node
/**
 * QA Browser - Headless browser checks для Quality Gate
 * 
 * Использование:
 *   node scripts/qa-browser.mjs [--page=<route>] [--checks=<check1,check2>]
 * 
 * Примеры:
 *   node scripts/qa-browser.mjs --page=/news
 *   node scripts/qa-browser.mjs --page=/news --checks=table,form,responsive
 */

import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ═════════════════════════════════════════════════════════
// Configuration
// ═════════════════════════════════════════════════════════

const CONFIG = {
  baseUrl: process.env.QA_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  }
};

// ═════════════════════════════════════════════════════════
// CLI Args Parsing
// ═════════════════════════════════════════════════════════

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const PAGE_ROUTE = args.page || '/';
const CHECKS = args.checks ? args.checks.split(',') : ['smoke'];

// ═════════════════════════════════════════════════════════
// Check Definitions
// ═════════════════════════════════════════════════════════

const CHECKS_REGISTRY = {
  // Smoke test: страница загружается без ошибок
  async smoke(page) {
    const errors = [];
    
    page.on('pageerror', error => {
      errors.push({
        type: 'JavaScript Error',
        message: error.message,
        severity: 'critical'
      });
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'Console Error',
          message: msg.text(),
          severity: 'major'
        });
      }
    });
    
    await page.goto(`${CONFIG.baseUrl}${PAGE_ROUTE}`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });
    
    // Проверяем, что страница загрузилась
    const title = await page.title();
    
    return {
      name: 'Smoke Test',
      passed: errors.length === 0,
      details: {
        title,
        errors: errors.length > 0 ? errors : undefined
      }
    };
  },
  
  // Responsive: страница работает на всех breakpoints
  async responsive(page) {
    const results = [];
    
    for (const [device, viewport] of Object.entries(CONFIG.viewports)) {
      await page.setViewportSize(viewport);
      await page.goto(`${CONFIG.baseUrl}${PAGE_ROUTE}`, {
        waitUntil: 'networkidle'
      });
      
      // Проверяем, что нет horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      // Проверяем, что контент видим
      const bodyHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
      
      results.push({
        device,
        viewport,
        hasOverflow,
        bodyHeight,
        passed: !hasOverflow && bodyHeight > 0
      });
    }
    
    const allPassed = results.every(r => r.passed);
    
    return {
      name: 'Responsive Check',
      passed: allPassed,
      details: { results }
    };
  },
  
  // Table: проверка отображения таблицы
  async table(page) {
    await page.goto(`${CONFIG.baseUrl}${PAGE_ROUTE}`, {
      waitUntil: 'networkidle'
    });
    
    // Ищем таблицу (Ant Design или MUI)
    const tableExists = await page.locator('table, [role="table"]').count() > 0;
    
    if (!tableExists) {
      return {
        name: 'Table Check',
        passed: false,
        details: { error: 'No table found on page' }
      };
    }
    
    // Проверяем наличие строк
    const rowCount = await page.locator('tbody tr, [role="row"]').count();
    
    return {
      name: 'Table Check',
      passed: rowCount > 0,
      details: {
        tableFound: true,
        rowCount
      }
    };
  },
  
  // Form: проверка открытия формы
  async form(page) {
    await page.goto(`${CONFIG.baseUrl}${PAGE_ROUTE}`, {
      waitUntil: 'networkidle'
    });
    
    // Ищем кнопку создания (обычные тексты)
    const createButton = page.locator('button:has-text("Создать"), button:has-text("Добавить"), button:has-text("Create"), button:has-text("Add")').first();
    
    const buttonExists = await createButton.count() > 0;
    
    if (!buttonExists) {
      return {
        name: 'Form Check',
        passed: false,
        details: { error: 'Create button not found' }
      };
    }
    
    // Кликаем
    await createButton.click();
    
    // Ждём появления формы (modal или drawer)
    await page.waitForSelector('form, [role="dialog"]', { timeout: 5000 });
    
    const formExists = await page.locator('form').count() > 0;
    
    return {
      name: 'Form Check',
      passed: formExists,
      details: {
        buttonFound: true,
        formOpened: formExists
      }
    };
  },
  
  // Accessibility: базовые a11y проверки
  async accessibility(page) {
    await page.goto(`${CONFIG.baseUrl}${PAGE_ROUTE}`, {
      waitUntil: 'networkidle'
    });
    
    const findings = [];
    
    // Проверка: все изображения имеют alt
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      findings.push({
        rule: 'Images must have alt text',
        severity: 'major',
        count: imagesWithoutAlt
      });
    }
    
    // Проверка: кнопки имеют текст или aria-label
    const buttonsWithoutLabel = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => 
        !btn.textContent.trim() && 
        !btn.getAttribute('aria-label')
      ).length;
    });
    
    if (buttonsWithoutLabel > 0) {
      findings.push({
        rule: 'Buttons must have accessible text',
        severity: 'major',
        count: buttonsWithoutLabel
      });
    }
    
    // Проверка: heading hierarchy
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map(h => parseInt(h.tagName[1]));
      
      let issues = 0;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          issues++;
        }
      }
      return issues;
    });
    
    if (headingIssues > 0) {
      findings.push({
        rule: 'Heading levels should not skip',
        severity: 'minor',
        count: headingIssues
      });
    }
    
    return {
      name: 'Accessibility Check',
      passed: findings.filter(f => f.severity === 'critical' || f.severity === 'major').length === 0,
      details: {
        findings: findings.length > 0 ? findings : undefined,
        summary: `${findings.length} accessibility issues found`
      }
    };
  }
};

// ═════════════════════════════════════════════════════════
// Main Runner
// ═════════════════════════════════════════════════════════

async function runQA() {
  console.log('🎭 QA Browser - Headless checks\n');
  console.log(`Page: ${PAGE_ROUTE}`);
  console.log(`Checks: ${CHECKS.join(', ')}\n`);
  
  let browser;
  let devServer;
  
  try {
    // Запускаем dev server если нужно
    if (!process.env.QA_SKIP_SERVER) {
      console.log('🚀 Starting dev server...');
      devServer = exec('npm run dev', {
        cwd: process.cwd()
      });
      
      // Ждём пока сервер поднимется
      await waitForServer(CONFIG.baseUrl, 30000);
      console.log('✅ Dev server ready\n');
    }
    
    // Запускаем browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: CONFIG.viewports.desktop
    });
    
    const page = await context.newPage();
    
    // Запускаем проверки
    const results = [];
    
    for (const checkName of CHECKS) {
      const checkFn = CHECKS_REGISTRY[checkName];
      
      if (!checkFn) {
        console.error(`❌ Unknown check: ${checkName}`);
        continue;
      }
      
      console.log(`Running: ${checkName}...`);
      
      try {
        const result = await checkFn(page);
        results.push(result);
        
        console.log(result.passed ? '  ✅ PASS' : '  ❌ FAIL');
        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      } catch (error) {
        console.error(`  💥 ERROR: ${error.message}`);
        results.push({
          name: checkName,
          passed: false,
          error: error.message
        });
      }
      
      console.log('');
    }
    
    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log('═'.repeat(50));
    console.log('📊 Summary\n');
    console.log(`Total checks: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}\n`);
    
    if (failed === 0) {
      console.log('🎉 All checks passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some checks failed');
      
      // Выводим детали провалов
      results.filter(r => !r.passed).forEach(r => {
        console.log(`\n❌ ${r.name}:`);
        if (r.error) {
          console.log(`   Error: ${r.error}`);
        }
        if (r.details) {
          console.log(`   ${JSON.stringify(r.details, null, 2)}`);
        }
      });
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    
    if (devServer) {
      devServer.kill();
    }
  }
}

// ═════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════

async function waitForServer(url, timeout) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Ещё не готов
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server not ready after ${timeout}ms`);
}

// ═════════════════════════════════════════════════════════
// Run
// ═════════════════════════════════════════════════════════

runQA();
