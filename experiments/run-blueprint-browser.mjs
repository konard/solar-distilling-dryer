import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyBlueprint, verifyFallback } from './blueprint-browser.mjs';
const packagePath = process.env.PLAYWRIGHT_PACKAGE_PATH;
const { chromium } = await import(
  packagePath ? pathToFileURL(packagePath).href : 'playwright'
);
const root = resolve('dist/site');
const prefix = '/solar-distilling-dryer/';
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.md': 'text/plain',
};
const server = createServer(async (req, res) => {
  const pathname = new globalThis.URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith(prefix)) {
    res.writeHead(404).end();
    return;
  }
  const file = resolve(
    root,
    decodeURIComponent(pathname.slice(prefix.length) || 'index.html')
  );
  if (!file.startsWith(`${root}/`)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(file);
    res
      .writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
      })
      .end(content);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BLUEPRINT_CHROMIUM_PATH || undefined,
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
  ],
});
const page = await browser.newPage();
page.setDefaultTimeout(20000);
try {
  await verifyBlueprint(
    page,
    `http://127.0.0.1:${server.address().port}${prefix}`
  );
  await verifyFallback(
    browser,
    `http://127.0.0.1:${server.address().port}${prefix}`
  );
  await mkdir('reports/blueprint', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
  await page.waitForSelector('#viewport[data-ready="true"]');
  await page.screenshot({
    path: 'reports/blueprint/desktop.png',
    fullPage: true,
  });
  await page.locator('#section').check();
  await page.locator('#produce').uncheck();
  await page.screenshot({
    path: 'reports/blueprint/section.png',
    fullPage: true,
  });
  await page.locator('#section').uncheck();
  await page.locator('#explode').check();
  await page.screenshot({
    path: 'reports/blueprint/exploded.png',
    fullPage: true,
  });
  await page.locator('#reset').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'reports/blueprint/mobile.png',
    fullPage: true,
  });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
