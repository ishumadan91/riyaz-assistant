/**
 * Embed entry — the app as a component for another site to host.
 *
 * Registers `rz-practice-page` and re-exports the types a host needs to type
 * its storage adapter and event listeners. Deliberately no side effects beyond
 * registration: no tokens, no global.css. The host supplies the design tokens
 * from its own `:root` (custom properties pierce Shadow DOM) and sizes the
 * element itself.
 *
 * Built by `npm run build:lib` to `dist-lib/riyaz.js`.
 */
import './components/pages/practice-page/rz-practice-page.js';

export type { RiyazStorage, Preferences } from './data/preferences.js';
export type { Thaat } from './data/thaats.js';
export type { Alankar, AlankarPart } from './data/alankars.js';
