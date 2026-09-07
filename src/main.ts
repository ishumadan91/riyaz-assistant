/**
 * Standalone entry. Importing the page pulls in the whole component tree
 * (template → organisms → molecules → atoms) via side-effect registration.
 *
 * Standalone owns the whole document, so the page takes document-level keys
 * and initial focus. Embedded it does neither — see src/embed.ts.
 */
import './components/pages/practice-page/rz-practice-page.js';
import type { RzPracticePage } from './components/pages/practice-page/rz-practice-page.js';

const page = document.querySelector<RzPracticePage>('rz-practice-page');
if (page) {
  page.globalKeys = true;
  page.focus();
}
