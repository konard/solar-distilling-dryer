import { spec, parts, validateDesign } from './design.js';
import {
  bomCsv,
  specificationJson,
  drawingSvg,
  cuttingDxf,
  assemblyScad,
} from './exports.js';

const $ = (selector) => document.querySelector(selector);
let viewer;
const debug = new globalThis.URLSearchParams(globalThis.location.search).has(
  'debug'
);
const trace = (...args) => {
  if (debug) {
    console.debug('[SD-01]', ...args);
  }
};
function selectPart(id) {
  const part = parts.find((p) => p.id === id);
  for (const button of document.querySelectorAll('[data-part]')) {
    button.setAttribute('aria-pressed', String(button.dataset.part === id));
  }
  $('#part-detail').innerHTML =
    `<div class="detail-title"><span>${part.id}</span><h3>${part.name}</h3></div><dl><dt>Material</dt><dd>${part.material}</dd><dt>Dimensions / mm</dt><dd>${part.size}</dd></dl><p>${part.process}</p>`;
  viewer?.select(id);
  trace('selected', id);
}
function populateParts() {
  for (const part of parts) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.part = part.id;
    button.setAttribute('aria-pressed', String(part.id === '01'));
    button.innerHTML = `<span class="part-number">${part.id}</span><span class="part-name">${part.name}<small>${part.material}</small></span><span class="part-quantity">${String(part.quantity).padStart(2, '0')}</span><span class="part-arrow" aria-hidden="true">↗</span>`;
    button.addEventListener('click', () => selectPart(part.id));
    $('#parts-list').appendChild(button);
  }
  selectPart('01');
}
function activateTab(tab) {
  for (const button of document.querySelectorAll('[data-tab]')) {
    const active = button === tab;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    $(`#panel-${button.dataset.tab}`).hidden = !active;
  }
}
function configureTabs() {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      const direction = {
        ArrowRight: 1,
        ArrowLeft: -1,
        Home: -index,
        End: tabs.length - index - 1,
      }[event.key];
      if (direction === undefined) {
        return;
      }
      event.preventDefault();
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      activateTab(next);
      next.focus();
    });
  });
}
function configureDownloads() {
  $('#download-toggle').addEventListener('click', () => {
    const open = $('#download-toggle').getAttribute('aria-expanded') !== 'true';
    $('#download-toggle').setAttribute('aria-expanded', String(open));
    $('#downloads').hidden = !open;
  });
  const exports = {
    csv: ['text/csv', bomCsv],
    json: ['application/json', specificationJson],
    svg: ['image/svg+xml', drawingSvg],
    dxf: ['application/dxf', cuttingDxf],
    scad: ['text/plain', assemblyScad],
  };
  document.querySelectorAll('[data-export]').forEach((button) =>
    button.addEventListener('click', () => {
      const extension = button.dataset.export;
      const [type, generate] = exports[extension];
      const data = generate();
      const url = globalThis.URL.createObjectURL(
        new globalThis.Blob([data], { type })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `SD-01-rev-A.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.setTimeout(() => globalThis.URL.revokeObjectURL(url), 1000);
      $('#download-status').textContent =
        `${extension.toUpperCase()} downloaded`;
      trace('export', extension, data.length);
    })
  );
}
function configureViewer() {
  document.querySelectorAll('[data-view]').forEach((button) =>
    button.addEventListener('click', () => {
      viewer?.view(button.dataset.view);
      document
        .querySelectorAll('[data-view]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      trace('view', button.dataset.view);
    })
  );
  for (const mode of ['section', 'explode', 'dimensions', 'produce']) {
    $(`#${mode}`).addEventListener('change', (event) => {
      viewer?.setMode(mode, event.target.checked);
      $('#view-title').textContent = $('#explode').checked
        ? 'Exploded assembly'
        : $('#section').checked
          ? 'Open section'
          : 'Assembly overview';
      trace('mode', mode, event.target.checked);
    });
  }
  $('#reset').addEventListener('click', () => {
    viewer?.reset();
    $('#section').checked = false;
    $('#explode').checked = false;
    $('#dimensions').checked = true;
    $('#produce').checked = true;
    $('#view-title').textContent = 'Assembly overview';
    document
      .querySelectorAll('[data-view]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.view === 'iso')
        )
      );
  });
}
populateParts();
configureTabs();
configureDownloads();
configureViewer();
try {
  const errors = validateDesign(spec);
  if (errors.length) {
    throw new Error(errors.join(' '));
  }
  const { createViewer } = await import('./scene.js');
  viewer = createViewer($('#viewport'), (id) => {
    activateTab($('#tab-parts'));
    selectPart(id);
  });
  $('#viewport').dataset.ready = 'true';
  trace('ready', spec.revision);
} catch (error) {
  $('#viewer-error').hidden = false;
  $('#viewport').dataset.ready = 'false';
  console.error('[SD-01] Viewer unavailable:', error);
}
