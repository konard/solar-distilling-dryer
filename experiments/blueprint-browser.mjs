// Reusable in Playwright MCP and CI; no assertion framework dependency.
const check = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};
const nextFrame = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        globalThis.requestAnimationFrame(() =>
          globalThis.requestAnimationFrame(resolve)
        )
      )
  );
export async function verifyBlueprint(page, baseURL) {
  page.setDefaultTimeout(20000);
  console.log('Checking desktop rendering');
  const errors = [];
  const external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (
      !request.url().startsWith(baseURL) &&
      !request.url().startsWith('blob:')
    ) {
      external.push(request.url());
    }
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(baseURL);
  await page.waitForSelector('#viewport[data-ready="true"] canvas');
  check(
    (await page.locator('[data-part]').count()) === 12,
    'BOM must expose every component'
  );
  check(
    !(await page.locator('#viewer-error').isVisible()),
    'WebGL should render'
  );
  const pixels = () =>
    page.locator('canvas').evaluate((canvas) => canvas.toDataURL());
  console.log('Checking camera controls');
  for (const view of ['front', 'right', 'top', 'iso']) {
    const before = await pixels();
    await page.locator(`[data-view="${view}"]`).click();
    await nextFrame(page);
    check(
      (await pixels()) !== before,
      `${view} camera must change the rendered model`
    );
  }
  const canvas = await page.locator('canvas').boundingBox();
  const drag = async (button, dx, dy) => {
    const before = await pixels();
    await page.mouse.move(
      canvas.x + canvas.width * 0.6,
      canvas.y + canvas.height * 0.55
    );
    await page.mouse.down({ button });
    await page.mouse.move(
      canvas.x + canvas.width * 0.6 + dx,
      canvas.y + canvas.height * 0.55 + dy,
      { steps: 8 }
    );
    await page.mouse.up({ button });
    await nextFrame(page);
    check((await pixels()) !== before, `${button} drag must change the view`);
  };
  await drag('left', 80, 20);
  await drag('right', 40, -25);
  const beforeZoom = await pixels();
  await page.mouse.wheel(0, -200);
  await nextFrame(page);
  check((await pixels()) !== beforeZoom, 'Scroll must zoom');
  await page.locator('#reset').click();
  console.log('Checking assembly modes and selection');
  await page.locator('#section').check();
  await page.locator('#produce').uncheck();
  await nextFrame(page);
  check(
    (await page.locator('canvas').getAttribute('data-section')) === 'true',
    'Section must be enabled'
  );
  await page.locator('#explode').check();
  await nextFrame(page);
  check(
    (await page.locator('#view-title').innerText()) === 'Exploded assembly',
    'Exploded state must be labelled'
  );
  check(
    (await page.locator('canvas').getAttribute('data-exploded')) === 'true',
    'Exploded mode must reach viewer'
  );
  await page.locator('[data-part="07"]').click();
  check(
    (await page.locator('#part-detail').innerText()).includes(
      'Ø53.8 OD / Ø50.8 bore × 130'
    ),
    'Selecting drain must show manufacturing definition'
  );
  check(
    (await page.locator('canvas').getAttribute('data-selected-part')) === '07',
    'BOM selection must reach viewer'
  );
  await page.locator('#reset').click();
  await page
    .locator('canvas')
    .click({ position: { x: canvas.width / 2, y: canvas.height / 2 } });
  check(
    (await page.locator('canvas').getAttribute('data-selected-part')) !== '07',
    'Clicking geometry must select its BOM entry'
  );
  await page.locator('#tab-build').click();
  check(await page.locator('#panel-build').isVisible(), 'Build tab must open');
  await page.locator('#tab-build').press('ArrowRight');
  check(
    await page.locator('#panel-care').isVisible(),
    'Keyboard tab navigation must open care'
  );
  await verifyDownloads(page);
  await page.locator('#reset').click();
  check(
    !(await page.locator('#section').isChecked()) &&
      !(await page.locator('#explode').isChecked()),
    'Reset must restore assembly'
  );
  await page.locator('#tab-parts').click();
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await nextFrame(page);
    check(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth
      ),
      'Responsive layout must not overflow'
    );
    const box = await page.locator('canvas').boundingBox();
    check(
      box.height >= 350 && box.width >= 300,
      'Mobile canvas must remain usable'
    );
  }
  check(errors.length === 0, `Unexpected browser errors: ${errors.join('; ')}`);
  check(
    external.length === 0,
    `Site must work without external requests: ${external.join('; ')}`
  );
  console.log(
    'Browser acceptance passed: rendering, orbit/pan/zoom, views, section/explode/reset, selection, keyboard tabs, five downloads, three responsive widths and local assets.'
  );
}

async function verifyDownloads(page) {
  console.log('Checking downloads');
  await page.locator('#download-toggle').click();
  for (const extension of ['svg', 'dxf', 'scad', 'csv', 'json']) {
    const pending = page.waitForEvent('download');
    await page.locator(`[data-export="${extension}"]`).click();
    const download = await pending;
    check(
      download.suggestedFilename() === `SD-01-rev-A.${extension}`,
      `${extension} filename must be stable`
    );
    // Read the stream in CI; the MCP host can retain a download until the call returns.
    if (process.env.CI) {
      check(
        (await download.failure()) === null,
        `${extension} download must succeed`
      );
    }
  }
}

export async function verifyFallback(browser, baseURL) {
  console.log('Checking specifications and exports when 3D is unavailable');
  const fallback = await browser.newPage();
  fallback.setDefaultTimeout(20000);
  try {
    await fallback.route('**/assets/scene.js', (route) => route.abort());
    await fallback.goto(baseURL);
    await fallback.locator('#viewer-error').waitFor({ state: 'visible' });
    check(
      (await fallback.locator('[data-part]').count()) === 12,
      'BOM must survive a viewer failure'
    );
    await fallback.locator('#tab-care').click();
    check(
      await fallback.locator('#panel-care').isVisible(),
      'Care guidance must survive a viewer failure'
    );
    await verifyDownloads(fallback);
  } finally {
    await fallback.close();
  }
}
