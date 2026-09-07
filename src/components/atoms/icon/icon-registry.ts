import { svg, type SVGTemplateResult } from 'lit';

/**
 * Inline SVG paths on a 24×24 grid. Inline rather than sprites or a font so an
 * icon inherits `currentColor` through the Shadow DOM and needs no extra
 * request when embedded.
 *
 * Transport glyphs are filled for weight; mode glyphs are stroked so an
 * inactive toggle reads as an outline.
 */
export type IconName =
  | 'play'
  | 'pause'
  | 'prev'
  | 'next'
  | 'repeat'
  | 'repeat-one'
  | 'infinity';

const stroke = (d: SVGTemplateResult) => svg`
  <g fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">${d}</g>
`;

export const ICONS: Record<IconName, SVGTemplateResult> = {
  play: svg`<path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/>`,
  pause: svg`<path fill="currentColor" d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/>`,
  prev: svg`<path fill="currentColor" d="M6 5h2.5v14H6zM20 5.6v12.8a1 1 0 0 1-1.55.83l-9.2-6.4a1 1 0 0 1 0-1.66l9.2-6.4A1 1 0 0 1 20 5.6Z"/>`,
  next: svg`<path fill="currentColor" d="M15.5 5H18v14h-2.5zM4 5.6v12.8a1 1 0 0 0 1.55.83l9.2-6.4a1 1 0 0 0 0-1.66l-9.2-6.4A1 1 0 0 0 4 5.6Z"/>`,
  repeat: stroke(svg`<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`),
  'repeat-one': svg`
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </g>
    <text x="12" y="15.5" text-anchor="middle" font-size="9" font-weight="700"
          font-family="inherit" fill="currentColor">1</text>`,
  infinity: stroke(svg`<path d="M18.18 8c5.09 0 5.09 8 0 8-5.1 0-7.14-8-12.74-8-4.59 0-4.59 8 0 8 5.6 0 7.64-8 12.74-8Z"/>`),
};
