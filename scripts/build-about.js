#!/usr/bin/env node
/* Generates src/about.js from README.md, so the in-app About panel is derived
   from the README rather than a copy of it that drifts.
   Run: node scripts/build-about.js   (CI checks the result is committed) */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// package.json sets "type": "module", so this file is ESM — no __dirname.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/ishumadan91/riyaz-assistant/blob/main/';

/* Which README sections become About panel sections, in order.
   `null` means the lead paragraphs before the first heading. */
const SECTIONS = [
  { heading: null,          title: 'Riyāz' },
  { heading: 'Using it',    title: 'Using it' },
  { heading: 'The cycle',   title: 'The cycle' },
  { heading: 'Modes',       title: 'Modes' },
  { heading: 'Thaats',      title: 'Thaats' },
  { heading: 'Notation',    title: 'Notation' },
  { heading: 'Licence',     title: 'Licence' }
];

function inline(s) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, (_, c) => '<code class="code-inline">' + c + '</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // README-relative links (LICENSE, src/…) must become absolute in the app
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
      '<a href="' + (/^https?:/.test(href) ? href : REPO + href) +
      '" target="_blank" rel="noopener noreferrer">' + text + '</a>');
}

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

function table(lines) {
  const head = cells(lines[0]);
  const body = lines.slice(2).map(cells);          // [1] is the --- separator
  const hasHead = head.some(c => c !== '');
  const th = hasHead
    ? '<thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>'
    : '';
  const tb = '<tbody>' + body.map(r =>
    '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
  return '<div class="table-scroll"><table class="data-table">' + th + tb + '</table></div>';
}

/* Just enough markdown for the prose in these sections: paragraphs and tables. */
function toHtml(md) {
  return md.trim().split(/\n{2,}/).map(block => {
    const lines = block.split('\n').filter(Boolean);
    if (lines[0].startsWith('|')) return table(lines);
    return '<p>' + inline(lines.join(' ')) + '</p>';
  }).join('\n');
}

function sectionBody(md, heading) {
  if (heading === null) {
    const lead = md.split(/\n## /)[0].replace(/^# .*$/m, '');
    // drop the "Open the app" link — pointless inside the app itself
    return lead.split('\n').filter(l => !/^\*\*\[Open the app/.test(l)).join('\n');
  }
  const re = new RegExp('^## ' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'm');
  const m = md.match(re);
  if (!m) throw new Error('README section not found: "' + heading + '"');
  const after = md.slice(m.index + m[0].length);
  return after.split(/\n##+ /)[0];
}

const md = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const out = SECTIONS.map(s => ({ title: s.title, html: toHtml(sectionBody(md, s.heading)) }));

fs.writeFileSync(path.join(ROOT, 'src', 'data', 'about.ts'),
  '/* GENERATED FILE — do not edit.\n' +
  '   Derived from README.md by scripts/build-about.js; re-run that after\n' +
  '   editing the README sections it draws from. CI checks it is in sync. */\n\n' +
  'export interface AboutSection {\n' +
  '  title: string;\n' +
  '  /** Build-time HTML from this repo\'s own README — see rz-about-sheet. */\n' +
  '  html: string;\n' +
  '}\n\n' +
  'export const ABOUT_SECTIONS: AboutSection[] = ' + JSON.stringify(out, null, 2) + ';\n');

console.log('src/data/about.ts written —', out.length, 'sections:',
            out.map(s => s.title).join(', '));
